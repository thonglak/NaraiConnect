<div>
    <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-neutral-900">Authorization codes</h1>
        <span class="text-xs text-neutral-500">read-only</span>
    </div>

    <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <input type="search" wire:model.live.debounce.300ms="clientId" placeholder="client_id"
               class="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none sm:w-56">
        <input type="search" wire:model.live.debounce.300ms="userId" placeholder="user_id"
               class="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none sm:w-56">
        <div class="flex items-center gap-2 sm:gap-3">
            <select wire:model.live="status"
                    class="flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none sm:flex-none">
                <option value="active">Active only</option>
                <option value="expired">Expired only</option>
                <option value="all">All</option>
            </select>
            <button wire:click="$refresh"
                    class="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100">Refresh</button>
        </div>
    </div>

    <div class="mt-6 hidden overflow-hidden rounded-lg border border-neutral-200 bg-white md:block">
        <table class="w-full text-sm">
            <thead class="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
                <tr>
                    <th class="px-4 py-2">Code</th>
                    <th class="px-4 py-2">Client ID</th>
                    <th class="px-4 py-2">User</th>
                    <th class="px-4 py-2">Scope</th>
                    <th class="px-4 py-2">Expires</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($codes as $c)
                    @php $expired = $c->expires->isPast(); @endphp
                    <tr class="border-t border-neutral-100" wire:key="ac-{{ $c->authorization_code }}">
                        <td class="px-4 py-2 font-mono text-xs text-neutral-700">{{ \Illuminate\Support\Str::limit($c->authorization_code, 16, '…') }}</td>
                        <td class="px-4 py-2 font-mono text-xs text-neutral-600">{{ $c->client_id }}</td>
                        <td class="px-4 py-2 text-xs text-neutral-600">{{ $c->user_id ?? '—' }}</td>
                        <td class="px-4 py-2 text-xs text-neutral-600">{{ $c->scope ?? '—' }}</td>
                        <td class="px-4 py-2 text-xs">
                            <span class="{{ $expired ? 'text-neutral-500' : 'text-emerald-700' }}">
                                {{ $c->expires->translatedFormat('d M Y H:i') }}
                            </span>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="5" class="px-4 py-8 text-center text-neutral-500">ไม่พบ authorization code</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <ul class="mt-6 space-y-2 md:hidden">
        @forelse ($codes as $c)
            @php $expired = $c->expires->isPast(); @endphp
            <li class="rounded-lg border border-neutral-200 bg-white p-3" wire:key="acc-{{ $c->authorization_code }}">
                <div class="truncate font-mono text-xs text-neutral-700">{{ \Illuminate\Support\Str::limit($c->authorization_code, 24, '…') }}</div>
                <div class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <div class="col-span-2 truncate font-mono text-neutral-600">
                        <span class="text-neutral-500">client:</span> {{ $c->client_id }}
                    </div>
                    <div class="text-neutral-600"><span class="text-neutral-500">user:</span> {{ $c->user_id ?? '—' }}</div>
                    <div class="truncate text-neutral-600"><span class="text-neutral-500">scope:</span> {{ $c->scope ?? '—' }}</div>
                    <div class="col-span-2">
                        <span class="text-neutral-500">expires:</span>
                        <span class="{{ $expired ? 'text-neutral-500' : 'text-emerald-700' }}">
                            {{ $c->expires->translatedFormat('d M Y H:i') }}
                        </span>
                    </div>
                </div>
            </li>
        @empty
            <li class="rounded-lg border border-neutral-200 bg-white px-4 py-8 text-center text-sm text-neutral-500">
                ไม่พบ authorization code
            </li>
        @endforelse
    </ul>

    <div class="mt-4">{{ $codes->links() }}</div>
</div>
