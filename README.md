# TheWearCo

> **Internet uniform for founders, creators and builders.**
> Drops + a Design Studio where users print their own art on premium tees, hoodies and caps.

A Next.js 14 ecommerce app with SQLite persistence and an admin console.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Prisma** + **SQLite** (`prisma/dev.db`)
- **iron-session** admin auth
- **Tailwind CSS** (`ink` neutrals, `signal` accents)
- Local uploads under `public/uploads/`

## Setup

```bash
cd thewearco
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open http://localhost:3000

### Environment (`.env`)

```
DATABASE_URL="file:./dev.db"
ADMIN_EMAIL="admin@thewearco.local"
ADMIN_PASSWORD="change-me"
SESSION_SECRET="a-32+char-random-string-change-in-prod"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## Admin

- URL: http://localhost:3000/admin/login
- Default credentials: from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`
- Manage products, orders, newsletter subscribers, design uploads, and password

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js |
| `npm run build` | Generate Prisma client + production build |
| `npm run db:push` | Sync Prisma schema to SQLite |
| `npm run db:seed` | Seed catalog + admin user |

## Features

- **Shop** — filter by category/drop, sort by price (data from DB)
- **Product detail** — server-rendered with SEO metadata
- **Design Studio** — upload art (stored on disk), drag to position, add to cart
- **Cart** — localStorage (no base64 bloat; uses `/uploads/designs/...` URLs)
- **Checkout** — demo payment; orders saved to DB for admin
- **Newsletter** — emails stored in SQLite
- **Admin** — dashboard, products CRUD, orders + status, subscribers CSV, uploads gallery

## Uploads

- Studio designs → `public/uploads/designs/<uuid>.<ext>`
- Order copies → `public/uploads/orders/<orderId>/`
- Paths are stored on order line items (never raw data URLs in the DB)

## Folder structure

```
app/
  page.tsx, shop/, product/, studio/, cart/, checkout/, about/
  admin/login/          admin sign-in
  admin/(protected)/    dashboard, products, orders, subscribers, uploads, settings
  api/                  products, orders, newsletter, uploads, admin auth
components/
lib/                    prisma, catalog, session, validators, uploads, products (seed types)
prisma/                 schema.prisma, seed.ts, dev.db
public/uploads/         designs + orders
```

## Brand voice

Identity-first, not fashion-first. Quiet, premium, monospace details. Speaks founder culture: *Building…*, *v1.0*, *Offline Mode*, *Late Night Shipping*.
