<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the user's event overview.
     */
    public function index(): Response
    {
        $events = Event::query()->whereBelongsTo(request()->user());
        $eventSummary = fn (Event $event) => [
            'id' => $event->id,
            'title' => $event->title,
            'location' => $event->location,
            'notes' => $event->notes,
            'starts_at' => $event->starts_at->toIso8601String(),
            'status' => $event->status === 'upcoming' && $event->starts_at->isPast() ? 'overdue' : $event->status,
            'checklist_count' => $event->checklist_items_count,
            'completed_checklist_count' => $event->completed_checklist_items_count,
        ];
        $withChecklistCounts = [
            'checklistItems',
            'checklistItems as completed_checklist_items_count' => fn ($query) => $query->where('is_completed', true),
        ];

        return Inertia::render('dashboard', [
            'currentDate' => Carbon::now(config('app.timezone'))->format('l, F j'),
            'statistics' => [
                'total' => (clone $events)->count(),
                'upcoming' => (clone $events)->where('status', 'upcoming')->where('starts_at', '>=', now())->count(),
                'overdue' => (clone $events)->where('status', 'upcoming')->where('starts_at', '<', now())->count(),
                'completed' => (clone $events)->where('status', 'completed')->count(),
            ],
            'upcomingEvents' => (clone $events)->withCount($withChecklistCounts)->where('status', 'upcoming')->where('starts_at', '>=', now())->orderBy('starts_at')->limit(4)->get()->map($eventSummary),
            'completedEvents' => (clone $events)->withCount($withChecklistCounts)->where('status', 'completed')->latest('completed_at')->limit(4)->get()->map($eventSummary),
        ]);
    }
}
