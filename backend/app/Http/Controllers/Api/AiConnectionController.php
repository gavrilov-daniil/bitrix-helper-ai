<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AiConnectionRequest;
use App\Models\AiConnection;
use App\Services\Ai\AiManager;
use Illuminate\Http\JsonResponse;

class AiConnectionController extends Controller
{
    public function __construct(
        private readonly AiManager $aiManager,
    ) {}

    public function index(): JsonResponse
    {
        $connections = AiConnection::orderBy('priority')->get();

        return response()->json([
            'data' => $connections->map(fn ($conn) => $this->formatConnection($conn)),
        ]);
    }

    public function store(AiConnectionRequest $request): JsonResponse
    {
        $connection = AiConnection::create($request->validated());

        return response()->json([
            'data' => $this->formatConnection($connection),
            'message' => 'AI connection created successfully.',
        ], 201);
    }

    public function show(AiConnection $aiConnection): JsonResponse
    {
        return response()->json([
            'data' => $this->formatConnection($aiConnection),
        ]);
    }

    public function update(AiConnectionRequest $request, AiConnection $aiConnection): JsonResponse
    {
        $data = $request->validated();

        if (empty($data['api_key'])) {
            unset($data['api_key']);
        }

        $aiConnection->update($data);

        return response()->json([
            'data' => $this->formatConnection($aiConnection->fresh()),
            'message' => 'AI connection updated successfully.',
        ]);
    }

    public function destroy(AiConnection $aiConnection): JsonResponse
    {
        $aiConnection->delete();

        return response()->json([
            'message' => 'AI connection deleted successfully.',
        ]);
    }

    public function test(AiConnection $aiConnection): JsonResponse
    {
        $result = $this->aiManager->testConnection($aiConnection);

        return response()->json([
            'data' => $result,
        ]);
    }

    private function formatConnection(AiConnection $connection): array
    {
        return [
            'id' => $connection->id,
            'name' => $connection->name,
            'provider' => $connection->provider->value,
            'model' => $connection->model,
            'priority' => $connection->priority,
            'is_active' => $connection->is_active,
            'last_status' => $connection->last_status?->value ?? 'disconnected',
            'error_message' => $connection->error_message,
            'last_checked_at' => $connection->last_checked_at?->toISOString(),
            'created_at' => $connection->created_at?->toISOString(),
            'updated_at' => $connection->updated_at?->toISOString(),
        ];
    }
}
