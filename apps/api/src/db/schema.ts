import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  tinyint,
  int,
  index,
} from 'drizzle-orm/mysql-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// ─── oauth_clients ──────────────────────────────────────────────────────
// Existing table from PHP OAuth2 server. Extended with is_active +
// timestamps. PHP server must filter `WHERE is_active = 1` on auth.
export const oauthClients = mysqlTable(
  'oauth_clients',
  {
    clientId: varchar('client_id', { length: 80 }).primaryKey(),
    clientSecret: varchar('client_secret', { length: 80 }).notNull(),
    redirectUri: varchar('redirect_uri', { length: 2000 }).notNull(),
    grantTypes: varchar('grant_types', { length: 80 }),
    scope: varchar('scope', { length: 100 }),
    userId: varchar('user_id', { length: 80 }),
    clientName: varchar('client_name', { length: 200 }),
    isActive: tinyint('is_active').default(1).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (t) => ({
    isActiveIdx: index('idx_oauth_clients_is_active').on(t.isActive),
    deletedAtIdx: index('idx_oauth_clients_deleted_at').on(t.deletedAt),
  }),
);

// ─── oauth_scopes ───────────────────────────────────────────────────────
// Existing table had no PK. Added id + timestamps.
export const oauthScopes = mysqlTable('oauth_scopes', {
  id: int('id').autoincrement().primaryKey(),
  scope: text('scope'),
  isDefault: tinyint('is_default'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ─── oauth_access_tokens ────────────────────────────────────────────────
// Existing — read + delete only.
export const oauthAccessTokens = mysqlTable(
  'oauth_access_tokens',
  {
    accessToken: varchar('access_token', { length: 40 }).primaryKey(),
    clientId: varchar('client_id', { length: 80 }).notNull(),
    userId: varchar('user_id', { length: 255 }),
    expires: timestamp('expires').notNull(),
    scope: varchar('scope', { length: 2000 }),
  },
  (t) => ({
    clientIdIdx: index('idx_access_tokens_client_id').on(t.clientId),
    userIdIdx: index('idx_access_tokens_user_id').on(t.userId),
  }),
);

// ─── oauth_refresh_tokens ───────────────────────────────────────────────
export const oauthRefreshTokens = mysqlTable(
  'oauth_refresh_tokens',
  {
    refreshToken: varchar('refresh_token', { length: 40 }).primaryKey(),
    clientId: varchar('client_id', { length: 80 }).notNull(),
    userId: varchar('user_id', { length: 255 }),
    expires: timestamp('expires').notNull(),
    scope: varchar('scope', { length: 2000 }),
  },
  (t) => ({
    clientIdIdx: index('idx_refresh_tokens_client_id').on(t.clientId),
    userIdIdx: index('idx_refresh_tokens_user_id').on(t.userId),
  }),
);

// ─── oauth_authorization_codes ──────────────────────────────────────────
// Read-only in admin.
export const oauthAuthorizationCodes = mysqlTable(
  'oauth_authorization_codes',
  {
    authorizationCode: varchar('authorization_code', { length: 40 }).primaryKey(),
    clientId: varchar('client_id', { length: 80 }).notNull(),
    userId: varchar('user_id', { length: 255 }),
    redirectUri: varchar('redirect_uri', { length: 2000 }),
    expires: timestamp('expires').notNull(),
    scope: varchar('scope', { length: 2000 }),
  },
  (t) => ({
    clientIdIdx: index('idx_auth_codes_client_id').on(t.clientId),
  }),
);

// ─── oauth_users (read-only join) ───────────────────────────────────────
export const oauthUsers = mysqlTable('oauth_users', {
  username: varchar('username', { length: 255 }).primaryKey(),
  password: varchar('password', { length: 2000 }),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
});

// ─── admin_users (NEW) ──────────────────────────────────────────────────
// Whitelist of usernames allowed into admin panel.
export const adminUsers = mysqlTable('admin_users', {
  id: int('id').autoincrement().primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }),
  isSuper: tinyint('is_super').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  deletedAt: timestamp('deleted_at'),
});

// ─── Types ──────────────────────────────────────────────────────────────
export type OauthClient = InferSelectModel<typeof oauthClients>;
export type NewOauthClient = InferInsertModel<typeof oauthClients>;
export type OauthScope = InferSelectModel<typeof oauthScopes>;
export type OauthAccessToken = InferSelectModel<typeof oauthAccessTokens>;
export type OauthRefreshToken = InferSelectModel<typeof oauthRefreshTokens>;
export type OauthAuthorizationCode = InferSelectModel<typeof oauthAuthorizationCodes>;
export type AdminUser = InferSelectModel<typeof adminUsers>;
