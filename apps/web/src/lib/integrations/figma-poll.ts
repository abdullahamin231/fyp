import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { figmaAdapter } from "./adapters";
import { rawHash } from "./common";
import { connectionAccessToken, persistDelivery } from "./server";

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
  error?: string;
};

function admin() {
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) is required for Figma polling");
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

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
  return `Figma versions request failed (${status}): ${message}`;
}

async function pollFile(workspaceId: string, token: string, file: WatchedFile): Promise<FilePollResult> {
  const now = new Date().toISOString();
  try {
    const response = await fetch(`https://api.figma.com/v1/files/${encodeURIComponent(file.file_key)}/versions`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) throw new Error(responseError(response.status, body));
    if (!body || typeof body !== "object" || !Array.isArray((body as { versions?: unknown }).versions)) {
      throw new Error("Figma versions response did not contain a versions array");
    }
    const versions = (body as { versions: unknown[] }).versions.filter((version): version is FigmaVersion => {
      if (!version || typeof version !== "object") return false;
      const candidate = version as Partial<FigmaVersion>;
      return typeof candidate.id === "string" && typeof candidate.created_at === "string";
    });
    if (!versions[0]) throw new Error("Figma returned no versions to use as a high-water mark");

    if (!file.last_seen_version_id) {
      const { error } = await admin().from("figma_watched_files").update({
        last_seen_version_id: versions[0].id,
        last_polled_at: now,
        last_poll_error: null,
      }).eq("id", file.id).eq("workspace_id", workspaceId);
      if (error) throw new Error(`Could not baseline Figma file: ${error.message}`);
      // Baseline deliberately avoids ingesting the file's entire existing history.
      return { fileKey: file.file_key, status: "baselined", versionsIngested: 0, newestVersionId: versions[0].id };
    }

    const newer: FigmaVersion[] = [];
    let foundHighWaterMark = false;
    for (const version of versions) {
      if (version.id === file.last_seen_version_id) {
        foundHighWaterMark = true;
        break;
      }
      newer.push(version);
    }
    if (!foundHighWaterMark) {
      throw new Error("Figma high-water mark was not found in the returned versions page");
    }

    const receivedAt = new Date();
    for (const version of newer.reverse()) {
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
    const { error } = await admin().from("figma_watched_files").update({
      last_seen_version_id: newestVersionId,
      last_polled_at: now,
      last_poll_error: null,
    }).eq("id", file.id).eq("workspace_id", workspaceId);
    if (error) throw new Error(`Could not update Figma poll state: ${error.message}`);
    return {
      fileKey: file.file_key,
      status: newer.length > 0 ? "ingested" : "up_to_date",
      versionsIngested: newer.length,
      newestVersionId,
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
  const { token, expiresAt } = await connectionAccessToken(workspaceId, "figma");
  if (expiresAt && Date.parse(expiresAt) <= Date.now()) {
    const error = "Figma access token has expired; reconnect Figma for this workspace";
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
