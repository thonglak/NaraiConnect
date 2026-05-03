# CLAUDE.md

> ไฟล์นี้คือคำสั่งให้ Claude Code อ่านก่อนทำงานทุกครั้ง อ่าน `docs/PRD.md` ควบคู่เสมอ

## Project Context

ชื่อโปรเจกต์: NaraiConnect Admin (Manage OAuth Clients SSO)
ประเภท: Internal admin tool ของ Narai Property
รายละเอียดทั้งหมดอยู่ใน `docs/PRD.md`

> **2026-05 migration**: เปลี่ยนจาก Bun + Elysia + SolidStart ไป **Laravel 11 + Livewire 3** ด้วยเหตุผล (1) DB share กับระบบ PHP เดิมง่ายขึ้น (2) ลด complexity ของ Vinxi/Vite HMR ใน Docker (3) ลด API server แยกออก
> โค้ดเก่าอยู่ที่ `apps/api/` + `apps/web/` (parked under `legacy` profile, รัน `docker compose --profile legacy up` ถ้าต้องการดูเทียบ)

## Tech Stack (Hard Rules)

- **Runtime:** PHP 8.3 + Node 20 (สำหรับ Vite build เท่านั้น)
- **Framework:** Laravel 11 (`apps/admin/`) — ห้ามใช้ Symfony/Slim/อื่นๆ
- **UI:** Livewire 3 + Blade — ห้าม React/Vue/Solid/Alpine แบบสร้าง SPA แยก (Alpine เฉพาะ inline UI state เช่น dropdown)
- **ORM:** Eloquent — ห้ามใช้ raw SQL ยกเว้นจำเป็น (พร้อมคอมเมนต์)
- **DB:** MariaDB 10.5 (shared `back_db` container ผ่าน `back_db_network`, database `narai_portal2`)
- **Styling:** Tailwind v4 ผ่าน `@tailwindcss/vite` — ห้าม CSS Modules / styled / Bootstrap
- **Testing:** Pest 3 (`./vendor/bin/pest`) — ห้ามใช้ PHPUnit ตรงๆ ห้ามติดตั้ง framework test อื่น
- **Dev environment:** Docker Compose เท่านั้น — ห้ามรัน `php`/`composer`/`artisan`/`npm` บน host โดยตรง ใช้ `docker compose exec admin ...`

## Commands

ทุกอย่างผ่าน Docker Compose (host ไม่ต้องมี PHP/composer/node):

```bash
docker compose up -d                                    # start dev (admin only)
docker compose logs -f admin                            # ดู log
docker compose exec admin sh                            # shell เข้า container
docker compose exec admin composer require <pkg>       # add PHP dep
docker compose exec admin npm install <pkg>            # add JS dep (Vite/Tailwind plugin เท่านั้น)
docker compose exec admin php artisan make:livewire X  # scaffold Livewire component
docker compose exec admin php artisan tinker           # interactive REPL
docker compose exec admin php artisan migrate          # run migration (ระวัง — DB share กับ PHP เดิม)
docker compose exec admin ./vendor/bin/pest            # run tests
docker compose exec admin php artisan route:list       # list routes

# Production
docker compose -f docker-compose.prod.yml build admin
docker compose -f docker-compose.prod.yml up -d

# Legacy (Bun stack อยู่ใน profile แยก)
docker compose --profile legacy up -d api web          # ปลุกของเก่า
```

URL หลัก:
- Admin app: http://localhost:8000
- Vite dev server (assets+HMR): http://localhost:5173

## Code Conventions

### General
- PSR-12 + Laravel Pint defaults
- Strict types ที่หัวไฟล์ของ service/model classes (`declare(strict_types=1);`) — Blade ไม่ต้อง
- ไฟล์ class: `PascalCase.php` namespace ตาม PSR-4
- เมธอด/ตัวแปร: `camelCase` constants: `SNAKE_CASE`
- Eloquent column ใน DB: `snake_case` (เช่น `client_id`, `created_at`) — ตามตารางเดิม

### Eloquent
- Models อยู่ที่ `apps/admin/app/Models/`
- ตาราง `oauth_*` + `admin_users` share กับระบบ PHP เดิม — ห้าม drop column, เพิ่ม column ต้อง nullable
- กำหนด `$primaryKey`, `$incrementing`, `$keyType` เมื่อ PK ไม่ใช่ `id` int auto-increment
- กำหนด `$timestamps = false` สำหรับตารางที่ไม่มี `created_at`/`updated_at`
- ใช้ `SoftDeletes` trait ถ้ามี `deleted_at`
- Scope query ที่ใช้บ่อยให้เขียน `scopeXxx` method (เช่น `scopeActive`)

### Livewire
- Components อยู่ที่ `apps/admin/app/Livewire/` view คู่กันที่ `resources/views/livewire/`
- Full-page component ใช้ attribute `#[Layout('layouts.app')]` + `#[Title('...')]`
- Public state สำหรับ filter/pagination ใช้ `#[Url]` เพื่อ sync URL query string
- Validation ใช้ `#[Validate('rules')]` บน property ตรงๆ ไม่ใช่ `rules()` method
- ห้ามเรียก DB ใน Blade view — ดึงข้อมูลใน `render()` ส่งเป็น array

