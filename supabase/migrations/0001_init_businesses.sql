create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id),
  name text not null,
  slug text unique,
  plan text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  created_at timestamptz not null default now()
);

alter table public.businesses enable row level security;

create policy "businesses_select_own"
  on public.businesses for select
  using (owner_id = auth.uid());

create policy "businesses_update_own"
  on public.businesses for update
  using (owner_id = auth.uid());

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.businesses (owner_id, name, plan)
  values (new.id, 'Mi negocio', 'free');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
