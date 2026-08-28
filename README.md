# ShopSaaS

Multi-tenant ecommerce SaaS built with Next.js 14, TypeScript, Supabase Postgres, and Supabase Storage. It includes a super-admin portal, a store-admin portal, and customer storefronts with guest cash-on-delivery checkout.

## Supabase setup

1. Create or open a Supabase project.
2. Open **SQL Editor**, paste [`supabase/migrations/20260828000000_initial_schema.sql`](supabase/migrations/20260828000000_initial_schema.sql), and run it once. This creates all tables, indexes, RLS settings, and the public `product-images` bucket.
3. In **Project Settings -> API Keys**, create/copy a server secret key (`sb_secret_...`). Legacy `service_role` keys are also supported.
4. Create `.env.local` from `.env.example` and set:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SECRET_KEY=sb_secret_your_server_only_key
DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres
JWT_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Never expose `SUPABASE_SECRET_KEY` or `DATABASE_URL` in client code. The app performs authorization in its server routes; both credentials are server-only. Copy `DATABASE_URL` from the project's **Connect** panel. Use the Session pooler connection string if your machine or host does not support IPv6.

As an alternative to `DATABASE_URL`, startup migrations also accept `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`. Do not configure both styles; `DATABASE_URL` takes precedence.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Seed accounts:

- Super admin: `super@platform.com` / `admin123`
- Store admin: `admin@demo.com` / `admin123`
- Demo storefront: `http://localhost:3000/store/demo`

`npm run dev` and `npm start` automatically apply every pending SQL file in `supabase/migrations` before starting Next.js, then run the idempotent seed. Applied filenames and checksums are tracked in `app_private.schema_migrations`; modified historical migrations are rejected. `npm run build` never connects to or mutates the database. Change the demo passwords before a public production launch.

## Features

- Role-protected super-admin and store-admin dashboards
- Admin/store CRUD, product catalog, categories, coupon discounts, order status updates, customer roll-up, analytics, and notification polling
- Public store routes by slug with catalog search, filtering, product options, localStorage cart, and COD checkout
- Server-side order validation, stock reduction, and store-admin notifications
- Durable Postgres data and public product-image storage on Supabase

## Deployment

Set `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `DATABASE_URL`, `JWT_SECRET`, and `NEXT_PUBLIC_SITE_URL` in the hosting provider's environment settings. Use `npm run build` for the production compilation check and `npm start` to migrate, seed, and serve the build.

The app uses a server-side Supabase secret because it keeps its existing custom JWT login. Database tables have RLS enabled and browser roles receive no direct access.

## SEO

The storefront uses Next.js server-rendered metadata. Set `NEXT_PUBLIC_SITE_URL` to the real HTTPS domain before deployment.

- `robots.txt` is available at `/robots.txt` and excludes dashboards, login, and API routes.
- `/sitemap.xml` automatically includes active stores, catalog pages, and active product pages.
- Store, catalog, and product pages have their own title, description, canonical URL, and Open Graph metadata.

After deploying, submit `https://your-domain.com/sitemap.xml` in Google Search Console.
