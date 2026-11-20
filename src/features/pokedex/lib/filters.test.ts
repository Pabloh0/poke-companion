import { describe, expect, it } from "vitest";
import {
  EMPTY_FILTERS,
  filterEntries,
  formatDexNumber,
  normalizeText,
  parseFilters,
  rarityOf,
  serializeFilters,
  toggleType,
  type PokedexEntry,
} from "./filters";

const entry = (
  fields: Pick<
    PokedexEntry,
    "dexNumber" | "slug" | "name" | "generation" | "types"
  >,
): PokedexEntry => ({
  genus: null,
  rarity: "common",
  baseStatTotal: 300,
  ...fields,
});

const ENTRIES: PokedexEntry[] = [
  entry({
    dexNumber: 6,
    slug: "charizard",
    name: "Charizard",
    generation: 1,
    types: ["fire", "flying"],
  }),
  entry({
    dexNumber: 25,
    slug: "pikachu",
    name: "Pikachu",
    generation: 1,
    types: ["electric"],
  }),
  entry({
    dexNumber: 26,
    slug: "raichu",
    name: "Raichu",
    generation: 1,
    types: ["electric"],
  }),
  entry({
    dexNumber: 130,
    slug: "gyarados",
    name: "Gyarados",
    generation: 1,
    types: ["water", "flying"],
  }),
  entry({
    dexNumber: 669,
    slug: "flabebe",
    name: "Flabébé",
    generation: 6,
    types: ["fairy"],
  }),
];

const names = (list: PokedexEntry[]) => list.map((entry) => entry.name);

describe("filterEntries", () => {
  it("returns everything without filters", () => {
    expect(filterEntries(ENTRIES, EMPTY_FILTERS)).toHaveLength(ENTRIES.length);
  });

  it("finds names containing the text, ignoring case and accents", () => {
    expect(
      names(filterEntries(ENTRIES, { ...EMPTY_FILTERS, query: "CHU" })),
    ).toEqual(["Pikachu", "Raichu"]);
    expect(
      names(filterEntries(ENTRIES, { ...EMPTY_FILTERS, query: "flabebe" })),
    ).toEqual(["Flabébé"]);
  });

  it("searches by exact Pokédex number with or without # and zeros", () => {
    for (const query of ["25", "025", "#25", "#0025"]) {
      expect(
        names(filterEntries(ENTRIES, { ...EMPTY_FILTERS, query })),
      ).toEqual(["Pikachu"]);
    }
  });

  it("requires every selected type", () => {
    expect(
      names(filterEntries(ENTRIES, { ...EMPTY_FILTERS, types: ["flying"] })),
    ).toEqual(["Charizard", "Gyarados"]);
    expect(
      names(
        filterEntries(ENTRIES, {
          ...EMPTY_FILTERS,
          types: ["water", "flying"],
        }),
      ),
    ).toEqual(["Gyarados"]);
  });

  it("combines search, types and generation", () => {
    expect(
      filterEntries(ENTRIES, {
        ...EMPTY_FILTERS,
        query: "a",
        types: ["fairy"],
        generation: 1,
      }),
    ).toEqual([]);
    expect(
      names(
        filterEntries(ENTRIES, {
          ...EMPTY_FILTERS,
          query: "a",
          types: ["fairy"],
          generation: 6,
        }),
      ),
    ).toEqual(["Flabébé"]);
  });
});

describe("URL filters", () => {
  it("round-trips through the query string", () => {
    const filters = {
      query: "pika",
      types: ["water", "flying"],
      generation: 3,
      region: "alola",
    } as const;
    const query = serializeFilters({ ...filters, types: [...filters.types] });
    expect(query).toBe("q=pika&types=water,flying&gen=3&form=alola");
    expect(parseFilters(new URLSearchParams(query))).toEqual(filters);
  });

  it("ignores unknown types, duplicates, extra types and invalid generations", () => {
    const parsed = parseFilters(
      new URLSearchParams(
        "types=fire,banana,fire,water,grass&gen=42&form=kanto",
      ),
    );
    expect(parsed).toEqual({
      query: "",
      types: ["fire", "water"],
      generation: null,
      region: null,
    });
  });

  it("produces an empty query string without filters", () => {
    expect(serializeFilters(EMPTY_FILTERS)).toBe("");
  });
});

