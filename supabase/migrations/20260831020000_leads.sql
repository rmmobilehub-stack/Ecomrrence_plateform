create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  contact text not null,
  interest text not null default '',
  source text not null default 'chatbot',
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed')),
  conversation jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists leads_store_created_idx on public.leads(store_id, created_at desc);

alter table public.leads enable row level security;
revoke all on table public.leads from anon, authenticated;
grant all on table public.leads to service_role;

