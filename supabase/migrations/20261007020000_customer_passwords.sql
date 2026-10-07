alter table public.customers
  add column if not exists password_hash text not null default '';
