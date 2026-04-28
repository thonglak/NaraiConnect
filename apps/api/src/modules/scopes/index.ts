import { Elysia } from 'elysia';

// TODO: CRUD for oauth_scopes.
export const scopesPlugin = new Elysia({ prefix: '/scopes' })
  .get('/', () => ({ items: [] }));
