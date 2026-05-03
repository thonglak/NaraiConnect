<div class="max-w-3xl">
    <a href="{{ route('clients.index') }}" class="mb-4 inline-block text-sm text-neutral-500 hover:text-neutral-900">
        ← Back to list
    </a>

    <div class="border-b border-neutral-200 pb-4">
        <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 class="text-xl font-semibold text-neutral-900">{{ $client->client_name ?? '(no name)' }}</h1>
            @if ($client->deleted_at)
                <span class="rounded bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-700">deleted</span>
            @endif
        </div>
        <div class="mt-2 grid grid-cols-1 gap-3 text-sm text-neutral-600 sm:grid-cols-2">
            <div>
                <span class="text-xs text-neutral-500">Client ID</span>
                <div class="break-all font-mono text-xs">{{ $client->client_id }}</div>
            </div>
            <div>
                <span class="text-xs text-neutral-500">Active tokens</span>
                <div>{{ $activeTokenCount }}</div>
            </div>
            <div>
                <span class="text-xs text-neutral-500">Created</span>
                <div>{{ $client->created_at?->translatedFormat('d M Y H:i') ?? '—' }}</div>
            </div>
            <div>
                <span class="text-xs text-neutral-500">Updated</span>
                <div>{{ $client->updated_at?->translatedFormat('d M Y H:i') ?? '—' }}</div>
            </div>
        </div>
    </div>

    <form wire:submit="save" class="mt-6 space-y-4">
        <x-form-field label="Client name">
            <input type="text" wire:model="clientName" @disabled($client->deleted_at)
                   class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none disabled:bg-neutral-100">
            @error('clientName') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
        </x-form-field>
        <x-form-field label="Redirect URI">
            <input type="url" wire:model="redirectUri" @disabled($client->deleted_at)
                   class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none disabled:bg-neutral-100">
            @error('redirectUri') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
        </x-form-field>
        <x-form-field label="Scope">
            <input type="text" wire:model="scope" @disabled($client->deleted_at)
                   class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none disabled:bg-neutral-100">
        </x-form-field>
        <x-form-field label="Grant types">
            <input type="text" wire:model="grantTypes" @disabled($client->deleted_at)
                   class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none disabled:bg-neutral-100">
        </x-form-field>

        @unless ($client->deleted_at)
            <button type="submit"
                    wire:loading.attr="disabled"
                    class="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50">
                <span wire:loading.remove wire:target="save">Save changes</span>
                <span wire:loading wire:target="save">Saving…</span>
            </button>
        @endunless
    </form>

    <div class="mt-8 border-t border-neutral-200 pt-6">
        <h2 class="text-sm font-semibold text-neutral-900">Actions</h2>
        <div class="mt-3 flex flex-wrap items-center gap-3">
            @if ($client->deleted_at)
                <button wire:click="restore"
                        class="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-100">
                    Restore client
                </button>
            @else
                <button wire:click="regenerateSecret"
                        wire:confirm="Regenerate client secret? secret เดิมจะใช้ไม่ได้ทันที"
                        class="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-100">
                    Regenerate secret
                </button>
                <button wire:click="softDelete"
                        wire:confirm="Soft-delete client นี้?"
                        class="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100">
                    Soft delete
                </button>
            @endif
        </div>
    </div>

    @if ($newSecret)
        <x-secret-modal :clientId="$client->client_id"
                        :clientSecret="$newSecret"
                        wire:click="clearNewSecret" />
    @endif
</div>
