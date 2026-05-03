# NaraiConnect Admin

Admin panel สำหรับจัดการ OAuth2 clients ของระบบ NaraiConnect SSO (Narai Property)

อ่าน `docs/PRD.md` ก่อนเริ่ม และ `CLAUDE.md` สำหรับ rules ของ AI agent

## Stack

- **Laravel 11** + **Livewire 3** + **Blade** (`apps/admin/`)
- **Tailwind v4** ผ่าน `@tailwindcss/vite`
- **MariaDB 10.5** (shared `back_db` container, database `narai_portal2`)
- **Pest 3** สำหรับ test
- รันใน Docker เท่านั้น (PHP 8.3 + Node 20)

## Quickstart (dev)

```bash
# 1. Copy env files
cp .env.example .env
cp apps/admin/.env.example apps/admin/.env
# แก้ DB_PASSWORD, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET ใน apps/admin/.env

# 2. ตรวจให้แน่ใจว่า back_db_network มีอยู่ และตาราง oauth_*, admin_users
#    มี columns ครบตาม schema เดิม (ถ้ายังไม่มี run sql/001_init.sql)
docker exec -i back_db mariadb -uroot -p"<DB_PASSWORD>" narai_portal2 < sql/001_init.sql

# 3. Insert oauth_clients row สำหรับ admin app เอง (chicken-and-egg)
#    ดูตัวอย่างใน sql/002_seed_admin_client.sql

# 4. Start
docker compose up -d
docker compose logs -f admin

# 5. Generate APP_KEY (ครั้งแรกเท่านั้น)
docker compose exec admin php artisan key:generate
```

URL:
- Admin: http://localhost:8000
- Vite (assets + HMR): http://localhost:5173

## Common dev commands

```bash
docker compose exec admin sh                            # shell
docker compose exec admin composer require <pkg>
docker compose exec admin php artisan make:livewire X
docker compose exec admin php artisan tinker
docker compose exec admin php artisan route:list
docker compose exec admin ./vendor/bin/pest             # tests
```

## Production (apps.naraiproperty.com/sso_man/)

### 1. สร้าง `apps/admin/.env.production`

```env
APP_NAME="NaraiConnect Admin"
APP_ENV=production
APP_DEBUG=false
APP_KEY=                                                # generate ใหม่
APP_URL=https://apps.naraiproperty.com/sso_man
APP_TIMEZONE=Asia/Bangkok

DB_CONNECTION=mariadb
DB_HOST=back_db
DB_PORT=3306
DB_DATABASE=narai_portal2
DB_USERNAME=root
DB_PASSWORD=...

SESSION_DRIVER=file
SESSION_LIFETIME=480
SESSION_SECURE_COOKIE=true
CACHE_STORE=file
QUEUE_CONNECTION=sync

OAUTH_CLIENT_ID=...                                     # prod client (separate from dev)
OAUTH_CLIENT_SECRET=...
OAUTH_AUTHORIZE_URL=https://apps.naraiproperty.com/connect/oauth/authorize
OAUTH_TOKEN_URL=https://apps.naraiproperty.com/connect/oauth/authorize/token
OAUTH_USERINFO_URL=https://apps.naraiproperty.com/connect/oauth/resource
OAUTH_SCOPE=email
ADMIN_OAUTH_REDIRECT_URI=https://apps.naraiproperty.com/sso_man/auth/callback
```

### 2. Insert prod oauth_clients row

```sql
INSERT INTO oauth_clients
  (client_id, client_secret, redirect_uri, grant_types, scope, client_name, is_active)
VALUES (
  'PROD_16HEX',
  'PROD_32HEX',
  'https://apps.naraiproperty.com/sso_man/auth/callback',
  'authorization_code', 'email',
  'NaraiConnect Admin (prod)', 1
);
```

### 3. Build + run

```bash
docker compose -f docker-compose.prod.yml build admin
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec admin php artisan key:generate
docker compose -f docker-compose.prod.yml exec admin php artisan config:cache
docker compose -f docker-compose.prod.yml exec admin php artisan route:cache
docker compose -f docker-compose.prod.yml exec admin php artisan view:cache
```

Container expose port `127.0.0.1:8000` (override ด้วย `ADMIN_PROD_PORT`)

### 4. nginx vhost

```nginx
location /sso_man/ {
    rewrite ^/sso_man/(.*)$ /$1 break;
    proxy_pass http://127.0.0.1:8000;

    proxy_http_version 1.1;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Prefix /sso_man;
    proxy_read_timeout 60s;
}
```

`nginx -t && systemctl reload nginx`

## Project layout

```
.
├── apps/admin/           Laravel + Livewire app
│   ├── app/
│   │   ├── Http/
│   │   ├── Livewire/     full-page Livewire components
│   │   ├── Models/       Eloquent models (oauth_*, admin_users)
│   │   └── Services/     business logic (NaraiOAuth, AdminSession, ClientService)
│   ├── resources/views/
│   │   ├── components/   reusable Blade components
│   │   ├── layouts/
│   │   └── livewire/     Livewire view templates
│   ├── routes/web.php
│   └── tests/Feature/    Pest feature tests
├── docker/               Dockerfiles + nginx + supervisord configs
├── docs/PRD.md
├── sql/                  initial schema + seed for shared MariaDB
├── docker-compose.yml          dev
├── docker-compose.prod.yml     prod
└── CLAUDE.md
```

## Migration history

- 2026-04: initial Bun + Elysia + SolidStart implementation
- 2026-05: rewritten as Laravel 11 + Livewire 3 (this version) — see git log
