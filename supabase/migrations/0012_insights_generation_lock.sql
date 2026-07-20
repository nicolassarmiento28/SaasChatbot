-- Lock de generación para insights: sin esto, dos requests concurrentes sin
-- caché existente disparan cada uno su propia llamada a Groq para el mismo
-- business_id/week_start antes de que cualquiera termine el upsert final.
-- La columna `generating` + el unique constraint existente permiten que solo
-- el primer insert "gane" el lock; el resto detecta el conflicto y no llama
-- a Groq.
alter table public.insights
  add column generating boolean not null default false;
