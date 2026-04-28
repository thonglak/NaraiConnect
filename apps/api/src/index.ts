import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { env } from './lib/env';
import { AppError } from './lib/errors';
import { authPlugin } from './modules/auth';
import { clientsPlugin } from './modules/clients';
import { dashboardPlugin } from './modules/dashboard';
import { scopesPlugin } from './modules/scopes';
import { tokensPlugin } from './modules/tokens';
import { authCodesPlugin } from './modules/auth-codes';

const app = new Elysia()
  .use(
    cors({
      origin: env.WEB_PUBLIC_URL,
      credentials: true,
    }),
  )
  .onError(({ error, set, path, request }) => {
    if (error instanceof AppError) {
      set.status = error.status;
      return { error: { code: error.code, message: error.message } };
    }
    console.error(`[api] ${request.method} ${path} unhandled error:`, error);
    set.status = 500;
    return {
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Internal server error',
      },
    };
  })
  .get('/health', () => ({ ok: true, ts: Date.now() }))
  .group('/api/v1', (api) =>
    api
      .use(authPlugin)
      .use(dashboardPlugin)
      .use(clientsPlugin)
      .use(scopesPlugin)
      .use(tokensPlugin)
      .use(authCodesPlugin),
  )
  .listen({ port: env.API_PORT, hostname: '0.0.0.0' });

export type App = typeof app;

console.info(`[api] listening on http://0.0.0.0:${env.API_PORT}`);
