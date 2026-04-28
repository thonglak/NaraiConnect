import { and, count, desc, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import { db } from '../../db/client';
import {
  oauthAccessTokens,
  oauthAuthorizationCodes,
  oauthClients,
  oauthRefreshTokens,
  oauthScopes,
} from '../../db/schema';

export type DashboardStats = {
  clients: { total: number; active: number; deleted: number };
  tokens: { activeAccess: number; activeRefresh: number };
  authCodes: { active: number };
  scopes: { total: number };
  recentClients: {
    clientId: string;
    clientName: string | null;
    createdAt: Date | null;
    isActive: number;
    deletedAt: Date | null;
  }[];
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const activeWhere = sql`expires > NOW()`;

  const [
    [clientsTotal],
    [clientsActive],
    [clientsDeleted],
    [accessActive],
    [refreshActive],
    [authCodesActive],
    [scopesTotal],
    recent,
  ] = await Promise.all([
    db.select({ c: count() }).from(oauthClients),
    db
      .select({ c: count() })
      .from(oauthClients)
      .where(and(eq(oauthClients.isActive, 1), isNull(oauthClients.deletedAt))),
    db.select({ c: count() }).from(oauthClients).where(isNotNull(oauthClients.deletedAt)),
    db.select({ c: count() }).from(oauthAccessTokens).where(activeWhere),
    db.select({ c: count() }).from(oauthRefreshTokens).where(activeWhere),
    db.select({ c: count() }).from(oauthAuthorizationCodes).where(activeWhere),
    db.select({ c: count() }).from(oauthScopes),
    db
      .select({
        clientId: oauthClients.clientId,
        clientName: oauthClients.clientName,
        createdAt: oauthClients.createdAt,
        isActive: oauthClients.isActive,
        deletedAt: oauthClients.deletedAt,
      })
      .from(oauthClients)
      .orderBy(desc(oauthClients.createdAt))
      .limit(5),
  ]);

  return {
    clients: {
      total: clientsTotal?.c ?? 0,
      active: clientsActive?.c ?? 0,
      deleted: clientsDeleted?.c ?? 0,
    },
    tokens: {
      activeAccess: accessActive?.c ?? 0,
      activeRefresh: refreshActive?.c ?? 0,
    },
    authCodes: { active: authCodesActive?.c ?? 0 },
    scopes: { total: scopesTotal?.c ?? 0 },
    recentClients: recent,
  };
};
