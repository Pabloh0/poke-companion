/**
 * Regional forms in the Pokédex: names, ordering and how they fit into an
 * evolution line. Pure functions (no React, no network): regional.test.ts.
 */
import type { FormVariant, Region } from "../data/regional-forms";
import type { EvolutionNode } from "./evolution";
import type { PokedexEntry } from "./filters";

/** The "Forms" block of es.json / en.json that names need. */
export type FormNameMessages = {
  /** "{name} de {region}" / "{region} {name}" */
  fullName: string;
  /** Region as used inside a name: "Alola" / "Alolan". */
  regionInName: Record<Region, string>;
  /** Region on its own: "Alola". */
  regions: Record<Region, string>;
  variants: Record<FormVariant, string>;
};

/**
 * "Vulpix de Alola" / "Alolan Vulpix". The Tauros breed is not part of the
 * name (it goes on its own line): "Tauros de Paldea" + "Variedad ardiente".
 */
export function regionalFormName(
  baseName: string,
  region: Region,
  messages: FormNameMessages,
): string {
  return messages.fullName
    .replace("{name}", baseName)
    .replace("{region}", messages.regionInName[region]);
}

/**
 * Pokédex order with each regional form right after its original:
 * Vulpix, Vulpix de Alola, Ninetales, Ninetales de Alola…
 */
export function comparePokedexOrder(a: PokedexEntry, b: PokedexEntry): number {
  return (
    a.dexNumber - b.dexNumber ||
    (a.form ? 1 : 0) - (b.form ? 1 : 0) ||
    (a.form?.pokemonId ?? 0) - (b.form?.pokemonId ?? 0)
  );
}

/** Sprite / artwork file of an entry: forms have their own. */
export function imageIdOf(entry: PokedexEntry): number {
  return entry.form?.pokemonId ?? entry.dexNumber;
}

/**
 * The evolution line seen from a regional form: each stage is swapped for its
 * form from the same region when one exists (Vulpix de Alola → Ninetales de
 * Alola). Stages without a regional form keep the original.
 *
 * Limitation: the tree comes from species data, so it cannot tell that
 * Galarian Meowth evolves only into Perrserker. Exact regional evolutions
 * need the evolution-method data (roadmap, phase 4).
 */
export function regionalizeTree(
  node: EvolutionNode,
  region: Region,
  forms: readonly PokedexEntry[],
): EvolutionNode {
  const match = forms.find(
    (form) =>
      form.dexNumber === node.entry.dexNumber && form.form?.region === region,
  );
  return {
    entry: match ?? node.entry,
    children: node.children.map((child) =>
      regionalizeTree(child, region, forms),
    ),
  };
}

/** The original species and all its regional forms, in Pokédex order. */
export function familyOfForms(
  dexNumber: number,
  species: readonly PokedexEntry[],
  forms: readonly PokedexEntry[],
): PokedexEntry[] {
  return [
    ...species.filter((entry) => entry.dexNumber === dexNumber),
    ...forms.filter((form) => form.dexNumber === dexNumber),
  ].sort(comparePokedexOrder);
}
