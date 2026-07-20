-- El constraint de 0009 nunca rechazaba nada: jsonb::text serializa con un
-- espacio después de ':' (ej. {"url": "javascript:..."}), pero el patrón
-- buscaba `"url":"javascript:` sin espacio, así que el ILIKE nunca
-- matcheaba. Reemplaza el matching de texto frágil por una función que
-- inspecciona cada elemento del array vía jsonb_array_elements, inmune a
-- variaciones de serialización.
create or replace function public.cta_buttons_urls_safe(buttons jsonb) returns boolean
language sql
immutable
as $$
  select not exists (
    select 1
    from jsonb_array_elements(buttons) as elem
    where lower(elem ->> 'url') ~ '^(javascript|data|vbscript):'
  );
$$;

alter table public.bots drop constraint if exists cta_buttons_url_scheme;

alter table public.bots
  add constraint cta_buttons_url_scheme
  check (public.cta_buttons_urls_safe(cta_buttons));
