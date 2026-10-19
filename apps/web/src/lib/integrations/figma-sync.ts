import type { SupabaseClient } from "@supabase/supabase-js";
import { asRecord } from "./common";
import { designArtifactId, designConstraintId, type DesignNodeSpec, type FigmaRef } from "./figma-design";

/**
 * Writes the projected design nodes for one file version and links tickets
 * that point at them. Both steps converge: running either twice changes
 * nothing, and the order in which a ticket and its design arrive does not
 * matter, because linking runs after each.
 */

export interface DesignSyncResult {
  upserted: number;
  retired: number;
  linked: number;
}

async function insertEdge(db: SupabaseClient, edge: Record<string, unknown>): Promise<boolean> {
  const { error } = await db.from("edges").insert(edge);
  if (!error) return true;
  if (error.code === "23505") return false;
  throw new Error(`edges: ${error.message}`);
}

export async function syncFigmaDesign(
  db: SupabaseClient,
  workspaceId: string,
  fileKey: string,
  specs: DesignNodeSpec[],
  eventId: string | null,
): Promise<DesignSyncResult> {
  const now = new Date().toISOString();
  const ids = new Map<string, string>();
  for (const spec of specs) {
    const { data, error } = await db
      .from("nodes")
      .upsert(
        {
          workspace_id: workspaceId,
          type: spec.type,
          external_id: spec.externalId,
          version: spec.version,
          status: null,
          last_modified: now,
          valid_to: null,
          payload: spec.payload,
        },
        { onConflict: "workspace_id,type,external_id" },
      )
      .select("id")
      .single();
    if (error) throw new Error(`Could not save ${spec.externalId}: ${error.message}`);
    ids.set(spec.externalId, (data as { id: string }).id);
    if (eventId) {
      const snap = await db.from("artifact_snapshots").upsert(
        {
          node_id: (data as { id: string }).id,
          source_event_id: eventId,
          version: spec.version,
          content_hash: String((spec.payload.slotItems as { contentSha256?: string }[] | undefined)?.[0]?.contentSha256 ?? spec.version),
          content: spec.payload,
        },
        { onConflict: "node_id,version", ignoreDuplicates: true },
      );
      if (snap.error) throw new Error(`artifact_snapshots: ${snap.error.message}`);
    }
  }

  const artifactId = ids.get(designArtifactId(fileKey))!;
  for (const spec of specs) {
    if (spec.type !== "DesignConstraint") continue;
    await insertEdge(db, {
      from_id: ids.get(spec.externalId),
      to_id: artifactId,
      type: "PART_OF",
      source_class: "observed",
      confidence: 1,
      resolver: "figma:file",
    });
  }

  const current = await db
    .from("nodes")
    .select("id, external_id")
    .eq("workspace_id", workspaceId)
    .eq("type", "DesignConstraint")
    .is("valid_to", null)
    .like("external_id", `figma:${fileKey}:%`);
  if (current.error) throw new Error(`nodes: ${current.error.message}`);
  const gone = ((current.data ?? []) as { id: string; external_id: string }[]).filter((row) => !ids.has(row.external_id));
  for (const row of gone) {
    const { error } = await db.from("nodes").update({ valid_to: now, status: "retired", last_modified: now }).eq("id", row.id);
    if (error) throw new Error(`nodes (retire ${row.external_id}): ${error.message}`);
  }

  return { upserted: specs.length, retired: gone.length, linked: await linkFigmaRefs(db, workspaceId) };
}

/**
 * Tickets carry the Figma links found in them (`payload.figmaRefs`, set by
 * Jira ingestion). Each becomes a design -CONSTRAINS-> ticket edge once the
 * design node exists: the frame named by `node-id`, or the whole file.
 */
export async function linkFigmaRefs(db: SupabaseClient, workspaceId: string): Promise<number> {
  const tickets = await db.from("nodes").select("id, payload").eq("workspace_id", workspaceId).eq("type", "Ticket").is("valid_to", null);
  if (tickets.error) throw new Error(`nodes (tickets): ${tickets.error.message}`);
  const wanted = ((tickets.data ?? []) as { id: string; payload: Record<string, unknown> | null }[]).flatMap((ticket) => {
    const refs = asRecord(ticket.payload).figmaRefs;
    return (Array.isArray(refs) ? (refs as FigmaRef[]) : []).map((ref) => ({
      ticketId: ticket.id,
      designExternalId: ref.nodeId ? designConstraintId(ref.fileKey, ref.nodeId) : designArtifactId(ref.fileKey),
    }));
  });
  if (wanted.length === 0) return 0;

  const designs = await db
    .from("nodes")
    .select("id, external_id")
    .eq("workspace_id", workspaceId)
    .in("type", ["DesignArtifact", "DesignConstraint"])
    .is("valid_to", null)
    .in("external_id", [...new Set(wanted.map((w) => w.designExternalId))]);
  if (designs.error) throw new Error(`nodes (designs): ${designs.error.message}`);
  const designId = new Map(((designs.data ?? []) as { id: string; external_id: string }[]).map((d) => [d.external_id, d.id]));

  let linked = 0;
  for (const want of wanted) {
    const from = designId.get(want.designExternalId);
    if (!from) continue;
    const inserted = await insertEdge(db, {
      from_id: from,
      to_id: want.ticketId,
      type: "CONSTRAINS",
      // `derived` is system-confirmed: the ticket's own text names this design.
      source_class: "derived",
      confidence: 1,
      resolver: "figma:url-in-ticket",
    });
    if (inserted) linked += 1;
  }
  return linked;
}

/**
 * Files a ticket names that no one watches yet start being watched, so the
 * design reaches the graph without a manual step. Needs a Figma connection;
 * the connection's owner is recorded as the watcher.
 */
export async function watchReferencedFiles(db: SupabaseClient, workspaceId: string, refs: FigmaRef[]): Promise<string[]> {
  const keys = [...new Set(refs.map((ref) => ref.fileKey))];
  if (keys.length === 0) return [];
  const connection = await db.from("integration_connections").select("created_by").eq("workspace_id", workspaceId).eq("provider", "figma").maybeSingle();
  if (connection.error) throw new Error(`integration_connections: ${connection.error.message}`);
  const owner = (connection.data as { created_by: string } | null)?.created_by;
  if (!owner) return [];
  const watched = await db.from("figma_watched_files").select("file_key").eq("workspace_id", workspaceId).in("file_key", keys);
  if (watched.error) throw new Error(`figma_watched_files: ${watched.error.message}`);
  const have = new Set(((watched.data ?? []) as { file_key: string }[]).map((row) => row.file_key));
  const added = keys.filter((key) => !have.has(key));
  for (const key of added) {
    const { error } = await db.from("figma_watched_files").insert({ workspace_id: workspaceId, file_key: key, created_by: owner });
    if (error && error.code !== "23505") throw new Error(`figma_watched_files: ${error.message}`);
  }
  return added;
}
