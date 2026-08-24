<?php

namespace Tests\Feature;

use App\Jobs\SendReminderEmail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class EventReminderResolutionTest extends TestCase
{
    use RefreshDatabase;

    public function test_completing_an_event_reads_existing_notifications_and_cancels_unsent_reminders(): void
    {
        $user = User::factory()->create();
        $event = $user->events()->create([
            'title' => 'Resolve reminders',
            'starts_at' => now()->addHour(),
            'status' => 'upcoming',
        ]);
        $sent = $event->reminders()->create([
            'remind_at' => now()->subMinute(),
            'channel' => 'email',
            'status' => 'sent',
        ]);
        $pending = $event->reminders()->create([
            'remind_at' => now()->addMinutes(30),
            'channel' => 'email',
            'status' => 'pending',
        ]);

        $this->actingAs($user)
            ->patch(route('events.status.update', $event), ['status' => 'completed'])
            ->assertRedirect();

        $this->assertSame('sent', $sent->refresh()->status);
        $this->assertNotNull($sent->read_at);
        $this->assertSame('cancelled', $pending->refresh()->status);
        $this->assertNotNull($pending->read_at);

        Notification::fake();
        SendReminderEmail::dispatchSync($pending->id);
        Notification::assertNothingSent();
    }
}
