import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { isPokemonType } from "@/features/types/data/pokemon-types";
import type { AppLocale } from "@/i18n/routing";
import { createPublicClient } from "@/lib/supabase/public-client";
import { isGeneration } from "../data/generations";
import type { PokedexEntry } from "../lib/filters";

/**
 * Supabase returns at most 1000 rows per request by default (the API's
 * `max_rows`). There are 1025 species, so we must page; otherwise the last
 * ones would silently disappear. We advance by the rows actually received
 * and stop at the exact total, so it also works if that limit changes.
 */
const PAGE_SIZE = 1000;

/**
 * Every species (default form) with its localized name and types.
 *
 * Cached for a day and shared by all visitors: reference data only changes
 * when we re-run the import. The page that uses it is prerendered at build
 * time, so visitors get it instantly.
 */
export async function getPokedexEntries(
  locale: AppLocale,
): Promise<PokedexEntry[]> {
  "use cache";
  cacheLife("days");
  cacheTag("pokedex");

  const supabase = createPublicClient();
  const entries: PokedexEntry[] = [];

  let total = Infinity;
  while (entries.length < total) {
    const from = entries.length;
    const { data, error, count } = await supabase
      .from("pokedex_entries")
      .select("dex_number, slug, name, generation_id, types", {
        count: "exact",
      })
      .eq("locale", locale)
      .order("dex_number")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`Could not load the Pokédex: ${error.message}`);
    if (count === null) throw new Error("The Pokédex query returned no count.");
    total = count;
    if (data.length === 0) break; // defensive: never loop forever

    for (const row of data) {
      const types = (row.types ?? []).filter(isPokemonType);
      if (!isGeneration(row.generation_id) || types.length === 0) {
        throw new Error(`Unexpected Pokédex row: ${JSON.stringify(row)}`);
      }
      entries.push({
        dexNumber: row.dex_number,
        slug: row.slug,
        name: row.name,
        generation: row.generation_id,
        types,
      });
    }
  }

  if (entries.length !== total) {
    throw new Error(
      `Expected ${total} Pokédex entries, got ${entries.length}.`,
    );
  }
  return entries;
}
