/**
 * Builds a species' evolution tree from two columns we already import from
 * PokeAPI: `evolves_from_species_id` and `evolution_chain_id`.
 * Pure (no React, no network): covered by evolution.test.ts.
 */
import type { PokedexEntry } from "./filters";

/** One row of pokemon_species, reduced to what the tree needs. */
export type EvolutionLink = {
  dexNumber: number;
  evolvesFrom: number | null;
  chainId: number | null;
};

/** A species and the ones it evolves into (several when the line branches). */
export type EvolutionNode = {
  entry: PokedexEntry;
  children: EvolutionNode[];
};

/**
 * The whole family of `dexNumber`, starting from its first stage.
 *
 * Works for straight lines (Bulbasaur → Ivysaur → Venusaur), branches
 * (Eevee has eight evolutions, Wurmple splits in two) and numbers out of
 * order (Pichu #172 → Pikachu #25). Returns a single node without children
 * when the species does not evolve, and null when it is unknown.
 */
export function buildEvolutionTree(
  links: readonly EvolutionLink[],
  entries: readonly PokedexEntry[],
  dexNumber: number,
): EvolutionNode | null {
  const entryByDex = new Map(entries.map((entry) => [entry.dexNumber, entry]));
  const self = links.find((link) => link.dexNumber === dexNumber);
  const selfEntry = entryByDex.get(dexNumber);
  if (!self || !selfEntry) return null;
  if (self.chainId === null) return { entry: selfEntry, children: [] };

  // Members of the same family that we can actually show.
  const members = new Map(
    links
      .filter((link) => link.chainId === self.chainId)
      .filter((link) => entryByDex.has(link.dexNumber))
      .map((link) => [link.dexNumber, link]),
  );

  // Walk up to the first stage. `seen` stops a malformed (circular) chain.
  let root = self;
  const seen = new Set([root.dexNumber]);
  while (root.evolvesFrom !== null) {
    const parent = members.get(root.evolvesFrom);
    if (!parent || seen.has(parent.dexNumber)) break;
    seen.add(parent.dexNumber);
    root = parent;
  }

  const visited = new Set<number>();
  const grow = (link: EvolutionLink, entry: PokedexEntry): EvolutionNode => {
    visited.add(link.dexNumber);
    const children: EvolutionNode[] = [];
    const next = [...members.values()]
      .filter((child) => child.evolvesFrom === link.dexNumber)
      .sort((a, b) => a.dexNumber - b.dexNumber);
    for (const child of next) {
      const childEntry = entryByDex.get(child.dexNumber);
      if (childEntry && !visited.has(child.dexNumber)) {
        children.push(grow(child, childEntry));
      }
    }
    return { entry, children };
  };

  return grow(root, entryByDex.get(root.dexNumber) ?? selfEntry);
}

/** Every species in the tree, first stage first (handy for tests and links). */
export function flattenEvolutionTree(node: EvolutionNode): PokedexEntry[] {
  return [node.entry, ...node.children.flatMap(flattenEvolutionTree)];
}
