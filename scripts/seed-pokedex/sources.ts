import { parse } from "csv-parse/sync";

/**
 * PokeAPI data is read from a pinned commit of its public repository, so every
 * import is reproducible. To get newer data, update this hash on purpose,
 * run the import and review the result.
 */
export const POKEAPI_COMMIT = "193d8d4fbb57cf962e3f7c1ce5299a6fe847b3f8";

const BASE_URL = `https://raw.githubusercontent.com/PokeAPI/pokeapi/${POKEAPI_COMMIT}/data/v2/csv`;

export const SOURCE_FILES = [
  "generations",
  "types",
  "type_names",
  "pokemon_species",
  "pokemon_species_names",
  "pokemon_species_flavor_text",
  "pokemon",
  "pokemon_types",
  "pokemon_stats",
  "abilities",
  "ability_names",
  "pokemon_abilities",
] as const;

export type SourceFile = (typeof SOURCE_FILES)[number];
export type CsvRow = Record<string, string>;
export type RawData = Record<SourceFile, CsvRow[]>;

export function parseCsv(text: string): CsvRow[] {
  return parse(text, { columns: true, skip_empty_lines: true }) as CsvRow[];
}

export async function downloadSources(): Promise<RawData> {
  const entries = await Promise.all(
    SOURCE_FILES.map(async (file) => {
      const response = await fetch(`${BASE_URL}/${file}.csv`);
      if (!response.ok) {
        throw new Error(
          `Could not download ${file}.csv (HTTP ${response.status}).`,
        );
      }
      return [file, parseCsv(await response.text())] as const;
    }),
  );
  return Object.fromEntries(entries) as RawData;
}
