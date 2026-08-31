<?php

use App\Http\Controllers\Api\MobileAuthController;
use App\Http\Controllers\Api\MobileChecklistItemController;
use App\Http\Controllers\Api\MobileEventController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;

Route::prefix('mobile')->group(function () {
    Route::post('register', [MobileAuthController::class, 'register'])->middleware('throttle:6,1');
    Route::post('login', [MobileAuthController::class, 'login'])->middleware('throttle:10,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [MobileAuthController::class, 'me']);
        Route::post('logout', [MobileAuthController::class, 'logout']);
        Route::post('broadcasting/auth', fn (\Illuminate\Http\Request $request) => Broadcast::auth($request));
        Route::get('events', [MobileEventController::class, 'index']);
        Route::get('dashboard', [MobileEventController::class, 'dashboard']);
        Route::get('templates', [MobileEventController::class, 'templates']);
        Route::get('notifications', [MobileEventController::class, 'notifications']);
        Route::get('push-reminders', [MobileEventController::class, 'pushReminders']);
        Route::patch('notifications/read', [MobileEventController::class, 'markNotificationsRead']);
        Route::delete('notifications', [MobileEventController::class, 'destroyNotifications']);
        Route::patch('notifications/{reminder}', [MobileEventController::class, 'updateNotification']);
        Route::delete('notifications/{reminder}', [MobileEventController::class, 'destroyNotification']);
        Route::post('events', [MobileEventController::class, 'store']);
        Route::get('events/{event}', [MobileEventController::class, 'show']);
        Route::patch('events/{event}', [MobileEventController::class, 'update']);
        Route::patch('events/{event}/status', [MobileEventController::class, 'updateStatus']);
        Route::delete('events/{event}', [MobileEventController::class, 'destroy']);
        Route::patch('profile', [MobileAuthController::class, 'updateProfile']);
        Route::patch('password', [MobileAuthController::class, 'updatePassword']);
        Route::patch('checklist-items/{checklistItem}', [MobileChecklistItemController::class, 'update']);
        Route::post('events/{event}/checklist-items', [MobileChecklistItemController::class, 'store']);
        Route::post('events/{event}/reminders', [MobileEventController::class, 'storeReminder']);
        Route::delete('reminders/{reminder}', [MobileEventController::class, 'destroyNotification']);
    });
});
