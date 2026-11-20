import type { PokemonType } from "@/features/types/data/pokemon-types";
import type { LocalizedText } from "@/features/pokedex/lib/detail";

/** How a Pokémon learns a move, in the order the page shows them. */
export const LEARN_METHODS = [
  "level-up",
  "machine",
  "egg",
  "tutor",
  "reminder",
] as const;
export type LearnMethod = (typeof LEARN_METHODS)[number];

export function isLearnMethod(value: string): value is LearnMethod {
  return (LEARN_METHODS as readonly string[]).includes(value);
}

export const DAMAGE_CLASSES = ["physical", "special", "status"] as const;
export type DamageClass = (typeof DAMAGE_CLASSES)[number];

export function isDamageClass(value: string): value is DamageClass {
  return (DAMAGE_CLASSES as readonly string[]).includes(value);
}

/** Games with a name in the translation files (PokeAPI version groups). */
export const KNOWN_GAMES = [
  "scarlet-violet",
  "sword-shield",
  "brilliant-diamond-shining-pearl",
  "ultra-sun-ultra-moon",
  "sun-moon",
  "omega-ruby-alpha-sapphire",
  "x-y",
] as const;
export type KnownGame = (typeof KNOWN_GAMES)[number];

export function isKnownGame(value: string): value is KnownGame {
  return (KNOWN_GAMES as readonly string[]).includes(value);
}

/** Technical Machine, Technical Record or Hidden Machine, by number. */
export type Machine = { kind: "tm" | "tr" | "hm"; number: number };

const MACHINE_KIND_ORDER: Record<Machine["kind"], number> = {
  tm: 0,
  tr: 1,
  hm: 2,
};

/** "tm045" → { kind: "tm", number: 45 }. Null for anything else. */
export function parseMachine(label: string | null): Machine | null {
  const match = label ? /^(tm|tr|hm)(\d+)$/.exec(label) : null;
  if (!match) return null;
  return {
    kind: match[1] as Machine["kind"],
    number: Number.parseInt(match[2] ?? "", 10),
  };
}

export type LearnedMove = {
  slug: string;
  name: LocalizedText;
  description: LocalizedText | null;
  type: PokemonType;
  damageClass: DamageClass;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  method: LearnMethod;
  /** Level-up only: 0 = when it evolves, 1 = from the start. */
  level: number;
  /** Machine only. */
  machine: Machine | null;
};

export type LearnsetGroup = { method: LearnMethod; moves: LearnedMove[] };

export type Learnset = {
  /** PokeAPI version group the moves come from ("scarlet-violet"). */
  game: string;
  /** Only methods with at least one move, in LEARN_METHODS order. */
  groups: LearnsetGroup[];
};

/**
 * Sorts as the games list them: by level (moves learned on evolution first),
 * machines by number, and everything else alphabetically.
 */
export function compareMoves(
  a: LearnedMove,
  b: LearnedMove,
  locale: string,
): number {
  const byName = a.name.text.localeCompare(b.name.text, locale);
  if (a.method === "level-up" && b.method === "level-up") {
    return a.level - b.level || byName;
  }
  if (a.machine && b.machine) {
    return (
      MACHINE_KIND_ORDER[a.machine.kind] - MACHINE_KIND_ORDER[b.machine.kind] ||
      a.machine.number - b.machine.number ||
      byName
    );
  }
  return byName;
}

/** Splits the moves by method and sorts each group. */
export function groupLearnset(
  moves: readonly LearnedMove[],
  locale: string,
): LearnsetGroup[] {
  return LEARN_METHODS.map((method) => ({
    method,
    moves: moves
      .filter((move) => move.method === method)
      .sort((a, b) => compareMoves(a, b, locale)),
  })).filter((group) => group.moves.length > 0);
}
