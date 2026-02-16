<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiConnection;
use App\Models\BitrixConnection;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function status(): JsonResponse
    {
        $bitrixConnections = BitrixConnection::all();
        $aiConnections = AiConnection::orderBy('priority')->get();

        return response()->json([
            'data' => [
                'bitrix' => [
                    'total' => $bitrixConnections->count(),
                    'connected' => $bitrixConnections->where('last_status', 'connected')->count(),
                    'error' => $bitrixConnections->where('last_status', 'error')->count(),
                    'disconnected' => $bitrixConnections->where('last_status', 'disconnected')->count(),
                    'connections' => $bitrixConnections->map(fn ($c) => [
                        'id' => $c->id,
                        'name' => $c->name,
                        'domain' => $c->domain,
                        'last_status' => $c->last_status?->value ?? 'disconnected',
                        'last_checked_at' => $c->last_checked_at?->toISOString(),
                        'error_message' => $c->error_message,
                    ]),
                ],
                'ai' => [
                    'total' => $aiConnections->count(),
                    'connected' => $aiConnections->where('last_status', 'connected')->count(),
                    'error' => $aiConnections->where('last_status', 'error')->count(),
                    'disconnected' => $aiConnections->where('last_status', 'disconnected')->count(),
                    'connections' => $aiConnections->map(fn ($c) => [
                        'id' => $c->id,
                        'name' => $c->name,
                        'provider' => $c->provider->value,
                        'model' => $c->model,
                        'priority' => $c->priority,
                        'is_active' => $c->is_active,
                        'last_status' => $c->last_status?->value ?? 'disconnected',
                        'last_checked_at' => $c->last_checked_at?->toISOString(),
                        'error_message' => $c->error_message,
                    ]),
                ],
            ],
        ]);
    }
}
