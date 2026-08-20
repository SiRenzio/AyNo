<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Reminder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReminderController extends Controller
{
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
}
