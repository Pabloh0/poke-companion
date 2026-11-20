-- =============================================================================
-- Reference data for the Pokédex (phase 2)
--
-- Source: PokeAPI data (BSD-3-Clause), imported by scripts/seed-pokedex.
-- Ids are PokeAPI ids, so re-importing is idempotent (upsert by primary key).
--
-- Security model:
--   * RLS is enabled on every table.
--   * anon/authenticated (the website) can only SELECT.
--   * Writes happen only from the import script, which connects with the
--     database owner role and therefore bypasses RLS. That credential never
--     reaches the browser or Vercel.
-- =============================================================================

-- Languages we store translations for. Kept as a domain so adding one later is
-- a single, explicit change.
create domain public.app_locale as text
  check (value in ('es', 'en'));

-- -----------------------------------------------------------------------------
-- Generations (I…IX)
-- -----------------------------------------------------------------------------
create table public.generations (
  id   smallint primary key,
  slug text not null unique -- e.g. "generation-i"
);

-- -----------------------------------------------------------------------------
-- Types (only the 18 battle types; PokeAPI's "stellar", "unknown" and
-- "shadow" pseudo-types are not imported)
-- -----------------------------------------------------------------------------
create table public.types (
  id   smallint primary key,
  slug text not null unique -- e.g. "fire"; matches the app's PokemonType ids
);

create table public.type_translations (
  type_id smallint not null references public.types (id) on delete cascade,
  locale  public.app_locale not null,
  name    text not null,
  primary key (type_id, locale)
);

-- -----------------------------------------------------------------------------
-- Species: what the Pokédex numbers (Pikachu is species #25)
-- -----------------------------------------------------------------------------
create table public.pokemon_species (
  id                      integer primary key, -- National Pokédex number
  slug                    text not null unique,
  generation_id           smallint not null references public.generations (id),
  -- Deferrable: some species evolve from one with a higher number (Pikachu #25
  -- evolves from Pichu #172), so the importer checks this at commit time.
  evolves_from_species_id integer references public.pokemon_species (id)
    deferrable initially immediate,
  evolution_chain_id      integer,
  is_baby                 boolean not null default false,
  is_legendary            boolean not null default false,
  is_mythical             boolean not null default false
);

create index pokemon_species_generation_idx
  on public.pokemon_species (generation_id);

-- Name, category ("Mouse Pokémon") and the most recent Pokédex entry.
-- genus/flavor_text can be null: PokeAPI lacks Spanish texts for some recent
-- species. The UI falls back to English for those.
create table public.pokemon_species_translations (
  species_id  integer not null references public.pokemon_species (id) on delete cascade,
  locale      public.app_locale not null,
  name        text not null,
  genus       text,
  flavor_text text,
  primary key (species_id, locale)
);

-- Fast case-insensitive name search ("pika" → Pikachu).
create index pokemon_species_translations_name_idx
  on public.pokemon_species_translations (locale, lower(name) text_pattern_ops);

-- -----------------------------------------------------------------------------
-- Pokémon: a concrete form of a species. Every species has one default form
-- (is_default) plus optional alternatives (Alolan, Mega, Gigantamax…).
-- -----------------------------------------------------------------------------
create table public.pokemon (
  id              integer primary key,
  slug            text not null unique, -- e.g. "raichu-alola"
  species_id      integer not null references public.pokemon_species (id) on delete cascade,
  is_default      boolean not null,
  height_dm       smallint not null check (height_dm >= 0), -- decimetres
  weight_hg       integer  not null check (weight_hg >= 0), -- hectograms
  base_experience smallint
);

create index pokemon_species_idx on public.pokemon (species_id);

-- Exactly one default form per species.
create unique index pokemon_one_default_per_species_idx
  on public.pokemon (species_id) where is_default;

create table public.pokemon_types (
  pokemon_id integer  not null references public.pokemon (id) on delete cascade,
  slot       smallint not null check (slot in (1, 2)),
  type_id    smallint not null references public.types (id),
  primary key (pokemon_id, slot)
);

create index pokemon_types_type_idx on public.pokemon_types (type_id);

-- The six base stats. Stat labels are UI text and live in the app's
-- translation files, not here.
create table public.pokemon_stats (
  pokemon_id integer  not null references public.pokemon (id) on delete cascade,
  stat       text     not null check (
    stat in ('hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed')
  ),
  base_value smallint not null check (base_value between 1 and 255),
  effort     smallint not null default 0 check (effort between 0 and 3),
  primary key (pokemon_id, stat)
);

-- -----------------------------------------------------------------------------
-- Abilities
-- -----------------------------------------------------------------------------
create table public.abilities (
  id            integer primary key,
  slug          text not null unique,
  generation_id smallint not null references public.generations (id)
);

create table public.ability_translations (
  ability_id integer not null references public.abilities (id) on delete cascade,
  locale     public.app_locale not null,
  name       text not null,
  primary key (ability_id, locale)
);

create table public.pokemon_abilities (
  pokemon_id integer  not null references public.pokemon (id) on delete cascade,
  slot       smallint not null check (slot between 1 and 3),
  ability_id integer  not null references public.abilities (id),
  is_hidden  boolean  not null default false,
  primary key (pokemon_id, slot)
);

create index pokemon_abilities_ability_idx on public.pokemon_abilities (ability_id);

-- -----------------------------------------------------------------------------
-- Security: RLS on, public read-only access for the website
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'generations', 'types', 'type_translations',
    'pokemon_species', 'pokemon_species_translations',
    'pokemon', 'pokemon_types', 'pokemon_stats',
    'abilities', 'ability_translations', 'pokemon_abilities'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    -- Defence in depth: even if a policy were added by mistake, the website
    -- roles have no write privileges on reference data.
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant select on table public.%I to anon, authenticated', t);
    execute format(
      'create policy "Reference data is publicly readable" on public.%I
         for select to anon, authenticated using (true)',
      t
    );
  end loop;
end
$$;
