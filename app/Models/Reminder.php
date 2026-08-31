<?php

namespace App\Models;

use App\Events\MobileNotificationsUpdated;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reminder extends Model
{
    protected $fillable = ['type', 'offset_minutes', 'remind_at', 'channel', 'status', 'read_at'];

    protected function casts(): array
    {
        return ['remind_at' => 'datetime', 'sent_at' => 'datetime', 'failed_at' => 'datetime', 'read_at' => 'datetime'];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    protected static function booted(): void
    {
        $broadcast = function (Reminder $reminder): void {
            $userId = $reminder->event()->value('user_id');
            if ($userId) {
                broadcast(new MobileNotificationsUpdated((int) $userId));
            }
        };

        static::saved($broadcast);
        static::deleted($broadcast);
    }
}
