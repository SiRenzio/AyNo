<?php

namespace App\Http\Controllers\Api;

use App\Events\MobileNotificationsUpdated;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Reminder;
use App\Models\Template;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MobileEventController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $events = $request->user()->events();
        $withCounts = ['checklistItems', 'checklistItems as completed_checklist_items_count' => fn ($query) => $query->where('is_completed', true)];

        return response()->json([
            'statistics' => [
                'total' => (clone $events)->count(),
                'upcoming' => (clone $events)->where('status', 'upcoming')->where('starts_at', '>=', now())->count(),
                'overdue' => (clone $events)->where('status', 'upcoming')->where('starts_at', '<', now())->count(),
                'completed' => (clone $events)->where('status', 'completed')->count(),
            ],
            'upcoming_events' => (clone $events)->withCount($withCounts)->where('status', 'upcoming')->where('starts_at', '>=', now())->orderBy('starts_at')->limit(4)->get()->map(fn ($event) => $this->summary($event)),
            'completed_events' => (clone $events)->withCount($withCounts)->where('status', 'completed')->latest('completed_at')->limit(4)->get()->map(fn ($event) => $this->summary($event)),
        ]);
    }

    public function templates(): JsonResponse
    {
        return response()->json(['templates' => Template::with('items')->orderBy('name')->get()->map(fn ($template) => [
            'id' => $template->id, 'name' => $template->name, 'description' => $template->description,
            'items' => $template->items->pluck('description')->values(),
        ])]);
    }

    public function notifications(Request $request): JsonResponse
    {
        $reminders = Reminder::whereHas('event', fn ($query) => $query->where('user_id', $request->user()->id))
            ->where('remind_at', '<=', now())
            ->with('event:id,title,location,starts_at,status')->latest('remind_at')->get()->map(fn ($reminder) => [
                'id' => $reminder->id, 'remind_at' => $reminder->remind_at->toIso8601String(),
                'status' => $reminder->event->status === 'completed' || $reminder->event->starts_at->isPast() ? 'completed' : $reminder->status,
                'channel' => $reminder->channel,
                'read_at' => $reminder->read_at?->toIso8601String(),
                'event' => ['id' => $reminder->event->id, 'title' => $reminder->event->title, 'location' => $reminder->event->location, 'starts_at' => $reminder->event->starts_at->toIso8601String(), 'status' => $reminder->event->status],
            ]);

        return response()->json(['notifications' => $reminders]);
    }

    public function pushReminders(Request $request): JsonResponse
    {
        $reminders = Reminder::query()
            ->where('channel', 'local_push')->where('status', 'pending')->where('remind_at', '>', now())
            ->whereHas('event', fn ($query) => $query->where('user_id', $request->user()->id)->where('status', 'upcoming'))
            ->with('event:id,title,location,starts_at')->orderBy('remind_at')->get()->map(fn ($reminder) => [
                'id' => $reminder->id, 'remind_at' => $reminder->remind_at->toIso8601String(),
                'event' => ['id' => $reminder->event->id, 'title' => $reminder->event->title, 'location' => $reminder->event->location],
            ]);

        return response()->json(['reminders' => $reminders]);
    }

    public function updateNotification(Request $request, Reminder $reminder): JsonResponse
    {
        $this->ensureReminderOwner($request, $reminder);
        $reminder->loadMissing('event');
        abort_if($reminder->status === 'sent', 422, 'Sent reminders cannot be changed.');
        $data = $request->validate(['status' => ['required', 'in:pending,cancelled']]);
        abort_if(
            $data['status'] === 'pending' && ($reminder->event->status === 'completed' || $reminder->event->starts_at->isPast()),
            422,
            'Reminders for completed or past events cannot be retried.',
        );
        $reminder->update([
            'status' => $data['status'],
            'failed_at' => $data['status'] === 'pending' ? null : $reminder->failed_at,
            'failure_reason' => $data['status'] === 'pending' ? null : $reminder->failure_reason,
        ]);

        return response()->json(['message' => 'Reminder updated.']);
    }

    public function destroyNotification(Request $request, Reminder $reminder): JsonResponse
    {
        $this->ensureReminderOwner($request, $reminder);
        $reminder->delete();
        return response()->json(['message' => 'Reminder deleted.']);
    }

    public function markNotificationsRead(Request $request): JsonResponse
    {
        $data = $request->validate(['ids' => ['nullable', 'array'], 'ids.*' => ['integer', 'distinct']]);
        $query = Reminder::whereHas('event', fn ($event) => $event->where('user_id', $request->user()->id))
            ->where('remind_at', '<=', now())->whereNull('read_at');
        if (! empty($data['ids'])) {
            $query->whereIn('id', $data['ids']);
        }
        $updated = $query->update(['read_at' => now()]);
        broadcast(new MobileNotificationsUpdated($request->user()->id));

        return response()->json(['message' => 'Notifications marked as read.', 'updated' => $updated]);
    }

    public function destroyNotifications(Request $request): JsonResponse
    {
        $data = $request->validate(['ids' => ['required', 'array', 'min:1'], 'ids.*' => ['integer', 'distinct']]);
        $deleted = Reminder::whereHas('event', fn ($event) => $event->where('user_id', $request->user()->id))
            ->whereIn('id', $data['ids'])->delete();
        broadcast(new MobileNotificationsUpdated($request->user()->id));

        return response()->json(['message' => 'Notifications deleted.', 'deleted' => $deleted]);
    }

    public function storeReminder(Request $request, Event $event): JsonResponse
    {
        $this->ensureOwner($request, $event);
        abort_unless($event->status === 'upcoming', 422, 'Reminders can only be added to active events.');
        $data = $request->validate(['offset_minutes' => ['required', 'integer', 'min:1', 'max:525600']]);
        $remindAt = $event->starts_at->copy()->subMinutes($data['offset_minutes']);
        abort_unless($remindAt->isFuture(), 422, 'The reminder time must be in the future.');
        $reminder = $event->reminders()->updateOrCreate(
            ['remind_at' => $remindAt, 'channel' => 'local_push'],
            ['type' => 'offset', 'offset_minutes' => $data['offset_minutes'], 'status' => 'pending'],
        );

        return response()->json(['reminder' => [
            'id' => $reminder->id, 'offset_minutes' => $reminder->offset_minutes,
            'remind_at' => $reminder->remind_at->toIso8601String(), 'status' => $reminder->status,
        ]], 201);
    }
    public function index(Request $request): JsonResponse
    {
        $events = $request->user()->events()->withCount([
            'checklistItems',
            'checklistItems as completed_checklist_items_count' => fn ($query) => $query->where('is_completed', true),
            'reminders as pending_reminders_count' => fn ($query) => $query->where('status', 'pending'),
        ])->latest('updated_at')->get()->map(fn (Event $event) => $this->summary($event));

        return response()->json(['events' => $events]);
    }

    public function show(Request $request, Event $event): JsonResponse
    {
        $this->ensureOwner($request, $event);
        $event->load(['checklistItems', 'reminders']);

        return response()->json(['event' => [
            ...$this->summary($event),
            'notes' => $event->notes,
            'checklist_items' => $event->checklistItems->map->only(['id', 'description', 'is_completed']),
            'reminders' => $event->reminders->map(fn ($reminder) => [
                'id' => $reminder->id,
                'remind_at' => $reminder->remind_at->toIso8601String(),
                'status' => $reminder->status,
                'offset_minutes' => $reminder->offset_minutes,
            ]),
        ]]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'starts_at' => ['required', 'date', 'after:now'],
            'checklist_items' => ['array', 'max:50'],
            'checklist_items.*' => ['required', 'string', 'max:255'],
            'reminder_offsets' => ['array', 'max:10'],
            'reminder_offsets.*' => ['integer', 'distinct', 'min:0', 'max:525600'],
        ]);

        $startsAt = Carbon::parse($data['starts_at'])->setTimezone(config('app.timezone'));
        $hasPastReminder = collect($data['reminder_offsets'] ?? [])
            ->contains(fn (int $offset) => $startsAt->copy()->subMinutes($offset)->isPast());

        if ($hasPastReminder) {
            throw ValidationException::withMessages([
                'reminder_offsets' => 'Choose a reminder that occurs in the future.',
            ]);
        }

        $event = DB::transaction(function () use ($request, $data, $startsAt) {
            $event = $request->user()->events()->create([
                'title' => $data['title'], 'location' => $data['location'] ?? null,
                'notes' => $data['notes'] ?? null, 'starts_at' => $startsAt->format('Y-m-d H:i:s'), 'status' => 'upcoming',
            ]);
            foreach ($data['checklist_items'] ?? [] as $position => $description) {
                $event->checklistItems()->create(compact('description', 'position'));
            }
            foreach ($data['reminder_offsets'] ?? [] as $offset) {
                $event->reminders()->create([
                    'type' => 'offset', 'offset_minutes' => $offset,
                    'remind_at' => $startsAt->copy()->subMinutes($offset),
                    'channel' => 'local_push', 'status' => 'pending',
                ]);
            }
            return $event;
        });

        return response()->json(['event' => $this->summary($event)], 201);
    }

    public function updateStatus(Request $request, Event $event): JsonResponse
    {
        $this->ensureOwner($request, $event);
        $data = $request->validate(['status' => ['required', 'in:completed,cancelled']]);
        abort_if(in_array($event->status, ['completed', 'cancelled'], true), 422, 'This event already has a final status.');

        DB::transaction(function () use ($event, $data) {
            $event->update(['status' => $data['status'], 'completed_at' => $data['status'] === 'completed' ? now() : null]);
            $event->resolveReminders();
        });

        return response()->json(['event' => $this->summary($event->refresh())]);
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        $this->ensureOwner($request, $event);
        abort_if(in_array($event->status, ['completed', 'cancelled'], true), 422, 'Completed or cancelled events cannot be edited.');
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'], 'location' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'], 'starts_at' => ['required', 'date', 'after:now'],
        ]);
        DB::transaction(function () use ($event, $data) {
            $startsAt = Carbon::parse($data['starts_at'])->setTimezone(config('app.timezone'));
            $event->update([...$data, 'starts_at' => $startsAt->format('Y-m-d H:i:s')]);
            $event->reminders()->where('status', 'pending')->where('type', 'offset')->get()->each(fn ($reminder) => $reminder->update([
                'remind_at' => $startsAt->copy()->subMinutes($reminder->offset_minutes),
                'status' => $startsAt->copy()->subMinutes($reminder->offset_minutes)->isFuture() ? 'pending' : 'cancelled',
            ]));
        });

        $event->load(['checklistItems', 'reminders']);
        return $this->show($request, $event);
    }

    public function destroy(Request $request, Event $event): JsonResponse
    {
        $this->ensureOwner($request, $event);
        DB::transaction(function () use ($event): void {
            $event->resolveReminders();
            $event->delete();
        });
        return response()->json(['message' => 'Event permanently deleted.']);
    }

    private function summary(Event $event): array
    {
        return [
            'id' => $event->id, 'title' => $event->title, 'location' => $event->location,
            'starts_at' => $event->starts_at->toIso8601String(),
            'status' => $event->status === 'upcoming' && $event->starts_at->isPast() ? 'overdue' : $event->status,
            'checklist_count' => $event->checklist_items_count ?? $event->checklistItems->count(),
            'completed_checklist_count' => $event->completed_checklist_items_count ?? $event->checklistItems->where('is_completed', true)->count(),
            'pending_reminders_count' => $event->pending_reminders_count ?? $event->reminders->where('status', 'pending')->count(),
        ];
    }

    private function ensureOwner(Request $request, Event $event): void
    {
        abort_unless($event->user_id === $request->user()->id, 404);
    }

    private function ensureReminderOwner(Request $request, Reminder $reminder): void
    {
        abort_unless($reminder->event()->where('user_id', $request->user()->id)->exists(), 404);
    }
}
