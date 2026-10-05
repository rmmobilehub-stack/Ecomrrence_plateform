create table if not exists public.repair_bookings (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  booking_number text not null,
  customer jsonb not null,
  device jsonb not null,
  issue jsonb not null,
  preferred_date text,
  preferred_time text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'scheduled', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (store_id, booking_number)
);

create index if not exists repair_bookings_store_created_idx
  on public.repair_bookings(store_id, created_at desc);

alter table public.repair_bookings enable row level security;
revoke all on table public.repair_bookings from anon, authenticated;
grant all on table public.repair_bookings to service_role;
