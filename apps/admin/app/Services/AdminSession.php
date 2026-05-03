<?php

namespace App\Services;

use App\Models\AdminUser;
use Illuminate\Contracts\Session\Session;

class AdminSession
{
    private const KEY = 'admin_user_id';

    public function __construct(private readonly Session $session) {}

    public function login(AdminUser $user): void
    {
        $this->session->regenerate();
        $this->session->put(self::KEY, $user->id);
    }

    public function logout(): void
    {
        $this->session->forget(self::KEY);
        $this->session->invalidate();
        $this->session->regenerateToken();
    }

    public function current(): ?AdminUser
    {
        $id = $this->session->get(self::KEY);
        if (!is_int($id) && !ctype_digit((string) $id)) {
            return null;
        }
        $user = AdminUser::query()->whereNull('deleted_at')->find($id);

        return $user instanceof AdminUser ? $user : null;
    }

    public function check(): bool
    {
        return $this->current() !== null;
    }
}
