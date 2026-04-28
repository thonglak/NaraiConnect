import { treaty } from '@elysiajs/eden';
import type { App } from '@ncadm/api/src/index';

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3100';

export const api = treaty<App>(baseUrl, {
  fetch: { credentials: 'include' as const },
});

// Path alias for terser call sites: v1.clients.get(), v1.auth.me.get(), etc.
export const v1 = api.api.v1;

export const apiBaseUrl = baseUrl;
