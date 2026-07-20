-- Rate limiting atómico: el patrón anterior (select en la Edge Function,
-- luego insert) tiene una ventana de carrera — N requests concurrentes del
-- mismo visitor_id pueden leer el mismo estado "aún no llegué al límite"
-- antes de que ninguno haya insertado su evento. Esta función hace el
-- conteo y el insert en una sola transacción, serializada por un advisory
-- lock por (bot_id, visitor_id) para que dos llamadas concurrentes del
-- mismo visitante nunca se evalúen en paralelo.
create or replace function public.check_and_record_rate_limit(
  p_bot_id uuid,
  p_visitor_id text,
  p_ip text,
  p_window_ms bigint,
  p_max_requests integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_start timestamptz := now() - (p_window_ms || ' milliseconds')::interval;
  v_count integer;
begin
  -- Serializa por visitante+bot: dos llamadas concurrentes con la misma
  -- clave esperan su turno en vez de leer el mismo conteo "viejo" en paralelo.
  perform pg_advisory_xact_lock(hashtextextended(p_bot_id::text || ':' || p_visitor_id, 0));

  select count(*) into v_count
  from public.rate_limit_events
  where bot_id = p_bot_id
    and (visitor_id = p_visitor_id or ip = p_ip)
    and created_at >= v_window_start;

  if v_count >= p_max_requests then
    return true; -- rate limited, no se registra el evento
  end if;

  insert into public.rate_limit_events (bot_id, visitor_id, ip)
  values (p_bot_id, p_visitor_id, p_ip);

  return false;
end;
$$;

-- Solo la service_role (Edge Function `chat`) llama esta función.
revoke execute on function public.check_and_record_rate_limit(uuid, text, text, bigint, integer) from anon, authenticated;
