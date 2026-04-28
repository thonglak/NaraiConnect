# NaraiConnect Admin

Admin panel สำหรับจัดการ OAuth2 clients ของระบบ NaraiConnect SSO (Narai Property).

อ่าน `docs/PRD.md` ก่อนเริ่ม และ `CLAUDE.md` สำหรับ rules ของ AI agent.

## Quickstart (dev)

```bash
# 1. Copy env and edit
cp .env.example .env
# แก้ DB_PASSWORD, OAUTH_*, SESSION_SECRET — APP_BASE_PATH ปล่อยว่าง

# 2. Run init SQL (ครั้งเดียว) เพิ่ม columns + admin_users
docker exec -i back_db mariadb -uroot -p"${DB_PASSWORD}" --default-character-set=utf8mb4 narai_portal2 < sql/001_init.sql

# 3. Insert client row สำหรับ admin app เอง (chicken-and-egg)
#    ดูตัวอย่างใน sql/002_seed_admin_client.sql แล้ว exec แบบเดียวกัน

# 4. Start
docker compose up -d
docker compose logs -f api
```

- API:  http://localhost:3100
- Web:  http://localhost:3001

## Stack

- Bun + Elysia (api)
- SolidStart + Tailwind v4 (web)
- Drizzle (mysql2) → MariaDB shared `back_db`
- Eden Treaty (type-safe RPC)

## Production (apps.naraiproperty.com/sso_man/)

### 1. Env vars บน VPS (`.env`)

```env
NODE_ENV=production
APP_BASE_PATH=/sso_man
API_PUBLIC_URL=https://apps.naraiproperty.com/sso_man
WEB_PUBLIC_URL=https://apps.naraiproperty.com/sso_man
VITE_API_URL=https://apps.naraiproperty.com/sso_man
OAUTH_REDIRECT_URI=https://apps.naraiproperty.com/sso_man/api/v1/auth/callback
# OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET — see step 2
SESSION_SECRET=...   # 32-byte hex, openssl rand -hex 32
```

### 2. สร้าง oauth_clients row สำหรับ prod (แยกจาก dev)

```sql
-- ตัวอย่าง — เปลี่ยน id/secret ใหม่
INSERT INTO oauth_clients
  (client_id, client_secret, redirect_uri, grant_types, scope, client_name, is_active)
VALUES (
  'PROD_CLIENT_ID_16hex',
  'PROD_CLIENT_SECRET_32hex',
  'https://apps.naraiproperty.com/sso_man/api/v1/auth/callback',
  'authorization_code',
  'email',
  'NaraiConnect Admin (prod)',
  1
);
```

### 3. Build + start containers

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f
```

ทั้ง api และ web ผูกกับ `127.0.0.1:3100` และ `127.0.0.1:3001` ตามลำดับ
(ผ่าน `ports:` ใน prod compose).

### 4. nginx vhost

ใส่เพิ่มใน server block ของ `apps.naraiproperty.com` ที่มีอยู่:

```nginx
# API: strip /sso_man prefix แล้วส่งไป Elysia
location /sso_man/api/ {
    rewrite ^/sso_man/(api/.*)$ /$1 break;
    proxy_pass http://127.0.0.1:3100;

    proxy_http_version 1.1;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Web: ส่งทั้ง path (รวม /sso_man) ไป SolidStart
location /sso_man/ {
    proxy_pass http://127.0.0.1:3001;

    proxy_http_version 1.1;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 60s;
}
```

`nginx -t && systemctl reload nginx`

### 5. ทดสอบ

เปิด `https://apps.naraiproperty.com/sso_man/` → ปุ่ม login → SSO → กลับมาที่
dashboard ภายใต้ path `/sso_man/dashboard`.
