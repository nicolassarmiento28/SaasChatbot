-- Insights semanales cacheados por negocio (specs/06-dashboard.md §7, §10).
-- Generados/escritos solo por la Edge Function `insights` (service_role,
-- ignora RLS); el dueño del negocio solo puede leer los suyos.

create table public.insights (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  week_start date not null,
  content text not null,
  created_at timestamptz not null default now(),
  unique (business_id, week_start)
);

alter table public.insights enable row level security;

create policy "owner can view own insights" on public.insights
  for select using (business_id in (select id from public.businesses where owner_id = auth.uid()));
