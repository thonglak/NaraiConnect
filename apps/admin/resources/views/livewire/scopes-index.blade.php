<div>
    <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-neutral-900">Scopes</h1>
        <button wire:click="openCreate"
                class="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700">
            + New scope
        </button>
    </div>

    <div class="mt-6 hidden overflow-hidden rounded-lg border border-neutral-200 bg-white md:block">
        <table class="w-full text-sm">
            <thead class="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
                <tr>
                    <th class="px-4 py-2">Scope</th>
                    <th class="px-4 py-2">Default</th>
                    <th class="px-4 py-2">Created</th>
                    <th class="px-4 py-2"></th>
                </tr>
            </thead>
            <tbody>
                @forelse ($scopes as $s)
                    <tr class="border-t border-neutral-100" wire:key="s-{{ $s->id }}">
                        <td class="px-4 py-2 font-mono text-xs text-neutral-700">{{ $s->scope ?? '—' }}</td>
                        <td class="px-4 py-2">
                            @if ($s->is_default)
                                <span class="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">default</span>
                            @else
                                <span class="text-xs text-neutral-400">no</span>
                            @endif
                        </td>
                        <td class="px-4 py-2 text-xs text-neutral-600">
                            {{ $s->created_at?->translatedFormat('d M Y H:i') ?? '—' }}
                        </td>
                        <td class="px-4 py-2 text-right">
                            <div class="flex justify-end gap-3">
                                <button wire:click="openEdit({{ $s->id }})" class="text-xs text-neutral-700 hover:underline">Edit</button>
                                <button wire:click="delete({{ $s->id }})"
                                        wire:confirm="Delete scope &quot;{{ $s->scope }}&quot;?"
                                        class="text-xs text-red-700 hover:underline">Delete</button>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="4" class="px-4 py-8 text-center text-neutral-500">ยังไม่มี scope</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <ul class="mt-6 space-y-2 md:hidden">
        @forelse ($scopes as $s)
            <li class="rounded-lg border border-neutral-200 bg-white p-3" wire:key="sc-{{ $s->id }}">
                <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0 flex-1 truncate font-mono text-sm text-neutral-800">{{ $s->scope ?? '—' }}</div>
                    @if ($s->is_default)
                        <span class="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">default</span>
                    @endif
                </div>
                <div class="mt-1 text-xs text-neutral-500">{{ $s->created_at?->translatedFormat('d M Y H:i') ?? '—' }}</div>
                <div class="mt-3 flex justify-end gap-4 border-t border-neutral-100 pt-2">
                    <button wire:click="openEdit({{ $s->id }})" class="text-xs font-medium text-neutral-700 hover:underline">Edit</button>
                    <button wire:click="delete({{ $s->id }})"
                            wire:confirm="Delete scope &quot;{{ $s->scope }}&quot;?"
                            class="text-xs font-medium text-red-700 hover:underline">Delete</button>
                </div>
            </li>
        @empty
            <li class="rounded-lg border border-neutral-200 bg-white px-4 py-8 text-center text-sm text-neutral-500">ยังไม่มี scope</li>
        @endforelse
    </ul>

    <div class="mt-4">{{ $scopes->links() }}</div>

    @if ($modalMode !== '')
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
             wire:click.self="close">
            <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <h2 class="text-lg font-semibold text-neutral-900">
                    {{ $modalMode === 'create' ? 'New scope' : 'Edit scope' }}
                </h2>

                <form wire:submit="save" class="mt-4 space-y-4">
                    <x-form-field label="Scope" required>
                        <input type="text" wire:model="scopeValue"
                               class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none">
                        @error('scopeValue') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
                    </x-form-field>

                    <label class="flex items-center gap-2">
                        <input type="checkbox" wire:model="isDefault" class="h-4 w-4">
                        <span class="text-sm text-neutral-700">Default scope</span>
                    </label>

                    <div class="flex items-center justify-end gap-2 pt-2">
                        <button type="button" wire:click="close"
                                class="rounded-md border border-neutral-300 px-4 py-1.5 text-sm hover:bg-neutral-100">Cancel</button>
                        <button type="submit"
                                wire:loading.attr="disabled"
                                class="rounded-md bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50">
                            <span wire:loading.remove wire:target="save">Save</span>
                            <span wire:loading wire:target="save">Saving…</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    @endif
</div>
