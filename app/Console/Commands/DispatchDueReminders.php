<?php

namespace App\Console\Commands;

use App\Jobs\SendReminderEmail;
use App\Models\Reminder;
use Illuminate\Console\Command;

class DispatchDueReminders extends Command
{
    protected $signature = 'reminders:dispatch';
    protected $description = 'Queue pending email reminders that are due';

    public function handle(): int
    {
        $queued = 0;
        Reminder::query()
            ->where('status', 'pending')->where('channel', 'email')->where('remind_at', '<=', now())
            ->whereHas('event', fn ($query) => $query->where('status', 'upcoming')
                ->whereHas('user', fn ($user) => $user->where('email_notifications_enabled', true)))
            ->select('id')->orderBy('id')
            ->chunkById(200, function ($reminders) use (&$queued) {
                foreach ($reminders as $reminder) {
                    SendReminderEmail::dispatch($reminder->id);
                    $queued++;
                }
            });

        $this->info("Queued {$queued} due reminder(s).");
        return self::SUCCESS;
    }
}
