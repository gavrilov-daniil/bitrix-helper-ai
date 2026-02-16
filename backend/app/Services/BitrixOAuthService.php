<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\BitrixConnection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BitrixOAuthService
{
    public function getAuthorizationUrl(BitrixConnection $connection): string
    {
        $domain = rtrim($connection->domain, '/');
        if (! str_starts_with($domain, 'http')) {
            $domain = 'https://' . $domain;
        }

        $redirectUri = config('bitrix.oauth_redirect_uri');

        $params = http_build_query([
            'client_id' => $connection->client_id,
            'response_type' => 'code',
            'redirect_uri' => $redirectUri,
            'state' => $connection->id,
        ]);

        return "{$domain}/oauth/authorize/?{$params}";
    }

    public function exchangeCode(BitrixConnection $connection, string $code): bool
    {
        $domain = rtrim($connection->domain, '/');
        if (! str_starts_with($domain, 'http')) {
            $domain = 'https://' . $domain;
        }

        try {
            $response = Http::timeout(10)->post("{$domain}/oauth/token/", [
                'grant_type' => 'authorization_code',
                'client_id' => $connection->client_id,
                'client_secret' => $connection->client_secret,
                'code' => $code,
                'redirect_uri' => config('bitrix.oauth_redirect_uri'),
            ]);

            if (! $response->successful()) {
                Log::error('Bitrix OAuth token exchange failed', [
                    'connection_id' => $connection->id,
                    'response' => $response->json(),
                ]);
                return false;
            }

            $data = $response->json();
            $connection->update([
                'access_token' => $data['access_token'],
                'refresh_token' => $data['refresh_token'],
                'token_expires_at' => now()->addSeconds($data['expires_in'] ?? 3600),
            ]);

            return true;
        } catch (\Throwable $e) {
            Log::error('Bitrix OAuth token exchange exception', [
                'connection_id' => $connection->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function refreshToken(BitrixConnection $connection): bool
    {
        if (! $connection->refresh_token) {
            return false;
        }

        $domain = rtrim($connection->domain, '/');
        if (! str_starts_with($domain, 'http')) {
            $domain = 'https://' . $domain;
        }

        try {
            $response = Http::timeout(10)->post("{$domain}/oauth/token/", [
                'grant_type' => 'refresh_token',
                'client_id' => $connection->client_id,
                'client_secret' => $connection->client_secret,
                'refresh_token' => $connection->refresh_token,
            ]);

            if (! $response->successful()) {
                Log::error('Bitrix OAuth token refresh failed', [
                    'connection_id' => $connection->id,
                    'response' => $response->json(),
                ]);
                return false;
            }

            $data = $response->json();
            $connection->update([
                'access_token' => $data['access_token'],
                'refresh_token' => $data['refresh_token'],
                'token_expires_at' => now()->addSeconds($data['expires_in'] ?? 3600),
            ]);

            return true;
        } catch (\Throwable $e) {
            Log::error('Bitrix OAuth token refresh exception', [
                'connection_id' => $connection->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function isTokenExpired(BitrixConnection $connection): bool
    {
        if (! $connection->token_expires_at) {
            return true;
        }

        // Refresh 5 minutes before expiration
        return $connection->token_expires_at->subMinutes(5)->isPast();
    }
}
