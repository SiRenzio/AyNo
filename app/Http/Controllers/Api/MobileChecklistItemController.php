<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChecklistItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MobileChecklistItemController extends Controller
{
    public function store(Request $request, \App\Models\Event $event): JsonResponse
    {
        abort_unless($event->user_id === $request->user()->id, 404);
        $data = $request->validate(['description' => ['required', 'string', 'max:255']]);
        $item = $event->checklistItems()->create([
            'description' => $data['description'],
            'position' => ($event->checklistItems()->max('position') ?? -1) + 1,
        ]);

        return response()->json(['checklist_item' => $item->only('id', 'description', 'is_completed')], 201);
    }

    public function update(Request $request, ChecklistItem $checklistItem): JsonResponse
    {
        abort_unless($checklistItem->event()->where('user_id', $request->user()->id)->exists(), 404);
        $data = $request->validate(['is_completed' => ['required', 'boolean']]);
        $checklistItem->update([
            'is_completed' => $data['is_completed'],
            'completed_at' => $data['is_completed'] ? now() : null,
        ]);

        return response()->json(['checklist_item' => $checklistItem->only('id', 'description', 'is_completed')]);
    }
}
