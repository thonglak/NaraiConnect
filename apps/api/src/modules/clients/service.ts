import { and, count, desc, eq, inArray, isNotNull, isNull, like, or, sql } from 'drizzle-orm';
import { db } from '../../db/client';
import { oauthAccessTokens, oauthClients, type OauthClient } from '../../db/schema';
import { generateClientId, generateClientSecret } from '../../lib/crypto';
import { errConflict, errNotFound } from '../../lib/errors';
import type {
  ClientPublic,
  ClientWithSecret,
  CreateClientInput,
  ListClientsParams,
  ListClientsResult,
  UpdateClientInput,
} from './types';

const toPublic = (row: OauthClient): ClientPublic => {
  const { clientSecret: _secret, ...rest } = row;
  return rest;
};

const buildStatusFilter = (status: ListClientsParams['status']) => {
  if (status === 'active') return and(eq(oauthClients.isActive, 1), isNull(oauthClients.deletedAt));
  if (status === 'deleted') return isNotNull(oauthClients.deletedAt);
  return undefined;
};

export const listClients = async (params: ListClientsParams): Promise<ListClientsResult> => {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  const offset = (page - 1) * pageSize;

  const search = params.q?.trim();
  const searchFilter = search
    ? or(
        like(oauthClients.clientName, `%${search}%`),
        like(oauthClients.clientId, `%${search}%`),
      )
    : undefined;

  const where = and(buildStatusFilter(params.status), searchFilter);

  const [rows, [{ total } = { total: 0 }]] = await Promise.all([
    db.select().from(oauthClients).where(where).orderBy(desc(oauthClients.createdAt)).limit(pageSize).offset(offset),
    db.select({ total: count() }).from(oauthClients).where(where),
  ]);

  // Active token count per client (single query — sums via subquery would be
  // overkill; do a grouped count for the page's client_ids).
  const ids = rows.map((r) => r.clientId);
  const tokenCounts = ids.length
    ? await db
        .select({ clientId: oauthAccessTokens.clientId, c: count() })
        .from(oauthAccessTokens)
        .where(and(inArray(oauthAccessTokens.clientId, ids), sql`${oauthAccessTokens.expires} > NOW()`))
        .groupBy(oauthAccessTokens.clientId)
    : [];
  const countMap = new Map(tokenCounts.map((r) => [r.clientId, r.c]));

  return {
    items: rows.map((r) => ({ ...toPublic(r), activeTokenCount: countMap.get(r.clientId) ?? 0 })),
    page,
    pageSize,
    total,
  };
};

export const getClient = async (clientId: string): Promise<ClientPublic & { activeTokenCount: number }> => {
  const [row] = await db.select().from(oauthClients).where(eq(oauthClients.clientId, clientId)).limit(1);
  if (!row) throw errNotFound('Client not found');
  const [tokenRow] = await db
    .select({ c: count() })
    .from(oauthAccessTokens)
    .where(and(eq(oauthAccessTokens.clientId, clientId), sql`${oauthAccessTokens.expires} > NOW()`));
  return { ...toPublic(row), activeTokenCount: tokenRow?.c ?? 0 };
};

export const createClient = async (input: CreateClientInput): Promise<ClientWithSecret> => {
  // Loop in case of (very unlikely) collision with existing 16-hex id.
  for (let attempt = 0; attempt < 5; attempt++) {
    const clientId = generateClientId();
    const clientSecret = generateClientSecret();
    const [exists] = await db
      .select({ id: oauthClients.clientId })
      .from(oauthClients)
      .where(eq(oauthClients.clientId, clientId))
      .limit(1);
    if (exists) continue;

    await db.insert(oauthClients).values({
      clientId,
      clientSecret,
      clientName: input.clientName,
      redirectUri: input.redirectUri,
      scope: input.scope ?? null,
      grantTypes: input.grantTypes ?? null,
      isActive: 1,
    });
    const [row] = await db.select().from(oauthClients).where(eq(oauthClients.clientId, clientId)).limit(1);
    if (!row) throw new Error('Insert succeeded but row not found');
    return { ...toPublic(row), clientSecret };
  }
  throw errConflict('Failed to generate unique client_id');
};

export const updateClient = async (
  clientId: string,
  input: UpdateClientInput,
): Promise<ClientPublic> => {
  const [existing] = await db.select().from(oauthClients).where(eq(oauthClients.clientId, clientId)).limit(1);
  if (!existing) throw errNotFound('Client not found');

  const patch: Partial<OauthClient> = {};
  if (input.clientName !== undefined) patch.clientName = input.clientName;
  if (input.redirectUri !== undefined) patch.redirectUri = input.redirectUri;
  if (input.scope !== undefined) patch.scope = input.scope;
  if (input.grantTypes !== undefined) patch.grantTypes = input.grantTypes;

  if (Object.keys(patch).length > 0) {
    await db.update(oauthClients).set(patch).where(eq(oauthClients.clientId, clientId));
  }
  const [row] = await db.select().from(oauthClients).where(eq(oauthClients.clientId, clientId)).limit(1);
  return toPublic(row!);
};

export const regenerateSecret = async (clientId: string): Promise<ClientWithSecret> => {
  const [existing] = await db.select().from(oauthClients).where(eq(oauthClients.clientId, clientId)).limit(1);
  if (!existing) throw errNotFound('Client not found');
  const clientSecret = generateClientSecret();
  await db.update(oauthClients).set({ clientSecret }).where(eq(oauthClients.clientId, clientId));
  const [row] = await db.select().from(oauthClients).where(eq(oauthClients.clientId, clientId)).limit(1);
  return { ...toPublic(row!), clientSecret };
};

export const softDeleteClient = async (clientId: string): Promise<ClientPublic> => {
  const [existing] = await db.select().from(oauthClients).where(eq(oauthClients.clientId, clientId)).limit(1);
  if (!existing) throw errNotFound('Client not found');
  if (existing.deletedAt) throw errConflict('Client is already deleted');
  await db
    .update(oauthClients)
    .set({ deletedAt: new Date(), isActive: 0 })
    .where(eq(oauthClients.clientId, clientId));
  const [row] = await db.select().from(oauthClients).where(eq(oauthClients.clientId, clientId)).limit(1);
  return toPublic(row!);
};

export const restoreClient = async (clientId: string): Promise<ClientPublic> => {
  const [existing] = await db.select().from(oauthClients).where(eq(oauthClients.clientId, clientId)).limit(1);
  if (!existing) throw errNotFound('Client not found');
  if (!existing.deletedAt) throw errConflict('Client is not deleted');
  await db
    .update(oauthClients)
    .set({ deletedAt: null, isActive: 1 })
    .where(eq(oauthClients.clientId, clientId));
  const [row] = await db.select().from(oauthClients).where(eq(oauthClients.clientId, clientId)).limit(1);
  return toPublic(row!);
};
