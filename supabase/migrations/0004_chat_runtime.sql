-- Tablas de runtime de conversación para la Edge Function `chat` (05-widget.md)
-- + rate limiting (07-seguridad.md). `businesses`, `bots` y `knowledge_sources`
-- ya existen desde 0001_init_businesses.sql / 0002_bots_and_knowledge.sql.

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references public.bots (id) on delete cascade,
  source text not null check (source in ('widget', 'demo')),
  visitor_id text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table public.usage_metrics (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  period date not null,
  messages_count integer not null default 0,
  unique (business_id, period)
);

-- rate_limit_events (07-seguridad.md): ventana deslizante por visitor_id/ip/bot_id.
create table public.rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references public.bots (id) on delete cascade,
  visitor_id text not null,
  ip text not null,
  created_at timestamptz not null default now()
);
create index rate_limit_events_lookup_idx
  on public.rate_limit_events (bot_id, visitor_id, ip, created_at);

-- RLS: acceso autenticado restringido al dueño del negocio. El widget/landing
-- (anónimos) nunca leen/escriben estas tablas directo: pasan siempre por la
-- Edge Function `chat` usando la service_role key.
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.usage_metrics enable row level security;
alter table public.rate_limit_events enable row level security;

create policy "owner can view own conversations" on public.conversations
  for select using (bot_id in (
    select b.id from public.bots b join public.businesses biz on biz.id = b.business_id
    where biz.owner_id = auth.uid()
  ));

create policy "owner can view own messages" on public.messages
  for select using (conversation_id in (
    select c.id from public.conversations c
    join public.bots b on b.id = c.bot_id
    join public.businesses biz on biz.id = b.business_id
    where biz.owner_id = auth.uid()
  ));

create policy "owner can view own usage metrics" on public.usage_metrics
  for select using (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- Sin policies de insert/update/select para anon en conversations/messages/
-- usage_metrics/rate_limit_events: solo la Edge Function (service_role,
-- que ignora RLS) escribe/lee ahí.

-- Vista pública de solo lectura para el widget: nunca expone system_prompt.
create view public.bots_public as
  select id, name, primary_color, avatar_url, is_active from public.bots;

grant select on public.bots_public to anon;
