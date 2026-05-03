<div>
    <div class="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <h1 class="text-xl font-semibold text-neutral-900">Tokens</h1>
        <button wire:click="revokeByClient"
                wire:confirm="Revoke ALL tokens of this client?"
                class="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50">
            Revoke by client_id
        </button>
    </div>

    <div class="mt-4 flex gap-1 overflow-x-auto border-b border-neutral-200">
        @foreach ([['access', 'Access tokens'], ['refresh', 'Refresh tokens']] as [$key, $label])
            <button type="button" wire:click="$set('tab', '{{ $key }}')"
                    class="-mb-px border-b-2 px-3 py-2 text-sm {{ $tab === $key ? 'border-neutral-900 font-medium text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-800' }}">
                {{ $label }}
            </button>
        @endforeach
    </div>

    <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <input type="search" wire:model.live.debounce.300ms="clientId" placeholder="client_id"
               class="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none sm:w-56">
        <input type="search" wire:model.live.debounce.300ms="userId" placeholder="user_id"
               class="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none sm:w-56">
        <select wire:model.live="status"
                class="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none sm:w-auto">
            <option value="active">Active only</option>
            <option value="expired">Expired only</option>
            <option value="all">All</option>
        </select>
    </div>

    @error('clientId')
        <div class="mt-2 text-xs text-red-600">{{ $message }}</div>
    @enderror

    <div class="mt-6 hidden overflow-hidden rounded-lg border border-neutral-200 bg-white md:block">
        <table class="w-full text-sm">
            <thead class="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
                <tr>
                    <th class="px-4 py-2">Token</th>
                    <th class="px-4 py-2">Client ID</th>
                    <th class="px-4 py-2">User</th>
                    <th class="px-4 py-2">Scope</th>
                    <th class="px-4 py-2">Expires</th>
                    <th class="px-4 py-2"></th>
                </tr>
            </thead>
            <tbody>
                @forelse ($tokens as $t)
                    @php $value = $t->{$tokenCol}; $expired = $t->expires->isPast(); @endphp
                    <tr class="border-t border-neutral-100" wire:key="t-{{ $value }}">
                        <td class="px-4 py-2 font-mono text-xs text-neutral-700">{{ \Illuminate\Support\Str::limit($value, 16, '…') }}</td>
                        <td class="px-4 py-2 font-mono text-xs text-neutral-600">{{ $t->client_id }}</td>
                        <td class="px-4 py-2 text-xs text-neutral-600">{{ $t->user_id ?? '—' }}</td>
                        <td class="px-4 py-2 text-xs text-neutral-600">{{ $t->scope ?? '—' }}</td>
                        <td class="px-4 py-2 text-xs">
                            <span class="{{ $expired ? 'text-neutral-500' : 'text-emerald-700' }}">
                                {{ $t->expires->translatedFormat('d M Y H:i') }}
                            </span>
                        </td>
                        <td class="px-4 py-2 text-right">
                            <button wire:click="revokeOne('{{ $value }}')"
                                    wire:confirm="Revoke this token?"
                                    class="text-xs text-red-700 hover:underline">Revoke</button>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="px-4 py-8 text-center text-neutral-500">ไม่พบ token</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <ul class="mt-6 space-y-2 md:hidden">
        @forelse ($tokens as $t)
            @php $value = $t->{$tokenCol}; $expired = $t->expires->isPast(); @endphp
            <li class="rounded-lg border border-neutral-200 bg-white p-3" wire:key="tc-{{ $value }}">
                <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0 flex-1 truncate font-mono text-xs text-neutral-700">{{ \Illuminate\Support\Str::limit($value, 24, '…') }}</div>
                    <button wire:click="revokeOne('{{ $value }}')"
                            wire:confirm="Revoke this token?"
                            class="text-xs font-medium text-red-700 hover:underline">Revoke</button>
                </div>
                <div class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <div class="col-span-2 truncate font-mono text-neutral-600">
                        <span class="text-neutral-500">client:</span> {{ $t->client_id }}
                    </div>
                    <div class="text-neutral-600"><span class="text-neutral-500">user:</span> {{ $t->user_id ?? '—' }}</div>
                    <div class="truncate text-neutral-600"><span class="text-neutral-500">scope:</span> {{ $t->scope ?? '—' }}</div>
                    <div class="col-span-2">
                        <span class="text-neutral-500">expires:</span>
                        <span class="{{ $expired ? 'text-neutral-500' : 'text-emerald-700' }}">
                            {{ $t->expires->translatedFormat('d M Y H:i') }}
                        </span>
                    </div>
                </div>
            </li>
        @empty
            <li class="rounded-lg border border-neutral-200 bg-white px-4 py-8 text-center text-sm text-neutral-500">
                ไม่พบ token
            </li>
        @endforelse
    </ul>

    <div class="mt-4">{{ $tokens->links() }}</div>
</div>
