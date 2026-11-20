/**
 * Moves and learnsets: PokeAPI CSV rows → rows for our tables.
 * Pure (no network, no database): covered by moves.test.ts.
 *
 * PokeAPI lists every game's learnset for every Pokémon (≈ 665 000 rows).
 * We keep one game per Pokémon: the most recent main-series game it appears
 * in, so a page shows what you can actually do in a current game.
 */
import type { CsvRow } from "./sources";
import { cleanFlavorText } from "./text";

type Locale = "es" | "en";

/**
 * Games to take learnsets from, newest first. Scarlet/Violet's rows already
 * include its DLC. Skipped on purpose: Let's Go (19) and the Legends games
 * (24, 30), whose move systems differ from the main series, and spin-offs.
 */
export const VERSION_GROUP_PRIORITY = [
  25, // scarlet-violet
  20, // sword-shield
  23, // brilliant-diamond-shining-pearl
  18, // ultra-sun-ultra-moon
  17, // sun-moon
  16, // omega-ruby-alpha-sapphire
  15, // x-y
  14, // black-2-white-2
  11, // black-white
  10, // heartgold-soulsilver
  9, //  platinum
  8, //  diamond-pearl
  7, //  firered-leafgreen
  6, //  emerald
  5, //  ruby-sapphire
  4, //  crystal
  3, //  gold-silver
  2, //  yellow
  1, //  red-blue
] as const;

const METHOD_BY_ID = {
  "1": "level-up",
  "2": "egg",
  "3": "tutor",
  "4": "machine",
  "13": "reminder", // Scarlet/Violet: only through the Move Reminder
} as const;

export type LearnMethod = (typeof METHOD_BY_ID)[keyof typeof METHOD_BY_ID];

const DAMAGE_CLASS_BY_ID = {
  "1": "status",
  "2": "physical",
  "3": "special",
} as const;

const LOCALE_BY_LANGUAGE_ID: Readonly<Record<string, Locale>> = {
  "7": "es",
  "9": "en",
};

export type MoveTables = {
  version_groups: { id: number; slug: string; generation_id: number }[];
  moves: {
    id: number;
    slug: string;
    type_id: number;
    damage_class: (typeof DAMAGE_CLASS_BY_ID)[keyof typeof DAMAGE_CLASS_BY_ID];
    power: number | null;
    accuracy: number | null;
    pp: number | null;
    priority: number;
  }[];
  move_translations: {
    move_id: number;
    locale: Locale;
    name: string;
    description: string | null;
  }[];
  pokemon_moves: {
    pokemon_id: number;
    move_id: number;
    method: LearnMethod;
    level: number;
    machine: string | null;
    version_group_id: number;
  }[];
};

export type MoveSources = {
  version_groups: CsvRow[];
  moves: CsvRow[];
  move_names: CsvRow[];
  move_flavor_text: CsvRow[];
  machines: CsvRow[];
  items: CsvRow[];
  pokemon_moves: CsvRow[];
};

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

/**
 * Power and accuracy: PokeAPI writes "0" instead of leaving the field empty
 * for some recent status moves (Victory Dance, Shelter…). In the games both
 * mean the same, "no fixed value", so 0 becomes null.
 */
function optionalPositive(row: CsvRow, key: string): number | null {
  const value = optionalInt(row, key);
  return value === null || value <= 0 ? null : value;
}

/** For each Pokémon, the newest game in the priority list it has moves in. */
export function pickVersionGroups(
  rows: readonly CsvRow[],
): Map<number, number> {
  const available = new Map<number, Set<number>>();
  for (const row of rows) {
    if (!((row.pokemon_move_method_id ?? "") in METHOD_BY_ID)) continue;
    const pokemonId = int(row, "pokemon_id");
    const games = available.get(pokemonId) ?? new Set<number>();
    games.add(int(row, "version_group_id"));
    available.set(pokemonId, games);
  }
  const chosen = new Map<number, number>();
  for (const [pokemonId, games] of available) {
    const game = VERSION_GROUP_PRIORITY.find((id) => games.has(id));
    if (game !== undefined) chosen.set(pokemonId, game);
  }
  return chosen;
}

/**
 * Builds the move tables. Only moves that some kept learnset uses are
 * imported, and only for Pokémon and types we already import.
 */
