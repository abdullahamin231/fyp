import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";

const MIGRATIONS = join(dirname(fileURLToPath(import.meta.url)), "../../../supabase/migrations");
const files = readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort();
const version = (f: string) => f.slice(0, f.indexOf("_"));

async function supabaseLikeDb(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(`
    create schema auth;
    create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
    create function auth.jwt() returns jsonb language sql stable as $$ select '{}'::jsonb $$;
    create role anon; create role authenticated; create role service_role;
  `);
  return db;
}

describe("supabase migrations", () => {
  it("have unique version prefixes", () => {
    const seen = new Map<string, string>();
    for (const f of files) {
      const v = version(f);
      expect(seen.get(v), `${f} reuses version ${v}`).toBeUndefined();
      seen.set(v, f);
    }
  });

  it("apply in order on a fresh database", async () => {
    const db = await supabaseLikeDb();
    for (const f of files) {
      await db.exec(readFileSync(join(MIGRATIONS, f), "utf8")).catch((e: Error) => {
        throw new Error(`${f}: ${e.message}`);
      });
    }
    const { rows } = await db.query<{ policyname: string }>(
      "select policyname from pg_policies where tablename = 'figma_watched_files'",
    );
    expect(rows.map((r) => r.policyname)).toEqual(["figma_watched_files_select_member"]);
  }, 60_000);
});
