<?php

namespace App\Livewire;

use App\Services\ClientService;
use Illuminate\View\View;
use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Attributes\Validate;
use Livewire\Component;

#[Layout('layouts.app')]
#[Title('New client — NaraiConnect Admin')]
class ClientsCreate extends Component
{
    #[Validate('required|string|max:200')]
    public string $clientName = '';

    #[Validate('required|url|max:2000')]
    public string $redirectUri = '';

    #[Validate('nullable|string|max:100')]
    public string $scope = 'email';

    #[Validate('nullable|string|max:80')]
    public string $grantTypes = 'authorization_code';

    public ?string $createdClientId = null;
    public ?string $createdClientSecret = null;

    public function save(ClientService $svc): void
    {
        $this->validate();
        $result = $svc->create([
            'client_name' => $this->clientName,
            'redirect_uri' => $this->redirectUri,
            'scope' => $this->scope ?: null,
            'grant_types' => $this->grantTypes ?: null,
        ]);
        $this->createdClientId = $result['clientId'];
        $this->createdClientSecret = $result['clientSecret'];
    }

    public function done(): void
    {
        $this->redirectRoute('clients.show', $this->createdClientId, navigate: false);
    }

    public function render(): View
    {
        return view('livewire.clients-create');
    }
}
