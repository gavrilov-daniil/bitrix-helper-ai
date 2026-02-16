<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default connection timeout (seconds)
    |--------------------------------------------------------------------------
    */
    'timeout' => env('BITRIX_TIMEOUT', 10),

    /*
    |--------------------------------------------------------------------------
    | Rate limit delay between requests (milliseconds)
    |--------------------------------------------------------------------------
    */
    'rate_limit_delay' => env('BITRIX_RATE_LIMIT_DELAY', 500),

    /*
    |--------------------------------------------------------------------------
    | OAuth redirect URI for Bitrix24 OAuth flow
    |--------------------------------------------------------------------------
    */
    'oauth_redirect_uri' => env('BITRIX_OAUTH_REDIRECT_URI', 'http://localhost/api/bitrix/oauth/callback'),
];
