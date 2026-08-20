<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Models\Event;
use App\Models\Template;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(): Response
    {
        $events = Event::query()
            ->whereBelongsTo(request()->user())
            ->withCount([
                'checklistItems',
                'checklistItems as completed_checklist_items_count' => fn ($query) => $query->where('is_completed', true),
            ])
            ->orderBy('starts_at')
            ->get()
            ->map(fn (Event $event) => [
                'id' => $event->id,
                'title' => $event->title,
                'location' => $event->location,
                'notes' => $event->notes,
                'starts_at' => $event->starts_at->toIso8601String(),
                'status' => $event->status === 'upcoming' && $event->starts_at->isPast() ? 'overdue' : $event->status,
                'checklist_count' => $event->checklist_items_count,
                'completed_checklist_count' => $event->completed_checklist_items_count,
            ]);

        return Inertia::render('events/index', ['events' => $events]);
    }

    public function create(): Response
    {
        $templates = Template::query()
            ->with(['items:id,template_id,description,position'])
            ->orderBy('name')
            ->get(['id', 'name', 'description'])
            ->map(fn (Template $template) => [
                'id' => $template->id,
                'name' => $template->name,
                'description' => $template->description,
                'items' => $template->items->pluck('description')->values(),
            ]);

        return Inertia::render('events/create', ['templates' => $templates]);
    }

    public function show(Request $request, Event $event): Response
    {
        abort_unless($event->user_id === $request->user()->id, 404);
        $event->load(['checklistItems', 'reminders']);

        return Inertia::render('events/show', [
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'location' => $event->location,
                'notes' => $event->notes,
                'starts_at' => $event->starts_at->toIso8601String(),
                'status' => $event->status === 'upcoming' && $event->starts_at->isPast() ? 'overdue' : $event->status,
                'checklist_items' => $event->checklistItems->map(fn ($item) => [
                    'id' => $item->id,
                    'description' => $item->description,
                    'is_completed' => $item->is_completed,
                ]),
                'reminders' => $event->reminders->map(fn ($reminder) => [
                    'id' => $reminder->id,
                    'offset_minutes' => $reminder->offset_minutes,
                    'remind_at' => $reminder->remind_at->toIso8601String(),
                    'status' => $reminder->status,
                ]),
            ],
        ]);
    }

    public function edit(Request $request, Event $event): Response
    {
        $this->ensureOwner($request, $event);

        return Inertia::render('events/edit', ['event' => [
            'id' => $event->id,
            'title' => $event->title,
            'location' => $event->location,
            'notes' => $event->notes,
            'starts_at' => $event->starts_at->format('Y-m-d\TH:i'),
            'status' => $event->status,
        ]]);
    }

    public function update(Request $request, Event $event): RedirectResponse
    {
        $this->ensureOwner($request, $event);
        abort_if(in_array($event->status, ['completed', 'cancelled'], true), 422, 'Completed or cancelled events cannot be edited.');
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'starts_at' => ['required', 'date', 'after:now'],
        ]);

        DB::transaction(function () use ($event, $data): void {
            $event->update($data);
            $startsAt = Carbon::parse($data['starts_at']);
            $event->reminders()->where('status', 'pending')->get()->each(function ($reminder) use ($startsAt): void {
                if ($reminder->type === 'offset') {
                    $remindAt = $startsAt->copy()->subMinutes($reminder->offset_minutes);
                    $reminder->update(['remind_at' => $remindAt, 'status' => $remindAt->isFuture() ? 'pending' : 'cancelled']);
                } elseif ($reminder->remind_at->isAfter($startsAt)) {
                    $reminder->update(['status' => 'cancelled']);
                }
            });
        });

        return to_route('events.show', $event)->with('success', 'Event updated successfully.');
    }

    public function updateStatus(Request $request, Event $event): RedirectResponse
    {
        $this->ensureOwner($request, $event);
        abort_if(in_array($event->status, ['completed', 'cancelled'], true), 422, 'This event already has a final status.');
        $data = $request->validate(['status' => ['required', 'in:completed,cancelled']]);

        DB::transaction(function () use ($event, $data): void {
            $event->update([
                'status' => $data['status'],
                'completed_at' => $data['status'] === 'completed' ? now() : null,
            ]);
            $event->reminders()->where('status', 'pending')->update(['status' => 'cancelled']);
        });

        return back()->with('success', $data['status'] === 'completed' ? 'Event marked complete.' : 'Event cancelled.');
    }

    public function destroy(Request $request, Event $event): RedirectResponse
    {
        $this->ensureOwner($request, $event);
        $event->delete();

        return to_route('events.index')->with('success', 'Event permanently deleted.');
    }

    public function store(StoreEventRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($request, $data): void {
            $event = Event::create([
                'user_id' => $request->user()->id,
                'title' => $data['title'],
                'location' => $data['location'] ?? null,
                'notes' => $data['notes'] ?? null,
                'starts_at' => $data['starts_at'],
                'status' => 'upcoming',
            ]);

            foreach ($data['checklist_items'] ?? [] as $position => $description) {
                $event->checklistItems()->create([
                    'description' => $description,
                    'position' => $position,
                ]);
            }

            $startsAt = Carbon::parse($data['starts_at']);
            foreach ($data['reminder_offsets'] ?? [] as $offset) {
                $event->reminders()->create([
                    'type' => 'offset',
                    'offset_minutes' => $offset,
                    'remind_at' => $startsAt->copy()->subMinutes($offset),
                    'channel' => 'email',
                    'status' => 'pending',
                ]);
            }
        });

        return to_route('events.index')->with('success', 'Event created successfully.');
    }

    private function ensureOwner(Request $request, Event $event): void
    {
        abort_unless($event->user_id === $request->user()->id, 404);
    }
}
