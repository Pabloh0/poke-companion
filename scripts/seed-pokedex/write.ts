import type pg from "pg";
import type { Dataset } from "./transform";

type Row = Record<string, unknown>;

/** Postgres accepts at most 65 535 parameters per query. */
const MAX_PARAMS = 60_000;

const quote = (identifier: string) => `"${identifier.replaceAll('"', '""')}"`;

async function insertRows(
  client: pg.ClientBase,
  table: string,
  rows: Row[],
  conflictColumns?: string[],
): Promise<void> {
  const first = rows[0];
  if (!first) return;
  const columns = Object.keys(first);
  const batchSize = Math.floor(MAX_PARAMS / columns.length);

  const onConflict = conflictColumns
    ? (() => {
        const updates = columns
          .filter((column) => !conflictColumns.includes(column))
          .map((column) => `${quote(column)} = excluded.${quote(column)}`);
        const target = conflictColumns.map(quote).join(", ");
        return updates.length > 0
          ? ` on conflict (${target}) do update set ${updates.join(", ")}`
          : ` on conflict (${target}) do nothing`;
      })()
    : "";

  for (let start = 0; start < rows.length; start += batchSize) {
    const batch = rows.slice(start, start + batchSize);
    const values: unknown[] = [];
    const tuples = batch.map((row) => {
      const placeholders = columns.map((column) => {
        values.push(row[column]);
        return `$${values.length}`;
      });
      return `(${placeholders.join(", ")})`;
    });
    await client.query(
      `insert into public.${quote(table)} (${columns.map(quote).join(", ")})
       values ${tuples.join(", ")}${onConflict}`,
      values,
    );
  }
}

/** Entities keep their ids forever (user data will reference them): upsert. */
const upsert = (
  client: pg.ClientBase,
  table: string,
  rows: Row[],
  key: string[],
) => insertRows(client, table, rows, key);

/**
 * Translations and links are fully derived from the source: wipe and insert,
 * so rows removed upstream (e.g. a type change) disappear too. It all runs
 * inside one transaction, so visitors never see an empty table.
 */
async function replace(client: pg.ClientBase, table: string, rows: Row[]) {
  await client.query(`delete from public.${quote(table)}`);
  await insertRows(client, table, rows);
}

/** Writes the whole dataset. Must be called inside a transaction. */
export async function writeDataset(client: pg.ClientBase, data: Dataset) {
  // Checked at commit: lets a species reference one inserted later.
  await client.query("set constraints all deferred");

  await upsert(client, "generations", data.generations, ["id"]);
  await upsert(client, "types", data.types, ["id"]);
  await replace(client, "type_translations", data.type_translations);

  await upsert(client, "pokemon_species", data.pokemon_species, ["id"]);
  await replace(
    client,
    "pokemon_species_translations",
    data.pokemon_species_translations,
  );

  await upsert(client, "pokemon", data.pokemon, ["id"]);
  await replace(client, "pokemon_types", data.pokemon_types);
  await replace(client, "pokemon_stats", data.pokemon_stats);

  await upsert(client, "abilities", data.abilities, ["id"]);
  await replace(client, "ability_translations", data.ability_translations);
  await replace(client, "pokemon_abilities", data.pokemon_abilities);

  await upsert(client, "version_groups", data.version_groups, ["id"]);
  await upsert(client, "moves", data.moves, ["id"]);
  await replace(client, "move_translations", data.move_translations);
  await replace(client, "pokemon_moves", data.pokemon_moves);
}
