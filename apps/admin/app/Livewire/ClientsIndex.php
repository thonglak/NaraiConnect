<?php

namespace App\Livewire;

use App\Models\OauthAccessToken;
use App\Models\OauthClient;
use App\Services\ClientService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\View\View;
use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Attributes\Url;
use Livewire\Component;
use Livewire\WithPagination;

#[Layout('layouts.app')]
#[Title('Clients — NaraiConnect Admin')]
class ClientsIndex extends Component
{
    use WithPagination;

    #[Url(as: 'q', except: '')]
    public string $q = '';

    #[Url(as: 'status', except: 'active')]
    public string $status = 'active';

    public function updatingQ(): void { $this->resetPage(); }
    public function updatingStatus(): void { $this->resetPage(); }

    public function delete(string $clientId): void
    {
        app(ClientService::class)->softDelete($clientId);
        session()->flash('flash.success', "Client \"$clientId\" deleted.");
    }

    public function restore(string $clientId): void
    {
        app(ClientService::class)->restore($clientId);
        session()->flash('flash.success', "Client \"$clientId\" restored.");
    }

    public function render(): View
    {
        $query = OauthClient::query();

        if ($this->status === 'active') {
            $query->whereNull('deleted_at')->where('is_active', 1);
        } elseif ($this->status === 'deleted') {
            $query->onlyTrashed();
        } else {
            $query->withTrashed();
        }

        $search = trim($this->q);
        if ($search !== '') {
            $query->where(function (Builder $b) use ($search) {
                $b->where('client_name', 'like', "%{$search}%")
                  ->orWhere('client_id', 'like', "%{$search}%");
            });
        }

        $clients = $query->orderByDesc('created_at')->paginate(20);

        $ids = collect($clients->items())->pluck('client_id')->all();
        $tokenCounts = empty($ids)
            ? collect()
            : OauthAccessToken::whereIn('client_id', $ids)
                ->where('expires', '>', Carbon::now())
                ->selectRaw('client_id, COUNT(*) as c')
                ->groupBy('client_id')
                ->pluck('c', 'client_id');

        return view('livewire.clients-index', [
            'clients' => $clients,
            'tokenCounts' => $tokenCounts,
        ]);
    }
}
