/**
 * A real Postgres for tests and the demo, running inside Node (PGlite).
 *
 * It loads Abdullah's actual migrations, so the linker is tested against the
 * same tables, enums and constraints as Supabase, not a mock. What is skipped
 * is Supabase-only: the `auth` schema is stubbed, and RLS (00004) and the
 * role/RPC migrations (00006–00008) are not loaded, because they need
 * Supabase's built-in roles and have nothing to do with linking.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const MIGRATIONS = join(dirname(fileURLToPath(import.meta.url)), "../../../../supabase/migrations");

const LOADED = [
  "00001_enums.sql",
  "00002_tenancy.sql",
  "00003_schema.sql",
  "00005_immutability.sql",
  "00009_edge_dedupe.sql",
];

export const WORKSPACE_ID = "11111111-1111-4111-8111-111111111111";

export async function createTestDb(): Promise<PGlite> {
  const db = new PGlite();
  // Stand-in for Supabase's auth schema: 00002 references auth.users.
  await db.exec("create schema auth; create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);");
  for (const file of LOADED) {
    await db.exec(readFileSync(join(MIGRATIONS, file), "utf8"));
  }
  await db.query("insert into public.workspaces (id, name, slug) values ($1, 'Demo', 'demo')", [WORKSPACE_ID]);
  return db;
}

/** Pretend these Jira issues have already been ingested as Ticket nodes. */
export async function seedTickets(db: PGlite, keys: string[]): Promise<void> {
  for (const key of keys) {
    await db.query(
      "insert into public.nodes (workspace_id, type, external_id, status) values ($1, 'Ticket', $2, 'In Progress')",
      [WORKSPACE_ID, key],
    );
  }
}
