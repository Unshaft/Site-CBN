-- À exécuter dans le SQL Editor du dashboard Supabase

create table salles (
  id uuid primary key default gen_random_uuid(),
  zone text not null,
  nom text not null,
  adresse text not null,
  note text
);

create table creneaux (
  id uuid primary key default gen_random_uuid(),
  salle_id uuid not null references salles(id) on delete cascade,
  jour text not null,
  horaire text not null,
  niveau text not null
);

alter table salles enable row level security;
alter table creneaux enable row level security;

create policy "Lecture publique des salles" on salles
  for select using (true);

create policy "Lecture publique des creneaux" on creneaux
  for select using (true);

-- Seed: données actuellement en dur dans src/app/creneaux/page.tsx

with s as (
  insert into salles (zone, nom, adresse, note) values
    ('Nice Ouest', 'Collège de l''Archet', '39 Bd Impératrice Eugénie, 06200 Nice', 'Salle surveillée — arrivée avant 19h55, ouverture des portes à 20h00 pile, sortie à 22h00.'),
    ('Nice Ouest', 'Faculté de Droit', 'Av. Doyen Louis Trotabas, 06000 Nice', null),
    ('Nice Ouest', 'UFR STAPS', '261 Bd du Mercantour, 06200 Nice', null),
    ('Nice Ouest', 'Faculté de Lettres', '98 Bd Edouard Herriot, 06200 Nice', null),
    ('Nice Est', 'Collège Port Lympia', '31 Bd Stalingrad, 06000 Nice', 'Salle surveillée — horaires d''entrée et de sortie stricts.'),
    ('Nice Est', 'Collège Maurice Jaubert', '5 Av. du Général Olry, 06300 Nice', null),
    ('Nice Centre / Nord', 'Collège Jean-Henri Fabre', '26 Bd Henri Sappia, 06100 Nice', 'Accès libre — clés gérées par les membres via le groupe WhatsApp de la salle.'),
    ('Nice Centre / Nord', 'Campus Valrose', '28 Av. de Valrose, 06000 Nice', null)
  returning id, nom
)
insert into creneaux (salle_id, jour, horaire, niveau)
select s.id, c.jour, c.horaire, c.niveau
from s
join (values
  ('Collège de l''Archet', 'Lundi', '18h00–20h00', 'Jeunes'),
  ('Collège de l''Archet', 'Lundi', '20h00–22h00', 'Adultes D1+ (entraînement)'),
  ('Collège de l''Archet', 'Mardi', '18h00–20h00', 'Jeunes'),
  ('Collège de l''Archet', 'Mardi', '20h00–22h00', 'Adultes loisir'),
  ('Collège de l''Archet', 'Jeudi', '18h00–20h00', 'Jeunes'),
  ('Collège de l''Archet', 'Jeudi', '20h00–22h00', 'Adultes débutants / loisir'),
  ('Collège de l''Archet', 'Vendredi', '17h30–19h00', 'Jeunes'),
  ('Collège de l''Archet', 'Vendredi', '19h00–20h30', 'Entraînement individuel (sur conditions)'),
  ('Faculté de Droit', 'Jeudi', '20h30–22h30', 'Adultes loisir'),
  ('UFR STAPS', 'Mercredi', '18h00–19h30', 'Jeunes'),
  ('UFR STAPS', 'Mercredi', '19h30–22h00', 'Adultes compétition (R/N)'),
  ('Faculté de Lettres', 'Samedi', '09h30–14h00', 'Loisir, tous niveaux'),
  ('Collège Port Lympia', 'Lundi', '20h00–22h00', 'Adultes loisir'),
  ('Collège Port Lympia', 'Mercredi', '20h00–22h00', 'Adultes loisir'),
  ('Collège Port Lympia', 'Jeudi', '20h00–22h00', 'Adultes loisir'),
  ('Collège Maurice Jaubert', 'Mardi', '20h00–22h00', 'Matchs interclubs'),
  ('Collège Jean-Henri Fabre', 'Mar · Mer · Jeu', '20h00–22h00', 'Adultes loisir'),
  ('Campus Valrose', 'Mercredi', '14h00–16h30', 'Jeunes')
) as c(nom, jour, horaire, niveau) on c.nom = s.nom;
