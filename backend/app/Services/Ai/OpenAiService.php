<?php

declare(strict_types=1);

namespace App\Services\Ai;

use App\Enums\ConnectionStatus;
use App\Models\AiConnection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAiService implements AiServiceInterface
{
    private const BASE_URL = 'https://api.openai.com/v1';

    public function chat(AiConnection $connection, array $messages): string
    {
        $timeout = (int) config('ai.openai_timeout', 30);

        $response = Http::timeout($timeout)
            ->withHeaders([
                'Authorization' => 'Bearer ' . $connection->api_key,
                'Content-Type' => 'application/json',
            ])
            ->post(self::BASE_URL . '/chat/completions', [
                'model' => $connection->model,
                'messages' => $messages,
            ]);

        if (! $response->successful()) {
            $error = $response->json('error.message', 'Unknown OpenAI error');
            throw new \RuntimeException("OpenAI API error: {$error}");
        }

        return $response->json('choices.0.message.content', '');
    }

    public function testConnection(AiConnection $connection): array
    {
        try {
            $timeout = (int) config('ai.openai_timeout', 30);

            $response = Http::timeout($timeout)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $connection->api_key,
                    'Content-Type' => 'application/json',
                ])
                ->post(self::BASE_URL . '/chat/completions', [
                    'model' => $connection->model,
                    'messages' => [
                        ['role' => 'user', 'content' => 'Say "OK" and nothing else.'],
                    ],
                    'max_tokens' => 5,
                ]);

            if (! $response->successful()) {
                $error = $response->json('error.message', 'Unknown error');
                $connection->update([
                    'last_status' => ConnectionStatus::Error,
                    'last_checked_at' => now(),
                    'error_message' => "OpenAI error: {$error}",
                ]);

                return [
                    'status' => ConnectionStatus::Error->value,
                    'message' => "OpenAI error: {$error}",
                ];
            }

            $connection->update([
                'last_status' => ConnectionStatus::Connected,
                'last_checked_at' => now(),
                'error_message' => null,
            ]);

            return [
                'status' => ConnectionStatus::Connected->value,
                'message' => 'OpenAI connection successful.',
                'model' => $connection->model,
            ];
        } catch (\Throwable $e) {
            Log::error('OpenAI connection test failed', [
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
                'message' => 'OpenAI test failed: ' . $e->getMessage(),
            ];
        }
    }
}
