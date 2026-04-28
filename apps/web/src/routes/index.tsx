import { createEffect, Match, Suspense, Switch } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { loginUrl, useMe } from '~/lib/auth';

export default function Home() {
  const [me] = useMe();
  const navigate = useNavigate();

  createEffect(() => {
    if (!me.loading && me()) {
      navigate('/dashboard', { replace: true });
    }
  });

  return (
    <main class="flex min-h-screen items-center justify-center bg-neutral-50 p-8">
      <div class="w-full max-w-sm text-center">
        <h1 class="text-2xl font-semibold text-neutral-900">NaraiConnect Admin</h1>
        <p class="mt-2 text-sm text-neutral-600">
          จัดการ OAuth2 clients ของระบบ SSO Narai Property
        </p>
        <Suspense fallback={<div class="mt-6 text-sm text-neutral-500">Loading…</div>}>
          <Switch>
            <Match when={me()}>
              <div class="mt-6 text-sm text-neutral-500">กำลังพาไปหน้า Dashboard…</div>
            </Match>
            <Match when={!me.loading}>
              <button
                onClick={() => {
                  window.location.href = loginUrl;
                }}
                class="mt-6 inline-block w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
              >
                เข้าสู่ระบบด้วย NaraiConnect
              </button>
            </Match>
          </Switch>
        </Suspense>
      </div>
    </main>
  );
}
