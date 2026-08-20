<?php

namespace App\Http\Controllers;

use App\Models\ChecklistItem;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ChecklistItemController extends Controller
{
    public function store(Request $request, Event $event): RedirectResponse
    {
        abort_unless($event->user_id === $request->user()->id, 404);
        $data = $request->validate(['description' => ['required', 'string', 'max:255']]);
        $event->checklistItems()->create([
            'description' => $data['description'],
            'position' => $event->checklistItems()->max('position') + 1,
        ]);

        return back();
    }

    public function update(Request $request, ChecklistItem $checklistItem): RedirectResponse
    {
        abort_unless($checklistItem->event()->where('user_id', $request->user()->id)->exists(), 404);
        $data = $request->validate(['is_completed' => ['required', 'boolean']]);
        $checklistItem->update([
            'is_completed' => $data['is_completed'],
            'completed_at' => $data['is_completed'] ? now() : null,
        ]);

        return back();
    }
}
