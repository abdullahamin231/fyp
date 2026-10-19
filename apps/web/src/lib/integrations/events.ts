import type { SupabaseClient } from "@supabase/supabase-js";
import type { NormalizedIntegrationEvent } from "./types";

/** Event IDs are globally unique; vendor deliveries are unique per workspace. */
export const workspaceEventId = (workspaceId: string, eventId: string) => `${workspaceId}:${eventId}`;

/** Replays keep the ID of an immutable event written before workspace scoping. */
export async function githubDeliveryEventId(db: SupabaseClient, workspaceId: string, deliveryId: string): Promise<string> {
  const { data, error } = await db.from("events").select("event_id")
    .eq("workspace_id", workspaceId).eq("source_tool", "github").eq("vendor_delivery_id", deliveryId).maybeSingle();
  if (error) throw new Error(`Could not load GitHub event: ${error.message}`);
  return data?.event_id ?? workspaceEventId(workspaceId, `github:${deliveryId}`);
}

/** Return the persisted identities, including on replay of a legacy event. */
export async function upsertNormalizedEvents(
  db: SupabaseClient,
  workspaceId: string,
  provider: string,
  events: NormalizedIntegrationEvent[],
  hash: string,
): Promise<NormalizedIntegrationEvent[]> {
  if (events.length === 0) return [];
  const { error } = await db.from("events").upsert(
    events.map((event) => ({
      event_id: workspaceEventId(workspaceId, event.eventId),
      vendor_delivery_id: event.vendorDeliveryId,
      workspace_id: workspaceId,
      source_tool: provider,
      entity_type: event.entityType,
      entity_id: event.entityId,
      version: event.version,
      action: event.action,
      state_before: event.stateBefore,
      state_after: event.stateAfter,
      actor: event.actor,
      occurred_at: event.occurredAt,
      received_at: event.receivedAt,
      references: event.references,
      raw_hash: hash,
      schema_version: 1,
    })),
    { onConflict: "workspace_id,source_tool,vendor_delivery_id", ignoreDuplicates: true },
  );
  if (error) throw new Error(`Could not persist normalized event: ${error.message}`);

  const stored = await db.from("events").select("event_id, vendor_delivery_id")
    .eq("workspace_id", workspaceId).eq("source_tool", provider)
    .in("vendor_delivery_id", events.map((event) => event.vendorDeliveryId));
  if (stored.error) throw new Error(`Could not load persisted events: ${stored.error.message}`);
  const ids = new Map((stored.data as { event_id: string; vendor_delivery_id: string }[]).map((row) => [row.vendor_delivery_id, row.event_id]));
  return events.map((event) => {
    const eventId = ids.get(event.vendorDeliveryId);
    if (!eventId) throw new Error(`Missing persisted delivery ${event.vendorDeliveryId}`);
    return { ...event, eventId };
  });
}
