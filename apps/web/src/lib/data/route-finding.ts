import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificationChannel, PersonRole } from "@unify/contracts";
import {
  MAX_HOPS,
  resolveNotifySet,
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

/**
 * Resolve and record the routing of one finding (FR-14): load only the
 * neighbourhood the hop bound allows, resolve the notify set, then either queue
 * a notification per recipient channel or record the unroutable outcome.
 * Idempotent per finding: returns null when it was already routed.
 */
export async function routeFinding(db: SupabaseClient, findingId: string, rule: RouteRule): Promise<NotifyResolution | null> {
  const hops = Math.min(Math.max(Math.trunc(rule.hops), 1), MAX_HOPS);

  // Already routed (a replay after a partial failure): nothing to do, nothing to duplicate.
  const [queued, recorded] = await Promise.all([
    db.from("notifications").select("id").eq("finding_id", findingId).limit(1),
    db.from("routing_outcomes").select("id").eq("finding_id", findingId).limit(1),
  ]);
  if (queued.error) fail("check notifications", queued.error);
  if (recorded.error) fail("check routing outcomes", recorded.error);
  if ((queued.data?.length ?? 0) > 0 || (recorded.data?.length ?? 0) > 0) return null;

  const finding = await db.from("findings").select("subject_node_id").eq("id", findingId).single();
  if (finding.error || !finding.data) fail("load finding", finding.error);
  const nodeId = (finding.data as { subject_node_id: string }).subject_node_id;

  // Bounded expansion over structural edges: one query per hop, never the whole graph.
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

  const roleRows = (await edgesAround(db, [...seen])).filter((edge) => ROLE_EDGES.includes(edge.type) && seen.has(edge.to_id));
  const roleEdges: RoleEdge[] = roleRows.map((edge) => ({ type: edge.type as RoleEdgeType, userId: edge.from_id, nodeId: edge.to_id }));

  let users: NotifyUser[] = [];
  const userIds = [...new Set(roleEdges.map((edge) => edge.userId))];
  if (userIds.length > 0) {
    const people = await db.from("nodes").select("id, payload").eq("type", "Person").in("id", userIds);
    if (people.error) fail("load people", people.error);
    users = ((people.data ?? []) as { id: string; payload: { role?: PersonRole; muted_channels?: NotificationChannel[] } | null }[])
      .filter((row) => row.payload?.role)
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
  return resolution;
}
