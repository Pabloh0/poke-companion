import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public-client";
import type { EvolutionLink } from "../lib/evolution";

/** Supabase returns at most 1000 rows per request: page like the list does. */
const PAGE_SIZE = 1000;

/**
 * Who evolves from whom, for all 1025 species (three small numbers each).
 *
 * Loaded once and shared by every detail page instead of one query per page:
 * the 2050 prerendered pages make two requests in total. Language-neutral,
 * so the same cache entry serves both locales.
 */
export async function getEvolutionLinks(): Promise<EvolutionLink[]> {
  "use cache";
  cacheLife("days");
  cacheTag("pokedex");

  const supabase = createPublicClient();
  const links: EvolutionLink[] = [];

  let total = Infinity;
  while (links.length < total) {
    const from = links.length;
    const { data, error, count } = await supabase
      .from("pokemon_species")
      .select("id, evolves_from_species_id, evolution_chain_id", {
        count: "exact",
      })
      .order("id")
      .range(from, from + PAGE_SIZE - 1);

    if (error)
      throw new Error(`Could not load evolution data: ${error.message}`);
    if (count === null)
      throw new Error("The evolution query returned no count.");
    total = count;
    if (data.length === 0) break; // defensive: never loop forever

    for (const row of data) {
      links.push({
        dexNumber: row.id,
        evolvesFrom: row.evolves_from_species_id,
        chainId: row.evolution_chain_id,
      });
    }
  }

  return links;
}
