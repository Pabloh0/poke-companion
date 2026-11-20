-- =============================================================================
-- pokedex_entries: one row per (species, locale) with everything the Pokédex
-- list needs, so the website makes a single, simple query.
--
-- security_invoker = true: the view runs with the permissions of whoever
-- queries it (the website's `anon` role), so the RLS policies of the underlying
-- tables still apply. Without it, a view runs as its owner and would bypass RLS.
-- =============================================================================
create view public.pokedex_entries
with (security_invoker = true) as
select
  s.id                                   as dex_number,
  p.slug,
  t.locale,
  t.name,
  s.generation_id,
  array_agg(ty.slug order by pt.slot)    as types
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
group by s.id, p.slug, t.locale, t.name, s.generation_id;

comment on view public.pokedex_entries is
  'Pokédex list: default form of each species, localized name and types.';

revoke all on table public.pokedex_entries from anon, authenticated;
grant select on table public.pokedex_entries to anon, authenticated;
