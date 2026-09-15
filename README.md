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
DEFAULT_STORE_SLUG=demo
NEXT_PUBLIC_DEFAULT_STORE_SLUG=demo
```

Never expose `SUPABASE_SECRET_KEY` or `DATABASE_URL` in client code. The app performs authorization in its server routes; both credentials are server-only. Copy `DATABASE_URL` from the project's **Connect** panel. Use the Session pooler connection string if your machine or host does not support IPv6.

As an alternative to `DATABASE_URL`, startup migrations also accept `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`. Do not configure both styles; `DATABASE_URL` takes precedence.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.
