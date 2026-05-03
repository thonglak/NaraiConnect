@props(['active' => false, 'deleted' => false])

@if ($deleted)
    <span class="rounded bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-700">deleted</span>
@elseif ($active)
    <span class="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">active</span>
@else
    <span class="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">inactive</span>
@endif
