import { createSignal, onMount, type Accessor } from 'solid-js';
import { v1 } from './api';

export type Me = {
  username: string;
  displayName: string | null;
  isSuper: boolean;
  expiresAt: number;
};

export const fetchMe = async (): Promise<Me | null> => {
  const res = await v1.auth.me.get();
  if (res.error) return null;
  return res.data as Me;
};

export type MeAccessor = Accessor<Me | null | undefined> & {
  loading: boolean;
  refetch: () => Promise<void>;
};

// Client-only auth state. createResource SSRs the fetch on the web server
// which has no access to the user's cookie — so we use onMount + signal to
// guarantee the call happens in the browser with credentials: include.
export const useMe = (): [MeAccessor] => {
  const [data, setData] = createSignal<Me | null | undefined>(undefined);
  const [loading, setLoading] = createSignal(true);

  const refetch = async (): Promise<void> => {
    setLoading(true);
    try {
      setData(await fetchMe());
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    void refetch();
  });

  const accessor = (() => data()) as MeAccessor;
  Object.defineProperty(accessor, 'loading', { get: () => loading() });
  accessor.refetch = refetch;
  return [accessor];
};

export const loginUrl = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3100'}/api/v1/auth/login`;

export const logout = async (): Promise<void> => {
  await v1.auth.logout.post();
  window.location.href = '/';
};
