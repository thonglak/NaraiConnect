<div>
    <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-neutral-900">Dashboard</h1>
        <a href="{{ route('clients.create') }}"
           class="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700">
            + New client
        </a>
    </div>

    <div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <x-stat-card label="Clients (active)" :value="$stats['clients']['active']" accent="emerald" />
        <x-stat-card label="Clients (deleted)" :value="$stats['clients']['deleted']" accent="neutral" />
        <x-stat-card label="Active access tokens" :value="$stats['tokens']['activeAccess']" accent="blue" />
        <x-stat-card label="Active refresh tokens" :value="$stats['tokens']['activeRefresh']" accent="violet" />
    </div>

    <div class="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <x-stat-card label="Total clients" :value="$stats['clients']['total']" accent="neutral" />
        <x-stat-card label="Auth codes (active)" :value="$stats['authCodes']['active']" accent="amber" />
        <x-stat-card label="Scopes" :value="$stats['scopes']['total']" accent="neutral" />
    </div>

    <section class="mt-10">
        <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-neutral-900">Recent clients</h2>
            <a href="{{ route('clients.index') }}" class="text-xs text-neutral-600 hover:text-neutral-900">
                View all →
            </a>
        </div>

        <div class="mt-3 hidden overflow-hidden rounded-lg border border-neutral-200 bg-white md:block">
            <table class="w-full text-sm">
                <thead class="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
                    <tr>
                        <th class="px-4 py-2">Name</th>
                        <th class="px-4 py-2">Client ID</th>
                        <th class="px-4 py-2">Status</th>
                        <th class="px-4 py-2">Created</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($recent as $c)
                        <tr class="border-t border-neutral-100">
                            <td class="px-4 py-2">
                                <a href="{{ route('clients.show', $c->client_id) }}" class="font-medium text-neutral-900 hover:underline">
                                    {{ $c->client_name ?? '(no name)' }}
                                </a>
                            </td>
                            <td class="px-4 py-2 font-mono text-xs text-neutral-600">{{ $c->client_id }}</td>
                            <td class="px-4 py-2">
                                <x-client-status-badge :active="$c->is_active" :deleted="(bool) $c->deleted_at" />
                            </td>
                            <td class="px-4 py-2 text-xs text-neutral-600">
                                {{ $c->created_at?->timezone(config('app.timezone'))->translatedFormat('d M Y H:i') ?? '—' }}
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" class="px-4 py-6 text-center text-neutral-500">ยังไม่มี client</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <ul class="mt-3 space-y-2 md:hidden">
            @forelse ($recent as $c)
                <li class="rounded-lg border border-neutral-200 bg-white p-3">
                    <div class="flex items-start justify-between gap-2">
                        <a href="{{ route('clients.show', $c->client_id) }}" class="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900 hover:underline">
                            {{ $c->client_name ?? '(no name)' }}
                        </a>
                        <x-client-status-badge :active="$c->is_active" :deleted="(bool) $c->deleted_at" />
                    </div>
                    <div class="mt-1 truncate font-mono text-xs text-neutral-600">{{ $c->client_id }}</div>
                    <div class="mt-1 text-xs text-neutral-500">
                        {{ $c->created_at?->timezone(config('app.timezone'))->translatedFormat('d M Y H:i') ?? '—' }}
                    </div>
                </li>
            @empty
                <li class="rounded-lg border border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
                    ยังไม่มี client
                </li>
            @endforelse
        </ul>
    </section>
</div>
