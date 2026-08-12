-- À exécuter dans le SQL Editor du dashboard Supabase, après stats_licencies.sql

-- ============================================================
-- Actualités : remplace les tableaux en dur ARTICLES (vie-du-club)
-- et NEWS (accueil), qui dupliquaient la même info à deux endroits.
-- date_fin est optionnelle : sert aux annonces sur plusieurs jours
-- (ex: "15–20 JUIN 2026"), le formatage d'affichage se fait en JS.
-- ============================================================
create table actualites (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  categorie text not null default 'Annonce',
  extrait text not null,
  date_debut date not null default current_date,
  date_fin date,
  created_at timestamptz not null default now()
);

alter table actualites enable row level security;

create policy "Actualités visibles par tous" on actualites
  for select using (true);

create policy "Actualités modifiables par un admin" on actualites
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- ============================================================
-- Tarifs : remplace TARIFS + REDUCTIONS (infos-pratiques), discriminés
-- par "type" pour éviter deux tables/CRUD quasi identiques. montant
-- reste du texte libre pour garder le signe (+/−) et le symbole €
-- déjà utilisés sans complexifier la saisie.
-- ============================================================
create table tarifs (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('formule', 'reduction')),
  label text not null,
  montant text not null,
  detail text,
  ordre integer not null default 0,
  created_at timestamptz not null default now()
);

alter table tarifs enable row level security;

create policy "Tarifs visibles par tous" on tarifs
  for select using (true);

create policy "Tarifs modifiables par un admin" on tarifs
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- ============================================================
-- Dashboard admin : agrégats réservés au bureau (is_admin), même
-- pattern que stats_licencies().
-- ============================================================
create or replace function admin_dashboard_stats(p_saison text)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  result json;
begin
  if not is_admin(auth.uid()) then
    raise exception 'Accès réservé au bureau du club.';
  end if;

  select json_build_object(
    'total_membres', (select count(*) from profiles),
    'par_role_club', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json) from (
        select role_club as label, count(*) as effectif
        from profiles group by role_club order by effectif desc
      ) t
    ),
    'cotisation', (
      select json_build_object(
        'paye', count(*) filter (where statut = 'paye'),
        'partiel', count(*) filter (where statut = 'partiel'),
        'impaye', count(*) filter (where statut = 'impaye'),
        'sans_ligne', (select count(*) from profiles) - count(*)
      )
      from cotisations where saison = p_saison
    ),
    'nb_salles', (select count(*) from salles),
    'nb_creneaux', (select count(*) from creneaux),
    'bureau_actif', (
      select count(distinct profile_id) from bureau_postes
      where saison = p_saison and (mandat_fin is null or mandat_fin >= current_date)
    )
  ) into result;

  return result;
end;
$$;

grant execute on function admin_dashboard_stats(text) to authenticated;

-- ============================================================
-- Policies admin manquantes : un admin ne pouvait jusqu'ici lire/
-- modifier que son propre profil (can_access_profile). Sans ça, le
-- portail admin ne verrait que l'admin connecté, silencieusement.
-- Ces policies s'ajoutent en OR aux policies existantes (RLS
-- permissive par défaut).
-- ============================================================
create policy "Profils visibles par un admin" on profiles
  for select using (is_admin(auth.uid()));

create policy "Profils modifiables par un admin" on profiles
  for update using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy "Cotisations visibles par un admin" on cotisations
  for select using (is_admin(auth.uid()));

create policy "Licences visibles par un admin" on licences
  for select using (is_admin(auth.uid()));
