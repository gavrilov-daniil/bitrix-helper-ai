<?php

declare(strict_types=1);

namespace App\Services\Ai;

use App\Enums\AiProvider;
use App\Enums\ConnectionStatus;
use App\Models\AiConnection;
use Illuminate\Support\Facades\Log;

class AiManager
{
    private array $services = [];

    public function __construct()
    {
        $this->services[AiProvider::OpenAI->value] = new OpenAiService();
        $this->services[AiProvider::Anthropic->value] = new AnthropicService();
    }

    public function chat(array $messages): string
    {
        $connections = AiConnection::where('is_active', true)
            ->orderBy('priority')
            ->get();

        if ($connections->isEmpty()) {
            throw new \RuntimeException('No active AI connections configured.');
        }

        $lastError = null;

        foreach ($connections as $connection) {
            $service = $this->getService($connection->provider);
            if (! $service) {
                continue;
            }

            try {
                $result = $service->chat($connection, $messages);

                // Mark as connected on success
                $connection->update([
                    'last_status' => ConnectionStatus::Connected,
                    'last_checked_at' => now(),
                    'error_message' => null,
                ]);

                return $result;
            } catch (\Throwable $e) {
                $lastError = $e;

                Log::warning('AI provider failed, trying next', [
                    'connection_id' => $connection->id,
                    'provider' => $connection->provider->value,
                    'error' => $e->getMessage(),
                ]);

                $connection->update([
                    'last_status' => ConnectionStatus::Error,
                    'last_checked_at' => now(),
                    'error_message' => $e->getMessage(),
                ]);
            }
        }

        throw new \RuntimeException(
            'All AI providers failed. Last error: ' . ($lastError?->getMessage() ?? 'Unknown')
        );
    }

    public function testConnection(AiConnection $connection): array
    {
        $service = $this->getService($connection->provider);
        if (! $service) {
            return [
                'status' => ConnectionStatus::Error->value,
                'message' => "Unsupported provider: {$connection->provider->value}",
            ];
        }

        return $service->testConnection($connection);
    }

    private function getService(AiProvider $provider): ?AiServiceInterface
    {
        return $this->services[$provider->value] ?? null;
    }
}
