<?php

namespace App\Models;

use App\Events\MobileNotificationsUpdated;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $fillable = ['user_id', 'title', 'location', 'notes', 'starts_at', 'status'];

    protected function casts(): array
    {
        return ['starts_at' => 'datetime', 'completed_at' => 'datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function checklistItems(): HasMany
    {
        return $this->hasMany(ChecklistItem::class)->orderBy('position');
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(Reminder::class)->orderBy('remind_at');
    }

    public function resolveReminders(): void
    {
        $resolvedAt = now();

        $this->reminders()
            ->where('status', 'pending')
            ->update(['status' => 'cancelled', 'read_at' => $resolvedAt]);

        $this->reminders()
            ->whereNull('read_at')
            ->update(['read_at' => $resolvedAt]);

        broadcast(new MobileNotificationsUpdated((int) $this->user_id));
    }
}
