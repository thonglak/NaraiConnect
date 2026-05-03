<?php

namespace App\Livewire;

use App\Models\OauthClient;
use App\Services\ClientService;
use Illuminate\View\View;
use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Attributes\Validate;
use Livewire\Component;

#[Layout('layouts.app')]
#[Title('Client — NaraiConnect Admin')]
class ClientsShow extends Component
{
    public string $clientId;

    #[Validate('required|string|max:200')]
    public string $clientName = '';

    #[Validate('required|url|max:2000')]
    public string $redirectUri = '';

    #[Validate('nullable|string|max:100')]
    public string $scope = '';

    #[Validate('nullable|string|max:80')]
    public string $grantTypes = '';

    public ?string $newSecret = null;

    public function mount(string $clientId): void
    {
        $this->clientId = $clientId;
        $this->loadFromDb();
    }

    private function loadFromDb(): void
    {
        $client = OauthClient::withTrashed()->where('client_id', $this->clientId)->firstOrFail();
        $this->clientName = $client->client_name ?? '';
        $this->redirectUri = $client->redirect_uri;
        $this->scope = $client->scope ?? '';
        $this->grantTypes = $client->grant_types ?? '';
    }

    public function save(): void
    {
        $this->validate();
        $client = OauthClient::withTrashed()->where('client_id', $this->clientId)->firstOrFail();
        if ($client->deleted_at) {
            $this->addError('clientName', 'Cannot edit a deleted client.');

            return;
        }
        $client->update([
            'client_name' => $this->clientName,
            'redirect_uri' => $this->redirectUri,
            'scope' => $this->scope ?: null,
            'grant_types' => $this->grantTypes ?: null,
        ]);
        session()->flash('flash.success', 'Client updated.');
    }

    public function regenerateSecret(ClientService $svc): void
    {
        $this->newSecret = $svc->regenerateSecret($this->clientId);
    }

    public function clearNewSecret(): void
    {
        $this->newSecret = null;
    }

    public function softDelete(ClientService $svc): void
    {
        $svc->softDelete($this->clientId);
        session()->flash('flash.success', 'Client deleted.');
        $this->loadFromDb();
    }

    public function restore(ClientService $svc): void
    {
        $svc->restore($this->clientId);
        session()->flash('flash.success', 'Client restored.');
        $this->loadFromDb();
    }

    public function render(): View
    {
        $client = OauthClient::withTrashed()->where('client_id', $this->clientId)->firstOrFail();

        return view('livewire.clients-show', [
            'client' => $client,
            'activeTokenCount' => app(ClientService::class)->activeTokenCount($this->clientId),
        ]);
    }
}
