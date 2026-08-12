-- ============================================================
-- Admins : membres du bureau autorisés à modifier les champs
-- administratifs (cotisation, licence, classement...).
-- Peuplée manuellement ou via sync_bureau_admin (cf. plus bas) :
--   insert into admins (user_id) values ('<uuid>');
-- ============================================================
create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table admins enable row level security;
-- Aucune policy : illisible/inéditable depuis le client, seulement via
-- service_role ou les fonctions security definer ci-dessous.

create function is_admin(uid uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from admins where user_id = uid);
$$;

-- ============================================================
-- Profiles : identité d'une personne (adhérent), qu'elle ait ou non
-- son propre compte de connexion. user_id est NULL pour un enfant
-- géré par un parent ; il se remplit quand la personne crée (ou
-- récupère) son propre compte via claim_code.
-- Ne contient QUE de l'identité — la licence et la cotisation sont
-- dans des tables séparées (permissions et cycle de vie différents :
-- éditables seulement par un admin, une ligne par saison pour la
-- cotisation).
-- ============================================================
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  claim_code text unique,

  prenom text not null,
  nom text not null,
  date_naissance date,
  sexe text check (sexe in ('M', 'F')),
  email text,
  telephone text,
  adresse text,

  -- Rôle au club — champ administratif malgré son emplacement ici (pas de
  -- table à part pour un champ unique) : protégé par le trigger plus bas.
  role_club text not null default 'adherent' check (
    role_club in ('adherent', 'bureau', 'entraineur', 'benevole')
  ),

  consentement_image boolean not null default false,
  contact_urgence_nom text,
  contact_urgence_telephone text,

  created_at timestamptz not null default now()
);

-- Lien parent ↔ enfant. Un parent peut gérer plusieurs profils enfants,
-- et un enfant (rare mais possible) peut avoir plusieurs tuteurs.
create table profile_guardians (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  relation text not null default 'parent' check (relation in ('parent', 'tuteur')),
  created_at timestamptz not null default now(),
  unique (parent_user_id, profile_id)
);

alter table profiles enable row level security;
alter table profile_guardians enable row level security;

