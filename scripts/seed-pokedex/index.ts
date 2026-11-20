/**
 * Imports Pokédex reference data from PokeAPI into our database.
 *
 *   npm run db:seed            → download, transform and write (one transaction)
 *   npm run db:seed -- --dry-run → download and transform only; writes nothing
 *
 * Needs SUPABASE_DB_URL in .env.local (see .env.example) and, for a remote
 * database, Supabase's CA certificate to verify the server (see README).
 * Safe to run again at any time: the result is always the same data.
 */
import { existsSync } from "node:fs";
import pg from "pg";
import { connectionConfig } from "./connection";
import { downloadSources, POKEAPI_COMMIT } from "./sources";
import { buildDataset, type Dataset } from "./transform";
import { writeDataset } from "./write";

function loadEnv() {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
}

function printSummary(data: Dataset) {
  const rows = Object.entries(data).map(([table, list]) => ({
    table,
    rows: list.length,
  }));
  console.table(rows);
}

async function main() {
  loadEnv();
  const dryRun = process.argv.includes("--dry-run");

  console.log(
    `Downloading PokeAPI data (commit ${POKEAPI_COMMIT.slice(0, 7)})…`,
  );
  const data = buildDataset(await downloadSources());
  printSummary(data);

  if (dryRun) {
    console.log("Dry run: nothing was written.");
    return;
  }

  const url = process.env.SUPABASE_DB_URL;
  if (!url) {
    throw new Error(
      "SUPABASE_DB_URL is not set. Add it to .env.local (see .env.example).",
    );
  }

  const client = new pg.Client(connectionConfig(url));
  await client.connect();
  try {
    console.log("Writing to the database (single transaction)…");
    await client.query("begin");
    await writeDataset(client, data);
    await client.query("commit");
    console.log("Done. Pokédex data is up to date.");
  } catch (error) {
    await client.query("rollback");
    console.error("Something failed; all changes were rolled back.");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
