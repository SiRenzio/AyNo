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
}
