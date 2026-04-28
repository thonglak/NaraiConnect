import { Elysia, t } from 'elysia';
import { requireAdmin } from '../../lib/guard';
import {
  createClient,
  getClient,
  listClients,
  regenerateSecret,
  restoreClient,
  softDeleteClient,
  updateClient,
} from './service';

const clientIdParam = t.Object({ clientId: t.String({ minLength: 1, maxLength: 80 }) });

const createBody = t.Object({
  clientName: t.String({ minLength: 1, maxLength: 200 }),
  redirectUri: t.String({ format: 'uri', maxLength: 2000 }),
  scope: t.Optional(t.Union([t.String({ maxLength: 100 }), t.Null()])),
  grantTypes: t.Optional(t.Union([t.String({ maxLength: 80 }), t.Null()])),
});

const updateBody = t.Partial(createBody);

const listQuery = t.Object({
  q: t.Optional(t.String({ maxLength: 100 })),
  status: t.Optional(t.Union([t.Literal('all'), t.Literal('active'), t.Literal('deleted')])),
  page: t.Optional(t.Numeric({ minimum: 1 })),
  pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
});

export const clientsPlugin = new Elysia({ prefix: '/clients' })
  .use(requireAdmin)
  .get('/', ({ query }) => listClients(query), { query: listQuery })
  .post('/', ({ body }) => createClient(body), { body: createBody })
  .get('/:clientId', ({ params }) => getClient(params.clientId), { params: clientIdParam })
  .patch('/:clientId', ({ params, body }) => updateClient(params.clientId, body), {
    params: clientIdParam,
    body: updateBody,
  })
  .post('/:clientId/regenerate', ({ params }) => regenerateSecret(params.clientId), {
    params: clientIdParam,
  })
  .delete('/:clientId', ({ params }) => softDeleteClient(params.clientId), {
    params: clientIdParam,
  })
  .post('/:clientId/restore', ({ params }) => restoreClient(params.clientId), {
    params: clientIdParam,
  });