-- Utilisée par les policies de profiles, licences et cotisations : évite
-- de dupliquer ce exists(...) dans chaque table liée à un profil.
create function can_access_profile(pid uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select
    auth.uid() in (select user_id from profiles where id = pid)
    or exists (
      select 1 from profile_guardians g
      where g.profile_id = pid and g.parent_user_id = auth.uid()
    );
$$;

-- Empêche un membre de s'attribuer lui-même le rôle "bureau" : seul un
-- admin (ou le trigger de signup interne, où auth.uid() est null car
-- l'appel ne passe pas par PostgREST) peut changer role_club.
create function enforce_profile_field_perms()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null or is_admin(auth.uid()) then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    new.role_club := old.role_club;
  else
    new.role_club := 'adherent';
  end if;

  return new;
end;
$$;

create trigger profiles_field_perms
  before insert or update on profiles
  for each row execute function enforce_profile_field_perms();

create policy "Voir son profil ou celui de ses enfants" on profiles
  for select using (can_access_profile(id));

create policy "Modifier son profil ou celui de ses enfants" on profiles
  for update using (can_access_profile(id)) with check (can_access_profile(id));

-- Un parent connecté peut créer un profil enfant (sans compte propre).
create policy "Créer un profil enfant" on profiles
  for insert with check (auth.uid() is not null and user_id is null);

create policy "Voir ses liens de tutelle" on profile_guardians
  for select using (auth.uid() = parent_user_id);

-- On ne peut créer un lien de tutelle que vers un profil non réclamé
-- (pas encore de compte propre) et qui n'a pas déjà de tuteur — sinon
-- n'importe quel membre connecté pourrait "adopter" le profil d'un autre
-- adhérent en connaissant juste son id.
create policy "Créer un lien de tutelle" on profile_guardians
  for insert with check (
    auth.uid() = parent_user_id
    and exists (
      select 1 from profiles p
      where p.id = profile_guardians.profile_id
        and p.user_id is null
        and not exists (select 1 from profile_guardians g2 where g2.profile_id = p.id)
    )
  );

create policy "Supprimer un lien de tutelle" on profile_guardians
  for delete using (auth.uid() = parent_user_id);

-- ============================================================
-- Licences FFBad : une ligne par profil. Table à part de profiles car
-- lecture/écriture obéissent à des règles différentes (écriture admin
-- uniquement) et le cycle de vie est différent (mise à jour par le
-- bureau après vérification, indépendamment des infos personnelles).
-- ============================================================
create table licences (
  profile_id uuid primary key references profiles(id) on delete cascade,
  numero_licence_ffbad text,
  type_licence text check (
    type_licence in ('competition', 'traditionnelle', 'decouverte', 'entreprise', 'para')
  ),
  date_expiration_licence date,
  certificat_medical_valide boolean not null default false,
  date_certificat_medical date,
  classement_simple text,
  classement_double text,
  classement_mixte text,
  niveau_jeu text,
  updated_at timestamptz not null default now()
);

alter table licences enable row level security;

create policy "Voir sa licence ou celle de ses enfants" on licences
  for select using (can_access_profile(profile_id));

create policy "Licence modifiable par un admin" on licences
  for insert with check (is_admin(auth.uid()));

create policy "Licence modifiable par un admin (update)" on licences
  for update using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- ============================================================
-- Cotisations : une ligne par profil ET par saison (l'ancien modèle à
-- une seule colonne "statut_cotisation" sur profiles ne gardait aucun
-- historique et écrasait la saison précédente).
-- ============================================================
create table cotisations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  saison text not null,
  statut text not null default 'impaye' check (statut in ('paye', 'impaye', 'partiel')),
  montant numeric(10, 2),
  date_paiement date,
  mode_paiement text check (mode_paiement in ('helloasso', 'cheque', 'especes', 'virement')),
  created_at timestamptz not null default now(),
  unique (profile_id, saison)
);

alter table cotisations enable row level security;

create policy "Voir sa cotisation ou celle de ses enfants" on cotisations
  for select using (can_access_profile(profile_id));

create policy "Cotisation modifiable par un admin" on cotisations
  for insert with check (is_admin(auth.uid()));

create policy "Cotisation modifiable par un admin (update)" on cotisations
  for update using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- Crée automatiquement une ligne profiles à chaque inscription (auth.users).
-- Si l'inscription porte un claim_code (ex: un ado qui récupère le profil
-- que son parent avait créé), on rattache ce profil existant au lieu d'en
-- créer un nouveau.
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  code text;
begin
  code := new.raw_user_meta_data ->> 'claim_code';

  if code is not null and exists (select 1 from public.profiles where claim_code = code and user_id is null) then
    update public.profiles
    set user_id = new.id, claim_code = null
    where claim_code = code;
  else
    insert into public.profiles (user_id, prenom, nom, email)
    values (
      new.id,
      new.raw_user_meta_data ->> 'prenom',
      new.raw_user_meta_data ->> 'nom',
      new.email
    );
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Bureau et équipes
-- ============================================================
create table bureau_postes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  poste text not null check (
    poste in ('president', 'vice_president', 'tresorier', 'tresorier_adjoint', 'secretaire', 'secretaire_adjoint', 'membre')
  ),
  saison text not null,
  mandat_debut date not null default current_date,
  mandat_fin date,
  created_at timestamptz not null default now(),
  unique (profile_id, poste, saison)
);

create table equipes (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  saison text not null,
  categorie text,
  division text,
  capitaine_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table equipe_membres (
  id uuid primary key default gen_random_uuid(),
  equipe_id uuid not null references equipes(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (equipe_id, profile_id)
);

alter table bureau_postes enable row level security;
alter table equipes enable row level security;
alter table equipe_membres enable row level security;

-- Composition du bureau et des équipes : visible par tout le monde (page
-- "vie du club"), modifiable uniquement par un admin.
create policy "Bureau visible par tous" on bureau_postes
  for select using (true);

create policy "Bureau modifiable par un admin" on bureau_postes
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy "Équipes visibles par tous" on equipes
  for select using (true);

create policy "Équipes modifiables par un admin" on equipes
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy "Composition d'équipe visible par tous" on equipe_membres
  for select using (true);

create policy "Composition d'équipe modifiable par un admin" on equipe_membres
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- Rejoindre le bureau donne automatiquement les droits admin si la
-- personne a un compte propre. Le retrait des droits admin reste manuel :
-- un admin peut porter ce rôle pour d'autres raisons (ex: entraîneur), le
-- simple départ du bureau ne doit pas le lui retirer silencieusement.
create function sync_bureau_admin()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  uid uuid;
begin
  select user_id into uid from profiles where id = new.profile_id;
  if uid is not null then
    insert into admins (user_id) values (uid) on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger bureau_postes_sync_admin
  after insert on bureau_postes
  for each row execute function sync_bureau_admin();
