import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { isPokemonType } from "@/features/types/data/pokemon-types";
import type { AppLocale } from "@/i18n/routing";
import { createPublicClient } from "@/lib/supabase/public-client";
import { isGeneration } from "../data/generations";
import { orderStats, pickLocalized, type PokemonDetail } from "../lib/detail";
import { rarityOf } from "../lib/filters";

/**
 * Everything the detail page shows for the DEFAULT form of a species, in one
 * request: PostgREST follows the foreign keys and embeds related rows
 * (species, translations, types, stats, abilities).
 *
 * Returns null when no Pokémon has that slug (the page then shows a 404).
 * Cached a day per (slug, locale), like the list.
 */
export async function getPokemonDetail(
  slug: string,
  locale: AppLocale,
): Promise<PokemonDetail | null> {
  "use cache";
  cacheLife("days");
  cacheTag("pokedex", `pokemon:${slug}`);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("pokemon")
    .select(
      `id, slug, height_dm, weight_hg,
       species:pokemon_species!inner (
         id, generation_id, is_legendary, is_mythical,
         translations:pokemon_species_translations ( locale, name, genus, flavor_text )
       ),
       pokemon_types ( slot, type:types ( slug ) ),
       pokemon_stats ( stat, base_value ),
       pokemon_abilities (
         slot, is_hidden,
         ability:abilities ( slug, translations:ability_translations ( locale, name ) )
       )`,
    )
    .eq("slug", slug)
    .eq("is_default", true)
    .maybeSingle();

  if (error)
    throw new Error(`Could not load Pokémon "${slug}": ${error.message}`);
  if (!data) return null;

  const { species } = data;
  const byLocale = (field: "name" | "genus" | "flavor_text") =>
    Object.fromEntries(
      species.translations.map((row) => [row.locale, row[field]]),
    ) as Partial<Record<AppLocale, string | null>>;

  const name = pickLocalized(byLocale("name"), locale);
  const types = [...data.pokemon_types]
    .sort((a, b) => a.slot - b.slot)
    .map((row) => row.type.slug)
    .filter(isPokemonType);
  if (!name || types.length === 0 || !isGeneration(species.generation_id)) {
    throw new Error(`Incomplete data for Pokémon "${slug}".`);
  }

  const { stats, total } = orderStats(data.pokemon_stats);

  return {
    id: data.id,
    slug: data.slug,
    dexNumber: species.id,
    name: name.text,
    genus: pickLocalized(byLocale("genus"), locale),
    flavorText: pickLocalized(byLocale("flavor_text"), locale),
    generation: species.generation_id,
    rarity: rarityOf(species),
    types,
    heightM: data.height_dm / 10,
    weightKg: data.weight_hg / 10,
    stats,
    baseStatTotal: total,
    abilities: [...data.pokemon_abilities]
      .sort((a, b) => a.slot - b.slot)
      .map((row) => {
        const names = Object.fromEntries(
          row.ability.translations.map((t) => [t.locale, t.name]),
        ) as Partial<Record<AppLocale, string>>;
        return {
          slug: row.ability.slug,
          name: pickLocalized(names, locale)?.text ?? row.ability.slug,
          isHidden: row.is_hidden,
        };
      }),
  };
}
