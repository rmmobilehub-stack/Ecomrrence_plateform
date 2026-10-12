-- Public storefront contact details managed from admin settings.
alter table public.stores
  add column if not exists contact_phone text,
  add column if not exists contact_address text;

comment on column public.stores.contact_phone is 'Public phone number shown on About / Connect sections';
comment on column public.stores.contact_address is 'Public business address shown on About / Connect sections';
