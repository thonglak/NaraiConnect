import { Elysia } from 'elysia';

// TODO: list/revoke access + refresh tokens, revoke-by-client.
export const tokensPlugin = new Elysia({ prefix: '/tokens' })
  .get('/access', () => ({ items: [], total: 0 }))
  .get('/refresh', () => ({ items: [], total: 0 }));
