<?php

use App\Http\Controllers\ChecklistItemController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ReminderController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('events/create', [EventController::class, 'create'])->name('events.create');
    Route::post('events', [EventController::class, 'store'])->name('events.store');

    Route::get('events', [EventController::class, 'index'])->name('events.index');
    Route::get('events/{event}/edit', [EventController::class, 'edit'])->name('events.edit');
    Route::get('events/{event}', [EventController::class, 'show'])->name('events.show');
    Route::patch('events/{event}', [EventController::class, 'update'])->name('events.update');
    Route::patch('events/{event}/status', [EventController::class, 'updateStatus'])->name('events.status.update');
    Route::delete('events/{event}', [EventController::class, 'destroy'])->name('events.destroy');
    Route::post('events/{event}/checklist-items', [ChecklistItemController::class, 'store'])->name('checklist-items.store');
    Route::patch('checklist-items/{checklistItem}', [ChecklistItemController::class, 'update'])->name('checklist-items.update');
    Route::post('events/{event}/reminders', [ReminderController::class, 'store'])->name('reminders.store');
    Route::patch('reminders/{reminder}', [ReminderController::class, 'update'])->name('reminders.update');
    Route::delete('reminders/{reminder}', [ReminderController::class, 'destroy'])->name('reminders.destroy');

    Route::get('notifications', [ReminderController::class, 'index'])->name('notifications.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
