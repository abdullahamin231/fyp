import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificationChannel, PersonRole } from "@unify/contracts";
import { deliverInApp } from "./notification-delivery";
import {
  MAX_HOPS,
  resolveNotifySet,
  unboundPersonIds,
  type NodeEdge,
  type NotifyResolution,
  type NotifyUser,
  type RoleEdge,
  type RoleEdgeType,
} from "@/lib/domain/notify-set";

const ROLE_EDGES: readonly string[] = ["OWNS", "ASSIGNED_TO", "WATCHES"];
const ALL_CHANNELS: NotificationChannel[] = ["slack", "in_app"];

export interface RouteRule {
  roles: PersonRole[];
  channels: NotificationChannel[];
  hops: number;
}

interface EdgeRow {
  from_id: string;
  to_id: string;
  type: string;
}

function fail(what: string, error: { message: string } | null): never {
  throw new Error(`Could not ${what}: ${error?.message ?? "unknown error"}`);
}

/** Active edges touching any of `ids`. */
async function edgesAround(db: SupabaseClient, ids: string[]): Promise<EdgeRow[]> {
  const list = `(${ids.join(",")})`;
  const { data, error } = await db.from("edges").select("from_id, to_id, type")
    .is("valid_to", null).eq("link_state", "active")
    .or(`from_id.in.${list},to_id.in.${list}`);
  if (error) fail("load edges", error);
  return (data ?? []) as EdgeRow[];
}

/** Bounded expansion over structural edges: one query per hop, never the whole graph. */
async function neighbourhood(db: SupabaseClient, nodeId: string, hops: number): Promise<{ seen: Set<string>; nodeEdges: NodeEdge[] }> {
  const nodeEdges: NodeEdge[] = [];
  const seen = new Set<string>([nodeId]);
  let frontier = [nodeId];
  for (let depth = 0; depth < hops && frontier.length > 0; depth++) {
    const next = new Set<string>();
    for (const edge of await edgesAround(db, frontier)) {
      if (ROLE_EDGES.includes(edge.type)) continue;
      nodeEdges.push({ from: edge.from_id, to: edge.to_id });
      for (const id of [edge.from_id, edge.to_id]) if (!seen.has(id)) { seen.add(id); next.add(id); }
    }
    frontier = [...next];
  }
  return { seen, nodeEdges };
}

/**
 * Resolve and record the routing of one finding (FR-14): load only the
 * neighbourhood the hop bound allows, resolve the notify set, then either queue
 * a notification per recipient channel or record the unroutable outcome.
 * Idempotent per finding: returns null when it was already routed.
 *
 * `retry` re-resolves a finding recorded as unroutable (its edges may have
 * arrived since); a finding that already has notifications is never re-routed.
 */
