<?php

namespace App\Livewire;

use App\Models\OauthAccessToken;
use App\Models\OauthAuthorizationCode;
use App\Models\OauthClient;
use App\Models\OauthRefreshToken;
use App\Models\OauthScope;
use Illuminate\Support\Carbon;
use Illuminate\View\View;
use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Component;

#[Layout('layouts.app')]
#[Title('Dashboard — NaraiConnect Admin')]
class DashboardPage extends Component
{
    public function render(): View
    {
        $now = Carbon::now();

        $stats = [
            'clients' => [
                'total' => OauthClient::withTrashed()->count(),
                'active' => OauthClient::active()->count(),
                'deleted' => OauthClient::onlyTrashed()->count(),
            ],
            'tokens' => [
                'activeAccess' => OauthAccessToken::where('expires', '>', $now)->count(),
                'activeRefresh' => OauthRefreshToken::where('expires', '>', $now)->count(),
            ],
            'authCodes' => [
                'active' => OauthAuthorizationCode::where('expires', '>', $now)->count(),
            ],
            'scopes' => ['total' => OauthScope::count()],
        ];

        $recent = OauthClient::withTrashed()
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['client_id', 'client_name', 'created_at', 'is_active', 'deleted_at']);

        return view('livewire.dashboard-page', [
            'stats' => $stats,
            'recent' => $recent,
        ]);
    }
}
