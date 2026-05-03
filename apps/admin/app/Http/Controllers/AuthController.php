<?php

namespace App\Http\Controllers;

use App\Models\AdminUser;
use App\Services\AdminSession;
use App\Services\NaraiOAuth\NaraiOAuthClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class AuthController extends Controller
{
    private const STATE_KEY = 'narai_oauth_state';

    public function __construct(
        private readonly NaraiOAuthClient $oauth,
        private readonly AdminSession $admin,
    ) {}

    public function login(Request $request): RedirectResponse
    {
        $state = Str::random(32);
        $request->session()->put(self::STATE_KEY, $state);

        return redirect()->away($this->oauth->buildAuthorizeUrl($state));
    }

    public function callback(Request $request): RedirectResponse
    {
        if ($this->admin->check()) {
            $request->session()->forget(self::STATE_KEY);

            return redirect()->route('dashboard');
        }

        $expected = $request->session()->pull(self::STATE_KEY);

        if (!is_string($expected) || $expected === '') {
            return redirect()->route('home')->withErrors(['oauth' => 'Missing OAuth state — please log in again.']);
        }

        $request->validate([
            'code' => ['required', 'string', 'min:1'],
            'state' => ['required', 'string', 'min:1'],
        ]);

        if (!hash_equals($expected, (string) $request->query('state'))) {
            throw ValidationException::withMessages(['state' => 'Invalid OAuth state']);
        }

        $tokens = $this->oauth->exchangeCode((string) $request->query('code'));
        $info = $this->oauth->fetchUserInfo($tokens['access_token']);

        $admin = AdminUser::query()
            ->whereNull('deleted_at')
            ->where('username', $info['username'])
            ->first();

        if (!$admin) {
            throw new RuntimeException("User '{$info['username']}' is not authorized for the admin panel", 403);
        }

        $this->admin->login($admin);

        return redirect()->route('dashboard');
    }

    public function logout(Request $request): JsonResponse|RedirectResponse
    {
        $this->admin->logout();

        if ($request->expectsJson()) {
            return response()->json(['ok' => true]);
        }

        return redirect()->route('home');
    }

    public function me(): JsonResponse
    {
        $admin = $this->admin->current();
        if (!$admin) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'username' => $admin->username,
            'displayName' => $admin->display_name,
            'isSuper' => $admin->is_super,
        ]);
    }
}
