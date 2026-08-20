<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Reminder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReminderController extends Controller
{
    public function index(Request $request): Response
    {
        $reminders = Reminder::query()
            ->whereHas('event', fn ($query) => $query->where('user_id', $request->user()->id))
            ->with('event:id,title,location,starts_at,status')
            ->latest('remind_at')
            ->get()
            ->map(fn (Reminder $reminder) => [
                'id' => $reminder->id,
                'remind_at' => $reminder->remind_at->toIso8601String(),
                'status' => $reminder->status,
                'channel' => $reminder->channel,
                'failure_reason' => $reminder->failure_reason,
                'event' => [
                    'id' => $reminder->event->id,
                    'title' => $reminder->event->title,
                    'location' => $reminder->event->location,
                    'starts_at' => $reminder->event->starts_at->toIso8601String(),
                ],
            ]);

        return Inertia::render('notifications/index', ['reminders' => $reminders]);
    }

    public function store(Request $request, Event $event): RedirectResponse
    {
        abort_unless($event->user_id === $request->user()->id, 404);
        $data = $request->validate(['offset_minutes' => ['required', 'integer', 'min:0', 'max:525600']]);
        $event->reminders()->updateOrCreate(
            ['remind_at' => $event->starts_at->copy()->subMinutes($data['offset_minutes']), 'channel' => 'email'],
            ['type' => 'offset', 'offset_minutes' => $data['offset_minutes'], 'status' => 'pending'],
        );

        return back();
    }

    public function destroy(Request $request, Reminder $reminder): RedirectResponse
    {
        abort_unless($reminder->event()->where('user_id', $request->user()->id)->exists(), 404);
        $reminder->delete();

        return back();
    }

    public function update(Request $request, Reminder $reminder): RedirectResponse
    {
        abort_unless($reminder->event()->where('user_id', $request->user()->id)->exists(), 404);
        $data = $request->validate([
            'status' => ['required', Rule::in(['pending', 'cancelled'])],
        ]);

        abort_if($reminder->status === 'sent', 422, 'Sent reminders cannot be changed.');
        $reminder->update([
            'status' => $data['status'],
            'failed_at' => $data['status'] === 'pending' ? null : $reminder->failed_at,
            'failure_reason' => $data['status'] === 'pending' ? null : $reminder->failure_reason,
        ]);

        return back()->with('success', $data['status'] === 'pending' ? 'Reminder queued again.' : 'Reminder cancelled.');
    }
}
