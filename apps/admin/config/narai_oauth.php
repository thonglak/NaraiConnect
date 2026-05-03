<?php

return [
    'client_id' => env('OAUTH_CLIENT_ID', ''),
    'client_secret' => env('OAUTH_CLIENT_SECRET', ''),
    'authorize_url' => env('OAUTH_AUTHORIZE_URL', ''),
    'token_url' => env('OAUTH_TOKEN_URL', ''),
    'userinfo_url' => env('OAUTH_USERINFO_URL', ''),
    'redirect_uri' => env('ADMIN_OAUTH_REDIRECT_URI', env('APP_URL').'/auth/callback'),
    'scope' => env('OAUTH_SCOPE', 'email'),
];
