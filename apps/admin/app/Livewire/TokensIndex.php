<?php

namespace App\Livewire;

use App\Models\OauthAccessToken;
use App\Models\OauthRefreshToken;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\View\View;
use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Attributes\Url;
use Livewire\Component;
use Livewire\WithPagination;

#[Layout('layouts.app')]
#[Title('Tokens — NaraiConnect Admin')]
class TokensIndex extends Component
{
    use WithPagination;

    #[Url(as: 'tab', except: 'access')]
    public string $tab = 'access';

    #[Url(as: 'client', except: '')]
    public string $clientId = '';

    #[Url(as: 'user', except: '')]
    public string $userId = '';

    #[Url(as: 'status', except: 'active')]
    public string $status = 'active';

    public function updatingTab(): void { $this->resetPage(); }
    public function updatingClientId(): void { $this->resetPage(); }
    public function updatingUserId(): void { $this->resetPage(); }
    public function updatingStatus(): void { $this->resetPage(); }

    public function revokeOne(string $token): void
    {
        $cls = $this->tab === 'access' ? OauthAccessToken::class : OauthRefreshToken::class;
        $col = $this->tab === 'access' ? 'access_token' : 'refresh_token';
        $cls::where($col, $token)->delete();
        session()->flash('flash.success', 'Token revoked.');
    }

    public function revokeByClient(): void
    {
        $cid = trim($this->clientId);
        if ($cid === '') {
            $this->addError('clientId', 'กรอก client_id ในช่องด้านบนก่อน');

            return;
        }
        $access = OauthAccessToken::where('client_id', $cid)->delete();
        $refresh = OauthRefreshToken::where('client_id', $cid)->delete();
        session()->flash('flash.success', "Revoked $access access + $refresh refresh tokens of \"$cid\".");
    }

    public function render(): View
    {
        $cls = $this->tab === 'access' ? OauthAccessToken::class : OauthRefreshToken::class;
        $tokenCol = $this->tab === 'access' ? 'access_token' : 'refresh_token';

        $query = $cls::query();
        if ($this->clientId !== '') $query->where('client_id', 'like', "%{$this->clientId}%");
        if ($this->userId !== '') $query->where('user_id', 'like', "%{$this->userId}%");
        if ($this->status === 'active') $query->where('expires', '>', Carbon::now());
        if ($this->status === 'expired') $query->where('expires', '<=', Carbon::now());

        $tokens = $query->orderByDesc('expires')->paginate(20);

        return view('livewire.tokens-index', [
            'tokens' => $tokens,
            'tokenCol' => $tokenCol,
        ]);
    }
}
