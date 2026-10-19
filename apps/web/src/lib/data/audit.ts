import { createHash } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import {
  canonicalJson,
  toAuditActor,
  toAuditEvent,
  type AuditActor,
  type AuditActorRow,
  type AuditEvent,
  type AuditFindingRow,
  type AuditRow,
} from "@/lib/domain/audit";
import type { ActivityEvent } from "@/lib/types";
import { selectInChunks } from "./chunk";

export interface AuditTrail {
  events: AuditEvent[];
  actors: AuditActor[];
  /** Every record the caller may read, not just the loaded page. */
  total: number;
}

const PAGE = 500;

/**
 * The newest audit records across the caller's workspaces (RLS scopes the
 * read), or only those about one finding.
 */
export async function loadAuditTrail(options: { findingId?: string; now?: Date } = {}): Promise<AuditTrail> {
  const now = options.now ?? new Date();
  const client = await createClient();
  let query = client
    .from("audit_log")
    .select("id, finding_id, actor_id, action, reason, evidence_snapshot, at", { count: "exact" });
  if (options.findingId) query = query.eq("finding_id", options.findingId);
  const res = await query.order("at", { ascending: false }).limit(PAGE);
  if (res.error) throw new Error(`audit_log: ${res.error.message}`);
  const rows = (res.data ?? []) as AuditRow[];

  const [actorRows, findingRows] = await Promise.all([
    selectInChunks<AuditActorRow>("nodes (audit actors)", rows.map((r) => r.actor_id), (chunk) =>
      client.from("nodes").select("id, external_id, payload").in("id", chunk),
    ),
    selectInChunks<{ id: string; annotation: string | null; subject_node_id: string }>(
      "findings (audit)",
      rows.flatMap((r) => (r.finding_id ? [r.finding_id] : [])),
      (chunk) => client.from("findings").select("id, annotation, subject_node_id").in("id", chunk),
    ),
  ]);
  const subjects = await selectInChunks<{ id: string; type: string; external_id: string }>(
    "nodes (audit subjects)",
    findingRows.map((f) => f.subject_node_id),
    (chunk) => client.from("nodes").select("id, type, external_id").in("id", chunk),
  );
  const subjectById = new Map(subjects.map((n) => [n.id, n]));

  const findings = new Map<string, AuditFindingRow>(
    findingRows.map((f) => [f.id, { id: f.id, annotation: f.annotation, subject: subjectById.get(f.subject_node_id) ?? null }]),
  );
  const digest = (row: AuditRow) => createHash("sha256").update(canonicalJson(row)).digest("hex");
  return {
    events: rows.map((row) => toAuditEvent(row, row.finding_id ? findings.get(row.finding_id) : undefined, digest(row), now)),
    actors: actorRows.map(toAuditActor),
    total: res.count ?? rows.length,
  };
}

/** A finding's reviewer decisions, oldest first, as conflict-detail timeline events. */
export async function loadFindingTimeline(findingId: string): Promise<ActivityEvent[]> {
  const trail = await loadAuditTrail({ findingId });
  const names = new Map(trail.actors.map((a) => [a.id, a.name]));
  return trail.events
    .map((event) => ({
      id: event.id,
      kind: "human" as const,
      tool: event.artifact.tool,
      title: event.action.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase()),
      detail: event.reason || "No reason given",
      actor: names.get(event.actorId) ?? "unknown reviewer",
      timestamp: String(event.payload.at),
      findingId,
    }))
    .reverse();
}
