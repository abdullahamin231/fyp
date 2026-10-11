/**
 * A real Postgres for the linking tests and demo, running inside Node (PGlite).
 * Not used by the worker at runtime; @electric-sql/pglite is a dev dependency.
 *
 * It loads Abdullah's actual migrations, so the linker is tested against the
 * same tables, enums and constraints as Supabase, not a mock. What is skipped
 * is Supabase-only: the `auth` schema and the three API roles are stubbed, and
 * RLS (00004) and the unrelated role/RPC/queue migrations (00006–00009,
 * 00011–00014) are not loaded. 00015 is the linking function itself.
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
  "00010_edge_dedupe.sql",
  "00015_link_pull_request_event.sql",
];

export const WORKSPACE_ID = "11111111-1111-4111-8111-111111111111";

export async function createTestDb(): Promise<PGlite> {
  const db = new PGlite();
  // Stand-in for Supabase's auth schema: 00002 references auth.users.
  await db.exec("create schema auth; create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);");
  // Stand-ins for Supabase's API roles: 00015 revokes/grants on them.
  await db.exec("create role anon; create role authenticated; create role service_role;");
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
