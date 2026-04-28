import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { eq, like } from 'drizzle-orm';
import { db } from '../../db/client';
import { adminUsers, oauthUsers } from '../../db/schema';
import { loadActiveAdminByUsername } from './service';

const TEST_PREFIX = `__test_auth_${Date.now()}_`;

const ensureOauthUser = async (username: string): Promise<void> => {
  const [exists] = await db.select().from(oauthUsers).where(eq(oauthUsers.username, username)).limit(1);
  if (!exists) {
    await db.insert(oauthUsers).values({ username, password: null, firstName: null, lastName: null });
  }
};

const cleanup = async (): Promise<void> => {
  await db.delete(adminUsers).where(like(adminUsers.username, `${TEST_PREFIX}%`));
  await db.delete(oauthUsers).where(like(oauthUsers.username, `${TEST_PREFIX}%`));
};

beforeAll(cleanup);
afterAll(cleanup);

describe('loadActiveAdminByUsername', () => {
  it('returns admin row for active username', async () => {
    const username = `${TEST_PREFIX}active`;
    await ensureOauthUser(username);
    await db.insert(adminUsers).values({ username, displayName: 'Active', isSuper: 0 });
    const row = await loadActiveAdminByUsername(username);
    expect(row.username).toBe(username);
    expect(row.deletedAt).toBeNull();
  });

  it('throws for unknown username', () => {
    expect(loadActiveAdminByUsername(`${TEST_PREFIX}unknown`)).rejects.toThrow();
  });

  it('throws for soft-deleted admin', async () => {
    const username = `${TEST_PREFIX}deleted`;
    await ensureOauthUser(username);
    await db
      .insert(adminUsers)
      .values({ username, displayName: 'Deleted', isSuper: 0, deletedAt: new Date() });
    expect(loadActiveAdminByUsername(username)).rejects.toThrow();
  });
});
