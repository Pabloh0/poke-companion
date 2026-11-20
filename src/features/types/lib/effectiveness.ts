/**
 * Type matchup maths. Pure functions (no React, no network): shared by the
 * type calculator and the Pokémon page, and covered by effectiveness.test.ts.
 */
import { POKEMON_TYPES, type PokemonType } from "../data/pokemon-types";
import { TYPE_CHART, type Multiplier } from "../data/type-chart";

/** What a Pokémon with one or two types can take: ×0 up to ×4. */
export type DamageMultiplier = 0 | 0.25 | 0.5 | 1 | 2 | 4;

/** Display order for a defender: biggest danger first, immunities last. */
export const DEFENSE_ORDER = [4, 2, 1, 0.5, 0.25, 0] as const;

/** Display order for an attacking type. */
export const ATTACK_ORDER = [2, 1, 0.5, 0] as const;

/** One attacking type against one defending type. */
export function attackMultiplier(
  attack: PokemonType,
  defender: PokemonType,
): Multiplier {
  return TYPE_CHART[attack][defender] ?? 1;
}

/**
 * One attacking type against a Pokémon with one or two types: the
 * multipliers of each of its types are multiplied (Rock vs Fire/Flying is
 * 2 × 2 = ×4; Ground vs Fire/Flying is 2 × 0 = ×0).
 */
export function damageMultiplier(
  attack: PokemonType,
  defenders: readonly PokemonType[],
): DamageMultiplier {
  return unique(defenders).reduce<number>(
    (total, defender) => total * attackMultiplier(attack, defender),
    1,
  ) as DamageMultiplier;
}

/** Every attacking type grouped by the damage it deals to these types. */
export function defensiveProfile(
  defenders: readonly PokemonType[],
): Record<DamageMultiplier, PokemonType[]> {
  const groups = emptyGroups(DEFENSE_ORDER);
  for (const attack of POKEMON_TYPES) {
    groups[damageMultiplier(attack, defenders)].push(attack);
  }
  return groups;
}

/** Every defending type grouped by how well this attacking type hits it. */
export function offensiveProfile(
  attack: PokemonType,
): Record<Multiplier, PokemonType[]> {
  const groups = emptyGroups(ATTACK_ORDER);
  for (const defender of POKEMON_TYPES) {
    groups[attackMultiplier(attack, defender)].push(defender);
  }
  return groups;
}

/**
 * Translation key for each multiplier (`defense.x05`…). "0.5" cannot be a
 * key: dots mean nesting in the message files.
 */
export const MULTIPLIER_KEY = {
  4: "x4",
  2: "x2",
  1: "x1",
  0.5: "x05",
  0.25: "x025",
  0: "x0",
} as const satisfies Record<DamageMultiplier, string>;

/** "×4", "×½", "×¼", "×0"… as players write them. */
export function formatMultiplier(multiplier: DamageMultiplier): string {
  const symbols: Record<DamageMultiplier, string> = {
    4: "4",
    2: "2",
    1: "1",
    0.5: "½",
    0.25: "¼",
    0: "0",
  };
  return `×${symbols[multiplier]}`;
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

function emptyGroups<K extends number>(
  keys: readonly K[],
): Record<K, PokemonType[]> {
  return Object.fromEntries(keys.map((key) => [key, []])) as unknown as Record<
    K,
    PokemonType[]
  >;
}
