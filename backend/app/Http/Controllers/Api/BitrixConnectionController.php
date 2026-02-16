<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BitrixConnectionRequest;
use App\Models\BitrixConnection;
use App\Services\BitrixService;
use Illuminate\Http\JsonResponse;

class BitrixConnectionController extends Controller
{
    public function __construct(
        private readonly BitrixService $bitrixService,
    ) {}

    public function index(): JsonResponse
    {
        $connections = BitrixConnection::all();

        return response()->json([
            'data' => $connections->map(fn ($conn) => $this->formatConnection($conn)),
        ]);
    }

    public function store(BitrixConnectionRequest $request): JsonResponse
    {
        $connection = BitrixConnection::create($request->validated());

        return response()->json([
            'data' => $this->formatConnection($connection),
            'message' => 'Connection created successfully.',
        ], 201);
    }

    public function show(BitrixConnection $connection): JsonResponse
    {
        return response()->json([
            'data' => $this->formatConnection($connection),
        ]);
    }

    public function update(BitrixConnectionRequest $request, BitrixConnection $connection): JsonResponse
    {
        $data = $request->validated();

        // Don't overwrite secrets if not provided
        if (empty($data['webhook_code'])) {
            unset($data['webhook_code']);
        }
        if (empty($data['client_secret'])) {
            unset($data['client_secret']);
        }

        $connection->update($data);

        return response()->json([
            'data' => $this->formatConnection($connection->fresh()),
            'message' => 'Connection updated successfully.',
        ]);
    }

    public function destroy(BitrixConnection $connection): JsonResponse
    {
        $connection->delete();

        return response()->json([
            'message' => 'Connection deleted successfully.',
        ]);
    }

    public function test(BitrixConnection $connection): JsonResponse
    {
        $result = $this->bitrixService->testConnection($connection);

        return response()->json([
            'data' => $result,
        ]);
    }

    public function status(BitrixConnection $connection): JsonResponse
    {
        return response()->json([
            'data' => [
                'id' => $connection->id,
                'status' => $connection->last_status?->value ?? 'disconnected',
                'last_checked_at' => $connection->last_checked_at?->toISOString(),
                'server_time' => $connection->server_time,
                'available_scopes' => $connection->available_scopes,
                'error_message' => $connection->error_message,
            ],
        ]);
    }

    private function formatConnection(BitrixConnection $connection): array
    {
        return [
            'id' => $connection->id,
            'name' => $connection->name,
            'domain' => $connection->domain,
            'bitrix_user_id' => $connection->bitrix_user_id,
            'auth_type' => $connection->auth_type?->value ?? 'webhook',
            'is_active' => $connection->is_active,
            'last_status' => $connection->last_status?->value ?? 'disconnected',
            'last_checked_at' => $connection->last_checked_at?->toISOString(),
            'server_time' => $connection->server_time,
            'available_scopes' => $connection->available_scopes,
            'error_message' => $connection->error_message,
            'oauth_connected' => $connection->isOAuth() && $connection->access_token !== null,
            'created_at' => $connection->created_at?->toISOString(),
            'updated_at' => $connection->updated_at?->toISOString(),
        ];
    }
}
