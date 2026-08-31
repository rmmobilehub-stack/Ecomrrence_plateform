alter table public.stores
  add column if not exists contact_widget_mode text not null default 'both';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'stores_contact_widget_mode_check'
  ) then
    alter table public.stores
      add constraint stores_contact_widget_mode_check
      check (contact_widget_mode in ('chatbot', 'whatsapp', 'both', 'none'));
  end if;
end $$;
