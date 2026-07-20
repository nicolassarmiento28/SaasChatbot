-- Botones CTA configurables por bot (specs/04-bot-config.md §5).
-- Hasta 3 botones {label, url} que la Edge Function `chat` devuelve junto
-- a cada respuesta para que el widget los renderice como acciones.
alter table public.bots
  add column cta_buttons jsonb not null default '[]'::jsonb;

alter table public.bots
  add constraint bots_cta_buttons_max_three
  check (jsonb_array_length(cta_buttons) <= 3);
