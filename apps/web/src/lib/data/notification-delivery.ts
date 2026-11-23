import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * In-app delivery for FR-14, in two honest stages:
 *
 *   pending    queued by routing; nothing has happened yet
 *   sent       available in the recipient's in-app inbox
 *   delivered  the recipient's inbox actually showed it (`delivered_at` set)
 *
 * Only the `in_app` channel is handled. Slack rows stay `pending` — there is no
 * Slack adapter, and marking them sent would be a lie.
 */

function fail(what: string, error: { message: string }): never {
  throw new Error(`Could not ${what}: ${error.message}`);
}

/** Make a finding's pending in-app notifications available in the inbox. Returns how many. */
export async function deliverInApp(db: SupabaseClient, findingId: string): Promise<number> {
  const { data, error } = await db.from("notifications")
    .update({ delivery_status: "sent" })
    .eq("finding_id", findingId).eq("channel", "in_app").eq("delivery_status", "pending")
    .select("id");
  if (error) fail("send in-app notifications", error);
  return (data ?? []).length;
}

/** The recipient's inbox showed these: record it. Only `sent` rows move, so a replay is harmless. */
export async function markDelivered(db: SupabaseClient, notificationIds: string[], now = new Date()): Promise<void> {
  if (notificationIds.length === 0) return;
  const { error } = await db.from("notifications")
    .update({ delivery_status: "delivered", delivered_at: now.toISOString() })
    .in("id", notificationIds).eq("delivery_status", "sent");
  if (error) fail("record delivery", error);
}

export interface InboxItem {
  id: string;
  findingId: string;
  annotation: string;
  severity: string;
  createdAt: string;
  /** `sent` = not yet shown to the recipient. */
  status: "sent" | "delivered";
}

const INBOX_LIMIT = 20;

/**
 * The signed-in user's in-app notifications, newest finding first. The Person
 * node is found by its stored auth user id — an id, never an email or a name.
 */
export async function inboxFor(db: SupabaseClient, userId: string): Promise<InboxItem[]> {
  const people = await db.from("nodes").select("id").eq("type", "Person").eq("payload->>userId", userId);
  if (people.error) fail("load your person record", people.error);
  const personIds = ((people.data ?? []) as { id: string }[]).map((row) => row.id);
  if (personIds.length === 0) return [];

  const rows = await db.from("notifications").select("id, finding_id, delivery_status")
    .in("recipient_id", personIds).eq("channel", "in_app").in("delivery_status", ["sent", "delivered"]);
  if (rows.error) fail("load notifications", rows.error);
  const notifications = (rows.data ?? []) as { id: string; finding_id: string; delivery_status: "sent" | "delivered" }[];
  if (notifications.length === 0) return [];

  const findings = await db.from("findings").select("id, annotation, severity, created_at")
    .in("id", [...new Set(notifications.map((row) => row.finding_id))]);
  if (findings.error) fail("load findings", findings.error);
  const byId = new Map(((findings.data ?? []) as { id: string; annotation: string; severity: string; created_at: string }[]).map((f) => [f.id, f]));

  return notifications
    .flatMap((row) => {
      const finding = byId.get(row.finding_id);
      return finding
        ? [{ id: row.id, findingId: row.finding_id, annotation: finding.annotation, severity: finding.severity, createdAt: finding.created_at, status: row.delivery_status }]
        : [];
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, INBOX_LIMIT);
}
