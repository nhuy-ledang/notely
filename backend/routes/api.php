<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    // Explicitly handle browser preflight requests on shared hosting setups.
    Route::options('/{any}', fn () => response()->noContent())->where('any', '.*');

    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function (): void {
        Route::get('/me', [ProfileController::class, 'show']);
        Route::patch('/me', [ProfileController::class, 'update']);
        Route::patch('/me/password', [ProfileController::class, 'updatePassword']);
        Route::delete('/me', [ProfileController::class, 'destroy']);
        Route::patch('/me/preferences', [ProfileController::class, 'updatePreferences']);

        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('jwt.refresh');

        Route::post('/media', [MediaController::class, 'store']);

        Route::apiResource('collections', CollectionController::class);
        Route::apiResource('notes', NoteController::class);
    });
});
