/**
 * State of the type calculator and its URL form:
 *   /tipos?types=fire,flying            → defending Fire/Flying
 *   /tipos?mode=attack&types=ground     → attacking with Ground
 * Same `types` parameter as the Pokédex, so links between both just work.
 * Invalid or unknown values are ignored, never trusted.
 */
import { isPokemonType, type PokemonType } from "../data/pokemon-types";

export type CalculatorMode = "defense" | "attack";

export type CalculatorState = {
  mode: CalculatorMode;
  /** Up to two when defending (a Pokémon), exactly one or none when attacking. */
  types: PokemonType[];
};

export const EMPTY_CALCULATOR: CalculatorState = { mode: "defense", types: [] };

export function maxTypes(mode: CalculatorMode): number {
  return mode === "defense" ? 2 : 1;
}

type SearchParamsLike = { get(name: string): string | null };

export function parseCalculator(params: SearchParamsLike): CalculatorState {
  const mode: CalculatorMode =
    params.get("mode") === "attack" ? "attack" : "defense";
  const types = (params.get("types") ?? "")
    .split(",")
    .filter(isPokemonType)
    .filter((type, index, all) => all.indexOf(type) === index)
    .slice(0, maxTypes(mode));
  return { mode, types };
}

export function serializeCalculator(state: CalculatorState): string {
  const params = new URLSearchParams();
  if (state.mode === "attack") params.set("mode", "attack");
  if (state.types.length > 0) params.set("types", state.types.join(","));
  return params.toString().replaceAll("%2C", ",");
}

/**
 * Clicking a type: selects it or, if selected, removes it. When defending
 * and two are already chosen, the new one replaces the second (more useful
 * than refusing the click). When attacking it simply replaces the current one.
 */
export function pickType(
  state: CalculatorState,
  type: PokemonType,
): CalculatorState {
  if (state.types.includes(type)) {
    return { ...state, types: state.types.filter((t) => t !== type) };
  }
  if (state.mode === "attack") return { ...state, types: [type] };
  return { ...state, types: [...state.types.slice(0, 1), type] };
}

/** Switching mode keeps the first type, so nothing is lost by accident. */
export function switchMode(
  state: CalculatorState,
  mode: CalculatorMode,
): CalculatorState {
  return { mode, types: state.types.slice(0, maxTypes(mode)) };
}