describe("toggleType", () => {
  it("adds, removes and never exceeds two types", () => {
    expect(toggleType([], "fire")).toEqual(["fire"]);
    expect(toggleType(["fire"], "fire")).toEqual([]);
    expect(toggleType(["fire", "water"], "grass")).toEqual(["fire", "water"]);
  });
});

describe("helpers", () => {
  it("formats Pokédex numbers with four digits", () => {
    expect(formatDexNumber(25)).toBe("0025");
    expect(formatDexNumber(1025)).toBe("1025");
  });

  it("derives the card rarity, mythical first", () => {
    expect(rarityOf({ is_legendary: false, is_mythical: false })).toBe(
      "common",
    );
    expect(rarityOf({ is_legendary: true, is_mythical: false })).toBe(
      "legendary",
    );
    expect(rarityOf({ is_legendary: false, is_mythical: true })).toBe(
      "mythical",
    );
  });

  it("normalizes text for searching", () => {
    expect(normalizeText("  Nidoran Él ")).toBe("nidoran el");
  });
});

describe("regional forms", () => {
  const vulpix = entry({
    dexNumber: 37,
    slug: "vulpix",
    name: "Vulpix",
    generation: 1,
    types: ["fire"],
  });
  const alolanVulpix: PokedexEntry = {
    ...entry({
      dexNumber: 37,
      slug: "vulpix-alola",
      name: "Vulpix de Alola",
      generation: 1,
      types: ["ice"],
    }),
    form: {
      pokemonId: 10103,
      region: "alola",
      variant: null,
      baseName: "Vulpix",
      regionLabel: "Alola",
      variantLabel: null,
    },
  };
  const blazeTauros: PokedexEntry = {
    ...entry({
      dexNumber: 128,
      slug: "tauros-paldea-blaze-breed",
      name: "Tauros de Paldea",
      generation: 1,
      types: ["fighting", "fire"],
    }),
    form: {
      pokemonId: 10251,
      region: "paldea",
      variant: "blaze",
      baseName: "Tauros",
      regionLabel: "Paldea",
      variantLabel: "Variedad ardiente",
    },
  };
  const all = [vulpix, alolanVulpix, blazeTauros];

  it("finds a form by its full name or by its region", () => {
    expect(
      names(filterEntries(all, { ...EMPTY_FILTERS, query: "vulpix de alola" })),
    ).toEqual(["Vulpix de Alola"]);
    expect(
      names(filterEntries(all, { ...EMPTY_FILTERS, query: "alola" })),
    ).toEqual(["Vulpix de Alola"]);
  });

  it("finds the original and its form by species name or number", () => {
    expect(
      names(filterEntries(all, { ...EMPTY_FILTERS, query: "vulpix" })),
    ).toEqual(["Vulpix", "Vulpix de Alola"]);
    expect(
      names(filterEntries(all, { ...EMPTY_FILTERS, query: "#37" })),
    ).toEqual(["Vulpix", "Vulpix de Alola"]);
  });

  it("finds a Tauros breed by its variant", () => {
    expect(
      names(filterEntries(all, { ...EMPTY_FILTERS, query: "ardiente" })),
    ).toEqual(["Tauros de Paldea"]);
  });

  it("keeps only one region's forms when a region is chosen", () => {
    expect(
      names(filterEntries(all, { ...EMPTY_FILTERS, region: "alola" })),
    ).toEqual(["Vulpix de Alola"]);
    expect(
      names(
        filterEntries(all, {
          ...EMPTY_FILTERS,
          region: "alola",
          types: ["fire"],
        }),
      ),
    ).toEqual([]);
  });
});
