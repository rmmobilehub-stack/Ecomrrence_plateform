-- Stores exist independently and may have more than one assigned administrator.
alter table public.stores drop constraint if exists stores_admin_id_fkey;
alter table public.stores drop constraint if exists stores_admin_id_key;
alter table public.stores alter column admin_id drop not null;

alter table public.admins drop constraint if exists admins_store_id_key;
alter table public.admins drop constraint if exists admins_store_id_fkey;
alter table public.admins
  add constraint admins_store_id_fkey
  foreign key (store_id) references public.stores(id) on delete cascade;

create index if not exists admins_store_id_idx on public.admins(store_id);

-- Keep the old stores.admin_id value only as an optional legacy primary owner.
-- Access and assignment are now determined by admins.store_id.
