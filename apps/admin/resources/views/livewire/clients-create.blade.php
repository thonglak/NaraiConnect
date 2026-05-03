<div class="max-w-xl">
    <h1 class="text-xl font-semibold text-neutral-900">Create OAuth Client</h1>
    <p class="mt-1 text-sm text-neutral-600">ระบบจะสุ่ม client_id และ client_secret ให้อัตโนมัติ</p>

    <form wire:submit="save" class="mt-6 space-y-4">
        <x-form-field label="Client name" required>
            <input type="text" wire:model="clientName"
                   placeholder="เช่น naraiapps-prod"
                   class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none">
            @error('clientName') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
        </x-form-field>

        <x-form-field label="Redirect URI" required>
            <input type="url" wire:model="redirectUri"
                   placeholder="https://example.com/callback"
                   class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none">
            @error('redirectUri') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
        </x-form-field>

        <x-form-field label="Scope" hint="คั่นด้วย space ถ้ามีหลาย scope">
            <input type="text" wire:model="scope"
                   class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none">
            @error('scope') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
        </x-form-field>

        <x-form-field label="Grant types" hint="คั่นด้วย space ถ้ามีหลายแบบ">
            <input type="text" wire:model="grantTypes"
                   class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none">
            @error('grantTypes') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
        </x-form-field>

        <div class="flex items-center gap-3 pt-2">
            <button type="submit"
                    wire:loading.attr="disabled"
                    class="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50">
                <span wire:loading.remove>Create client</span>
                <span wire:loading>Creating…</span>
            </button>
            <a href="{{ route('clients.index') }}"
               class="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100">Cancel</a>
        </div>
    </form>

    @if ($createdClientId && $createdClientSecret)
        <x-secret-modal :clientId="$createdClientId"
                        :clientSecret="$createdClientSecret"
                        wire:click="done" />
    @endif
</div>
