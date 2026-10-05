alter table public.stores
  add column if not exists ads jsonb not null default '[]'::jsonb;
