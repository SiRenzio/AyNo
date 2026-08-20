<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NavigationPlaceholderController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('events/create', [NavigationPlaceholderController::class, 'show'])
        ->defaults('section', 'add-event')
        ->name('events.create');

    Route::get('events', [NavigationPlaceholderController::class, 'show'])
        ->defaults('section', 'events')
        ->name('events.index');

    Route::get('notifications', [NavigationPlaceholderController::class, 'show'])
        ->defaults('section', 'notifications')
        ->name('notifications.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
