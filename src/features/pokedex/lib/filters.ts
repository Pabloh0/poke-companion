/**
 * Pure Pokédex search/filter logic. No React, no network: fully unit-tested
 * (filters.test.ts) and shared by the server and the browser.
 */
import {
  isPokemonType,
  type PokemonType,
} from "@/features/types/data/pokemon-types";
import { isGeneration, type Generation } from "../data/generations";
import {
  isRegion,
  type FormVariant,
  type Region,
} from "../data/regional-forms";

export type Rarity = "common" | "legendary" | "mythical";

/** Present only on regional forms (Vulpix de Alola). */
export type RegionalFormInfo = {
  /** Row id in `pokemon`: the form's own sprite and artwork. */
  pokemonId: number;
  region: Region;
  variant: FormVariant | null;
  /** Species name, printed on the card next to the region stamp: "Vulpix". */
  baseName: string;
  /** "Alola" */
  regionLabel: string;
  /** "Variedad ardiente" (Paldean Tauros only). */
  variantLabel: string | null;
};

export type PokedexEntry = {
  /** National Pokédex number of the species (shared by its forms). */
  dexNumber: number;
  slug: string;
  /** Full name: "Pikachu", "Vulpix de Alola". */
  name: string;
  /** "Mouse Pokémon"; null when PokeAPI has no text in this language. */
  genus: string | null;
  generation: Generation;
  types: PokemonType[];
  rarity: Rarity;
  baseStatTotal: number;
  form?: RegionalFormInfo;
};

export function rarityOf(row: {
  is_legendary: boolean;
  is_mythical: boolean;
}): Rarity {
  if (row.is_mythical) return "mythical";
  if (row.is_legendary) return "legendary";
  return "common";
}

export type PokedexFilters = {
  query: string;
  /** Up to two types; a Pokémon must have all of them. */
  types: PokemonType[];
  generation: Generation | null;
  /** Only the regional forms of this region. */
  region: Region | null;
};

export const MAX_TYPE_FILTERS = 2;

export const EMPTY_FILTERS: PokedexFilters = {
  query: "",
  types: [],
  generation: null,
  region: null,
};

/** "#0025" style number used across the app (without the "#"). */
export function formatDexNumber(dexNumber: number): string {
  return String(dexNumber).padStart(4, "0");
}

/** Lowercase and without accents, so "flabebe" finds "Flabébé". */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function hasActiveFilters(filters: PokedexFilters): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.types.length > 0 ||
    filters.generation !== null ||
    filters.region !== null
  );
}

export function filterEntries(
  entries: readonly PokedexEntry[],
  filters: PokedexFilters,
): PokedexEntry[] {
  const query = normalizeText(filters.query);
  // "25", "025" or "#25" search by number; anything else by name.
  const numberMatch = /^#?(\d+)$/.exec(query);
  const dexNumber = numberMatch ? Number(numberMatch[1]) : null;

  return entries.filter((entry) => {
    if (
      filters.generation !== null &&
      entry.generation !== filters.generation
    ) {
      return false;
    }
    if (filters.region !== null && entry.form?.region !== filters.region) {
      return false;
    }
    if (!filters.types.every((type) => entry.types.includes(type))) {
      return false;
    }
    if (query === "") return true;
    if (dexNumber !== null) return entry.dexNumber === dexNumber;
    // Name, plus the breed for Paldean Tauros ("ardiente").
    const haystack = normalizeText(
      [entry.name, entry.form?.variantLabel ?? ""].join(" "),
    );
    return haystack.includes(query);
  });
}

// ---------------------------------------------------------------------------
// URL <-> filters: /pokedex?q=pika&types=water,flying&gen=3&form=alola
// Invalid or unknown values are ignored, never trusted.
// ---------------------------------------------------------------------------

type SearchParamsLike = { get(name: string): string | null };

export function parseFilters(params: SearchParamsLike): PokedexFilters {
  const types = (params.get("types") ?? "")
    .split(",")
    .filter(isPokemonType)
    .filter((type, index, all) => all.indexOf(type) === index)
    .slice(0, MAX_TYPE_FILTERS);

  const gen = Number(params.get("gen"));
  return {
    query: (params.get("q") ?? "").slice(0, 50),
    types,
    generation: Number.isInteger(gen) && isGeneration(gen) ? gen : null,
    region: isRegion(params.get("form"))
      ? (params.get("form") as Region)
      : null,
  };
}

export function serializeFilters(filters: PokedexFilters): string {
  const params = new URLSearchParams();
  const query = filters.query.trim();
  if (query) params.set("q", query);
  if (filters.types.length > 0) params.set("types", filters.types.join(","));
  if (filters.generation !== null)
    params.set("gen", String(filters.generation));
  if (filters.region !== null) params.set("form", filters.region);
  // Keep commas readable in the URL: types=water,flying
  return params.toString().replaceAll("%2C", ",");
}

/** Adds a type, or removes it if already selected. Respects the limit. */
export function toggleType(
  selected: readonly PokemonType[],
  type: PokemonType,
): PokemonType[] {
  if (selected.includes(type)) return selected.filter((t) => t !== type);
  if (selected.length >= MAX_TYPE_FILTERS) return [...selected];
  return [...selected, type];
}
