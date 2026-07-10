-- Corrige aislamiento multi-tenant en storage.objects (hallazgos HIGH #1/#2
-- de la auditoria de seguridad): las policies originales de 0003 solo
-- exigian auth.role() = 'authenticated', permitiendo leer/escribir/borrar
-- archivos de knowledge-docs y avatars de CUALQUIER otro negocio.
--
-- A partir de esta migracion, los objetos deben subirse bajo el prefijo
-- {business_id}/... (p.ej. knowledge-docs/<uuid-del-negocio>/archivo.pdf)
-- para que la policy pueda validar la propiedad.

drop policy "avatars_owner_write" on storage.objects;
drop policy "knowledge_docs_owner_all" on storage.objects;

create policy "avatars_owner_write"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] in (
      select id::text from public.businesses where owner_id = auth.uid()
    )
  );

create policy "knowledge_docs_owner_all"
  on storage.objects for all
  using (
    bucket_id = 'knowledge-docs'
    and (storage.foldername(name))[1] in (
      select id::text from public.businesses where owner_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'knowledge-docs'
    and (storage.foldername(name))[1] in (
      select id::text from public.businesses where owner_id = auth.uid()
    )
  );
