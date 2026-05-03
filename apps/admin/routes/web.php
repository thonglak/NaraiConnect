<?php

use App\Http\Controllers\AuthController;
use App\Livewire\AuthCodesIndex;
use App\Livewire\ClientsCreate;
use App\Livewire\ClientsIndex;
use App\Livewire\ClientsShow;
use App\Livewire\DashboardPage;
use App\Livewire\ScopesIndex;
use App\Livewire\TokensIndex;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => view('home'))->name('home');

Route::prefix('auth')->group(function () {
    Route::get('/login', [AuthController::class, 'login'])->name('auth.login');
    Route::get('/callback', [AuthController::class, 'callback'])->name('auth.callback');
    Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::get('/me', [AuthController::class, 'me'])->name('auth.me');
});

Route::middleware('admin')->group(function () {
    Route::get('/dashboard', DashboardPage::class)->name('dashboard');

    Route::get('/clients', ClientsIndex::class)->name('clients.index');
    Route::get('/clients/new', ClientsCreate::class)->name('clients.create');
    Route::get('/clients/{clientId}', ClientsShow::class)->name('clients.show');

    Route::get('/tokens', TokensIndex::class)->name('tokens.index');
    Route::get('/auth-codes', AuthCodesIndex::class)->name('auth-codes.index');
    Route::get('/scopes', ScopesIndex::class)->name('scopes.index');
});
