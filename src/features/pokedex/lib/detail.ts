/**
 * Pure helpers for the Pokémon detail page. No React, no network:
 * covered by detail.test.ts.
 */
import type { PokemonType } from "@/features/types/data/pokemon-types";
import type { Generation } from "../data/generations";
import type { PokedexEntry, Rarity } from "./filters";

export const STAT_ORDER = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
] as const;

export type StatName = (typeof STAT_ORDER)[number];

/** Highest possible base stat in the games (bars are drawn against it). */
export const MAX_BASE_STAT = 255;

export type LocalizedText = {
  text: string;
  /** Locale the text is actually in (may differ from the page's). */
  locale: "es" | "en";
};

export type PokemonDetail = {
  id: number;
  slug: string;
  dexNumber: number;
  name: string;
  genus: LocalizedText | null;
  flavorText: LocalizedText | null;
  generation: Generation;
  rarity: Rarity;
  types: PokemonType[];
  heightM: number;
  weightKg: number;
  stats: { stat: StatName; value: number }[];
  baseStatTotal: number;
  abilities: { slug: string; name: string; isHidden: boolean }[];
};

/**
 * Returns the text in the page's locale or, if PokeAPI has none, the English
 * one, flagged so the UI can mark it with lang="en".
 */
export function pickLocalized(
  byLocale: Partial<Record<"es" | "en", string | null>>,
  locale: "es" | "en",
): LocalizedText | null {
  const own = byLocale[locale]?.trim();
  if (own) return { text: own, locale };
  const english = byLocale.en?.trim();
  return english ? { text: english, locale: "en" } : null;
}

/** The six base stats in the games' order, plus their total. */
export function orderStats(
  rows: readonly { stat: string; base_value: number }[],
): {
  stats: { stat: StatName; value: number }[];
  total: number;
} {
  const stats = STAT_ORDER.map((stat) => {
    const row = rows.find((candidate) => candidate.stat === stat);
    if (!row) throw new Error(`Missing base stat "${stat}".`);
    return { stat, value: row.base_value };
  });
  return { stats, total: stats.reduce((sum, { value }) => sum + value, 0) };
}

/** Width of a stat bar as a percentage of the maximum base stat. */
export function statBarPercent(value: number): number {
  return Math.min(100, Math.max(0, (value / MAX_BASE_STAT) * 100));
}

/** Previous and next species in Pokédex order (none at the ends). */
export function neighbours(
  entries: readonly PokedexEntry[],
  dexNumber: number,
): { previous: PokedexEntry | null; next: PokedexEntry | null } {
  const index = entries.findIndex((entry) => entry.dexNumber === dexNumber);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: entries[index - 1] ?? null,
    next: entries[index + 1] ?? null,
  };
}
