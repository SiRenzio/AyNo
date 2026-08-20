<?php

namespace App\Notifications;

use App\Models\Reminder;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventReminderNotification extends Notification
{
    use Queueable;

    public function __construct(public Reminder $reminder) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $event = $this->reminder->event;
        $timezone = $notifiable->timezone ?: config('app.timezone');
        $mail = (new MailMessage)
            ->subject("Reminder: {$event->title}")
            ->greeting("Hello {$notifiable->name},")
            ->line("Your event is scheduled for {$event->starts_at->timezone($timezone)->format('F j, Y \\a\\t g:i A')}.");

        if ($event->location) $mail->line("Location: {$event->location}");
        if ($event->notes) $mail->line($event->notes);

        if ($event->checklistItems->isNotEmpty()) {
            $mail->line('Checklist:');
            foreach ($event->checklistItems as $item) {
                $mail->line(($item->is_completed ? '[x] ' : '[ ] ').$item->description);
            }
        }

        return $mail->action('View Checklist', route('events.show', $event))->line('This reminder was sent by AyNo.');
    }
}
