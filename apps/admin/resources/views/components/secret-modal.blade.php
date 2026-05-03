@props(['clientId', 'clientSecret'])

<div x-data="{
        copied: null,
        async copy(key, value) {
            await navigator.clipboard.writeText(value);
            this.copied = key;
            setTimeout(() => { this.copied = null; }, 1500);
        }
     }"
     class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 class="text-lg font-semibold text-neutral-900">Client credentials</h2>
        <p class="mt-1 text-sm text-amber-700">เก็บ secret ไว้ทันที — ระบบจะไม่แสดงอีกครั้ง</p>

        <div class="mt-4 space-y-3">
            <div>
                <label class="text-xs font-medium text-neutral-600">Client ID</label>
                <div class="mt-1 flex items-center gap-2">
                    <code class="flex-1 truncate rounded border border-neutral-200 bg-neutral-50 px-2 py-1.5 font-mono text-xs">{{ $clientId }}</code>
                    <button type="button" @click="copy('id', '{{ $clientId }}')"
                            class="rounded-md border border-neutral-300 px-2 py-1.5 text-xs hover:bg-neutral-100">
                        <span x-show="copied !== 'id'">Copy</span>
                        <span x-show="copied === 'id'">✓</span>
                    </button>
                </div>
            </div>
            <div>
                <label class="text-xs font-medium text-neutral-600">Client Secret</label>
                <div class="mt-1 flex items-center gap-2">
                    <code class="flex-1 truncate rounded border border-neutral-200 bg-neutral-50 px-2 py-1.5 font-mono text-xs">{{ $clientSecret }}</code>
                    <button type="button" @click="copy('secret', '{{ $clientSecret }}')"
                            class="rounded-md border border-neutral-300 px-2 py-1.5 text-xs hover:bg-neutral-100">
                        <span x-show="copied !== 'secret'">Copy</span>
                        <span x-show="copied === 'secret'">✓</span>
                    </button>
                </div>
            </div>
        </div>

        <button type="button" {{ $attributes }}
                class="mt-6 w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700">
            ฉันบันทึกเรียบร้อยแล้ว
        </button>
    </div>
</div>
