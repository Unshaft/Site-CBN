-- À exécuter dans le SQL Editor du dashboard Supabase, après schema.sql

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  prenom text,
  nom text,
  telephone text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Un membre voit son propre profil" on profiles
  for select using (auth.uid() = id);

create policy "Un membre modifie son propre profil" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Crée automatiquement une ligne profiles à chaque inscription (auth.users)
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, prenom, nom)
  values (
    new.id,
    new.raw_user_meta_data ->> 'prenom',
    new.raw_user_meta_data ->> 'nom'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
