create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  email text not null,
  name text not null default '',
  phone text not null default '',
  avatar_url text not null default '',
  google_id text,
  facebook_id text,
  created_at timestamptz not null default now(),
  last_login_at timestamptz,
  unique (store_id, email)
);

create unique index if not exists customers_store_google_uidx
  on public.customers(store_id, google_id)
  where google_id is not null;

create unique index if not exists customers_store_facebook_uidx
  on public.customers(store_id, facebook_id)
  where facebook_id is not null;

create index if not exists customers_store_email_idx
  on public.customers(store_id, lower(email));

alter table public.customers enable row level security;
revoke all on table public.customers from anon, authenticated;
grant all on table public.customers to service_role;

alter table public.orders
  add column if not exists customer_id uuid references public.customers(id) on delete set null;

alter table public.repair_bookings
  add column if not exists customer_id uuid references public.customers(id) on delete set null;

create index if not exists orders_customer_created_idx
  on public.orders(customer_id, created_at desc);

create index if not exists repair_bookings_customer_created_idx
  on public.repair_bookings(customer_id, created_at desc);
