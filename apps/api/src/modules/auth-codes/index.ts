import { Elysia } from 'elysia';

// TODO: read-only list of authorization codes.
export const authCodesPlugin = new Elysia({ prefix: '/auth-codes' })
  .get('/', () => ({ items: [], total: 0 }));
