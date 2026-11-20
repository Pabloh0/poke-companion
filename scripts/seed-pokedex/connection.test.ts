import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { connectionConfig } from "./connection";

const REMOTE =
  "postgresql://postgres.abc:secret@aws-0-eu-west-3.pooler.supabase.com:5432/postgres";

function fakeCa(): string {
  const dir = mkdtempSync(join(tmpdir(), "ca-"));
  const path = join(dir, "ca.crt");
  writeFileSync(
    path,
    "-----BEGIN CERTIFICATE-----\nfake\n-----END CERTIFICATE-----\n",
  );
  return path;
}

afterEach(() => vi.restoreAllMocks());

describe("connectionConfig", () => {
  it("connects to a local database without TLS", () => {
    const config = connectionConfig(
      "postgresql://u:p@localhost:5432/app",
      "/nope",
    );
    expect(config.ssl).toBeUndefined();
  });

  it("verifies the server certificate against Supabase's CA for remote databases", () => {
    const config = connectionConfig(REMOTE, fakeCa());
    expect(config.ssl).toMatchObject({ rejectUnauthorized: true });
    expect((config.ssl as { ca: string }).ca).toContain("BEGIN CERTIFICATE");
  });

  it("refuses to connect remotely without the CA certificate", () => {
    expect(() => connectionConfig(REMOTE, "/does/not/exist.crt")).toThrow(
      /CA certificate not found/,
    );
  });

  it("removes SSL parameters from the URL so they cannot weaken verification", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const config = connectionConfig(`${REMOTE}?sslmode=no-verify`, fakeCa());
    expect(config.connectionString).not.toContain("sslmode");
    expect(config.ssl).toMatchObject({ rejectUnauthorized: true });
  });
});
