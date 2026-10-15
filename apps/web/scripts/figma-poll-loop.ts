/**
 * Local Figma poll loop — runs the same `pollFigmaWorkspace` the workspace
 * surface's "Poll now" button runs, on an interval, from a machine that has the
 * app's environment (`.env`: Supabase URL, secret key, INTEGRATION_ENCRYPTION_KEY).
 *
 * Vercel Hobby only allows daily cron jobs, so the scheduled half of Figma
 * polling lives here instead of in `vercel.json`. The route
 * `/api/cron/figma-poll` still exists for a Pro schedule or a manual call;
 * this loop is the hobby-plan answer and the one the demo uses.
 *
 *   terminal:  cd apps/web && npx tsx scripts/figma-poll-loop.ts
 *   interval:  FIGMA_POLL_INTERVAL_MS=60000 (default) npx tsx scripts/...
 *
 * One loop per workspace-set is enough: it walks every workspace with at least
 * one watched file. Ctrl-C stops it; a crash exits non-zero so a supervisor can
 * restart it.
 */
import { existsSync, readFileSync } from "node:fs";
import { figmaWatchedWorkspaces, pollFigmaWorkspace } from "../src/lib/integrations/figma-poll.js";

// Same convention as the wire-up scripts: read whichever env file exists.
// Shell exports win over the file, so a one-off override still works.
for (const name of [".env.local", ".env"]) {
  if (!existsSync(new URL(`../${name}`, import.meta.url))) continue;
  for (const line of readFileSync(new URL(`../${name}`, import.meta.url), "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  break;
}

const INTERVAL_MS = Number(process.env.FIGMA_POLL_INTERVAL_MS ?? 60_000);
const ONCE = process.argv.includes("--once");

function log(message: string, fields: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ at: new Date().toISOString(), message, ...fields }));
}

async function pass(): Promise<void> {
  const workspaces = await figmaWatchedWorkspaces();
  if (workspaces.length === 0) {
    log("no watched Figma files yet — add one on the workspace page");
    return;
  }
  for (const workspace of workspaces) {
    try {
      const results = await pollFigmaWorkspace(workspace.id);
      const ingested = results.filter((r) => r.status === "ingested");
      log("polled", { workspace: workspace.slug, files: workspace.files, ingested: ingested.length });
      for (const result of results) {
        log("file", {
          workspace: workspace.slug,
          fileKey: result.fileKey,
          status: result.status,
          versions: result.versionsIngested,
          ...(result.error ? { error: result.error } : {}),
        });
      }
    } catch (error) {
      log("poll failed", { workspace: workspace.slug, error: error instanceof Error ? error.message : String(error) });
    }
  }
}

log("figma poll loop started", { intervalMs: INTERVAL_MS, once: ONCE });

async function main(): Promise<void> {
  await pass();
  if (ONCE) return;
  for (;;) {
    await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
    await pass().catch((error: unknown) =>
      log("pass failed", { error: error instanceof Error ? error.message : String(error) }),
    );
  }
}

void main();
