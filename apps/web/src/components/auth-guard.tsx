import { createEffect, Match, Show, Switch, type JSX } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useMe } from '~/lib/auth';

export function AuthGuard(props: { children: JSX.Element }) {
  const [me] = useMe();
  const navigate = useNavigate();

  createEffect(() => {
    if (!me.loading && me() === null) {
      navigate('/', { replace: true });
    }
  });

  return (
    <Switch>
      <Match when={me.loading}>
        <div class="text-sm text-neutral-500">Loading…</div>
      </Match>
      <Match when={me()}>
        <Show when={me()}>{props.children}</Show>
      </Match>
    </Switch>
  );
}
