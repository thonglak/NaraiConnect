@props([
    'label' => '',
    'value' => 0,
    'accent' => 'neutral',
])

@php
    $accentClasses = [
        'emerald' => 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        'blue' => 'bg-blue-50 text-blue-700 ring-blue-100',
        'violet' => 'bg-violet-50 text-violet-700 ring-violet-100',
        'amber' => 'bg-amber-50 text-amber-800 ring-amber-100',
        'neutral' => 'bg-neutral-50 text-neutral-700 ring-neutral-200',
    ];
    $cls = $accentClasses[$accent] ?? $accentClasses['neutral'];
@endphp

<div {{ $attributes->merge(['class' => "rounded-lg p-4 ring-1 $cls"]) }}>
    <div class="text-xs font-medium uppercase tracking-wide opacity-70">{{ $label }}</div>
    <div class="mt-1 text-2xl font-semibold tabular-nums">{{ number_format($value) }}</div>
</div>
