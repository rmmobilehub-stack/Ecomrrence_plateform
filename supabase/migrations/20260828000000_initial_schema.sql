-- ShopSaaS database schema. Run this once in the Supabase SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.super_admins (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists super_admins_email_unique on public.super_admins (lower(email));

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  password_hash text not null,
  status text not null default 'active' check (status in ('active', 'suspended')),
  plan text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  store_id uuid not null unique,
  created_at timestamptz not null default now()
);
create unique index if not exists admins_email_unique on public.admins (lower(email));

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null unique references public.admins(id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  logo text not null default '',
  banner text not null default '',
  hero_title text,
  hero_cta_label text,
  announcement text,
  primary_color text not null default '#6c63ff',
  currency text not null default 'USD',
  contact_email text not null,
  whatsapp_number text,
  delivery_fee numeric not null default 0 check (delivery_fee >= 0),
  free_delivery_threshold numeric check (free_delivery_threshold >= 0),
  social_links jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists stores_slug_unique on public.stores (lower(slug));

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  unique (store_id, slug)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  price numeric not null default 0 check (price >= 0),
  compare_price numeric not null default 0 check (compare_price >= 0),
  discount numeric not null default 0 check (discount between 0 and 100),
  images jsonb not null default '[]'::jsonb,
  thumbnail text not null default '',
  category_id text not null default '',
  tags jsonb not null default '[]'::jsonb,
  stock integer not null default 0 check (stock >= 0),
  sku text not null default '',
  status text not null default 'draft' check (status in ('active', 'draft', 'archived')),
  custom_properties jsonb not null default '[]'::jsonb,
  variants jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, slug)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  order_number text not null,
  customer jsonb not null,
  items jsonb not null,
  subtotal numeric not null check (subtotal >= 0),
  product_discount numeric not null default 0 check (product_discount >= 0),
  discount numeric not null default 0 check (discount >= 0),
  coupon_code text,
  delivery_fee numeric not null default 0 check (delivery_fee >= 0),
  total numeric not null check (total >= 0),
  payment_method text not null default 'COD' check (payment_method = 'COD'),
  channel text check (channel in ('website', 'whatsapp')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (store_id, order_number)
);

create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  code text not null,
  type text not null check (type in ('percentage', 'fixed')),
  value numeric not null check (value > 0),
  min_order_amount numeric not null default 0 check (min_order_amount >= 0),
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (store_id, code)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.admins(id) on delete cascade,
  type text not null check (type = 'new_order'),
  title text not null,
  message text not null,
  order_id uuid not null references public.orders(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists categories_store_id_idx on public.categories(store_id);
create index if not exists products_store_id_idx on public.products(store_id);
create index if not exists products_status_idx on public.products(store_id, status);
create index if not exists orders_store_created_idx on public.orders(store_id, created_at desc);
create index if not exists notifications_admin_created_idx on public.notifications(admin_id, created_at desc);
create index if not exists discounts_store_code_idx on public.discounts(store_id, code);

alter table public.super_admins enable row level security;
alter table public.admins enable row level security;
alter table public.stores enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.discounts enable row level security;
alter table public.notifications enable row level security;

-- The application authorizes requests in its server routes and uses only the
-- server-side secret key. Browser roles receive no table access.
revoke all on table public.super_admins, public.admins, public.stores,
  public.categories, public.products, public.orders, public.discounts,
  public.notifications from anon, authenticated;
grant all on table public.super_admins, public.admins, public.stores,
  public.categories, public.products, public.orders, public.discounts,
  public.notifications to service_role;

-- Public product images are written by the server-side secret client.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
