alter table public.stores
  add column if not exists hero_slides jsonb not null default '[]'::jsonb,
  add column if not exists about_title text,
  add column if not exists about_description text,
  add column if not exists about_image text;

