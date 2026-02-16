<?php

use App\Http\Controllers\Api\BitrixConnectionController;
use Illuminate\Support\Facades\Route;

Route::prefix('connections')->group(function () {
    Route::get('/', [BitrixConnectionController::class, 'index']);
    Route::post('/', [BitrixConnectionController::class, 'store']);
    Route::get('/{connection}', [BitrixConnectionController::class, 'show']);
    Route::put('/{connection}', [BitrixConnectionController::class, 'update']);
    Route::delete('/{connection}', [BitrixConnectionController::class, 'destroy']);
    Route::post('/{connection}/test', [BitrixConnectionController::class, 'test']);
    Route::get('/{connection}/status', [BitrixConnectionController::class, 'status']);
});
