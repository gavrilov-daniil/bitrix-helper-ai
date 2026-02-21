<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\ConnectionStatus;
use App\Http\Controllers\Controller;
use App\Models\BitrixConnection;
use App\Services\BitrixOAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BitrixOAuthController extends Controller
{
    public function __construct(
        private readonly BitrixOAuthService $oauthService,
    ) {}

    public function initiate(BitrixConnection $connection): RedirectResponse
    {
        if (!$connection->isOAuth()) {
            abort(400, 'Connection is not configured for OAuth.');
        }

        $url = $this->oauthService->getAuthorizationUrl($connection);

        return redirect()->away($url);
    }

    public function callback(Request $request): RedirectResponse
    {
        $connectionId = $request->query('state');
        $code = $request->query('code');
        $error = $request->query('error');

        if ($error) {
            return redirect(config('app.frontend_url', 'http://localhost') . '/settings/' . $connectionId . '?oauth=error&message=' . urlencode($error));
        }

        if (! $connectionId || ! $code) {
            return redirect(config('app.frontend_url', 'http://localhost') . '/?oauth=error&message=missing_parameters');
        }

        $connection = BitrixConnection::find($connectionId);
        if (! $connection) {
            return redirect(config('app.frontend_url', 'http://localhost') . '/?oauth=error&message=connection_not_found');
        }

        $success = $this->oauthService->exchangeCode($connection, $code);

        if ($success) {
            $connection->update([
                'last_status' => ConnectionStatus::Connected,
                'last_checked_at' => now(),
                'error_message' => null,
            ]);

            return redirect(config('app.frontend_url', 'http://localhost') . '/settings/' . $connectionId . '?oauth=success');
        }

        $connection->update([
            'last_status' => ConnectionStatus::Error,
            'last_checked_at' => now(),
            'error_message' => 'OAuth token exchange failed.',
        ]);

        return redirect(config('app.frontend_url', 'http://localhost') . '/settings/' . $connectionId . '?oauth=error&message=token_exchange_failed');
    }
}