export async function routeFinding(
  db: SupabaseClient,
  findingId: string,
  rule: RouteRule,
  options: { retry?: boolean } = {},
): Promise<NotifyResolution | null> {
  const hops = Math.min(Math.max(Math.trunc(rule.hops), 1), MAX_HOPS);

  // Already routed (a replay after a partial failure): nothing to do, nothing to duplicate.
  const [queued, recorded] = await Promise.all([
    db.from("notifications").select("id").eq("finding_id", findingId).limit(1),
    db.from("routing_outcomes").select("id").eq("finding_id", findingId).limit(1),
  ]);
  if (queued.error) fail("check notifications", queued.error);
  if (recorded.error) fail("check routing outcomes", recorded.error);
  if ((queued.data?.length ?? 0) > 0 || ((recorded.data?.length ?? 0) > 0 && !options.retry)) return null;

  const finding = await db.from("findings").select("subject_node_id").eq("id", findingId).single();
  if (finding.error || !finding.data) fail("load finding", finding.error);
  const nodeId = (finding.data as { subject_node_id: string }).subject_node_id;

  const { seen, nodeEdges } = await neighbourhood(db, nodeId, hops);

  const roleRows = (await edgesAround(db, [...seen])).filter((edge) => ROLE_EDGES.includes(edge.type) && seen.has(edge.to_id));
  const roleEdges: RoleEdge[] = roleRows.map((edge) => ({ type: edge.type as RoleEdgeType, userId: edge.from_id, nodeId: edge.to_id }));

  let users: NotifyUser[] = [];
  const userIds = [...new Set(roleEdges.map((edge) => edge.userId))];
  if (userIds.length > 0) {
    const people = await db.from("nodes").select("id, payload").eq("type", "Person").in("id", userIds);
    if (people.error) fail("load people", people.error);
    const identities = await db.from("person_identities").select("person_node_id, source_class").in("person_node_id", userIds);
    if (identities.error) fail("load identities", identities.error);
    // The role edge stays (the account really is the assignee); it just cannot be a recipient.
    const unbound = unboundPersonIds((identities.data ?? []) as { person_node_id: string; source_class: string }[]);
    users = ((people.data ?? []) as { id: string; payload: { role?: PersonRole; muted_channels?: NotificationChannel[] } | null }[])
      .filter((row) => row.payload?.role && !unbound.has(row.id))
      .map((row) => ({
        id: row.id,
        role: row.payload!.role!,
        channels: ALL_CHANNELS.filter((channel) => !row.payload!.muted_channels?.includes(channel)),
      }));
  }

  const resolution = resolveNotifySet({ nodeId, roles: rule.roles, channels: rule.channels, hops, roleEdges, nodeEdges, users });

  if (resolution.outcome === "unroutable") {
    const { error } = await db.from("routing_outcomes").upsert(
      { finding_id: findingId, node_id: nodeId, outcome: "unroutable", reason: resolution.reason, hops },
      { onConflict: "finding_id" },
    );
    if (error) fail("record unroutable outcome", error);
    return resolution;
  }

  const { error } = await db.from("notifications").insert(
    resolution.recipients.flatMap((recipient) =>
      recipient.channels.map((channel) => ({ finding_id: findingId, recipient_id: recipient.userId, channel, delivery_status: "pending" })),
    ),
  );
  if (error) fail("queue notifications", error);
  // The finding found its recipients: the earlier unroutable record no longer describes it.
  const cleared = await db.from("routing_outcomes").delete().eq("finding_id", findingId);
  if (cleared.error) fail("clear the unroutable outcome", cleared.error);
  return resolution;
}

/** Route a finding and, when it reaches someone, make its in-app notifications available. */
export async function routeAndDeliver(
  db: SupabaseClient,
  findingId: string,
  rule: RouteRule,
  options: { retry?: boolean } = {},
): Promise<NotifyResolution | null> {
  const resolution = await routeFinding(db, findingId, rule, options);
  if (resolution?.outcome === "routed") await deliverInApp(db, findingId);
  return resolution;
}

/**
 * Role edges just appeared near `nodeId`: give every open finding recorded as
 * unroutable within reach another chance. Returns how many now route.
 */
export async function rerouteUnroutableAround(db: SupabaseClient, nodeId: string): Promise<number> {
  const { seen } = await neighbourhood(db, nodeId, MAX_HOPS);
  const outcomes = await db.from("routing_outcomes").select("finding_id").in("node_id", [...seen]);
  if (outcomes.error) fail("load unroutable findings", outcomes.error);
  let routed = 0;
  for (const { finding_id } of (outcomes.data ?? []) as { finding_id: string }[]) {
    const finding = await db.from("findings").select("rule_id, rule_version, state").eq("id", finding_id).maybeSingle();
    if (finding.error) fail("load finding", finding.error);
    const row = finding.data as { rule_id: string | null; rule_version: number | null; state: string } | null;
    if (!row?.rule_id || row.rule_version === null || row.state !== "open") continue;
    const rule = await db.from("rules").select("notify").eq("id", row.rule_id).eq("version", row.rule_version).maybeSingle();
    if (rule.error) fail("load rule", rule.error);
    const notify = (rule.data as { notify: RouteRule } | null)?.notify;
    if (!notify) continue;
    if ((await routeAndDeliver(db, finding_id, notify, { retry: true }))?.outcome === "routed") routed++;
  }
  return routed;
}
