-- Auditoria de RLS (07-seguridad.md, punto 2 del flujo).
-- Ejecutar en el SQL editor de Supabase para listar todas las policies
-- activas y confirmar manualmente que ninguna permite cruzar `business_id`.
--
-- Uso: correr el select de abajo y revisar cada fila contra el checklist.

select
  schemaname,
  tablename,
  policyname,
  cmd,
  qual as using_expr,
  with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- Checklist manual (confirmado a mano contra migraciones 0001-0004):
--
-- [x] businesses        -> select/update: owner_id = auth.uid(). Sin policy de
--                           insert/delete para authenticated (se crea via
--                           trigger handle_new_user, security definer).
-- [x] bots               -> all: business_id pertenece a auth.uid() via
--                           join businesses. Sin acceso anon directo a esta
--                           tabla (solo via vista bots_public).
-- [x] bots_public (view) -> select publico, expone unicamente id, name,
--                           primary_color, avatar_url, is_active. Nunca
--                           system_prompt.
-- [x] knowledge_sources  -> all: bot_id -> bots -> businesses = auth.uid().
--                           Sin policy anon (la Edge Function la lee con
--                           service_role, que ignora RLS).
-- [x] conversations      -> select: bot_id -> bots -> businesses = auth.uid().
--                           Sin policy de insert para authenticated ni anon:
--                           solo la Edge Function `chat` (service_role) inserta.
-- [x] messages           -> select: conversation_id -> conversations -> bots
--                           -> businesses = auth.uid(). Igual que arriba, solo
--                           la Edge Function inserta.
-- [x] usage_metrics      -> select: business_id = auth.uid() (via businesses).
--                           Solo la Edge Function escribe (service_role).
-- [x] rate_limit_events  -> RLS habilitado, sin policies para authenticated/anon:
--                           tabla de uso interno exclusivo de la Edge Function.
--
-- Ningun `business_id` recibido en el payload de un endpoint publico se usa
-- como fuente de verdad: `chat` deriva business_id desde bot.business_id
-- leido con service_role, nunca del body del request.
--
-- Test automatizado que verifica el aislamiento cross-tenant:
-- tests/rls/crossTenant.test.ts
