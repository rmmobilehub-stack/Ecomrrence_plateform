alter table public.repair_bookings
  add column if not exists admin_note text,
  add column if not exists status_updates jsonb not null default '[]'::jsonb;

alter table public.orders
  add column if not exists admin_note text,
  add column if not exists status_updates jsonb not null default '[]'::jsonb;
