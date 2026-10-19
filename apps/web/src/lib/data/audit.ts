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
import { selectInChunks } from "./chunk";

export interface AuditTrail {
  events: AuditEvent[];
  actors: AuditActor[];
  /** Every record the caller may read, not just the loaded page. */
  total: number;
}

const PAGE = 500;

/** The newest audit records across the caller's workspaces (RLS scopes the read). */
export async function loadAuditTrail(now = new Date()): Promise<AuditTrail> {
  const client = await createClient();
  const res = await client
    .from("audit_log")
    .select("id, finding_id, actor_id, action, reason, evidence_snapshot, at", { count: "exact" })
    .order("at", { ascending: false })
    .limit(PAGE);
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
