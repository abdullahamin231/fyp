import { createClient } from "@/lib/supabase/server";
import { integrationStatus, resolutionLeaders, type Integration, type ResolutionLeader } from "@/lib/domain/alerts";
import { selectInChunks } from "./chunk";

/** The alerts right rail: this week's resolvers and each provider's last event. */
export async function loadAlertsRail(now = new Date()): Promise<{ leaders: ResolutionLeader[]; integrations: Integration[] }> {
  const client = await createClient();
  const since = new Date(now.getTime() - 7 * 24 * 3_600_000).toISOString();
  const [resolved, connections, deliveries] = await Promise.all([
    client.from("audit_log").select("actor_id").eq("action", "finding_resolved").gte("at", since),
    client.from("integration_connections").select("provider"),
    client.from("integration_deliveries").select("provider, received_at").gte("received_at", since).order("received_at", { ascending: false }).limit(500),
  ]);
  if (resolved.error) throw new Error(`audit_log: ${resolved.error.message}`);
  if (connections.error) throw new Error(`integration_connections: ${connections.error.message}`);
  if (deliveries.error) throw new Error(`integration_deliveries: ${deliveries.error.message}`);
  const rows = (resolved.data ?? []) as { actor_id: string }[];
  const actors = await selectInChunks<{ id: string; payload: { name?: string; email?: string } | null }>(
    "nodes (resolvers)",
    rows.map((r) => r.actor_id),
    (chunk) => client.from("nodes").select("id, payload").in("id", chunk),
  );
  const names = new Map(actors.map((a) => [a.id, a.payload?.name ?? a.payload?.email ?? "Unknown reviewer"]));
  return {
    leaders: resolutionLeaders(rows, names),
    integrations: integrationStatus(
      (connections.data ?? []) as { provider: string }[],
      (deliveries.data ?? []) as { provider: string; received_at: string }[],
      now,
    ),
  };
}
