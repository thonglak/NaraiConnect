<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $title ?? 'NaraiConnect Admin' }}</title>
    @vite(['resources/css/app.css'])
    @livewireStyles
</head>
<body class="bg-neutral-50 text-neutral-900 antialiased">
    @php
        $admin = app(\App\Services\AdminSession::class)->current();
        $items = [
            ['url' => route('dashboard'),  'label' => 'Dashboard',  'route' => 'dashboard'],
            ['url' => route('clients.index'), 'label' => 'Clients', 'route' => 'clients.*'],
            ['url' => route('scopes.index'), 'label' => 'Scopes', 'route' => 'scopes.*'],
            ['url' => route('tokens.index'), 'label' => 'Tokens', 'route' => 'tokens.*'],
            ['url' => route('auth-codes.index'), 'label' => 'Auth codes', 'route' => 'auth-codes.*'],
        ];
        $isActive = fn (string $pattern) => request()->routeIs($pattern);
    @endphp

    <div x-data="{ menuOpen: false }">
        <header class="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
            <div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <div class="flex min-w-0 items-center gap-2 sm:gap-6">
                    <button type="button"
                            @click="menuOpen = !menuOpen"
                            aria-label="Toggle navigation"
                            class="-ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 md:hidden">
                        <svg x-show="!menuOpen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <line x1="3" y1="12" x2="21" y2="12"/>
                            <line x1="3" y1="18" x2="21" y2="18"/>
                        </svg>
                        <svg x-show="menuOpen" x-cloak width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                    <a href="{{ route('home') }}" class="truncate text-sm font-semibold text-neutral-900">NaraiConnect Admin</a>
                    <nav class="hidden items-center gap-4 text-sm text-neutral-600 md:flex">
                        @foreach ($items as $item)
                            <a href="{{ $item['url'] }}"
                               class="hover:text-neutral-900 {{ $isActive($item['route']) ? 'text-neutral-900' : '' }}">
                                {{ $item['label'] }}
                            </a>
                        @endforeach
                    </nav>
                </div>

                @if ($admin)
                    <div class="flex min-w-0 items-center gap-2 text-sm sm:gap-3">
                        <span class="hidden min-w-0 truncate text-neutral-600 sm:inline">
                            {{ $admin->display_name ?? $admin->username }}
                        </span>
                        @if ($admin->is_super)
                            <span class="hidden rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 sm:inline">super</span>
                        @endif
                        <form method="POST" action="{{ route('auth.logout') }}">
                            @csrf
                            <button type="submit"
                                    class="rounded-md border border-neutral-300 px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-100">
                                Logout
                            </button>
                        </form>
                    </div>
                @endif
            </div>

            <nav x-show="menuOpen" x-cloak class="border-t border-neutral-200 bg-white px-2 py-2 md:hidden">
                <ul class="flex flex-col">
                    @foreach ($items as $item)
                        <li>
                            <a href="{{ $item['url'] }}"
                               @click="menuOpen = false"
                               class="block rounded-md px-3 py-2 text-sm {{ $isActive($item['route']) ? 'bg-neutral-100 font-medium text-neutral-900' : 'text-neutral-700 hover:bg-neutral-50' }}">
                                {{ $item['label'] }}
                            </a>
                        </li>
                    @endforeach
                    @if ($admin)
                        <li class="mt-1 border-t border-neutral-100 px-3 pt-2 text-xs text-neutral-500">
                            {{ $admin->display_name ?? $admin->username }}
                            @if ($admin->is_super)
                                <span class="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">super</span>
                            @endif
                        </li>
                    @endif
                </ul>
            </nav>
        </header>

        <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            @if (session('flash.success'))
                <div class="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                    {{ session('flash.success') }}
                </div>
            @endif
            @if ($errors->any())
                <div class="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    @foreach ($errors->all() as $msg)
                        <div>{{ $msg }}</div>
                    @endforeach
                </div>
            @endif

            {{ $slot }}
        </main>
    </div>

    @livewireScripts
</body>
</html>
