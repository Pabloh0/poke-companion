import { describe, expect, it } from "vitest";
import { POKEMON_TYPES } from "../../src/features/types/data/pokemon-types";
import type { RawData } from "./sources";
import { buildDataset, cleanFlavorText, latestFlavorTexts } from "./transform";

const ES = "7";
const EN = "9";
const JA = "1";

/** Smallest valid PokeAPI extract: Pichu (#172) evolves into Pikachu (#25). */
function makeRaw(): RawData {
  return {
    generations: [
      { id: "1", identifier: "generation-i" },
      { id: "2", identifier: "generation-ii" },
    ],
    types: [
      ...POKEMON_TYPES.map((slug, index) => ({
        id: String(index + 1),
        identifier: slug,
      })),
      { id: "19", identifier: "stellar" },
      { id: "10001", identifier: "unknown" },
    ],
    type_names: [
      { type_id: "4", local_language_id: ES, name: "Eléctrico" },
      { type_id: "4", local_language_id: EN, name: "Electric" },
      { type_id: "4", local_language_id: JA, name: "でんき" },
      { type_id: "19", local_language_id: ES, name: "Astral" },
    ],
    pokemon_species: [
      {
        id: "25",
        identifier: "pikachu",
        generation_id: "1",
        evolves_from_species_id: "172",
        evolution_chain_id: "10",
        is_baby: "0",
        is_legendary: "0",
        is_mythical: "0",
      },
      {
        id: "172",
        identifier: "pichu",
        generation_id: "2",
        evolves_from_species_id: "",
        evolution_chain_id: "10",
        is_baby: "1",
        is_legendary: "0",
        is_mythical: "0",
      },
    ],
    pokemon_species_names: [
      {
        pokemon_species_id: "25",
        local_language_id: ES,
        name: "Pikachu",
        genus: "Pokémon Ratón",
      },
      {
        pokemon_species_id: "25",
        local_language_id: EN,
        name: "Pikachu",
        genus: "Mouse Pokémon",
      },
      {
        pokemon_species_id: "172",
        local_language_id: ES,
        name: "Pichu",
        genus: "",
      },
      {
        pokemon_species_id: "172",
        local_language_id: EN,
        name: "Pichu",
        genus: "Tiny Mouse Pokémon",
      },
    ],
    pokemon_species_flavor_text: [
      {
        species_id: "25",
        version_id: "1",
        language_id: EN,
        flavor_text: "Old\ntext.",
      },
      {
        species_id: "25",
        version_id: "30",
        language_id: EN,
        flavor_text: "Newest\ftext.",
      },
      {
        species_id: "25",
        version_id: "20",
        language_id: ES,
        flavor_text: "Texto\nreciente.",
      },
    ],
    pokemon: [
      {
        id: "25",
        identifier: "pikachu",
        species_id: "25",
        height: "4",
        weight: "60",
        base_experience: "112",
        is_default: "1",
      },
      {
        id: "172",
        identifier: "pichu",
        species_id: "172",
        height: "3",
        weight: "20",
        base_experience: "",
        is_default: "1",
      },
    ],
    pokemon_types: [
      { pokemon_id: "25", type_id: "4", slot: "1" },
      { pokemon_id: "172", type_id: "4", slot: "1" },
    ],
    pokemon_stats: [
      { pokemon_id: "25", stat_id: "1", base_stat: "35", effort: "0" },
      { pokemon_id: "25", stat_id: "6", base_stat: "90", effort: "2" },
      { pokemon_id: "25", stat_id: "7", base_stat: "1", effort: "0" }, // accuracy
    ],
    abilities: [
      {
        id: "9",
        identifier: "static",
        generation_id: "3",
        is_main_series: "1",
      },
      {
        id: "31",
        identifier: "lightning-rod",
        generation_id: "3",
        is_main_series: "1",
      },
      {
        id: "10001",
        identifier: "mountaineer",
        generation_id: "4",
        is_main_series: "0",
      },
      {
        id: "10002",
        identifier: "used-spin-off",
        generation_id: "4",
        is_main_series: "0",
      },
    ],
    ability_names: [
      { ability_id: "9", local_language_id: ES, name: "Elec. Estática" },
      { ability_id: "9", local_language_id: EN, name: "Static" },
    ],
    pokemon_abilities: [
      { pokemon_id: "25", ability_id: "9", is_hidden: "0", slot: "1" },
      { pokemon_id: "25", ability_id: "31", is_hidden: "1", slot: "3" },
      { pokemon_id: "172", ability_id: "10002", is_hidden: "0", slot: "1" },
    ],
  };
}

