import { createClient } from "@/lib/supabase/server";
import type { IngestCounts, IngestedEvent, IngestedReference } from "@/lib/types";

type EventRow = {
  event_id: string;
  vendor_delivery_id: string;
  source_tool: string;
  entity_type: string;
  entity_id: string;
  version: string | null;
  action: string;
  state_before: string | null;
  state_after: string | null;
  actor: string;
  occurred_at: string;
  received_at: string;
  references: unknown;
  raw_hash: string;
};

type DeliveryRow = {
  event_id: string | null;
  raw_payload: unknown;
};

const REDACTED = "[REDACTED]";
const SECRET_KEY = /token|secret|password|authorization|signature|key$/i;

function redactPayload(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactPayload);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, child]) => [
        key,
        SECRET_KEY.test(key) ? REDACTED : redactPayload(child),
      ]),
    );
  }
  return value;
}

function referencesOf(value: unknown): IngestedReference[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (item === null || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    if (
      typeof row.entityType !== "string" ||
      typeof row.entityId !== "string" ||
      typeof row.provenance !== "string"
    ) {
      return [];
    }
    return [{
      entityType: row.entityType,
      entityId: row.entityId,
      provenance: row.provenance,
      ...(typeof row.url === "string" ? { url: row.url } : {}),
    }];
  });
}

function mapEvent(row: EventRow, delivery: DeliveryRow | undefined): IngestedEvent {
  const payload = delivery?.raw_payload;
  return {
    eventId: row.event_id,
    vendorDeliveryId: row.vendor_delivery_id,
    sourceTool: row.source_tool,
    entityType: row.entity_type,
    entityId: row.entity_id,
    version: row.version,
    action: row.action,
    stateBefore: row.state_before,
    stateAfter: row.state_after,
    actor: row.actor,
    occurredAt: row.occurred_at,
    receivedAt: row.received_at,
    references: referencesOf(row.references),
    rawHash: row.raw_hash,
    rawPayload:
      payload !== undefined &&
      payload !== null &&
      typeof payload === "object" &&
      !Array.isArray(payload)
        ? redactPayload(payload) as Record<string, unknown>
        : null,
  };
}

/**
 * Reads the normalised `events` and raw `integration_deliveries` tables through
 * the session-scoped client, so RLS limits both the rows and the delivery join
 * to the signed-in user's workspaces. Secret-bearing columns are deliberately
 * not selected; raw payload values are recursively redacted before rendering.
 */
export async function listIngestedEvents(limit = 50): Promise<IngestedEvent[]> {
  const client = await createClient();
  const events = await client
    .from("events")
    .select("event_id, vendor_delivery_id, source_tool, entity_type, entity_id, version, action, state_before, state_after, actor, occurred_at, received_at, \"references\", raw_hash")
    .order("received_at", { ascending: false })
    .limit(limit);
  if (events.error) throw new Error(`events: ${events.error.message}`);

  const rows = (events.data ?? []) as EventRow[];
  const eventIds = rows.map((row) => row.event_id);
  if (eventIds.length === 0) return [];

  const deliveries = await client
    .from("integration_deliveries")
    .select("event_id, raw_payload")
    .in("event_id", eventIds);
  if (deliveries.error) throw new Error(`integration_deliveries: ${deliveries.error.message}`);

  const deliveryByEvent = new Map(
    ((deliveries.data ?? []) as DeliveryRow[]).map((delivery) => [delivery.event_id, delivery]),
  );
  return rows.map((row) => mapEvent(row, deliveryByEvent.get(row.event_id)));
}

/**
 * Reads exact counts from `integration_deliveries` and `events`, plus the
 * distinct event providers, through the session-scoped client. Counts and
 * provider names are RLS-scoped; no service-role client is used.
 */
export async function ingestCounts(): Promise<IngestCounts> {
  const client = await createClient();
  const [deliveries, events, providers] = await Promise.all([
    client.from("integration_deliveries").select("id", { count: "exact", head: true }),
    client.from("events").select("event_id", { count: "exact", head: true }),
    client.from("events").select("source_tool"),
  ]);
  if (deliveries.error) throw new Error(`integration_deliveries: ${deliveries.error.message}`);
  if (events.error) throw new Error(`events: ${events.error.message}`);
  if (providers.error) throw new Error(`events: ${providers.error.message}`);

  return {
    deliveries: deliveries.count ?? 0,
    events: events.count ?? 0,
    providers: [...new Set((providers.data ?? []).map((row) => row.source_tool as string))],
  };
}
