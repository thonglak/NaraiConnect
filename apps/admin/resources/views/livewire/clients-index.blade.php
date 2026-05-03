<div>
    <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-neutral-900">OAuth Clients</h1>
        <a href="{{ route('clients.create') }}"
           class="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700">
            + New client
        </a>
    </div>

    <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <input type="search"
               wire:model.live.debounce.300ms="q"
               placeholder="ค้นหาตามชื่อหรือ client_id"
               class="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none sm:w-72">
        <div class="flex items-center gap-2 sm:gap-3">
            <select wire:model.live="status"
                    class="flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none sm:flex-none">
                <option value="active">Active only</option>
                <option value="deleted">Deleted only</option>
                <option value="all">All</option>
            </select>
            <button wire:click="$refresh"
                    class="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100">
                Refresh
            </button>
        </div>
    </div>

    <div class="mt-6 hidden overflow-hidden rounded-lg border border-neutral-200 bg-white md:block">
        <table class="w-full text-sm">
            <thead class="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
                <tr>
                    <th class="px-4 py-2">Name</th>
                    <th class="px-4 py-2">Client ID</th>
                    <th class="px-4 py-2">Redirect URI</th>
                    <th class="px-4 py-2">Scope</th>
                    <th class="px-4 py-2">Status</th>
                    <th class="px-4 py-2 text-right">Active tokens</th>
                    <th class="px-4 py-2"></th>
                </tr>
            </thead>
            <tbody>
                @forelse ($clients as $c)
                    <tr class="border-t border-neutral-100" wire:key="row-{{ $c->client_id }}">
                        <td class="px-4 py-2">
                            <a href="{{ route('clients.show', $c->client_id) }}"
                               class="font-medium text-neutral-900 hover:underline">
                                {{ $c->client_name ?? '(no name)' }}
                            </a>
                        </td>
                        <td class="px-4 py-2 font-mono text-xs text-neutral-600">{{ $c->client_id }}</td>
                        <td class="px-4 py-2 max-w-xs truncate text-xs text-neutral-600">{{ $c->redirect_uri }}</td>
                        <td class="px-4 py-2 text-xs text-neutral-600">{{ $c->scope ?? '—' }}</td>
                        <td class="px-4 py-2">
                            <x-client-status-badge :active="$c->is_active" :deleted="(bool) $c->deleted_at" />
                        </td>
                        <td class="px-4 py-2 text-right text-neutral-600">{{ $tokenCounts[$c->client_id] ?? 0 }}</td>
                        <td class="px-4 py-2 text-right">
                            @if ($c->deleted_at)
                                <button wire:click="restore('{{ $c->client_id }}')"
                                        class="text-xs text-emerald-700 hover:underline">Restore</button>
                            @else
                                <div class="flex justify-end gap-3">
                                    <a href="{{ route('clients.show', $c->client_id) }}" class="text-xs text-neutral-700 hover:underline">Edit</a>
                                    <button wire:click="delete('{{ $c->client_id }}')"
                                            wire:confirm="Soft-delete client &quot;{{ $c->client_name ?? $c->client_id }}&quot;?"
                                            class="text-xs text-red-700 hover:underline">Delete</button>
                                </div>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="px-4 py-8 text-center text-neutral-500">ไม่พบ client</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <ul class="mt-6 space-y-2 md:hidden">
        @forelse ($clients as $c)
            <li class="rounded-lg border border-neutral-200 bg-white p-3" wire:key="card-{{ $c->client_id }}">
                <div class="flex items-start justify-between gap-2">
                    <a href="{{ route('clients.show', $c->client_id) }}"
                       class="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900 hover:underline">
                        {{ $c->client_name ?? '(no name)' }}
                    </a>
                    <x-client-status-badge :active="$c->is_active" :deleted="(bool) $c->deleted_at" />
                </div>
                <div class="mt-1 truncate font-mono text-xs text-neutral-600">{{ $c->client_id }}</div>
                <div class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-neutral-600">
                    <div class="col-span-2">
                        <span class="text-neutral-500">Redirect:</span>
                        <span class="break-all">{{ $c->redirect_uri }}</span>
                    </div>
                    <div><span class="text-neutral-500">Scope:</span> {{ $c->scope ?? '—' }}</div>
                    <div class="text-right"><span class="text-neutral-500">Tokens:</span> {{ $tokenCounts[$c->client_id] ?? 0 }}</div>
                </div>
                <div class="mt-3 flex justify-end gap-4 border-t border-neutral-100 pt-2">
                    @if ($c->deleted_at)
                        <button wire:click="restore('{{ $c->client_id }}')"
                                class="text-xs font-medium text-emerald-700 hover:underline">Restore</button>
                    @else
                        <a href="{{ route('clients.show', $c->client_id) }}"
                           class="text-xs font-medium text-neutral-700 hover:underline">Edit</a>
                        <button wire:click="delete('{{ $c->client_id }}')"
                                wire:confirm="Soft-delete client &quot;{{ $c->client_name ?? $c->client_id }}&quot;?"
                                class="text-xs font-medium text-red-700 hover:underline">Delete</button>
                    @endif
                </div>
            </li>
        @empty
            <li class="rounded-lg border border-neutral-200 bg-white px-4 py-8 text-center text-sm text-neutral-500">
                ไม่พบ client
            </li>
        @endforelse
    </ul>

    <div class="mt-4">
        {{ $clients->links() }}
    </div>
</div>