describe("cleanFlavorText", () => {
  it("joins the game's text box lines into one paragraph", () => {
    expect(cleanFlavorText("When several\nof these\fPOKéMON gather,")).toBe(
      "When several of these POKéMON gather,",
    );
  });

  it("rejoins words split with a soft hyphen", () => {
    expect(cleanFlavorText("It stores elec­\ntricity.")).toBe(
      "It stores electricity.",
    );
  });

  it("keeps real hyphens that fall on a line break", () => {
    expect(cleanFlavorText("A self-\nconfident Pokémon.")).toBe(
      "A self-confident Pokémon.",
    );
  });
});

describe("latestFlavorTexts", () => {
  it("keeps only the most recent game's entry per species and language", () => {
    const texts = latestFlavorTexts(makeRaw().pokemon_species_flavor_text);
    expect(texts.get("25:en")).toBe("Newest text.");
    expect(texts.get("25:es")).toBe("Texto reciente.");
  });
});

describe("buildDataset", () => {
  it("imports only the 18 battle types and their es/en names", () => {
    const data = buildDataset(makeRaw());
    expect(data.types.map((type) => type.slug)).toEqual([...POKEMON_TYPES]);
    expect(data.type_translations).toEqual([
      { type_id: 4, locale: "es", name: "Eléctrico" },
      { type_id: 4, locale: "en", name: "Electric" },
    ]);
  });

  it("keeps evolutions that point to a higher Pokédex number", () => {
    const pikachu = buildDataset(makeRaw()).pokemon_species.find(
      (s) => s.id === 25,
    );
    expect(pikachu?.evolves_from_species_id).toBe(172);
  });

  it("stores null when a text is missing instead of an empty string", () => {
    const data = buildDataset(makeRaw());
    const pichuEs = data.pokemon_species_translations.find(
      (row) => row.species_id === 172 && row.locale === "es",
    );
    expect(pichuEs).toMatchObject({
      name: "Pichu",
      genus: null,
      flavor_text: null,
    });
    expect(data.pokemon.find((p) => p.id === 172)?.base_experience).toBeNull();
  });

  it("keeps the six base stats and drops accuracy/evasion", () => {
    const stats = buildDataset(makeRaw()).pokemon_stats.map((row) => row.stat);
    expect(stats).toEqual(["hp", "speed"]);
  });

  it("includes main-series abilities and spin-off ones only if a Pokémon uses them", () => {
    const slugs = buildDataset(makeRaw()).abilities.map(
      (ability) => ability.slug,
    );
    expect(slugs).toEqual(["static", "lightning-rod", "used-spin-off"]);
  });

  it("fails if a species has no Spanish name", () => {
    const raw = makeRaw();
    raw.pokemon_species_names = raw.pokemon_species_names.filter(
      (row) =>
        !(row.pokemon_species_id === "172" && row.local_language_id === ES),
    );
    expect(() => buildDataset(raw)).toThrow(/without a "es" name: 172/);
  });

  it("fails if a Pokémon has a type the app does not know", () => {
    const raw = makeRaw();
    raw.pokemon_types.push({ pokemon_id: "25", type_id: "19", slot: "2" });
    expect(() => buildDataset(raw)).toThrow(/unknown type 19/);
  });

  it("fails on malformed numbers instead of importing garbage", () => {
    const raw = makeRaw();
    raw.pokemon[0]!.height = "four";
    expect(() => buildDataset(raw)).toThrow(/Expected an integer in "height"/);
  });
});
