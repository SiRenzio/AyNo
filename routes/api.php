<?php

use App\Http\Controllers\Api\MobileAuthController;
use App\Http\Controllers\Api\MobileChecklistItemController;
use App\Http\Controllers\Api\MobileEventController;
use Illuminate\Support\Facades\Route;

Route::prefix('mobile')->group(function () {
    Route::post('register', [MobileAuthController::class, 'register'])->middleware('throttle:6,1');
    Route::post('login', [MobileAuthController::class, 'login'])->middleware('throttle:10,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [MobileAuthController::class, 'me']);
        Route::post('logout', [MobileAuthController::class, 'logout']);
        Route::get('events', [MobileEventController::class, 'index']);
        Route::post('events', [MobileEventController::class, 'store']);
        Route::get('events/{event}', [MobileEventController::class, 'show']);
        Route::patch('events/{event}/status', [MobileEventController::class, 'updateStatus']);
        Route::patch('checklist-items/{checklistItem}', [MobileChecklistItemController::class, 'update']);
    });
});
