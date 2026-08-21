<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MobileEventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $events = $request->user()->events()->withCount([
            'checklistItems',
            'checklistItems as completed_checklist_items_count' => fn ($query) => $query->where('is_completed', true),
            'reminders as pending_reminders_count' => fn ($query) => $query->where('status', 'pending'),
        ])->orderBy('starts_at')->get()->map(fn (Event $event) => $this->summary($event));

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

        $event = DB::transaction(function () use ($request, $data) {
            $event = $request->user()->events()->create([
                'title' => $data['title'], 'location' => $data['location'] ?? null,
                'notes' => $data['notes'] ?? null, 'starts_at' => $data['starts_at'], 'status' => 'upcoming',
            ]);
            foreach ($data['checklist_items'] ?? [] as $position => $description) {
                $event->checklistItems()->create(compact('description', 'position'));
            }
            foreach ($data['reminder_offsets'] ?? [] as $offset) {
                $event->reminders()->create([
                    'type' => 'offset', 'offset_minutes' => $offset,
                    'remind_at' => Carbon::parse($data['starts_at'])->subMinutes($offset),
                    'channel' => 'email', 'status' => 'pending',
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
            $event->reminders()->where('status', 'pending')->update(['status' => 'cancelled']);
        });

        return response()->json(['event' => $this->summary($event->refresh())]);
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
}
