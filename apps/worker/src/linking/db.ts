/**
 * The smallest plain-SQL interface `viaSql` (callers.ts) needs: run one
 * statement with `$1, $2, ...` parameters and get rows back. PGlite (the
 * in-process Postgres used by the tests) and `pg.Client`
 * both have this shape.
 */
export interface Db {
  query<Row = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: Row[] }>;
}
