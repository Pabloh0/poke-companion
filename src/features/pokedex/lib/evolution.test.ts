import { describe, expect, it } from "vitest";
import {
  buildEvolutionTree,
  flattenEvolutionTree,
  type EvolutionLink,
  type EvolutionNode,
} from "./evolution";
import type { PokedexEntry } from "./filters";

function entry(dexNumber: number, name: string): PokedexEntry {
  return {
    dexNumber,
    slug: name.toLowerCase(),
    name,
    genus: null,
    generation: 1,
    types: ["normal"],
    rarity: "common",
    baseStatTotal: 300,
  };
}

const ENTRIES = [
  entry(1, "Bulbasaur"),
  entry(2, "Ivysaur"),
  entry(3, "Venusaur"),
  entry(25, "Pikachu"),
  entry(26, "Raichu"),
  entry(128, "Tauros"),
  entry(133, "Eevee"),
  entry(134, "Vaporeon"),
  entry(135, "Jolteon"),
  entry(136, "Flareon"),
  entry(172, "Pichu"),
  entry(265, "Wurmple"),
  entry(266, "Silcoon"),
  entry(267, "Beautifly"),
  entry(268, "Cascoon"),
  entry(269, "Dustox"),
];

const link = (
  dexNumber: number,
  evolvesFrom: number | null,
  chainId: number | null,
): EvolutionLink => ({ dexNumber, evolvesFrom, chainId });

const LINKS = [
  link(1, null, 1),
  link(2, 1, 1),
  link(3, 2, 1),
  link(25, 172, 10),
  link(26, 25, 10),
  link(128, null, 60),
  link(133, null, 67),
  link(136, 133, 67), // deliberately out of order
  link(134, 133, 67),
  link(135, 133, 67),
  link(172, null, 10),
  link(265, null, 135),
  link(266, 265, 135),
  link(267, 266, 135),
  link(268, 265, 135),
  link(269, 268, 135),
];

/** "Wurmple(Silcoon(Beautifly), Cascoon(Dustox))": easy to compare. */
function shape(node: EvolutionNode): string {
  const kids = node.children.map(shape).join(", ");
  return kids ? `${node.entry.name}(${kids})` : node.entry.name;
}

describe("buildEvolutionTree", () => {
  it("starts from the first stage whichever member you open", () => {
    for (const dex of [1, 2, 3]) {
      const tree = buildEvolutionTree(LINKS, ENTRIES, dex);
      expect(tree && shape(tree)).toBe("Bulbasaur(Ivysaur(Venusaur))");
    }
  });

  it("follows evolutions whose number is lower (Pichu #172 → Pikachu #25)", () => {
    const tree = buildEvolutionTree(LINKS, ENTRIES, 26);
    expect(tree && shape(tree)).toBe("Pichu(Pikachu(Raichu))");
  });

  it("lists branches in Pokédex order", () => {
    const tree = buildEvolutionTree(LINKS, ENTRIES, 136);
    expect(tree && shape(tree)).toBe("Eevee(Vaporeon, Jolteon, Flareon)");
  });

  it("keeps each branch with its own next stage", () => {
    const tree = buildEvolutionTree(LINKS, ENTRIES, 269);
    expect(tree && shape(tree)).toBe(
      "Wurmple(Silcoon(Beautifly), Cascoon(Dustox))",
    );
  });

  it("returns a lone node for species that do not evolve", () => {
    expect(buildEvolutionTree(LINKS, ENTRIES, 128)).toEqual({
      entry: ENTRIES.find((e) => e.dexNumber === 128),
      children: [],
    });
  });

  it("returns a lone node when the species has no chain", () => {
    const tree = buildEvolutionTree([link(128, null, null)], ENTRIES, 128);
    expect(tree?.children).toEqual([]);
  });

  it("returns null for an unknown species", () => {
    expect(buildEvolutionTree(LINKS, ENTRIES, 9999)).toBeNull();
  });

  it("skips family members it has no card for", () => {
    const withoutIvysaur = ENTRIES.filter((e) => e.dexNumber !== 2);
    const tree = buildEvolutionTree(LINKS, withoutIvysaur, 1);
    expect(tree && shape(tree)).toBe("Bulbasaur");
  });

  it("does not loop forever on a circular chain", () => {
    const circular = [link(1, 2, 1), link(2, 1, 1)];
    const tree = buildEvolutionTree(circular, ENTRIES, 1);
    expect(tree && flattenEvolutionTree(tree).map((e) => e.dexNumber)).toEqual([
      2, 1,
    ]);
  });
});

describe("flattenEvolutionTree", () => {
  it("lists every member, first stage first", () => {
    const tree = buildEvolutionTree(LINKS, ENTRIES, 265);
    expect(tree && flattenEvolutionTree(tree).map((e) => e.name)).toEqual([
      "Wurmple",
      "Silcoon",
      "Beautifly",
      "Cascoon",
      "Dustox",
    ]);
  });
});
