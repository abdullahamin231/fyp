/**
 * An in-memory stand-in for the supabase-js query builder, for data-layer
 * tests. It serves rows from plain arrays and records every request so a test
 * can assert what PostgREST would have been asked (the request is the
 * observable effect of a query function).
 *
 * Supported: select (column list ignored, `{ count, head }` honoured), eq, neq,
 * in, is, gte, lte, like, ilike, filter (cs), or (comma-joined `col.op.value` terms with op
 * in/eq/ilike), order, limit, range, maybeSingle, single, insert, update,
 * delete, upsert, rpc, auth.getUser.
 */

type Row = Record<string, unknown>;
type Predicate = (row: Row) => boolean;

export interface RecordedRequest {
  table: string;
  op: "select" | "insert" | "update" | "delete" | "upsert";
  filters: { column: string; op: string; value: unknown }[];
  payload?: unknown;
  /** The `select()` column list, verbatim. */
  columns?: string;
  url: string;
}

export interface FakeOptions {
  tables?: Record<string, Row[]>;
  user?: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null;
  rpc?: Record<string, (args: Record<string, unknown>) => unknown>;
  /** Force an error for a table, e.g. `{ audit_log: "permission denied" }`. */
  errors?: Record<string, string>;
}

function ilikeMatch(value: unknown, pattern: string, flags = "is"): boolean {
  if (value === null || value === undefined) return false;
  const re = new RegExp(
    `^${pattern
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
      .replace(/%/g, ".*")
      .replace(/_/g, ".")}$`,
    flags,
  );
  return re.test(typeof value === "string" ? value : JSON.stringify(value));
}

function readPath(row: Row, column: string): unknown {
  if (!column.includes("->")) return row[column];
  const [head, ...rest] = column.split(/->>?/);
  let value: unknown = row[head];
  for (const key of rest) value = (value as Row | null | undefined)?.[key];
  return value;
}

function orTerm(term: string): Predicate {
  const match = /^([^.]+)\.(in|eq|ilike)\.(.*)$/s.exec(term);
  if (!match) throw new Error(`fake-supabase: unsupported or() term ${term}`);
  const [, column, op, raw] = match;
  if (op === "in") {
    const values = raw.replace(/^\(|\)$/g, "").split(",");
    return (row) => values.includes(String(readPath(row, column)));
  }
  if (op === "eq") return (row) => String(readPath(row, column)) === raw;
  return (row) => ilikeMatch(readPath(row, column), raw);
}

