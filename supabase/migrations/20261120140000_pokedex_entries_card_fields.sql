-- =============================================================================
-- pokedex_entries: extra fields for the collectible-card design.
--
--   genus           "Mouse Pokémon" / "Pokémon Ratón" (null when PokeAPI has
--                   no text in that language)
--   is_legendary,
--   is_mythical     rarity mark on the card
--   base_stat_total sum of the six base stats of the default form
--
-- `create or replace view` can only APPEND columns, so existing ones keep
-- their order. security_invoker must be restated: it is part of the view
-- definition.
-- =============================================================================
create or replace view public.pokedex_entries
with (security_invoker = true) as
select
  s.id                                   as dex_number,
  p.slug,
  t.locale,
  t.name,
  s.generation_id,
  array_agg(ty.slug order by pt.slot)    as types,
  t.genus,
  s.is_legendary,
  s.is_mythical,
  (
    select sum(st.base_value)::integer
    from public.pokemon_stats st
    where st.pokemon_id = p.id
  )                                      as base_stat_total
from public.pokemon p
join public.pokemon_species s
  on s.id = p.species_id
join public.pokemon_species_translations t
  on t.species_id = s.id
join public.pokemon_types pt
  on pt.pokemon_id = p.id
join public.types ty
  on ty.id = pt.type_id
where p.is_default
group by s.id, p.id, p.slug, t.locale, t.name, t.genus, s.generation_id,
  s.is_legendary, s.is_mythical;
