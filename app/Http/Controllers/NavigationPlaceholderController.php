<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class NavigationPlaceholderController extends Controller
{
    /**
     * Display a temporary page for a planned application module.
     */
    public function show(string $section): Response
    {
        $sections = [
            'add-event' => [
                'title' => 'Add New Event',
                'description' => 'Create an event, build its checklist, and schedule reminders before it begins.',
            ],
            'events' => [
                'title' => 'Event Management',
                'description' => 'Review, update, complete, cancel, and organize all your events in one place.',
            ],
            'notifications' => [
                'title' => 'Notifications',
                'description' => 'Review reminder activity and manage notifications connected to your events.',
            ],
        ];

        abort_unless(array_key_exists($section, $sections), 404);

        return Inertia::render('coming-soon', $sections[$section]);
    }
}
