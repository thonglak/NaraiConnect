<?php

namespace App\Livewire;

use App\Models\OauthAuthorizationCode;
use Illuminate\Support\Carbon;
use Illuminate\View\View;
use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Attributes\Url;
use Livewire\Component;
use Livewire\WithPagination;

#[Layout('layouts.app')]
#[Title('Authorization codes — NaraiConnect Admin')]
class AuthCodesIndex extends Component
{
    use WithPagination;

    #[Url(as: 'client', except: '')]
    public string $clientId = '';

    #[Url(as: 'user', except: '')]
    public string $userId = '';

    #[Url(as: 'status', except: 'active')]
    public string $status = 'active';

    public function updatingClientId(): void { $this->resetPage(); }
    public function updatingUserId(): void { $this->resetPage(); }
    public function updatingStatus(): void { $this->resetPage(); }

    public function render(): View
    {
        $query = OauthAuthorizationCode::query();
        if ($this->clientId !== '') $query->where('client_id', 'like', "%{$this->clientId}%");
        if ($this->userId !== '') $query->where('user_id', 'like', "%{$this->userId}%");
        if ($this->status === 'active') $query->where('expires', '>', Carbon::now());
        if ($this->status === 'expired') $query->where('expires', '<=', Carbon::now());

        $codes = $query->orderByDesc('expires')->paginate(20);

        return view('livewire.auth-codes-index', ['codes' => $codes]);
    }
}
