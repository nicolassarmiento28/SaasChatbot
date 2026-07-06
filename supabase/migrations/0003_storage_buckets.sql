insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('knowledge-docs', 'knowledge-docs', false)
on conflict (id) do nothing;

create policy "avatars_owner_write"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "knowledge_docs_owner_all"
  on storage.objects for all
  using (bucket_id = 'knowledge-docs' and auth.role() = 'authenticated')
  with check (bucket_id = 'knowledge-docs' and auth.role() = 'authenticated');
