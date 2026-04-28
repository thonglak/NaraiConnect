# CLAUDE.md

> ไฟล์นี้คือคำสั่งให้ Claude Code อ่านก่อนทำงานทุกครั้ง อ่าน `docs/PRD.md` ควบคู่เสมอ

## Project Context

ชื่อโปรเจกต์: NaraiConnect Admin (Manage OAuth Clients SSO)
ประเภท: Internal admin tool ของ Narai Property
รายละเอียดทั้งหมดอยู่ใน `docs/PRD.md`

## Tech Stack (Hard Rules)

- **Runtime:** Bun เท่านั้น ห้ามแนะนำ `npm`, `node`, `ts-node`, `tsx`
- **Backend:** Elysia + TypeBox (มากับ Elysia) ห้ามใช้ Express/Fastify/Zod
- **ORM:** Drizzle (`drizzle-orm/mysql2`) ห้ามใช้ Prisma หรือ raw SQL
- **DB:** MariaDB 10.5 (shared `back_db` container ผ่าน `back_db_network`, database `narai_portal2`)
- **Frontend:** SolidStart + SolidJS ห้ามใช้ React/Vue/Svelte
- **Styling:** Tailwind v4 ห้ามใช้ CSS Modules / styled-components
- **Type-safe RPC:** Eden Treaty ห้ามสร้าง REST client มือ
- **Testing:** `bun:test` (built-in) ห้ามติดตั้ง Vitest/Jest
- **Dev environment:** Docker Compose เท่านั้น — ห้ามรัน `bun` บน host โดยตรง ใช้ `docker compose exec api ...`

## Commands

รันทุกอย่างผ่าน Docker Compose (host ไม่ต้องมี bun ติดตั้ง):

```bash
docker compose up -d                                  # start dev (api + web)
docker compose logs -f api                            # ดู log api
docker compose exec api bun install                   # install deps
docker compose exec api bun add <pkg>                 # add deps
docker compose exec api bun run db:push               # sync Drizzle schema (dev)
docker compose exec api bun run db:studio             # Drizzle Studio
docker compose exec api bun run db:generate           # generate migration
docker compose exec api bun run db:migrate            # run migration
docker compose exec api bun test                      # tests
docker compose exec api bun run lint                  # lint
docker compose -f docker-compose.prod.yml up -d       # production build
```

## Code Conventions

### General
- TypeScript strict mode ห้ามมี `any` ห้ามใช้ `as` ยกเว้น narrowing ที่จำเป็น
- ESM only ใช้ `import/export` ห้าม CommonJS
- ไฟล์ตั้งชื่อ `kebab-case.ts` directory เป็น `kebab-case`
- ฟังก์ชัน/ตัวแปรใช้ `camelCase` type/interface ใช้ `PascalCase`
- Arrow function เป็นค่าเริ่มต้น เว้นแต่ต้อง `this`

### Elysia
- ใช้ method chaining ตามแบบ Elysia
- Schema validation อยู่ใน `body`, `params`, `query`, `response` ของ route นั้นๆ
- แยกเป็น Elysia plugin ต่อ module เช่น `authPlugin`, `userPlugin`
- Service layer แยกออกจาก route handler
- ห้ามเรียก DB ตรงๆ ใน route ให้เรียกผ่าน service

ตัวอย่าง pattern:
```ts
export const authRoutes = new Elysia({ prefix: '/auth' })
  .post('/signup', async ({ body }) => signup(body), {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 8 }),
    }),
  });
```

### Drizzle
- Schema เป็น single source of truth ที่ `apps/api/src/db/schema.ts`
- Type ของ entity ดึงด้วย `InferSelectModel<typeof oauthClients>`
- ใช้ `bun run db:push` ตอน dev, migration ตอน prod
- ห้ามเขียน raw SQL ยกเว้นจำเป็น (พร้อมคอมเมนต์)
- ตาราง `oauth_*` ใช้ร่วมกับระบบ PHP เดิม — เพิ่ม column ต้องเป็น nullable ทุกครั้ง ห้าม drop column

### SolidStart
- Route ใช้ file-based ใน `src/routes/`
- ใช้ Server Functions (`"use server"`) สำหรับ private logic
- Data fetching ใช้ `createAsync` + `query` ของ SolidStart
- Component เป็น `function` ไม่ใช่ `const = () =>`
- State ใช้ Solid signals ห้ามใช้ store ภายนอก

### Eden Treaty
- Client อยู่ใน `apps/web/src/lib/api.ts` ตัวเดียว
- เรียก API ผ่าน `api.users.get()` ห้าม `fetch` ตรง

## Boundaries

### ทำได้
- สร้างไฟล์ใหม่ใน apps/api/src และ apps/web/src
- แก้ schema เพิ่ม table แต่ต้อง generate migration
- ติดตั้ง package ผ่าน `bun add`

### ห้ามทำโดยไม่ถาม
- เปลี่ยน tech stack
- เพิ่ม dependency หนัก (>500KB)
- เพิ่ม feature นอก scope MVP
- รัน migration บน production
- แก้ไฟล์ใน `node_modules`, `.git`, `dist`

## Workflow

1. **อ่าน PRD ก่อน** — `docs/PRD.md` คือ truth
2. **Plan แล้วค่อย implement**
3. **ทำทีละ task เล็ก** — 1 task = 1 PR mental model
4. **เขียน test ไปด้วย**
5. **Lint ก่อนจบ** — `bun run lint` ต้องผ่าน

## ภาษาที่ใช้สื่อสาร

- ผู้ใช้พูดไทย ตอบเป็นไทย
- โค้ด, comment, commit, error message → **ภาษาอังกฤษเสมอ**

## Common Pitfalls (อย่าทำ)

- ❌ ใช้ `any` แก้ปัญหา type
- ❌ catch error แล้วทิ้ง
- ❌ เก็บ password เป็น plain text — bcrypt 12 rounds
- ❌ เปิด CORS `*`
- ❌ ใช้ `console.log` ใน production code
- ❌ ลืม index บน column ที่ query บ่อย
- ❌ commit `.env` หรือ secret

## Performance Targets

- API response < 200ms (p95) บน local
- First contentful paint < 1s
- Bundle frontend < 150KB gzip

## เมื่อสับสน

ถ้าสเปกใน PRD ไม่ชัด ให้ **ถามก่อน** ห้ามเดา
