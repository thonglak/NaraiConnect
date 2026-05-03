<?php

namespace App\Livewire;

use App\Models\OauthScope;
use Illuminate\View\View;
use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Attributes\Validate;
use Livewire\Component;
use Livewire\WithPagination;

#[Layout('layouts.app')]
#[Title('Scopes — NaraiConnect Admin')]
class ScopesIndex extends Component
{
    use WithPagination;

    public string $modalMode = ''; // '', 'create', 'edit'
    public ?int $editingId = null;

    #[Validate('required|string|max:65535')]
    public string $scopeValue = '';

    public bool $isDefault = false;

    public function openCreate(): void
    {
        $this->reset(['scopeValue', 'isDefault', 'editingId']);
        $this->resetErrorBag();
        $this->modalMode = 'create';
    }

    public function openEdit(int $id): void
    {
        $row = OauthScope::findOrFail($id);
        $this->editingId = $row->id;
        $this->scopeValue = $row->scope ?? '';
        $this->isDefault = (bool) $row->is_default;
        $this->resetErrorBag();
        $this->modalMode = 'edit';
    }

    public function close(): void
    {
        $this->modalMode = '';
        $this->reset(['scopeValue', 'isDefault', 'editingId']);
    }

    public function save(): void
    {
        $this->validate();
        $payload = [
            'scope' => trim($this->scopeValue),
            'is_default' => $this->isDefault ? 1 : 0,
        ];

        if ($this->modalMode === 'edit' && $this->editingId) {
            OauthScope::where('id', $this->editingId)->update($payload);
            session()->flash('flash.success', 'Scope updated.');
        } else {
            OauthScope::create($payload);
            session()->flash('flash.success', 'Scope created.');
        }
        $this->close();
    }

    public function delete(int $id): void
    {
        OauthScope::where('id', $id)->delete();
        session()->flash('flash.success', 'Scope deleted.');
    }

    public function render(): View
    {
        $scopes = OauthScope::orderBy('id')->paginate(50);

        return view('livewire.scopes-index', ['scopes' => $scopes]);
    }
}
