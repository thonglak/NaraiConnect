import { Show, Suspense, type JSX } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { logout, useMe } from '~/lib/auth';

export function AppLayout(props: { children: JSX.Element }) {
  const [me] = useMe();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div class="min-h-screen bg-neutral-50">
      <header class="border-b border-neutral-200 bg-white">
        <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div class="flex items-center gap-6">
            <A href="/" class="text-sm font-semibold text-neutral-900">
              NaraiConnect Admin
            </A>
            <nav class="flex items-center gap-4 text-sm text-neutral-600">
              <A href="/dashboard" class="hover:text-neutral-900" activeClass="text-neutral-900">
                Dashboard
              </A>
              <A href="/clients" class="hover:text-neutral-900" activeClass="text-neutral-900">
                Clients
              </A>
            </nav>
          </div>
          <Suspense fallback={<span class="text-xs text-neutral-400">Loading…</span>}>
            <Show
              when={me()}
              fallback={
                <Show when={!me.loading}>
                  <button
                    onClick={() => navigate('/')}
                    class="text-sm text-neutral-600 hover:text-neutral-900"
                  >
                    Login
                  </button>
                </Show>
              }
            >
              {(m) => (
                <div class="flex items-center gap-3 text-sm">
                  <span class="text-neutral-600">
                    {m().displayName ?? m().username}
                    <Show when={m().isSuper}>
                      <span class="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                        super
                      </span>
                    </Show>
                  </span>
                  <button
                    onClick={handleLogout}
                    class="rounded-md border border-neutral-300 px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </Show>
          </Suspense>
        </div>
      </header>
      <main class="mx-auto max-w-6xl px-6 py-8">{props.children}</main>
    </div>
  );
}
