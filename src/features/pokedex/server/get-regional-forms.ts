import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { isPokemonType } from "@/features/types/data/pokemon-types";
import type { AppLocale } from "@/i18n/routing";
import { createPublicClient } from "@/lib/supabase/public-client";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import { isGeneration } from "../data/generations";
import { REGIONAL_FORMS } from "../data/regional-forms";
import { rarityOf, type PokedexEntry } from "../lib/filters";
import { comparePokedexOrder, regionalFormName } from "../lib/regional";

const FORM_MESSAGES = { es: es.Forms, en: en.Forms } as const;

/**
 * The 57 regional forms as Pokédex entries, in Pokédex order.
 *
 * Their types and stats are already in the database (rows of `pokemon` that
 * are not the default form); which rows are regional comes from the list in
 * code. Names are built from the species name ("Vulpix de Alola"), because
 * PokeAPI has no Spanish names for forms. One request, cached for a day.
 */
export async function getRegionalForms(
  locale: AppLocale,
): Promise<PokedexEntry[]> {
  "use cache";
  cacheLife("days");
  cacheTag("pokedex");

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("pokemon")
    .select(
      "id, slug, species_id, pokemon_types(slot, type:types(slug)), pokemon_stats(base_value), species:pokemon_species!inner(generation_id, is_legendary, is_mythical, translations:pokemon_species_translations(locale, name, genus))",
    )
    .in(
      "id",
      REGIONAL_FORMS.map((form) => form.pokemonId),
    );
  if (error) {
    throw new Error(`Could not load regional forms: ${error.message}`);
  }

  const messages = FORM_MESSAGES[locale];
  const rowsById = new Map(data.map((row) => [row.id, row]));

  const entries = REGIONAL_FORMS.map((form): PokedexEntry => {
    const row = rowsById.get(form.pokemonId);
    const translation = row?.species.translations.find(
      (candidate) => candidate.locale === locale,
    );
    const types = [...(row?.pokemon_types ?? [])]
      .sort((a, b) => a.slot - b.slot)
      .map(({ type }) => type.slug)
      .filter(isPokemonType);
    if (
      !row ||
      !translation ||
      types.length === 0 ||
      !isGeneration(row.species.generation_id) ||
      row.pokemon_stats.length !== 6
    ) {
      throw new Error(`Incomplete data for regional form ${form.slug}.`);
    }
    return {
      dexNumber: form.dexNumber,
      slug: form.slug,
      name: regionalFormName(translation.name, form.region, messages),
      genus: translation.genus,
      generation: row.species.generation_id,
      types,
      rarity: rarityOf(row.species),
      baseStatTotal: row.pokemon_stats.reduce(
        (sum, stat) => sum + stat.base_value,
        0,
      ),
      form: {
        pokemonId: form.pokemonId,
        region: form.region,
        variant: form.variant ?? null,
        baseName: translation.name,
        regionLabel: messages.regions[form.region],
        variantLabel: form.variant ? messages.variants[form.variant] : null,
      },
    };
  });

  return entries.sort(comparePokedexOrder);
}
