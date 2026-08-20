<?php

namespace App\Jobs;

use App\Models\Reminder;
use App\Notifications\EventReminderNotification;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Throwable;

class SendReminderEmail implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $uniqueFor = 3600;

    public function __construct(public int $reminderId) {}

    public function uniqueId(): string
    {
        return (string) $this->reminderId;
    }

    public function backoff(): array
    {
        return [60, 300];
    }

    public function handle(): void
    {
        $reminder = DB::transaction(function () {
            $reminder = Reminder::query()->with(['event.user', 'event.checklistItems'])
                ->lockForUpdate()->find($this->reminderId);

            if (! $reminder || $reminder->status !== 'pending' || $reminder->event->status !== 'upcoming') {
                return null;
            }

            if (! $reminder->event->user->email_notifications_enabled) {
                $reminder->update(['status' => 'cancelled']);
                return null;
            }

            return $reminder;
        });

        if (! $reminder) {
            return;
        }

        $reminder->event->user->notify(new EventReminderNotification($reminder));
        Reminder::query()->whereKey($this->reminderId)->where('status', 'pending')->update([
            'status' => 'sent', 'sent_at' => now(), 'failed_at' => null, 'failure_reason' => null,
        ]);
    }

    public function failed(?Throwable $exception): void
    {
        Reminder::query()->whereKey($this->reminderId)->where('status', 'pending')->update([
            'status' => 'failed',
            'failed_at' => now(),
            'failure_reason' => str($exception?->getMessage() ?? 'Reminder delivery failed')->limit(1000),
        ]);
    }
}
