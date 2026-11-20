/**
 * Pure transformation: PokeAPI CSV rows → rows for our tables.
 *
 * No network, no database: everything here is covered by unit tests
 * (transform.test.ts). Row keys match the table column names exactly.
 * Any inconsistency in the source data throws, so we never import half-broken
 * data silently.
 */
import { POKEMON_TYPES } from "../../src/features/types/data/pokemon-types";
import { buildMoveTables, type MoveTables } from "./moves";
import type { CsvRow, RawData } from "./sources";
import { cleanFlavorText } from "./text";

export { cleanFlavorText };

export type Locale = "es" | "en";

/** PokeAPI language ids for the locales we store. */
const LOCALE_BY_LANGUAGE_ID: Readonly<Record<string, Locale>> = {
  "7": "es",
  "9": "en",
};

const STAT_BY_ID = {
  "1": "hp",
  "2": "attack",
  "3": "defense",
  "4": "special-attack",
  "5": "special-defense",
  "6": "speed",
} as const;

export type Dataset = {
  generations: { id: number; slug: string }[];
  types: { id: number; slug: string }[];
  type_translations: { type_id: number; locale: Locale; name: string }[];
  pokemon_species: {
    id: number;
    slug: string;
    generation_id: number;
    evolves_from_species_id: number | null;
    evolution_chain_id: number | null;
    is_baby: boolean;
    is_legendary: boolean;
    is_mythical: boolean;
  }[];
  pokemon_species_translations: {
    species_id: number;
    locale: Locale;
    name: string;
    genus: string | null;
    flavor_text: string | null;
  }[];
  pokemon: {
    id: number;
    slug: string;
    species_id: number;
    is_default: boolean;
    height_dm: number;
    weight_hg: number;
    base_experience: number | null;
  }[];
  pokemon_types: { pokemon_id: number; slot: number; type_id: number }[];
  pokemon_stats: {
    pokemon_id: number;
    stat: (typeof STAT_BY_ID)[keyof typeof STAT_BY_ID];
    base_value: number;
    effort: number;
  }[];
  abilities: { id: number; slug: string; generation_id: number }[];
  ability_translations: { ability_id: number; locale: Locale; name: string }[];
  pokemon_abilities: {
    pokemon_id: number;
    slot: number;
    ability_id: number;
    is_hidden: boolean;
  }[];
} & MoveTables;

// ---------------------------------------------------------------------------
// Small parsing helpers
// ---------------------------------------------------------------------------

function int(row: CsvRow, key: string): number {
  const value = row[key];
  const parsed = Number(value);
  if (value === undefined || value === "" || !Number.isInteger(parsed)) {
    throw new Error(`Expected an integer in "${key}": ${JSON.stringify(row)}`);
  }
  return parsed;
}

function optionalInt(row: CsvRow, key: string): number | null {
  return row[key] === undefined || row[key] === "" ? null : int(row, key);
}

function bool(row: CsvRow, key: string): boolean {
  return row[key] === "1";
}

function text(row: CsvRow, key: string): string {
  const value = row[key]?.trim();
  if (!value)
    throw new Error(`Expected text in "${key}": ${JSON.stringify(row)}`);
  return value;
}

function localeOf(languageId: string | undefined): Locale | undefined {
  return languageId === undefined
    ? undefined
    : LOCALE_BY_LANGUAGE_ID[languageId];
}

/** For each (species, locale), keeps the entry from the most recent game. */
export function latestFlavorTexts(rows: CsvRow[]): Map<string, string> {
  const best = new Map<string, { version: number; text: string }>();
  for (const row of rows) {
    const locale = localeOf(row.language_id);
    if (!locale) continue;
    const key = `${int(row, "species_id")}:${locale}`;
    const version = int(row, "version_id");
    const current = best.get(key);
    if (!current || version > current.version) {
      best.set(key, { version, text: cleanFlavorText(row.flavor_text ?? "") });
    }
  }
  return new Map([...best].map(([key, value]) => [key, value.text]));
}

// ---------------------------------------------------------------------------
// Main transformation
// ---------------------------------------------------------------------------