export function fakeSupabase(options: FakeOptions = {}) {
  const tables: Record<string, Row[]> = {};
  for (const [name, rows] of Object.entries(options.tables ?? {})) tables[name] = rows.map((r) => ({ ...r }));
  const requests: RecordedRequest[] = [];
  const rpcCalls: { name: string; args: Record<string, unknown> }[] = [];

  function builder(table: string) {
    const filters: RecordedRequest["filters"] = [];
    const predicates: Predicate[] = [];
    let op: RecordedRequest["op"] = "select";
    let payload: unknown;
    let order: { column: string; ascending: boolean }[] = [];
    let limit: number | undefined;
    let range: [number, number] | undefined;
    let single: "one" | "maybe" | undefined;
    let countMode = false;
    let head = false;
    let columns: string | undefined;
    let conflictColumns: string[] = [];
    let ignoreDuplicates = false;

    const add = (column: string, kind: string, value: unknown, predicate: Predicate) => {
      filters.push({ column, op: kind, value });
      predicates.push(predicate);
      return api;
    };

    const urlOf = () =>
      `/rest/v1/${table}?` +
      filters
        .map((f) =>
          f.op === "in"
            ? `${f.column}=in.(${(f.value as unknown[]).join(",")})`
            : `${f.column}=${f.op}.${String(f.value)}`,
        )
        .join("&");

    function run() {
      requests.push({ table, op, filters: [...filters], payload, columns, url: urlOf() });
      const error = options.errors?.[table];
      if (error) return { data: null, error: { message: error, code: "XX000" }, count: null };
      const rows = (tables[table] ??= []);
      const match = (row: Row) => predicates.every((p) => p(row));

      if (op === "insert" || op === "upsert") {
        const list = (Array.isArray(payload) ? payload : [payload]) as Row[];
        const inserted: Row[] = [];
        for (const row of list) {
          const existing = op === "upsert" && conflictColumns.length > 0
            ? rows.find((candidate) => conflictColumns.every((column) => candidate[column] === row[column]))
            : undefined;
          if (existing) {
            if (!ignoreDuplicates) { Object.assign(existing, row); inserted.push(existing); }
          } else {
            const added = { id: `${table}-${rows.length + 1}`, ...row };
            rows.push(added);
            inserted.push(added);
          }
        }
        return finish(inserted);
      }
      if (op === "update") {
        const hit = rows.filter(match);
        for (const row of hit) Object.assign(row, payload as Row);
        return finish(hit);
      }
      if (op === "delete") {
        const hit = rows.filter(match);
        tables[table] = rows.filter((row) => !match(row));
        return finish(hit);
      }
      let out = rows.filter(match);
      for (const { column, ascending } of [...order].reverse()) {
        out = [...out].sort((a, b) => {
          const left = String(a[column] ?? "");
          const right = String(b[column] ?? "");
          return ascending ? left.localeCompare(right) : right.localeCompare(left);
        });
      }
      const total = out.length;
      if (range) out = out.slice(range[0], range[1] + 1);
      if (limit !== undefined) out = out.slice(0, limit);
      return finish(out, total);
    }

    function finish(out: Row[], total = out.length) {
      const count = countMode ? total : null;
      if (single === "one") {
        if (out.length !== 1) return { data: null, error: { message: "not exactly one row", code: "PGRST116" }, count };
        return { data: out[0], error: null, count };
      }
      if (single === "maybe") return { data: out[0] ?? null, error: null, count };
      return { data: head ? null : out, error: null, count };
    }

    const api = {
      select(list?: string, opts?: { count?: string; head?: boolean }) {
        columns = list;
        if (opts?.count) countMode = true;
        if (opts?.head) head = true;
        return api;
      },
      insert(value: unknown) {
        op = "insert";
        payload = value;
        return api;
      },
      upsert(value: unknown, opts?: { onConflict?: string; ignoreDuplicates?: boolean }) {
        op = "upsert";
        payload = value;
        conflictColumns = opts?.onConflict?.split(",") ?? [];
        ignoreDuplicates = opts?.ignoreDuplicates ?? false;
        return api;
      },
      update(value: unknown) {
        op = "update";
        payload = value;
        return api;
      },
      delete() {
        op = "delete";
        return api;
      },
      eq: (c: string, v: unknown) => add(c, "eq", v, (r) => readPath(r, c) === v),
      neq: (c: string, v: unknown) => add(c, "neq", v, (r) => readPath(r, c) !== v),
      is: (c: string, v: unknown) => add(c, "is", v, (r) => (readPath(r, c) ?? null) === v),
      in: (c: string, v: unknown[]) => add(c, "in", v, (r) => v.includes(readPath(r, c))),
      gte: (c: string, v: string | number) =>
        add(c, "gte", v, (r) => String(readPath(r, c)) >= String(v)),
      lte: (c: string, v: string | number) =>
        add(c, "lte", v, (r) => String(readPath(r, c)) <= String(v)),
      ilike: (c: string, v: string) => add(c, "ilike", v, (r) => ilikeMatch(readPath(r, c), v)),
      like: (c: string, v: string) => add(c, "like", v, (r) => ilikeMatch(readPath(r, c), v, "s")),
      filter(c: string, op: string, v: string) {
        if (op !== "cs") throw new Error(`fake-supabase: unsupported filter op ${op}`);
        const want = JSON.parse(v) as Row[];
        // jsonb @>: every wanted element is contained in some element of the column's array.
        return add(c, "cs", v, (r) => {
          const have = readPath(r, c);
          return Array.isArray(have) && want.every((w) => have.some((h) => Object.entries(w).every(([k, val]) => (h as Row)?.[k] === val)));
        });
      },
      or(expression: string) {
        const terms = expression.split(/,(?![^(]*\))/).map(orTerm);
        return add("or", "or", expression, (r) => terms.some((t) => t(r)));
      },
      order(column: string, opts?: { ascending?: boolean }) {
        order = [...order, { column, ascending: opts?.ascending ?? true }];
        return api;
      },
      limit(n: number) {
        limit = n;
        return api;
      },
      range(from: number, to: number) {
        range = [from, to];
        return api;
      },
      maybeSingle() {
        single = "maybe";
        return api;
      },
      single() {
        single = "one";
        return api;
      },
      then<T>(resolve: (value: ReturnType<typeof run>) => T, reject?: (e: unknown) => T) {
        try {
          return Promise.resolve(resolve(run()));
        } catch (error) {
          return reject ? Promise.resolve(reject(error)) : Promise.reject(error);
        }
      },
    };
    return api;
  }

  const client = {
    from: (table: string) => builder(table),
    rpc(name: string, args: Record<string, unknown> = {}) {
      rpcCalls.push({ name, args });
      const handler = options.rpc?.[name];
      if (!handler) return Promise.resolve({ data: null, error: { message: `no rpc ${name}`, code: "PGRST202" } });
      try {
        return Promise.resolve({ data: handler(args), error: null });
      } catch (error) {
        const e = error as { message?: string; code?: string };
        return Promise.resolve({ data: null, error: { message: e.message ?? String(error), code: e.code ?? "P0001" } });
      }
    },
    auth: {
      getUser: () =>
        Promise.resolve({
          data: { user: options.user === undefined ? { id: "user-1", email: "me@example.com" } : options.user },
          error: null,
        }),
    },
  };

  return { client, tables, requests, rpcCalls };
}

export type FakeSupabase = ReturnType<typeof fakeSupabase>;
