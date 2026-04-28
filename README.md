# NaraiConnect Admin

Admin panel สำหรับจัดการ OAuth2 clients ของระบบ NaraiConnect SSO (Narai Property).

อ่าน `docs/PRD.md` ก่อนเริ่ม และ `CLAUDE.md` สำหรับ rules ของ AI agent.

## Quickstart (dev)

```bash
# 1. Copy env and edit
cp .env.example .env
# แก้ DB_PASSWORD, OAUTH_*, SESSION_SECRET

# 2. Run init SQL (ครั้งเดียว) เพิ่ม columns + admin_users
docker exec -i back_db mariadb -uroot -p"${DB_PASSWORD}" narai_portal2 < sql/001_init.sql

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

## Production

Deploy บน VPS หลัง reverse proxy ที่ `apps.naraiproperty.com/sso_man`:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```
