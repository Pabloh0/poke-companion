import { existsSync, readFileSync } from "node:fs";
import type pg from "pg";

const DEFAULT_CA_PATH = "supabase/certs/prod-ca-2021.crt";

/**
 * TLS with full verification (`verify-full`): the server must present a
 * certificate signed by Supabase's CA, for the host we asked for. Without it,
 * anyone between us and the database could impersonate it.
 */
export function connectionConfig(
  rawUrl: string,
  caPath = process.env.SUPABASE_DB_CA_CERT ?? DEFAULT_CA_PATH,
): pg.ClientConfig {
  const url = new URL(rawUrl);
  for (const param of ["sslmode", "sslrootcert", "sslcert", "sslkey"]) {
    if (url.searchParams.has(param)) {
      // SSL parameters in the URL would override the settings below.
      console.warn(
        `Ignoring "${param}" in SUPABASE_DB_URL (TLS is set in code).`,
      );
      url.searchParams.delete(param);
    }
  }

  const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (isLocal) return { connectionString: url.toString() };

  if (!existsSync(caPath)) {
    throw new Error(
      `Supabase CA certificate not found at "${caPath}".\n` +
        "Download it from the Supabase dashboard (Project Settings → Database → " +
        `SSL Configuration → Download certificate) and save it as ${DEFAULT_CA_PATH}.`,
    );
  }
  return {
    connectionString: url.toString(),
    ssl: { ca: readFileSync(caPath, "utf8"), rejectUnauthorized: true },
  };
}
