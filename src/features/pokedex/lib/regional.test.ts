import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import {
  REGIONAL_FORMS,
  REGIONS,
  regionalFormBySlug,
} from "../data/regional-forms";
import type { EvolutionNode } from "./evolution";
import type { PokedexEntry } from "./filters";
import {
  comparePokedexOrder,
  familyOfForms,
  imageIdOf,
  regionalFormName,
  regionalizeTree,
} from "./regional";

function entry(
  dexNumber: number,
  name: string,
  form?: { pokemonId: number; region: "alola" | "galar" },
): PokedexEntry {
  return {
    dexNumber,
    slug: form ? `${name.toLowerCase()}-${form.region}` : name.toLowerCase(),
    name,
    genus: null,
    generation: 1,
    types: ["normal"],
    rarity: "common",
    baseStatTotal: 300,
    form: form && {
      ...form,
      variant: null,
      baseName: name,
      regionLabel: form.region,
      variantLabel: null,
    },
  };
}

describe("REGIONAL_FORMS", () => {
  it("has the 57 regional forms of the games", () => {
    const perRegion = Object.fromEntries(
      REGIONS.map((region) => [
        region,
        REGIONAL_FORMS.filter((form) => form.region === region).length,
      ]),
    );
    expect(perRegion).toEqual({ alola: 18, galar: 19, hisui: 16, paldea: 4 });
  });

  it("has unique slugs and ids, and no battle-only or special forms", () => {
    const slugs = REGIONAL_FORMS.map((form) => form.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(REGIONAL_FORMS.map((f) => f.pokemonId)).size).toBe(57);
    expect(slugs).not.toContain("darmanitan-galar-zen");
    expect(slugs.some((slug) => slug.includes("totem"))).toBe(false);
    expect(slugs.some((slug) => slug.includes("cap"))).toBe(false);
  });

  it("looks forms up by slug", () => {
    expect(regionalFormBySlug("vulpix-alola")).toMatchObject({
      dexNumber: 37,
      region: "alola",
    });
    expect(regionalFormBySlug("vulpix")).toBeUndefined();
  });
});

describe("regionalFormName", () => {
  it("follows each language's convention", () => {
    expect(regionalFormName("Vulpix", "alola", es.Forms)).toBe(
      "Vulpix de Alola",
    );
    expect(regionalFormName("Vulpix", "alola", en.Forms)).toBe("Alolan Vulpix");
    expect(regionalFormName("Growlithe", "hisui", en.Forms)).toBe(
      "Hisuian Growlithe",
    );
  });
});

describe("comparePokedexOrder", () => {
  it("puts each form right after its original", () => {
    const list = [
      entry(38, "Ninetales"),
      entry(37, "Vulpix", { pokemonId: 10103, region: "alola" }),
      entry(38, "Ninetales", { pokemonId: 10104, region: "alola" }),
      entry(37, "Vulpix"),
    ].sort(comparePokedexOrder);
    expect(list.map((e) => e.slug)).toEqual([
      "vulpix",
      "vulpix-alola",
      "ninetales",
      "ninetales-alola",
    ]);
  });
});

describe("imageIdOf", () => {
  it("uses the form's own picture", () => {
    expect(imageIdOf(entry(37, "Vulpix"))).toBe(37);
    expect(
      imageIdOf(entry(37, "Vulpix", { pokemonId: 10103, region: "alola" })),
    ).toBe(10103);
  });
});

describe("regionalizeTree", () => {
  const meowth = entry(52, "Meowth");
  const persian = entry(53, "Persian");
  const perrserker = entry(863, "Perrserker");
  const tree: EvolutionNode = {
    entry: meowth,
    children: [
      { entry: persian, children: [] },
      { entry: perrserker, children: [] },
    ],
  };
  const forms = [
    entry(52, "Meowth", { pokemonId: 10107, region: "alola" }),
    entry(53, "Persian", { pokemonId: 10108, region: "alola" }),
    entry(52, "Meowth", { pokemonId: 10161, region: "galar" }),
  ];
  const slugs = (node: EvolutionNode): string[] => [
    node.entry.slug,
    ...node.children.flatMap(slugs),
  ];

  it("swaps each stage for its form from the same region", () => {
    expect(slugs(regionalizeTree(tree, "alola", forms))).toEqual([
      "meowth-alola",
      "persian-alola",
      "perrserker",
    ]);
  });

  it("keeps the original where the region has no form", () => {
    expect(slugs(regionalizeTree(tree, "galar", forms))).toEqual([
      "meowth-galar",
      "persian",
      "perrserker",
    ]);
  });
});

describe("familyOfForms", () => {
  it("lists the original and its forms", () => {
    const species = [entry(37, "Vulpix"), entry(38, "Ninetales")];
    const forms = [
      entry(38, "Ninetales", { pokemonId: 10104, region: "alola" }),
      entry(37, "Vulpix", { pokemonId: 10103, region: "alola" }),
    ];
    expect(familyOfForms(37, species, forms).map((e) => e.slug)).toEqual([
      "vulpix",
      "vulpix-alola",
    ]);
  });
});
