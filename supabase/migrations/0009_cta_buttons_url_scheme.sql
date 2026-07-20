-- Bloquea esquemas de URL peligrosos en cta_buttons a nivel de base de datos.
-- La validación de cliente (src/features/bots/ctaButtons.ts) no es suficiente:
-- un negocio puede escribir directo vía PostgREST saltándose la UI.
alter table public.bots
  add constraint cta_buttons_url_scheme
  check (
    cta_buttons::text not ilike '%"url":"javascript:%' and
    cta_buttons::text not ilike '%"url":"data:%' and
    cta_buttons::text not ilike '%"url":"vbscript:%'
  );
