import { admin } from "@/lib/supabase/admin";
import { figmaAdapter } from "./adapters";
import { rawHash } from "./common";
import { recordCheckpoint } from "./checkpoints";
import { persistDelivery } from "./server";
import { getProviderToken, ReconnectRequired } from "./tokens";
import { projectFigmaFile } from "./figma-design";
import { syncFigmaDesign, type DesignSyncResult } from "./figma-sync";

type WatchedFile = {
  id: string;
  file_key: string;
  file_name: string | null;
  last_seen_version_id: string | null;
  last_polled_at: string | null;
  last_poll_error: string | null;
};

type FigmaVersion = {
  id: string;
  created_at: string;
  label?: string | null;
  description?: string | null;
  user?: { handle?: string | null } | null;
};

export type WatchedFileStatus = WatchedFile;

export type FilePollResult = {
  fileKey: string;
  status: "up_to_date" | "ingested" | "baselined" | "error";
  versionsIngested: number;
  newestVersionId: string | null;
  design?: DesignSyncResult;
  error?: string;
};

async function watchedFiles(workspaceId: string): Promise<WatchedFile[]> {
  const { data, error } = await admin()
    .from("figma_watched_files")
    .select("id, file_key, file_name, last_seen_version_id, last_polled_at, last_poll_error")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Could not load Figma watched files: ${error.message}`);
  return (data ?? []) as WatchedFile[];
}

export async function listFigmaWatchedFiles(workspaceId: string): Promise<WatchedFileStatus[]> {
  return watchedFiles(workspaceId);
}

export async function addFigmaWatchedFile(input: {
  workspaceId: string;
  userId: string;
  fileKey: string;
}): Promise<WatchedFileStatus> {
  const fileKey = input.fileKey.trim();
  if (!fileKey) throw new Error("A Figma file key is required");
  const { data, error } = await admin()
    .from("figma_watched_files")
    .insert({ workspace_id: input.workspaceId, file_key: fileKey, created_by: input.userId })
    .select("id, file_key, file_name, last_seen_version_id, last_polled_at, last_poll_error")
    .single();
  if (error) throw new Error(`Could not watch Figma file: ${error.message}`);
  return data as WatchedFileStatus;
}

export async function removeFigmaWatchedFile(workspaceId: string, id: string): Promise<void> {
  const { error } = await admin().from("figma_watched_files").delete().eq("workspace_id", workspaceId).eq("id", id);
  if (error) throw new Error(`Could not remove Figma watched file: ${error.message}`);
}

function responseError(status: number, body: unknown): string {
  const message = body && typeof body === "object" && "message" in body && typeof body.message === "string"
    ? body.message
    : "Figma returned an error";
  return `Figma request failed (${status}): ${message}`;
}

const FIGMA = "https://api.figma.com/v1";
const MAX_VERSION_PAGES = 10;

async function figmaGet(token: string, url: string): Promise<Record<string, unknown>> {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(responseError(response.status, body));
  if (!body || typeof body !== "object") throw new Error("Figma returned a non-JSON body");
  return body as Record<string, unknown>;
}

/**
 * Versions newer than the mark, newest first, following `pagination.next_page`
 * until the mark appears. With no mark, only the first page is read (the
 * newest version is all a baseline needs).
 */
async function versionsSince(token: string, fileKey: string, mark: string | null): Promise<{ versions: FigmaVersion[]; foundMark: boolean }> {
  const out: FigmaVersion[] = [];
  let url: string | null = `${FIGMA}/files/${encodeURIComponent(fileKey)}/versions`;
  for (let page = 0; url && page < MAX_VERSION_PAGES; page++) {
    const body = await figmaGet(token, url);
    if (!Array.isArray(body.versions)) throw new Error("Figma versions response did not contain a versions array");
    for (const version of body.versions as Partial<FigmaVersion>[]) {
      if (typeof version.id !== "string" || typeof version.created_at !== "string") continue;
      if (mark && version.id === mark) return { versions: out, foundMark: true };
      out.push(version as FigmaVersion);
    }
    if (!mark) break;
    const next = (body.pagination as { next_page?: unknown } | undefined)?.next_page;
    url = typeof next === "string" && next.startsWith(FIGMA) ? next : null;
  }
  return { versions: out, foundMark: mark === null };
}

/** Fetch the file at its current version and write its design nodes. */
async function projectDesign(workspaceId: string, token: string, fileKey: string, versionId: string, eventId: string | null) {
  const file = await figmaGet(token, `${FIGMA}/files/${encodeURIComponent(fileKey)}?depth=3`);
  const sync = await syncFigmaDesign(admin(), workspaceId, fileKey, projectFigmaFile(fileKey, file, versionId), eventId);
  return { fileName: typeof file.name === "string" ? file.name : null, sync };
}

async function pollFile(workspaceId: string, token: string, file: WatchedFile): Promise<FilePollResult> {
  const now = new Date().toISOString();
  try {
    const { versions, foundMark } = await versionsSince(token, file.file_key, file.last_seen_version_id);

    if (!file.last_seen_version_id || !foundMark) {
      if (!versions[0]) throw new Error("Figma returned no versions to use as a high-water mark");
      // First poll, or the mark fell out of the history Figma still returns:
      // baseline at the newest version rather than import (or loop over) history.
      const design = await projectDesign(workspaceId, token, file.file_key, versions[0].id, null);
      const { error } = await admin().from("figma_watched_files").update({
        last_seen_version_id: versions[0].id,
        file_name: design.fileName,
        last_polled_at: now,
        last_poll_error: null,
      }).eq("id", file.id).eq("workspace_id", workspaceId);
      if (error) throw new Error(`Could not baseline Figma file: ${error.message}`);
      return { fileKey: file.file_key, status: "baselined", versionsIngested: 0, newestVersionId: versions[0].id, design: design.sync };
    }

    const newer = versions;
    const receivedAt = new Date();
    const ingestedEventIds: string[] = [];
    for (const version of [...newer].reverse()) {
      const payload = {
        event_type: "FILE_VERSION_UPDATE",
        file_key: file.file_key,
        version_id: version.id,
        id: `figma:poll:${file.file_key}:${version.id}`,
        timestamp: version.created_at,
        user: { handle: version.user?.handle ?? null },
        label: version.label ?? null,
        description: version.description ?? null,
      };
      // Polling calls Figma directly, so there is no inbound request to verify.
      const events = figmaAdapter.normalise(payload, receivedAt, new Headers());
      const event = events[0];
      await persistDelivery({
        workspaceId,
        provider: "figma",
        deliveryId: payload.id,
        eventId: event?.eventId ?? null,
        payload,
      });
      if (event) {
        ingestedEventIds.push(event.eventId);
        const { error } = await admin().from("events").upsert({
          event_id: event.eventId,
          vendor_delivery_id: event.vendorDeliveryId,
          workspace_id: workspaceId,
          source_tool: "figma",
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
          raw_hash: rawHash(Buffer.from(JSON.stringify(payload))),
          schema_version: 1,
        }, { onConflict: "event_id", ignoreDuplicates: true });
        if (error) throw new Error(`Could not persist normalized Figma event: ${error.message}`);
      }
    }

    const newestVersionId = newer.length > 0 ? newer[0].id : file.last_seen_version_id;
    const design = newer.length > 0
      ? await projectDesign(workspaceId, token, file.file_key, newestVersionId, ingestedEventIds[ingestedEventIds.length - 1] ?? null)
      : null;
    const { error } = await admin().from("figma_watched_files").update({
      last_seen_version_id: newestVersionId,
      ...(design ? { file_name: design.fileName } : {}),
      last_polled_at: now,
      last_poll_error: null,
    }).eq("id", file.id).eq("workspace_id", workspaceId);
    if (error) throw new Error(`Could not update Figma poll state: ${error.message}`);
    // A checkpoint per file: polling is an ingestion source like any other, and
    // freshness (§8.4) is computed from these rows, not from webhook deliveries.
    if (newer.length > 0 && ingestedEventIds.length > 0) {
      await recordCheckpoint(admin(), {
        workspaceId,
        provider: "figma",
        resource: { provider: "figma", fileKey: file.file_key },
        // The normalised event id — `checkpoints.last_event_id` references
        // `events(event_id)`, so it must name a row that exists.
        eventId: ingestedEventIds[ingestedEventIds.length - 1]!,
        eventTime: newer[0]!.created_at,
      });
    }
    return {
      fileKey: file.file_key,
      status: newer.length > 0 ? "ingested" : "up_to_date",
      versionsIngested: newer.length,
      newestVersionId,
      ...(design ? { design: design.sync } : {}),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Figma polling failed";
    await admin().from("figma_watched_files").update({
      last_polled_at: now,
      last_poll_error: message,
    }).eq("id", file.id).eq("workspace_id", workspaceId);
    return { fileKey: file.file_key, status: "error", versionsIngested: 0, newestVersionId: file.last_seen_version_id, error: message };
  }
}

/**
 * Polls sequentially to respect Figma rate limits. Polling has interval-based
 * latency, cannot observe DEV_MODE_STATUS_UPDATE or file deletion, does not
 * verify webhook signatures, and stores events without projecting design nodes.
 */
export async function pollFigmaWorkspace(workspaceId: string): Promise<FilePollResult[]> {
  const files = await watchedFiles(workspaceId);
  let token: string;
  try {
    token = (await getProviderToken(workspaceId, "figma")).accessToken;
  } catch (cause) {
    if (!(cause instanceof ReconnectRequired)) throw cause;
    const error = cause.message;
    const now = new Date().toISOString();
    const results: FilePollResult[] = [];
    for (const file of files) {
      await admin().from("figma_watched_files").update({ last_polled_at: now, last_poll_error: error })
        .eq("id", file.id).eq("workspace_id", workspaceId);
      results.push({ fileKey: file.file_key, status: "error", versionsIngested: 0, newestVersionId: file.last_seen_version_id, error });
    }
    return results;
  }
  const results: FilePollResult[] = [];
  for (const file of files) results.push(await pollFile(workspaceId, token, file));
  return results;
}

/**
 * Every workspace with at least one watched file — what the scheduled poll
 * iterates. Service-role read (RLS has no policy for this join), used only by
 * the cron route, which is itself authenticated.
 */
export async function figmaWatchedWorkspaces(): Promise<{ id: string; slug: string; files: number }[]> {
  const { data, error } = await admin()
    .from("figma_watched_files")
    .select("workspace_id, workspaces(slug)")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Could not load watched Figma workspaces: ${error.message}`);
  const rows = (data ?? []) as unknown as Array<{
    workspace_id: string;
    workspaces: { slug: string } | { slug: string }[] | null;
  }>;
  const counts = new Map<string, { id: string; slug: string; files: number }>();
  for (const row of rows) {
    // supabase-js types an embedded to-one resource as an array; handle both.
    const embedded = row.workspaces;
    const slug = (Array.isArray(embedded) ? embedded[0]?.slug : embedded?.slug) ?? row.workspace_id;
    const entry = counts.get(row.workspace_id) ?? { id: row.workspace_id, slug, files: 0 };
    entry.files += 1;
    counts.set(row.workspace_id, entry);
  }
  return [...counts.values()];
}
