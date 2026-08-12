-- À exécuter dans le SQL Editor du dashboard Supabase, après schema_membres.sql

-- Agrégats sur les profils, réservés au bureau (is_admin). Ne renvoie que
-- des effectifs, jamais de ligne individuelle : sûr même si un jour on
-- élargit l'accès.
create or replace function stats_licencies()
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
    'total', (select count(*) from profiles),
    'avec_telephone', (select count(*) from profiles where telephone is not null and telephone <> ''),
    'avec_date_naissance', (select count(*) from profiles where date_naissance is not null),
    'certificat_medical_valide', (select count(*) from licences where certificat_medical_valide),
    'par_sexe', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json) from (
        select coalesce(sexe, 'Non renseigné') as label, count(*) as effectif
        from profiles group by label order by effectif desc
      ) t
    ),
    'par_tranche_age', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json) from (
        select
          case
            when date_naissance is null then 'Non renseigné'
            when date_part('year', age(date_naissance)) < 15 then 'Moins de 15 ans'
            when date_part('year', age(date_naissance)) < 18 then '15-17 ans'
            when date_part('year', age(date_naissance)) < 40 then '18-39 ans'
            else '40 ans et +'
          end as label,
          count(*) as effectif
        from profiles group by label order by effectif desc
      ) t
    ),
    'par_statut_cotisation', (
      -- Dernière saison connue par profil (le tri lexicographique marche
      -- tant que la saison est au format 'AAAA-AAAA').
      select coalesce(json_agg(row_to_json(t)), '[]'::json) from (
        select coalesce(c.statut, 'Non renseigné') as label, count(*) as effectif
        from profiles p
        left join lateral (
          select statut from cotisations where profile_id = p.id order by saison desc limit 1
        ) c on true
        group by label order by effectif desc
      ) t
    ),
    'par_type_licence', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json) from (
        select coalesce(l.type_licence, 'Non renseigné') as label, count(*) as effectif
        from profiles p
        left join licences l on l.profile_id = p.id
        group by label order by effectif desc
      ) t
    )
  ) into result;

  return result;
end;
$$;

grant execute on function stats_licencies() to authenticated;