export function buildDataset(raw: RawData): Dataset {
  const generations = raw.generations.map((row) => ({
    id: int(row, "id"),
    slug: text(row, "identifier"),
  }));

  // Only the 18 battle types the app knows about.
  const knownTypes = new Set<string>(POKEMON_TYPES);
  const types = raw.types
    .filter((row) => knownTypes.has(row.identifier ?? ""))
    .map((row) => ({ id: int(row, "id"), slug: text(row, "identifier") }));
  if (types.length !== POKEMON_TYPES.length) {
    throw new Error(
      `Expected ${POKEMON_TYPES.length} types, found ${types.length}.`,
    );
  }
  const typeIds = new Set(types.map((type) => type.id));

  const type_translations = raw.type_names.flatMap((row) => {
    const locale = localeOf(row.local_language_id);
    const typeId = int(row, "type_id");
    return locale && typeIds.has(typeId)
      ? [{ type_id: typeId, locale, name: text(row, "name") }]
      : [];
  });

  const pokemon_species = raw.pokemon_species.map((row) => ({
    id: int(row, "id"),
    slug: text(row, "identifier"),
    generation_id: int(row, "generation_id"),
    evolves_from_species_id: optionalInt(row, "evolves_from_species_id"),
    evolution_chain_id: optionalInt(row, "evolution_chain_id"),
    is_baby: bool(row, "is_baby"),
    is_legendary: bool(row, "is_legendary"),
    is_mythical: bool(row, "is_mythical"),
  }));
  const speciesIds = new Set(pokemon_species.map((species) => species.id));

  const flavorTexts = latestFlavorTexts(raw.pokemon_species_flavor_text);
  const pokemon_species_translations = raw.pokemon_species_names.flatMap(
    (row) => {
      const locale = localeOf(row.local_language_id);
      const speciesId = int(row, "pokemon_species_id");
      if (!locale || !speciesIds.has(speciesId)) return [];
      return [
        {
          species_id: speciesId,
          locale,
          name: text(row, "name"),
          genus: row.genus?.trim() || null,
          flavor_text: flavorTexts.get(`${speciesId}:${locale}`) || null,
        },
      ];
    },
  );

  // Every species must have a name in every locale: the UI relies on it.
  for (const locale of Object.values(LOCALE_BY_LANGUAGE_ID)) {
    const named = new Set(
      pokemon_species_translations
        .filter((row) => row.locale === locale)
        .map((row) => row.species_id),
    );
    const missing = [...speciesIds].filter((id) => !named.has(id));
    if (missing.length > 0) {
      throw new Error(
        `Species without a "${locale}" name: ${missing.slice(0, 10).join(", ")}…`,
      );
    }
  }

  const pokemon = raw.pokemon.map((row) => {
    const speciesId = int(row, "species_id");
    if (!speciesIds.has(speciesId)) {
      throw new Error(
        `Pokémon ${row.id} points to unknown species ${speciesId}.`,
      );
    }
    return {
      id: int(row, "id"),
      slug: text(row, "identifier"),
      species_id: speciesId,
      is_default: bool(row, "is_default"),
      height_dm: int(row, "height"),
      weight_hg: int(row, "weight"),
      base_experience: optionalInt(row, "base_experience"),
    };
  });
  const pokemonIds = new Set(pokemon.map((entry) => entry.id));

  const pokemon_types = raw.pokemon_types.map((row) => {
    const typeId = int(row, "type_id");
    if (!typeIds.has(typeId)) {
      throw new Error(`Pokémon ${row.pokemon_id} has unknown type ${typeId}.`);
    }
    return {
      pokemon_id: int(row, "pokemon_id"),
      slot: int(row, "slot"),
      type_id: typeId,
    };
  });

  const pokemon_stats = raw.pokemon_stats.flatMap((row) => {
    const stat = STAT_BY_ID[row.stat_id as keyof typeof STAT_BY_ID];
    if (!stat) return []; // accuracy/evasion are not base stats
    return [
      {
        pokemon_id: int(row, "pokemon_id"),
        stat,
        base_value: int(row, "base_stat"),
        effort: int(row, "effort"),
      },
    ];
  });

  // Main-series abilities, plus any ability a Pokémon actually uses.
  const usedAbilityIds = new Set(
    raw.pokemon_abilities.map((row) => int(row, "ability_id")),
  );
  const abilities = raw.abilities
    .filter(
      (row) =>
        bool(row, "is_main_series") || usedAbilityIds.has(int(row, "id")),
    )
    .map((row) => ({
      id: int(row, "id"),
      slug: text(row, "identifier"),
      generation_id: int(row, "generation_id"),
    }));
  const abilityIds = new Set(abilities.map((ability) => ability.id));
  const unknownAbility = [...usedAbilityIds].find((id) => !abilityIds.has(id));
  if (unknownAbility !== undefined) {
    throw new Error(`A Pokémon uses unknown ability ${unknownAbility}.`);
  }

  const ability_translations = raw.ability_names.flatMap((row) => {
    const locale = localeOf(row.local_language_id);
    const abilityId = int(row, "ability_id");
    return locale && abilityIds.has(abilityId)
      ? [{ ability_id: abilityId, locale, name: text(row, "name") }]
      : [];
  });

  const pokemon_abilities = raw.pokemon_abilities.map((row) => ({
    pokemon_id: int(row, "pokemon_id"),
    slot: int(row, "slot"),
    ability_id: int(row, "ability_id"),
    is_hidden: bool(row, "is_hidden"),
  }));

  for (const link of [
    ...pokemon_types,
    ...pokemon_stats,
    ...pokemon_abilities,
  ]) {
    if (!pokemonIds.has(link.pokemon_id)) {
      throw new Error(`Data references unknown Pokémon ${link.pokemon_id}.`);
    }
  }

  return {
    generations,
    types,
    type_translations,
    pokemon_species,
    pokemon_species_translations,
    pokemon,
    pokemon_types,
    pokemon_stats,
    abilities,
    ability_translations,
    pokemon_abilities,
    ...buildMoveTables(raw, {
      pokemonIds,
      typeIds,
      generationIds: new Set(generations.map((generation) => generation.id)),
    }),
  };
}
