-- ─────────────────────────────────────────────────────────────────────────
-- 001_init.sql
-- One-shot setup for NaraiConnect Admin on existing `narai_portal2`.
-- Non-destructive: only ADD nullable columns + CREATE new table.
-- Run once:  docker exec -i back_db mariadb -uroot -p... narai_portal2 < sql/001_init.sql
-- ─────────────────────────────────────────────────────────────────────────

-- ─── oauth_clients: add is_active + timestamps + soft delete ────────────
ALTER TABLE `oauth_clients`
  ADD COLUMN `is_active`  TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN `created_at` TIMESTAMP   NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN `updated_at` TIMESTAMP   NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN `deleted_at` TIMESTAMP   NULL DEFAULT NULL,
  ADD INDEX  `idx_oauth_clients_is_active`  (`is_active`),
  ADD INDEX  `idx_oauth_clients_deleted_at` (`deleted_at`);

-- ─── oauth_scopes: add PK + timestamps (existing rows get id assigned) ──
ALTER TABLE `oauth_scopes`
  ADD COLUMN `id`         INT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
  ADD COLUMN `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ─── oauth_access_tokens / refresh_tokens / authorization_codes ─────────
-- Add helpful indexes for admin queries (no schema change otherwise).
ALTER TABLE `oauth_access_tokens`
  ADD INDEX `idx_access_tokens_client_id` (`client_id`),
  ADD INDEX `idx_access_tokens_user_id`   (`user_id`);

ALTER TABLE `oauth_refresh_tokens`
  ADD INDEX `idx_refresh_tokens_client_id` (`client_id`),
  ADD INDEX `idx_refresh_tokens_user_id`   (`user_id`);

ALTER TABLE `oauth_authorization_codes`
  ADD INDEX `idx_auth_codes_client_id` (`client_id`);

-- ─── admin_users: whitelist of users allowed into admin panel ───────────
-- `username` is whatever NaraiConnect SSO userinfo returns (e.g. "NP_1696").
-- No FK to oauth_users because that table is unused — actual auth lives in
-- the company's main user store, not here.
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id`           INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `username`     VARCHAR(255) NOT NULL UNIQUE,
  `display_name` VARCHAR(255) NULL,
  `is_super`     TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at`   TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`   TIMESTAMP    NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Backfill existing oauth_clients rows ───────────────────────────────
UPDATE `oauth_clients` SET `is_active` = 1 WHERE `is_active` IS NULL;
