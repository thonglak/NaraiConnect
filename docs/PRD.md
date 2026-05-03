# PRD: NaraiConnect Admin

> เอกสารนี้คือ source of truth ของโปรเจกต์ AI agent ต้องอ่านก่อนเริ่มงานทุกครั้ง
> เก็บให้สั้น เปลี่ยนเมื่อ scope เปลี่ยน เท่านั้น

## 1. สรุปโปรเจกต์

- **ทำอะไร:** Admin panel สำหรับจัดการ OAuth2 clients ของระบบ NaraiConnect SSO (Narai Property)
- **กลุ่มเป้าหมาย:** ทีม IT/DevOps ของ Narai Property ที่ต้องสร้าง/แก้/ปิดใช้ client สำหรับแอปภายในที่ login ผ่าน SSO
- **ปัญหาที่แก้:** ปัจจุบันต้อง insert/update `oauth_clients` ตรง ๆ ผ่าน phpMyAdmin → เสี่ยง human error, ไม่มี audit, ไม่มี soft delete
- **ระยะเวลา MVP:** 2-3 สัปดาห์
- **สถานะ:** กำลังเริ่ม

## 2. Tech Stack (ตัดสินใจแล้ว ห้ามเปลี่ยน)

| Layer | เทคโนโลยี | เวอร์ชัน | เหตุผล |
|---|---|---|---|
| Runtime | Bun | latest | เร็ว, รองรับ TS native |
| Backend | Elysia + TypeBox | latest | type-safe, performance ดี |
| ORM | Drizzle (`drizzle-orm/mysql2`) | latest | type-safe, lightweight, SQL-first |
| Database | MariaDB | 10.5 | shared กับระบบ PHP เดิม |
| Frontend | SolidStart + SolidJS | latest | reactivity เร็ว, bundle เล็ก |
| Styling | Tailwind | v4 | ทีมคุ้น, ไม่ต้องเขียน CSS |
| Auth | OAuth2 (NaraiConnect เอง) | - | dogfood, ใช้ระบบที่กำลัง manage |
| Email | (ไม่ใช้) | - | MVP ไม่ต้องส่งอีเมล |
| Deploy | Docker Compose บน VPS | - | reverse proxy ที่มีอยู่แล้ว |

**ภาษาหลัก:** TypeScript
**Module system:** ESM
**Package manager:** bun

## 3. Feature MVP

### 3.1 Authentication (login เข้า admin panel)
- Login ผ่าน NaraiConnect OAuth2 authorization code flow (eat own dogfood)
- Admin app ตัวเองมี client_id/client_secret ของตัวเอง (insert manual ครั้งแรก)
- เก็บ session cookie httpOnly + secure
- ตรวจสิทธิ์ admin จาก table `admin_users` (FK → `oauth_users.username`)
- Endpoint: `GET /api/v1/auth/login`, `GET /api/v1/auth/callback`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`

### 3.2 Manage OAuth Clients (CRUD + soft delete)
- List clients (filter: ชื่อ, สถานะ active/deleted, pagination)
- Create client: random `client_id` (16 hex), random `client_secret` (32 hex), กรอก `client_name`, `redirect_uri`, `scope`, `grant_types`
- Edit client: แก้ `client_name`, `redirect_uri`, `scope`, `grant_types`
- Regenerate client_secret
- Soft delete: set `deleted_at` + `is_active = 0`
- Restore: clear `deleted_at` + `is_active = 1`
- View detail: ข้อมูล client + จำนวน active token

### 3.3 Manage Scopes
- List scopes
- Create scope (`scope`, `is_default`)
- Edit / Delete scope

### 3.4 View & Revoke Tokens
- List access tokens (filter: client_id, user_id, expired/active) — pagination
- List refresh tokens (filter เดียวกัน)
- Revoke (DELETE row) tokens เป็นรายตัวหรือรายกลุ่ม (ตาม client_id)

### 3.5 View Authorization Codes (read-only)
- List recent authorization codes
- Filter ตาม client_id, user_id, expired/active

### 3.x ที่ไม่ทำใน MVP
> ส่วนนี้สำคัญ — บอก AI ชัด ๆ ว่าอะไรที่ "ยังไม่ทำ" ป้องกัน scope creep

- ❌ จัดการ `oauth_users` (สร้าง/ลบ user) — ใช้ระบบเดิม
- ❌ จัดการ `oauth_jwt` (public key) — เพิ่มภายหลัง
- ❌ Audit log แบบละเอียด — เก็บแค่ created_at/updated_at บน table หลัก
- ❌ Multi-tenant — มีแค่ Narai Property
- ❌ ส่งอีเมล / notification
- ❌ 2FA สำหรับ admin
- ❌ API rate limiting (มี reverse proxy อยู่แล้ว)
- ❌ User self-service portal

## 4. Data Model

ใช้ database `narai_portal2` ที่มีอยู่แล้ว (MariaDB 10.5) — เพิ่ม column nullable + table ใหม่ ห้าม drop ของเดิม

```
oauth_clients               (existing — ALTER เพิ่ม columns)
  client_id      varchar(80) pk
  client_secret  varchar(80) not null
  redirect_uri   varchar(2000) not null
  grant_types    varchar(80)
  scope          varchar(100)
  user_id        varchar(80)
  client_name    varchar(200)
  is_active      tinyint(1) default 1   -- NEW: PHP server ต้อง filter is_active=1
  created_at     timestamp default current_timestamp  -- NEW
  updated_at     timestamp default current_timestamp on update current_timestamp  -- NEW
  deleted_at     timestamp null         -- NEW: soft delete

