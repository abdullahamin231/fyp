import { RULE_META, type Severity as DbSeverity } from "@unify/contracts";
import { createClient } from "@/lib/supabase/server";

/**
 * The versioned `rules` table (00009), as the policy screens show it.
 *
 * `rules` has no title or description column: those live on the committed
 * record in `@unify/contracts` and are joined in by rule id. Everything the
 * table does store (grace window, severity, guards, notify routing, active) is
 * read from the latest version of each rule.
 */

export interface RuleGuard {
  path: string;
  op: string;
  description: string;
}

export interface RuleNotify {
  channels: string[];
  roles: string[];
  hops: number;
  template: string;
}

export interface RuleView {
  id: string;
  version: number;
  /** How many versions of this rule exist. */
  versionCount: number;
  title: string;
  description: string;
  edgeType: string | null;
  trigger: { on: string; entityType?: string | null };
  guards: RuleGuard[];
  condition: string;
  gracePeriodHours: number;
  produces: string;
  severity: DbSeverity;
  notify: RuleNotify;
  active: boolean;
  /** Findings this rule raised in the caller's workspaces over the last 7 days. */
  fired7d: number;
}

export interface RuleRow {
  id: string;
  version: number;
  edge_type: string | null;
  trigger: { on: string; entityType?: string | null };
  guards: RuleGuard[] | null;
  condition: string;
  grace_period_hours: number;
  produces: string;
  severity: DbSeverity;
  notify: RuleNotify;
  active: boolean;
}

export const RULE_COLUMNS =
  "id, version, edge_type, trigger, guards, condition, grace_period_hours, produces, severity, notify, active";

/** Latest version per rule id, ordered by id. Pure, so it is tested directly. */
export function latestRules(rows: RuleRow[], fired: Record<string, number> = {}): RuleView[] {
  const byId = new Map<string, RuleRow[]>();
  for (const row of rows) byId.set(row.id, [...(byId.get(row.id) ?? []), row]);
  return [...byId.entries()]
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([id, versions]) => {
      const row = versions.reduce((best, v) => (v.version > best.version ? v : best));
      const meta = RULE_META[id];
      return {
        id,
        version: row.version,
        versionCount: versions.length,
        title: meta?.title ?? row.produces.replace(/_/g, " "),
        description: meta?.description ?? row.condition,
        edgeType: row.edge_type,
        trigger: row.trigger,
        guards: row.guards ?? [],
        condition: row.condition,
        gracePeriodHours: row.grace_period_hours,
        produces: row.produces,
        severity: row.severity,
        notify: row.notify,
        active: row.active,
        fired7d: fired[id] ?? 0,
      };
    });
}

export async function listRules(now = new Date()): Promise<RuleView[]> {
  const client = await createClient();
  const res = await client.from("rules").select(RULE_COLUMNS).order("id").order("version");
  if (res.error) throw new Error(`rules: ${res.error.message}`);
  const rows = (res.data ?? []) as RuleRow[];

  const since = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
  const ids = [...new Set(rows.map((row) => row.id))];
  const counts = await Promise.all(
    ids.map(async (id) => {
      const count = await client
        .from("findings")
        .select("id", { count: "exact", head: true })
        .eq("rule_id", id)
        .gte("created_at", since);
      if (count.error) throw new Error(`findings: ${count.error.message}`);
      return [id, count.count ?? 0] as const;
    }),
  );
  return latestRules(rows, Object.fromEntries(counts));
}