ตัวอย่าง pattern:
```php
#[Layout('layouts.app')]
#[Title('Clients — NaraiConnect Admin')]
class ClientsIndex extends Component
{
    use WithPagination;

    #[Url(as: 'q', except: '')]
    public string $q = '';

    public function delete(string $clientId): void
    {
        app(ClientService::class)->softDelete($clientId);
        session()->flash('flash.success', "Client deleted.");
    }

    public function render(): View { /* ... */ }
}
```

### Blade
- Layout หลัก: `resources/views/layouts/app.blade.php`
- Reusable components: `resources/views/components/<name>.blade.php` ใช้ผ่าน `<x-name>`
- ใช้ `@vite(['resources/css/app.css'])` ใน layout ไม่ต้อง require ทุกหน้า
- ผูก `wire:model.live.debounce.300ms` สำหรับ search/filter input
- `wire:confirm="..."` สำหรับ destructive actions แทน `confirm()` JS
- Mobile-responsive: hidden `md:block` table + `md:hidden` card list (เก็บ pattern จาก redesign)

### Service Layer
- Business logic นอก Controller/Livewire เอาไปไว้ที่ `app/Services/`
- Service constructor inject ผ่าน Laravel container, ไม่ใช่ static singleton
- Controller/Livewire ห้ามเรียก DB query ที่ซับซ้อนเอง — ผ่าน service

### Auth
- Custom OAuth2 ผ่าน Narai Connect — ดู `app/Services/NaraiOAuth/NaraiOAuthClient.php`
- Session-based admin auth ผ่าน `app/Services/AdminSession.php` (key `admin_user_id`)
- Protected routes ใช้ middleware alias `admin` (อยู่ใน `bootstrap/app.php`)
- ห้ามใช้ Laravel default `auth` middleware — เราไม่ใช้ `users` table

## Boundaries

### ทำได้
- สร้างไฟล์ใหม่ใน `apps/admin/app/`, `resources/views/`, `routes/`, `tests/`
- เพิ่ม Livewire component ผ่าน `php artisan make:livewire`
- เพิ่ม migration ใหม่สำหรับตารางของ admin app เอง (ไม่ใช่ `oauth_*` หรือ `admin_users`)
- เพิ่ม composer/npm package ผ่าน `docker compose exec admin composer/npm` ที่จำเป็น

### ห้ามทำโดยไม่ถาม
- เปลี่ยน tech stack
- เพิ่ม dependency หนัก (>2MB autoload)
- รัน migration ที่แตะตาราง `oauth_*` หรือ `admin_users`
- แก้ไฟล์ใน `apps/api/` หรือ `apps/web/` (legacy)
- แก้ไฟล์ใน `vendor/`, `node_modules/`, `.git`, `storage/framework/`
- รัน `php artisan migrate` บน production โดยไม่ backup
- ลบ `legacy` profile ใน `docker-compose.yml`

## Workflow

1. **อ่าน PRD ก่อน** — `docs/PRD.md` คือ truth
2. **Plan แล้วค่อย implement**
3. **ทำทีละ task เล็ก** — 1 task = 1 PR mental model
4. **เขียน Pest test ไปด้วย** — feature test ผ่าน `Livewire::test(...)`
5. **Test ก่อนจบ** — `./vendor/bin/pest` ต้องเขียวหมด

## ภาษาที่ใช้สื่อสาร

- ผู้ใช้พูดไทย ตอบเป็นไทย
- โค้ด, comment, commit, error message → **ภาษาอังกฤษเสมอ**
- Blade `@error` message + flash session ที่แสดงให้ user → ภาษาไทยได้

## Common Pitfalls (อย่าทำ)

- ❌ ใช้ raw SQL เมื่อ Eloquent ทำได้
- ❌ catch Exception แล้วทิ้ง — log อย่างน้อย
- ❌ เก็บ password/secret เป็น plain text — bcrypt 12 rounds (Laravel default)
- ❌ เปิด CORS `*`
- ❌ ใช้ `dd()` / `dump()` ใน production code (ใช้ `Log::debug` แทน)
- ❌ ลืม index บน column ที่ query บ่อย
- ❌ commit `.env`, `.env.production` หรือ secret
- ❌ Query DB ใน Blade view — ทำใน `render()`
- ❌ Hard-code URL — ใช้ `route('name')` เสมอ
- ❌ ใช้ `wire:model` (sync ที่ submit) เมื่อต้องการ live filter — ใช้ `wire:model.live.debounce.300ms`

## Performance Targets

- TTFB < 200ms (p95) บน local
- First contentful paint < 1s
- Livewire round-trip < 300ms

## เมื่อสับสน

ถ้าสเปกใน PRD ไม่ชัด ให้ **ถามก่อน** ห้ามเดา
