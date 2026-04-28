import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { eq, like } from 'drizzle-orm';
import { db } from '../../db/client';
import { oauthClients } from '../../db/schema';
import {
  createClient,
  getClient,
  listClients,
  regenerateSecret,
  restoreClient,
  softDeleteClient,
  updateClient,
} from './service';

// Integration tests — hit real `back_db`. Cleanup by deleting rows whose
// `client_name` starts with the test prefix. Run inside the api container:
//   docker compose exec api bun test
const TEST_PREFIX = `__test_${Date.now()}_`;

const cleanup = async (): Promise<void> => {
  await db.delete(oauthClients).where(like(oauthClients.clientName, `${TEST_PREFIX}%`));
};

beforeAll(cleanup);
afterAll(cleanup);

describe('clients service', () => {
  it('creates a client with random id + secret', async () => {
    const created = await createClient({
      clientName: `${TEST_PREFIX}create`,
      redirectUri: 'https://example.com/cb',
      scope: 'email',
    });
    expect(created.clientId).toMatch(/^[a-f0-9]{16}$/);
    expect(created.clientSecret).toMatch(/^[a-f0-9]{32}$/);
    expect(created.clientName).toBe(`${TEST_PREFIX}create`);
    expect(created.isActive).toBe(1);
    expect(created.deletedAt).toBeNull();
  });

  it('lists clients with status=active and filters by q', async () => {
    const c = await createClient({
      clientName: `${TEST_PREFIX}list`,
      redirectUri: 'https://example.com/cb',
    });
    const res = await listClients({ q: TEST_PREFIX, status: 'active', page: 1, pageSize: 50 });
    const found = res.items.find((i) => i.clientId === c.clientId);
    expect(found).toBeDefined();
    expect(found).not.toHaveProperty('clientSecret');
    expect(found?.activeTokenCount).toBe(0);
  });

  it('gets a single client without secret', async () => {
    const c = await createClient({
      clientName: `${TEST_PREFIX}get`,
      redirectUri: 'https://example.com/cb',
    });
    const fetched = await getClient(c.clientId);
    expect(fetched.clientId).toBe(c.clientId);
    expect(fetched).not.toHaveProperty('clientSecret');
  });

  it('updates editable fields', async () => {
    const c = await createClient({
      clientName: `${TEST_PREFIX}update`,
      redirectUri: 'https://a.example.com/cb',
    });
    const updated = await updateClient(c.clientId, {
      clientName: `${TEST_PREFIX}update_v2`,
      redirectUri: 'https://b.example.com/cb',
    });
    expect(updated.clientName).toBe(`${TEST_PREFIX}update_v2`);
    expect(updated.redirectUri).toBe('https://b.example.com/cb');
  });

  it('regenerates client_secret', async () => {
    const c = await createClient({
      clientName: `${TEST_PREFIX}regen`,
      redirectUri: 'https://example.com/cb',
    });
    const regen = await regenerateSecret(c.clientId);
    expect(regen.clientSecret).toMatch(/^[a-f0-9]{32}$/);
    expect(regen.clientSecret).not.toBe(c.clientSecret);
  });

  it('soft deletes and restores a client', async () => {
    const c = await createClient({
      clientName: `${TEST_PREFIX}delete`,
      redirectUri: 'https://example.com/cb',
    });
    const deleted = await softDeleteClient(c.clientId);
    expect(deleted.deletedAt).not.toBeNull();
    expect(deleted.isActive).toBe(0);

    expect(softDeleteClient(c.clientId)).rejects.toThrow();

    const restored = await restoreClient(c.clientId);
    expect(restored.deletedAt).toBeNull();
    expect(restored.isActive).toBe(1);

    expect(restoreClient(c.clientId)).rejects.toThrow();
  });

  it('throws on get of unknown client', () => {
    expect(getClient('does_not_exist_xx')).rejects.toThrow();
  });
});
