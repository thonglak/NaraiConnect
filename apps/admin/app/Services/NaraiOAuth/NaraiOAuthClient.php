<?php

namespace App\Services\NaraiOAuth;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory as HttpFactory;
use RuntimeException;

class NaraiOAuthClient
{
    public function __construct(private readonly HttpFactory $http) {}

    /**
     * @return array{0: string, 1: string} [authorize URL, state]
     */
    public function buildAuthorizeUrl(string $state): string
    {
        $params = [
            'response_type' => 'code',
            'client_id' => $this->cfg('client_id'),
            'redirect_uri' => $this->cfg('redirect_uri'),
            'scope' => $this->cfg('scope'),
            'state' => $state,
        ];

        return $this->cfg('authorize_url').'?'.http_build_query($params);
    }

    /** @return array{access_token: string, token_type?: string, expires_in?: int, refresh_token?: string, scope?: string} */
    public function exchangeCode(string $code): array
    {
        try {
            $res = $this->http->asForm()->post($this->cfg('token_url'), [
                'grant_type' => 'authorization_code',
                'code' => $code,
                'redirect_uri' => $this->cfg('redirect_uri'),
                'client_id' => $this->cfg('client_id'),
                'client_secret' => $this->cfg('client_secret'),
            ]);
        } catch (ConnectionException $e) {
            throw new RuntimeException("Token exchange connection failed: {$e->getMessage()}", 502, $e);
        }

        if (!$res->ok()) {
            throw new RuntimeException("Token exchange failed: {$res->status()} {$res->body()}", 502);
        }

        return $res->json();
    }

    /** @return array{username: string, displayName: string|null, raw: array<string, mixed>} */
    public function fetchUserInfo(string $accessToken): array
    {
        try {
            $res = $this->http->withToken($accessToken)->get($this->cfg('userinfo_url'));
        } catch (ConnectionException $e) {
            throw new RuntimeException("Userinfo connection failed: {$e->getMessage()}", 502, $e);
        }

        if (!$res->ok()) {
            throw new RuntimeException("Userinfo failed: {$res->status()} {$res->body()}", 502);
        }

        $raw = $res->json();
        $username = $this->pickString($raw, ['username', 'user_id', 'sub', 'preferred_username']);
        if ($username === null) {
            throw new RuntimeException('Userinfo missing username field', 502);
        }

        return [
            'username' => $username,
            'displayName' => $this->pickString($raw, ['display_name', 'name', 'first_name']),
            'raw' => $raw,
        ];
    }

    private function cfg(string $key): string
    {
        $v = config("narai_oauth.$key");
        if (!is_string($v) || $v === '') {
            throw new RuntimeException("Missing narai_oauth.$key config");
        }

        return $v;
    }

    /** @param array<string, mixed> $raw @param string[] $keys */
    private function pickString(array $raw, array $keys): ?string
    {
        foreach ($keys as $k) {
            $v = $raw[$k] ?? null;
            if (is_string($v) && $v !== '') {
                return $v;
            }
        }

        return null;
    }
}
