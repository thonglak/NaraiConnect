-- ─────────────────────────────────────────────────────────────────────────
-- 002_seed_admin_client.sql
-- Bootstrap row for the admin app's own OAuth client (chicken-and-egg).
-- BEFORE RUNNING:
--   1. generate a random client_id (16 hex)  e.g. openssl rand -hex 8
--   2. generate a random client_secret (32 hex) e.g. openssl rand -hex 16
--   3. replace the placeholders below
--   4. add the same values to apps/admin/.env (OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET)
--   5. add at least one admin row to admin_users
-- ─────────────────────────────────────────────────────────────────────────

-- 1. The admin app as an OAuth client
INSERT INTO `oauth_clients`
  (`client_id`, `client_secret`, `redirect_uri`, `grant_types`, `scope`, `client_name`, `is_active`)
VALUES
  (
    'REPLACE_CLIENT_ID',
    'REPLACE_CLIENT_SECRET',
    'http://localhost:8000/auth/callback',
    'authorization_code',
    'email',
    'NaraiConnect Admin',
    1
  );

-- 2. Whitelist initial admin (must already exist in oauth_users)
INSERT INTO `admin_users` (`username`, `display_name`, `is_super`)
VALUES ('REPLACE_USERNAME', 'Initial Admin', 1);
