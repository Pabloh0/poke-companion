import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { pickLocalized } from "@/features/pokedex/lib/detail";
import { isPokemonType } from "@/features/types/data/pokemon-types";
import type { AppLocale } from "@/i18n/routing";
import { createPublicClient } from "@/lib/supabase/public-client";
import {
  groupLearnset,
  isDamageClass,
  isLearnMethod,
  parseMachine,
  type LearnedMove,
  type Learnset,
} from "../lib/learnset";

/**
 * Supabase returns at most 1000 rows per request. The longest learnset is
 * Mew's (about 240 moves), so one request is enough; past this limit we fail
 * loudly instead of silently showing a cut list.
 */
const MAX_ROWS = 1000;

/**
 * The moves a Pokémon (or regional form) learns in the game the import chose
 * for it, grouped by method and sorted, in one request: PostgREST embeds each
 * move with its type and translations.
 *
 * Returns null when there is no learnset at all. Cached a day per
 * (Pokémon, locale), like the rest of the detail page.
 */
export async function getLearnset(
  pokemonId: number,
  locale: AppLocale,
): Promise<Learnset | null> {
  "use cache";
  cacheLife("days");
  cacheTag("pokedex", "moves");

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("pokemon_moves")
    .select(
      `method, level, machine,
       game:version_groups ( slug ),
       move:moves (
         slug, damage_class, power, accuracy, pp,
         type:types ( slug ),
         translations:move_translations ( locale, name, description )
       )`,
    )
    .eq("pokemon_id", pokemonId)
    .range(0, MAX_ROWS - 1);

  if (error)
    throw new Error(
      `Could not load the moves of Pokémon ${pokemonId}: ${error.message}`,
    );
  if (data.length >= MAX_ROWS)
    throw new Error(`Pokémon ${pokemonId} has too many moves for one request.`);
  if (data.length === 0) return null;

  const games = new Set(data.map((row) => row.game.slug));
  const [game] = games;
  if (games.size !== 1 || !game)
    throw new Error(`Pokémon ${pokemonId} mixes moves from several games.`);

  const moves = data.map((row): LearnedMove => {
    const { move } = row;
    const byLocale = (field: "name" | "description") =>
      Object.fromEntries(
        move.translations.map((t) => [t.locale, t[field]]),
      ) as Partial<Record<AppLocale, string | null>>;
    const name = pickLocalized(byLocale("name"), locale);
    const type = move.type.slug;
    if (
      !name ||
      !isPokemonType(type) ||
      !isDamageClass(move.damage_class) ||
      !isLearnMethod(row.method)
    ) {
      throw new Error(`Incomplete data for move "${move.slug}".`);
    }
    return {
      slug: move.slug,
      name,
      description: pickLocalized(byLocale("description"), locale),
      type,
      damageClass: move.damage_class,
      power: move.power,
      accuracy: move.accuracy,
      pp: move.pp,
      method: row.method,
      level: row.level,
      machine: parseMachine(row.machine),
    };
  });

  return { game, groups: groupLearnset(moves, locale) };
}
