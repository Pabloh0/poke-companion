/**
 * The 18 Pokémon types, in the canonical games order.
 *
 * Display names live in the translation catalogues (`Types.<id>`), and colours
 * live in globals.css (`--color-type-<id>`). This file only knows the ids and
 * which text colour reads best on each type's background.
 */
export const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

/**
 * Types whose colour is dark enough to need light text.
 * Computed with the WCAG 2.x contrast formula: every chip reaches ≥ 5.4:1.
 */
const LIGHT_TEXT_TYPES: ReadonlySet<PokemonType> = new Set([
  "fighting",
  "poison",
  "ghost",
  "dragon",
  "dark",
]);

export function typeTextTone(type: PokemonType): "light" | "dark" {
  return LIGHT_TEXT_TYPES.has(type) ? "light" : "dark";
}

export function isPokemonType(value: string): value is PokemonType {
  return (POKEMON_TYPES as readonly string[]).includes(value);
}
