<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class EventCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_users_can_open_event_creation(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('events.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('events/create')->has('templates'));
    }

    public function test_users_only_see_their_own_events_in_management(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $user->events()->create(['title' => 'My appointment', 'starts_at' => now()->addDay()]);
        $otherUser->events()->create(['title' => 'Private event', 'starts_at' => now()->addDays(2)]);

        $this->actingAs($user)
            ->get(route('events.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('events/index')
                ->has('events', 1)
                ->where('events.0.title', 'My appointment')
            );
    }

    public function test_user_can_create_an_event_with_checklist_and_reminder(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('events.store'), [
            'title' => 'Claim diploma',
            'location' => 'University Registrar',
            'notes' => 'Bring the original receipt.',
            'starts_at' => now()->addWeek()->format('Y-m-d H:i:s'),
            'checklist_items' => ['Official receipt', 'Valid ID'],
            'reminder_offsets' => [60, 1440],
        ])->assertRedirect(route('events.index'));

        $this->assertDatabaseHas('events', ['user_id' => $user->id, 'title' => 'Claim diploma']);
        $this->assertDatabaseCount('checklist_items', 2);
        $this->assertDatabaseCount('reminders', 2);
    }

    public function test_event_requires_a_future_date(): void
    {
        $this->actingAs(User::factory()->create())
            ->post(route('events.store'), [
                'title' => 'Past event',
                'starts_at' => now()->subDay()->format('Y-m-d H:i:s'),
            ])
            ->assertSessionHasErrors('starts_at');
    }

    public function test_user_can_view_and_manage_an_event_checklist_and_reminders(): void
    {
        $user = User::factory()->create();
        $event = $user->events()->create(['title' => 'Claim diploma', 'starts_at' => now()->addWeek()]);
        $item = $event->checklistItems()->create(['description' => 'Official receipt', 'position' => 0]);

        $this->actingAs($user)
            ->get(route('events.show', $event))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('events/show')->where('event.title', 'Claim diploma'));

        $this->patch(route('checklist-items.update', $item), ['is_completed' => true])->assertRedirect();
        $this->assertDatabaseHas('checklist_items', ['id' => $item->id, 'is_completed' => true]);

        $this->post(route('checklist-items.store', $event), ['description' => 'Valid ID'])->assertRedirect();
        $this->assertDatabaseHas('checklist_items', ['event_id' => $event->id, 'description' => 'Valid ID']);

        $this->post(route('reminders.store', $event), ['offset_minutes' => 120])->assertRedirect();
        $this->assertDatabaseHas('reminders', ['event_id' => $event->id, 'offset_minutes' => 120]);
    }

    public function test_user_cannot_view_another_users_event(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $event = $owner->events()->create(['title' => 'Private event', 'starts_at' => now()->addDay()]);

        $this->actingAs($otherUser)->get(route('events.show', $event))->assertNotFound();
    }
}