oauth_scopes                (existing — ALTER เพิ่ม PK + timestamps)
  id             int auto_increment pk  -- NEW (ของเดิมไม่มี PK)
  scope          text
  is_default     tinyint(1)
  created_at     timestamp default current_timestamp  -- NEW
  updated_at     timestamp default current_timestamp on update current_timestamp  -- NEW

oauth_access_tokens         (existing — ไม่แตะ schema, อ่าน/ลบเท่านั้น)
oauth_refresh_tokens        (existing — ไม่แตะ schema, อ่าน/ลบเท่านั้น)
oauth_authorization_codes   (existing — read-only)
oauth_users                 (existing — read-only join เพื่อหา admin)
oauth_jwt                   (existing — ไม่แตะ MVP)

admin_users                 (NEW)
  id             int auto_increment pk
  username       varchar(255) not null unique  -- ค่าจาก SSO userinfo (e.g. "NP_1696")
  display_name   varchar(255)
  is_super       tinyint(1) default 0
  created_at     timestamp default current_timestamp
  updated_at     timestamp default current_timestamp on update current_timestamp
  deleted_at     timestamp null
  -- ไม่มี FK กับ oauth_users เพราะ table นั้นไม่ได้ถูกใช้ — auth จริงอยู่ที่
  -- ระบบ users หลักของบริษัท ส่ง username กลับมาผ่าน SSO userinfo
```

ความสัมพันธ์สำคัญ:
- `oauth_clients` 1-to-many `oauth_access_tokens` (ผ่าน `client_id`)
- `oauth_clients` 1-to-many `oauth_refresh_tokens` (ผ่าน `client_id`)
- `admin_users.username` คือ identifier จาก SSO userinfo (ไม่มี FK)

Multi-tenant: ไม่ใช่

## 5. โครงสร้างโปรเจกต์

```
NaraiConnect/
├── apps/
│   ├── api/                       # Elysia + Drizzle (mysql2)
│   │   ├── src/
│   │   │   ├── db/schema.ts
│   │   │   ├── modules/
│   │   │   │   ├── auth/          # OAuth callback, session
│   │   │   │   ├── clients/       # CRUD + soft delete
│   │   │   │   ├── scopes/        # CRUD
│   │   │   │   ├── tokens/        # list + revoke
│   │   │   │   └── auth-codes/    # read-only list
│   │   │   ├── lib/               # session, oauth client helper
│   │   │   └── index.ts
│   │   ├── drizzle.config.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   └── web/                       # SolidStart + Tailwind v4 + Eden Treaty
│       ├── src/
│       │   ├── routes/
│       │   ├── components/
│       │   └── lib/api.ts
│       ├── app.config.ts
│       ├── Dockerfile
│       └── package.json
├── packages/
│   └── shared/                    # shared types ระหว่าง api/web
├── sql/
│   ├── db.sql                     # dump ต้นฉบับจาก back_db
│   └── 001_init.sql               # ALTER + CREATE สำหรับ admin app
├── docs/PRD.md
├── docker-compose.yml             # dev
├── docker-compose.prod.yml        # prod (VPS)
├── CLAUDE.md
├── package.json                   # workspace root
├── tsconfig.base.json
├── .env.example
├── .gitignore
└── README.md
```

## 6. ข้อตกลง API

- **Base URL:** `/api/v1`
- **Format:** JSON
- **Error format:**
  ```json
  { "error": { "code": "ERROR_CODE", "message": "Human readable" } }
  ```
- **HTTP codes:** 200/201/400/401/403/404/409/422/500
- **Auth:** session cookie (httpOnly, sameSite=lax)

### Endpoints

```
# Auth
GET    /api/v1/auth/login                       → 302 redirect ไป NaraiConnect authorize
GET    /api/v1/auth/callback?code&state         → set session cookie, 302 ไป /
POST   /api/v1/auth/logout                      → clear session
GET    /api/v1/auth/me                          → { username, displayName, isSuper }

