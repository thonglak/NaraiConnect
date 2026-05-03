<?php

use App\Livewire\AuthCodesIndex;
use App\Livewire\ClientsCreate;
use App\Livewire\ClientsIndex;
use App\Livewire\ClientsShow;
use App\Livewire\DashboardPage;
use App\Livewire\ScopesIndex;
use App\Livewire\TokensIndex;
use App\Models\AdminUser;
use App\Models\OauthClient;
use Livewire\Livewire;

beforeEach(function () {
    $this->withSession(['admin_user_id' => AdminUser::first()->id]);
});

it('loads dashboard with stats', function () {
    Livewire::test(DashboardPage::class)
        ->assertOk()
        ->assertSee('Dashboard');
});

it('loads clients index and filters by search', function () {
    $sample = OauthClient::active()->first();
    expect($sample)->not->toBeNull();

    Livewire::test(ClientsIndex::class)
        ->assertOk()
        ->set('q', $sample->client_id)
        ->assertSee($sample->client_id);
});

it('loads clients create form', function () {
    Livewire::test(ClientsCreate::class)
        ->assertOk()
        ->assertSee('Create OAuth Client');
});

it('validates clients create form', function () {
    Livewire::test(ClientsCreate::class)
        ->call('save')
        ->assertHasErrors(['clientName' => 'required', 'redirectUri' => 'required']);
});

it('loads clients show for an existing client', function () {
    $client = OauthClient::active()->first();
    expect($client)->not->toBeNull();

    Livewire::test(ClientsShow::class, ['clientId' => $client->client_id])
        ->assertOk()
        ->assertSee($client->client_id);
});

it('loads tokens index in both tabs', function () {
    Livewire::test(TokensIndex::class)
        ->assertOk()
        ->assertSee('Access tokens')
        ->set('tab', 'refresh')
        ->assertSet('tab', 'refresh');
});

it('loads auth-codes index', function () {
    Livewire::test(AuthCodesIndex::class)
        ->assertOk()
        ->assertSee('Authorization codes');
});

it('loads scopes index', function () {
    Livewire::test(ScopesIndex::class)
        ->assertOk()
        ->assertSee('Scopes');
});

it('opens scope create modal and validates', function () {
    Livewire::test(ScopesIndex::class)
        ->call('openCreate')
        ->assertSet('modalMode', 'create')
        ->call('save')
        ->assertHasErrors(['scopeValue' => 'required']);
});

it('blocks dashboard route without admin session', function () {
    $this->flushSession();
    $this->get('/dashboard')->assertRedirect(route('home'));
    $this->get('/clients')->assertRedirect(route('home'));
    $this->get('/tokens')->assertRedirect(route('home'));
});
