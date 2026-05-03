@props(['label', 'required' => false, 'hint' => null])

<label class="block">
    <span class="text-sm font-medium text-neutral-700">
        {{ $label }}
        @if ($required) <span class="ml-1 text-red-600">*</span> @endif
    </span>
    {{ $slot }}
    @if ($hint)
        <span class="mt-1 block text-xs text-neutral-500">{{ $hint }}</span>
    @endif
</label>