# Clients
GET    /api/v1/clients?q&active&page&pageSize   → list
POST   /api/v1/clients                          → create (auto-gen id/secret)
GET    /api/v1/clients/:clientId                → detail
PATCH  /api/v1/clients/:clientId                → update fields
POST   /api/v1/clients/:clientId/regenerate     → new secret
DELETE /api/v1/clients/:clientId                → soft delete (deleted_at + is_active=0)
POST   /api/v1/clients/:clientId/restore        → un-delete

# Scopes
GET    /api/v1/scopes
POST   /api/v1/scopes
PATCH  /api/v1/scopes/:id
DELETE /api/v1/scopes/:id

# Tokens
GET    /api/v1/tokens/access?clientId&userId&page&pageSize
GET    /api/v1/tokens/refresh?clientId&userId&page&pageSize
DELETE /api/v1/tokens/access/:token
DELETE /api/v1/tokens/refresh/:token
DELETE /api/v1/tokens/by-client/:clientId       → revoke ทั้งหมดของ client (access + refresh)

# Authorization codes (read-only)
GET    /api/v1/auth-codes?clientId&userId&page&pageSize
```

## 7. Acceptance Criteria

- [ ] Admin login ผ่าน NaraiConnect OAuth ได้
- [ ] CRUD + soft delete + restore ของ `oauth_clients` ทำงานครบ
- [ ] Soft delete แล้ว PHP server เดิมไม่ยอมให้ login ด้วย client นั้น (ผ่าน `is_active=1` filter ใน PHP — ทีม PHP ต้องอัปเดตด้วย)
- [ ] Manage scopes ครบ CRUD
- [ ] List + revoke tokens ทำงาน
- [ ] List authorization codes (read-only)
- [ ] response time ของทุก endpoint < 200ms (local)
- [ ] test ผ่านทั้งหมด
- [ ] lint ไม่มี error

## 8. Deployment

- **Dev:** `docker compose up -d` — `admin` container joins `back_db_network` (external)
- **Staging:** ไม่มี — dev → prod ตรง ๆ
- **Production:** VPS ที่มี reverse proxy เดิม → `apps.naraiproperty.com/connect_man`
  - nginx route `/connect_man/` → admin container (`127.0.0.1:8000`)
  - ดู `docker/nginx-vhost.conf` สำหรับ snippet
- **Env vars:** ดู `.env.example`
- **Migration:** รัน `sql/001_init.sql` มือก่อน start app ครั้งแรก (ครั้งเดียว)

## 9. Non-functional Requirements

- **Performance:** API < 200ms p95 (local), FCP < 1s, bundle frontend < 150KB gzip
- **Security:**
  - bcrypt 12 rounds (ถ้ามี password — MVP ไม่มี เพราะ OAuth)
  - CORS เฉพาะ origin ของตัวเอง ห้าม `*`
  - Cookie `httpOnly`, `secure`, `sameSite=lax`
  - Client secret ห้าม return ใน list endpoint, แสดงครั้งเดียวตอน create/regenerate
- **Compatibility:** Chrome/Firefox/Edge ล่าสุด (ใช้ภายใน)
- **Localization:** UI ไทย, timestamp Asia/Bangkok

## 10. Constraints / Decisions

- ใช้ MariaDB ไม่ใช่ PostgreSQL เพราะ share `back_db` กับระบบ PHP เดิม
- เลือก soft delete ผ่าน `is_active=1` filter (ฝั่ง PHP ต้องอัปเดต) แทน hard delete เพื่อ rollback ได้
- ไม่มี admin role ละเอียด — แค่ `is_super` boolean ใน MVP
- OAuth flow ของ admin app เอง: ต้อง insert client row แรกใน `oauth_clients` ด้วย SQL มือ (chicken-and-egg)
- ห้ามแตะ schema ของตาราง `oauth_*` แบบ destructive — เพิ่ม nullable column ได้, drop ไม่ได้
