<?php

namespace App\Services;

use App\Models\OauthAccessToken;
use App\Models\OauthClient;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use RuntimeException;

class ClientService
{
    /** @return array{clientId: string, clientSecret: string} */
    public function create(array $input): array
    {
        // 16-hex client_id, 32-hex client_secret — matches PHP-generated rows.
        for ($i = 0; $i < 5; $i++) {
            $clientId = bin2hex(random_bytes(8));
            if (!OauthClient::withTrashed()->where('client_id', $clientId)->exists()) {
                $clientSecret = bin2hex(random_bytes(16));
                OauthClient::create([
                    'client_id' => $clientId,
                    'client_secret' => $clientSecret,
                    'client_name' => $input['client_name'] ?? null,
                    'redirect_uri' => $input['redirect_uri'],
                    'scope' => $input['scope'] ?? null,
                    'grant_types' => $input['grant_types'] ?? null,
                    'is_active' => 1,
                ]);

                return ['clientId' => $clientId, 'clientSecret' => $clientSecret];
            }
        }
        throw new RuntimeException('Failed to generate unique client_id');
    }

    public function regenerateSecret(string $clientId): string
    {
        $client = OauthClient::withTrashed()->where('client_id', $clientId)->firstOrFail();
        $secret = bin2hex(random_bytes(16));
        $client->client_secret = $secret;
        $client->save();

        return $secret;
    }

    public function softDelete(string $clientId): void
    {
        $client = OauthClient::where('client_id', $clientId)->firstOrFail();
        $client->is_active = 0;
        $client->save();
        $client->delete();
    }

    public function restore(string $clientId): void
    {
        $client = OauthClient::onlyTrashed()->where('client_id', $clientId)->firstOrFail();
        $client->restore();
        $client->is_active = 1;
        $client->save();
    }

    public function activeTokenCount(string $clientId): int
    {
        return OauthAccessToken::where('client_id', $clientId)
            ->where('expires', '>', Carbon::now())
            ->count();
    }
}
