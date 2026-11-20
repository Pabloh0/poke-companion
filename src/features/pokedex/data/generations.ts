/** Main-series generations, I–IX. Labels live in `Pokedex.generations`. */
export const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export type Generation = (typeof GENERATIONS)[number];

export function isGeneration(value: number): value is Generation {
  return (GENERATIONS as readonly number[]).includes(value);
}
