<?php

namespace App\Http\Controllers;

use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the user's event overview.
     */
    public function index(): Response
    {
        // Replace these values with Event model queries when event management is implemented.
        return Inertia::render('dashboard', [
            'currentDate' => Carbon::now(config('app.timezone'))->format('l, F j'),
            'statistics' => [
                'total' => 0,
                'upcoming' => 0,
                'overdue' => 0,
                'completed' => 0,
            ],
            'upcomingEvents' => [],
            'completedEvents' => [],
        ]);
    }
}
