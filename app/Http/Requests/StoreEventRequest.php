<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'starts_at' => ['required', 'date', 'after:now'],
            'template_id' => ['nullable', 'integer', 'exists:templates,id'],
            'checklist_items' => ['array', 'max:50'],
            'checklist_items.*' => ['required', 'string', 'max:255'],
            'reminder_offsets' => ['array', 'max:10'],
            'reminder_offsets.*' => ['integer', 'distinct', 'min:0', 'max:525600'],
        ];
    }
}
