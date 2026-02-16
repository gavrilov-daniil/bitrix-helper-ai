<?php

use App\Http\Controllers\Api\AiConnectionController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BitrixConnectionController;
use App\Http\Controllers\Api\BitrixOAuthController;
use App\Http\Controllers\Api\DashboardController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/bitrix/oauth/callback', [BitrixOAuthController::class, 'callback']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Bitrix Connections
    Route::prefix('connections')->group(function () {
        Route::get('/', [BitrixConnectionController::class, 'index']);
        Route::post('/', [BitrixConnectionController::class, 'store']);
        Route::get('/{connection}', [BitrixConnectionController::class, 'show']);
        Route::put('/{connection}', [BitrixConnectionController::class, 'update']);
        Route::delete('/{connection}', [BitrixConnectionController::class, 'destroy']);
        Route::post('/{connection}/test', [BitrixConnectionController::class, 'test']);
        Route::get('/{connection}/status', [BitrixConnectionController::class, 'status']);
    });

    // Bitrix OAuth
    Route::get('/bitrix/oauth/initiate/{connection}', [BitrixOAuthController::class, 'initiate']);

    // AI Connections
    Route::prefix('ai-connections')->group(function () {
        Route::get('/', [AiConnectionController::class, 'index']);
        Route::post('/', [AiConnectionController::class, 'store']);
        Route::get('/{aiConnection}', [AiConnectionController::class, 'show']);
        Route::put('/{aiConnection}', [AiConnectionController::class, 'update']);
        Route::delete('/{aiConnection}', [AiConnectionController::class, 'destroy']);
        Route::post('/{aiConnection}/test', [AiConnectionController::class, 'test']);
    });

    // Dashboard
    Route::get('/dashboard/status', [DashboardController::class, 'status']);
});
