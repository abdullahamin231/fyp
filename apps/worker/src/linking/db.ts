/**
 * The smallest database interface the linker needs: run one SQL statement
 * with `$1, $2, ...` parameters and get rows back.
 *
 * Both `pg.Client` (the normal Node Postgres driver, used against Supabase)
 * and `PGlite` (an in-process Postgres used by the tests and the demo) already
 * have this shape, so the linker works with either without an adapter.
 *
 * Use a single connection (a `pg.Client`, not a `pg.Pool`): the linker runs
 * BEGIN ... COMMIT on it, which only works if every statement goes down the
 * same connection.
 */
export interface Db {
  query<Row = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: Row[] }>;
}
