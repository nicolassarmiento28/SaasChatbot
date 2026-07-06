create table public.bots (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  tone text not null default 'amigable' check (tone in ('formal', 'casual', 'amigable')),
  system_prompt text not null,
  avatar_url text,
  primary_color text not null default '#1677ff',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.bots enable row level security;

create policy "bots_all_own"
  on public.bots for all
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- Refuerza el límite de bots por plan server-side (no basta con deshabilitar el botón en UI).
create function public.enforce_bot_plan_limit()
returns trigger as $$
declare
  business_plan text;
  bot_count integer;
begin
  select plan into business_plan from public.businesses where id = new.business_id;
  select count(*) into bot_count from public.bots where business_id = new.business_id;

  if business_plan = 'free' and bot_count >= 1 then
    raise exception 'El plan free permite un único bot';
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger bots_enforce_plan_limit
  before insert on public.bots
  for each row execute procedure public.enforce_bot_plan_limit();

create table public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references public.bots (id) on delete cascade,
  type text not null check (type in ('faq', 'document', 'text')),
  title text not null,
  content text not null check (char_length(content) <= 20000),
  file_url text,
  created_at timestamptz not null default now()
);

alter table public.knowledge_sources enable row level security;

create policy "knowledge_sources_all_own"
  on public.knowledge_sources for all
  using (bot_id in (
    select b.id from public.bots b
    join public.businesses biz on biz.id = b.business_id
    where biz.owner_id = auth.uid()
  ))
  with check (bot_id in (
    select b.id from public.bots b
    join public.businesses biz on biz.id = b.business_id
    where biz.owner_id = auth.uid()
  ));