export function buildMoveTables(
  raw: MoveSources,
  known: {
    pokemonIds: ReadonlySet<number>;
    typeIds: ReadonlySet<number>;
    generationIds: ReadonlySet<number>;
  },
): MoveTables {
  const chosen = pickVersionGroups(raw.pokemon_moves);

  // Machine item per (game, move): "tm045", "tr12", "hm01".
  const itemSlug = new Map(raw.items.map((row) => [row.id, row.identifier]));
  const machineOf = new Map<string, string>();
  for (const row of raw.machines) {
    const slug = itemSlug.get(row.item_id ?? "") ?? "";
    if (/^(tm|tr|hm)\d+$/.test(slug)) {
      machineOf.set(`${row.version_group_id}:${row.move_id}`, slug);
    }
  }

  const seen = new Set<string>();
  const pokemon_moves: MoveTables["pokemon_moves"] = [];
  for (const row of raw.pokemon_moves) {
    const method =
      METHOD_BY_ID[row.pokemon_move_method_id as keyof typeof METHOD_BY_ID];
    if (!method) continue;
    const pokemonId = int(row, "pokemon_id");
    const game = int(row, "version_group_id");
    if (chosen.get(pokemonId) !== game || !known.pokemonIds.has(pokemonId)) {
      continue;
    }
    const moveId = int(row, "move_id");
    const level = method === "level-up" ? (optionalInt(row, "level") ?? 0) : 0;
    // PokeAPI repeats some rows (same move, method and level): keep one.
    const key = `${pokemonId}:${moveId}:${method}:${level}`;
    if (seen.has(key)) continue;
    seen.add(key);
    pokemon_moves.push({
      pokemon_id: pokemonId,
      move_id: moveId,
      method,
      level,
      machine:
        method === "machine"
          ? (machineOf.get(`${game}:${moveId}`) ?? null)
          : null,
      version_group_id: game,
    });
  }

  const usedMoves = new Set(pokemon_moves.map((row) => row.move_id));
  const moves = raw.moves
    .filter((row) => usedMoves.has(int(row, "id")))
    .map((row) => {
      const typeId = int(row, "type_id");
      if (!known.typeIds.has(typeId)) {
        throw new Error(`Move ${row.identifier} has unknown type ${typeId}.`);
      }
      const damageClass =
        DAMAGE_CLASS_BY_ID[
          row.damage_class_id as keyof typeof DAMAGE_CLASS_BY_ID
        ];
      if (!damageClass) {
        throw new Error(`Move ${row.identifier} has no damage class.`);
      }
      return {
        id: int(row, "id"),
        slug: row.identifier ?? "",
        type_id: typeId,
        damage_class: damageClass,
        power: optionalPositive(row, "power"),
        accuracy: optionalPositive(row, "accuracy"),
        pp: optionalInt(row, "pp"),
        priority: optionalInt(row, "priority") ?? 0,
      };
    });
  const moveIds = new Set(moves.map((move) => move.id));
  const missing = [...usedMoves].find((id) => !moveIds.has(id));
  if (missing !== undefined) {
    throw new Error(`A learnset uses unknown move ${missing}.`);
  }

  // Most recent description per (move, language).
  const description = new Map<string, { game: number; text: string }>();
  for (const row of raw.move_flavor_text) {
    const locale = LOCALE_BY_LANGUAGE_ID[row.language_id ?? ""];
    if (!locale || !moveIds.has(int(row, "move_id"))) continue;
    const key = `${row.move_id}:${locale}`;
    const game = int(row, "version_group_id");
    const current = description.get(key);
    if (!current || game > current.game) {
      description.set(key, {
        game,
        text: cleanFlavorText(row.flavor_text ?? ""),
      });
    }
  }

  const move_translations = raw.move_names.flatMap((row) => {
    const locale = LOCALE_BY_LANGUAGE_ID[row.local_language_id ?? ""];
    const moveId = Number(row.move_id);
    const name = row.name?.trim();
    if (!locale || !moveIds.has(moveId) || !name) return [];
    return [
      {
        move_id: moveId,
        locale,
        name,
        description: description.get(`${moveId}:${locale}`)?.text || null,
      },
    ];
  });
  for (const move of moves) {
    for (const locale of ["es", "en"] as const) {
      if (
        !move_translations.some(
          (t) => t.move_id === move.id && t.locale === locale,
        )
      ) {
        throw new Error(`Move ${move.slug} has no ${locale} name.`);
      }
    }
  }

  const usedGames = new Set(pokemon_moves.map((row) => row.version_group_id));
  const version_groups = raw.version_groups
    .filter((row) => usedGames.has(int(row, "id")))
    .map((row) => {
      const generationId = int(row, "generation_id");
      if (!known.generationIds.has(generationId)) {
        throw new Error(`Game ${row.identifier} has unknown generation.`);
      }
      return {
        id: int(row, "id"),
        slug: row.identifier ?? "",
        generation_id: generationId,
      };
    });

  return { version_groups, moves, move_translations, pokemon_moves };
}
