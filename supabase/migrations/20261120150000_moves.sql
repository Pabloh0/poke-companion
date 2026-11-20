-- =============================================================================
-- Moves and learnsets (phase 2, RF-P05)
--
-- Source: PokeAPI data (BSD-3-Clause), imported by scripts/seed-pokedex.
-- For each Pokémon we keep ONE game's learnset: the most recent main-series
-- game it appears in (Scarlet/Violet, else Sword/Shield, else Brilliant
-- Diamond/Shining Pearl, else Ultra Sun/Ultra Moon…). Let's Go and the Legends
-- games are skipped: their move systems differ from the main series.
-- Same security model as the reference data: RLS on, public read-only.
-- =============================================================================

-- Games, grouped as PokeAPI does ("scarlet-violet"). Names live in the app's
-- translation files.
create table public.version_groups (
  id            smallint primary key,
  slug          text not null unique,
  generation_id smallint not null references public.generations (id)
);

create table public.moves (
  id           integer primary key,
  slug         text not null unique, -- e.g. "thunderbolt"
  type_id      smallint not null references public.types (id),
  damage_class text not null check (damage_class in ('physical', 'special', 'status')),
  power        smallint check (power > 0),               -- null: no fixed power
  accuracy     smallint check (accuracy between 1 and 100), -- null: never misses
  pp           smallint check (pp > 0),
  priority     smallint not null default 0
);

create index moves_type_idx on public.moves (type_id);

-- Name and the most recent in-game description, per language.
create table public.move_translations (
  move_id     integer not null references public.moves (id) on delete cascade,
  locale      public.app_locale not null,
  name        text not null,
  description text,
  primary key (move_id, locale)
);

-- Who learns what, how. `level` is 0 for every method except level-up, where
-- 0 means "when it evolves" (Scarlet/Violet) and 1 "from the start".
-- `machine` is the TM/TR/HM item ("tm045", "tr12") when method = 'machine'.
create table public.pokemon_moves (
  pokemon_id       integer  not null references public.pokemon (id) on delete cascade,
  move_id          integer  not null references public.moves (id) on delete cascade,
  method           text     not null check (
    method in ('level-up', 'machine', 'egg', 'tutor', 'reminder')
  ),
  level            smallint not null default 0 check (level between 0 and 100),
  machine          text check (machine ~ '^(tm|tr|hm)[0-9]+$'),
  version_group_id smallint not null references public.version_groups (id),
  primary key (pokemon_id, move_id, method, level)
);

create index pokemon_moves_move_idx on public.pokemon_moves (move_id);

-- -----------------------------------------------------------------------------
-- Security: RLS on, public read-only access for the website
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'version_groups', 'moves', 'move_translations', 'pokemon_moves'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
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
