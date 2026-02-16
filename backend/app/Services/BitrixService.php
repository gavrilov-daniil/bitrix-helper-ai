<?php

namespace App\Services;

use App\Enums\ConnectionStatus;
use App\Models\BitrixConnection;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BitrixService
{
    public function testConnection(BitrixConnection $connection): array
    {
        $baseUrl = $this->buildWebhookUrl($connection);
        $timeout = config('bitrix.timeout', 10);

        try {
            // Step 1: Check server availability via server.time
            $timeResponse = Http::timeout($timeout)
                ->get($baseUrl . 'server.time.json');

            if (!$timeResponse->successful()) {
                return $this->handleError($connection, $timeResponse);
            }

            $timeData = $timeResponse->json();
            $serverTime = $timeData['result'] ?? null;

            // Step 2: Check available scopes
            $scopeResponse = Http::timeout($timeout)
                ->get($baseUrl . 'scope.json');

            $scopes = [];
            if ($scopeResponse->successful()) {
                $scopes = $scopeResponse->json('result', []);
            }

            // Step 3: Update connection status in DB
            $connection->update([
                'last_status' => ConnectionStatus::Connected,
                'last_checked_at' => now(),
                'server_time' => $serverTime,
                'available_scopes' => $scopes,
                'error_message' => null,
            ]);

            $hasTaskScope = in_array('task', $scopes);

            return [
                'status' => ConnectionStatus::Connected->value,
                'server_time' => $serverTime,
                'scopes' => $scopes,
                'has_task_scope' => $hasTaskScope,
                'message' => $hasTaskScope
                    ? 'Connection successful. Task scope available.'
                    : 'Connection successful, but "task" scope is missing. Please add it in Bitrix24 webhook settings.',
            ];
        } catch (ConnectionException $e) {
            return $this->handleException($connection, 'Connection failed: unable to reach Bitrix24 server. Check the domain.');
        } catch (\Throwable $e) {
            Log::error('Bitrix24 connection test failed', [
                'connection_id' => $connection->id,
                'error' => $e->getMessage(),
            ]);
            return $this->handleException($connection, 'Unexpected error: ' . $e->getMessage());
        }
    }

    public function buildWebhookUrl(BitrixConnection $connection): string
    {
        $domain = rtrim($connection->domain, '/');
        if (!str_starts_with($domain, 'http')) {
            $domain = 'https://' . $domain;
        }

        return "{$domain}/rest/{$connection->bitrix_user_id}/{$connection->webhook_code}/";
    }

    private function handleError(BitrixConnection $connection, $response): array
    {
        $statusCode = $response->status();
        $body = $response->json();
        $errorCode = $body['error'] ?? 'UNKNOWN';
        $errorDescription = $body['error_description'] ?? 'Unknown error';

        $message = match ($errorCode) {
            'NO_AUTH_FOUND' => 'Authentication failed: invalid webhook code or user ID.',
            'insufficient_scope' => 'Insufficient permissions: webhook does not have required scopes.',
            'INVALID_CREDENTIALS' => 'Invalid credentials: user lacks permissions.',
            'ACCESS_DENIED' => 'Access denied: REST API may not be available.',
            'QUERY_LIMIT_EXCEEDED' => 'Rate limit exceeded. Please try again later.',
            default => "Bitrix24 error ({$statusCode}): {$errorDescription}",
        };

        $connection->update([
            'last_status' => ConnectionStatus::Error,
            'last_checked_at' => now(),
            'error_message' => $message,
            'server_time' => null,
            'available_scopes' => null,
        ]);

        return [
            'status' => ConnectionStatus::Error->value,
            'error_code' => $errorCode,
            'message' => $message,
        ];
    }

    private function handleException(BitrixConnection $connection, string $message): array
    {
        $connection->update([
            'last_status' => ConnectionStatus::Error,
            'last_checked_at' => now(),
            'error_message' => $message,
            'server_time' => null,
            'available_scopes' => null,
        ]);

        return [
            'status' => ConnectionStatus::Error->value,
            'message' => $message,
        ];
    }
}
