<?php

use App\Models\AdminUser;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config()->set('narai_oauth', [
        'client_id' => 'test-client',
        'client_secret' => 'test-secret',
        'authorize_url' => 'https://idp.example.com/oauth/authorize',
        'token_url' => 'https://idp.example.com/oauth/token',
        'userinfo_url' => 'https://idp.example.com/oauth/userinfo',
        'redirect_uri' => 'http://localhost/auth/callback',
        'scope' => 'email',
    ]);
});

it('renders home page with login link', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertSee('NaraiConnect Admin');
    $response->assertSee(route('auth.login'));
});

it('redirects unauthenticated users from dashboard to home', function () {
    $this->get('/dashboard')->assertRedirect(route('home'));
});

it('returns 401 from /auth/me when unauthenticated', function () {
    $this->getJson('/auth/me')->assertStatus(401);
});

it('redirects /auth/login to authorize URL with state in session', function () {
    $response = $this->get('/auth/login');

    $response->assertStatus(302);
    expect($response->headers->get('Location'))
        ->toStartWith('https://idp.example.com/oauth/authorize')
        ->toContain('client_id=test-client')
        ->toContain('response_type=code')
        ->toContain('redirect_uri=http%3A%2F%2Flocalhost%2Fauth%2Fcallback');

    expect(session('narai_oauth_state'))->toBeString()->not->toBeEmpty();
});

it('rejects callback with mismatched state', function () {
    $this->withSession(['narai_oauth_state' => 'expected-state']);

    $response = $this->get('/auth/callback?code=abc&state=wrong-state');

    $response->assertSessionHasErrors(['state']);
});

it('redirects callback to home when state cookie missing', function () {
    $this->get('/auth/callback?code=abc&state=anything')
        ->assertRedirect(route('home'))
        ->assertSessionHasErrors(['oauth']);
});

it('logs in known admin via OAuth callback and redirects to dashboard', function () {
    Http::fake([
        'idp.example.com/oauth/token' => Http::response([
            'access_token' => 'fake-access-token',
            'token_type' => 'Bearer',
            'expires_in' => 3600,
        ]),
        'idp.example.com/oauth/userinfo' => Http::response([
            'username' => 'NP_1696',
            'display_name' => 'Test Admin',
        ]),
    ]);

    $this->withSession(['narai_oauth_state' => 'state-xyz']);

    $response = $this->get('/auth/callback?code=valid-code&state=state-xyz');

    $response->assertRedirect(route('dashboard'));
    expect(session('admin_user_id'))->toBe(AdminUser::where('username', 'NP_1696')->value('id'));
});

it('rejects callback when user is not in admin_users', function () {
    Http::fake([
        'idp.example.com/oauth/token' => Http::response(['access_token' => 'fake']),
        'idp.example.com/oauth/userinfo' => Http::response([
            'username' => 'unauthorized-user-'.uniqid(),
        ]),
    ]);

    $this->withSession(['narai_oauth_state' => 'state-xyz']);

    expect(fn () => $this->withoutExceptionHandling()->get('/auth/callback?code=c&state=state-xyz'))
        ->toThrow(RuntimeException::class, 'is not authorized');
});

it('logout clears the admin session', function () {
    $this->withSession(['admin_user_id' => AdminUser::first()->id]);

    $this->getJson('/auth/me')->assertStatus(200);

    $this->post('/auth/logout')->assertRedirect(route('home'));
});
