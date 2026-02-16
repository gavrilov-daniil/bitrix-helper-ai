<?php

declare(strict_types=1);

namespace App\Services\Ai;

use App\Enums\ConnectionStatus;
use App\Models\AiConnection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AnthropicService implements AiServiceInterface
{
    private const BASE_URL = 'https://api.anthropic.com/v1';
    private const API_VERSION = '2023-06-01';

    public function chat(AiConnection $connection, array $messages): string
    {
        $timeout = (int) config('ai.anthropic_timeout', 60);

        // Convert OpenAI-style messages to Anthropic format
        $system = null;
        $anthropicMessages = [];
        foreach ($messages as $msg) {
            if ($msg['role'] === 'system') {
                $system = $msg['content'];
            } else {
                $anthropicMessages[] = [
                    'role' => $msg['role'],
                    'content' => $msg['content'],
                ];
            }
        }

        $payload = [
            'model' => $connection->model,
            'max_tokens' => 4096,
            'messages' => $anthropicMessages,
        ];
        if ($system) {
            $payload['system'] = $system;
        }

        $response = Http::timeout($timeout)
            ->withHeaders([
                'x-api-key' => $connection->api_key,
                'anthropic-version' => self::API_VERSION,
                'Content-Type' => 'application/json',
            ])
            ->post(self::BASE_URL . '/messages', $payload);

        if (! $response->successful()) {
            $error = $response->json('error.message', 'Unknown Anthropic error');
            throw new \RuntimeException("Anthropic API error: {$error}");
        }

        return $response->json('content.0.text', '');
    }

    public function testConnection(AiConnection $connection): array
    {
        try {
            $timeout = (int) config('ai.anthropic_timeout', 60);

            $response = Http::timeout($timeout)
                ->withHeaders([
                    'x-api-key' => $connection->api_key,
                    'anthropic-version' => self::API_VERSION,
                    'Content-Type' => 'application/json',
                ])
                ->post(self::BASE_URL . '/messages', [
                    'model' => $connection->model,
                    'max_tokens' => 5,
                    'messages' => [
                        ['role' => 'user', 'content' => 'Say "OK" and nothing else.'],
                    ],
                ]);

            if (! $response->successful()) {
                $error = $response->json('error.message', 'Unknown error');
                $connection->update([
                    'last_status' => ConnectionStatus::Error,
                    'last_checked_at' => now(),
                    'error_message' => "Anthropic error: {$error}",
                ]);

                return [
                    'status' => ConnectionStatus::Error->value,
                    'message' => "Anthropic error: {$error}",
                ];
            }

            $connection->update([
                'last_status' => ConnectionStatus::Connected,
                'last_checked_at' => now(),
                'error_message' => null,
            ]);

            return [
                'status' => ConnectionStatus::Connected->value,
                'message' => 'Anthropic (Claude) connection successful.',
                'model' => $connection->model,
            ];
        } catch (\Throwable $e) {
            Log::error('Anthropic connection test failed', [
                'connection_id' => $connection->id,
                'error' => $e->getMessage(),
            ]);

            $connection->update([
                'last_status' => ConnectionStatus::Error,
                'last_checked_at' => now(),
                'error_message' => $e->getMessage(),
            ]);

            return [
                'status' => ConnectionStatus::Error->value,
                'message' => 'Anthropic test failed: ' . $e->getMessage(),
            ];
        }
    }
}
