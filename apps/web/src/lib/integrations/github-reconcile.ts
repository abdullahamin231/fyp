import { createHash } from "node:crypto";
import { admin } from "@/lib/supabase/admin";
import { asRecord, text } from "./common";
import { openPullRequests } from "./github";
import { processPullRequestDelivery, type PullRequestOutcome } from "./pipeline";
import { persistDelivery } from "./server";
import { getProviderToken } from "./tokens";

/**
 * GitHub delivers webhooks best-effort. Reconciliation lists each analysed
 * repository's open pull requests and replays, through the exact webhook path,
 * any whose head the graph has not seen. The delivery id is deterministic
 * (`reconcile:<repo>#<n>@<head>`), so running it twice, or a late real
 * webhook for the same head, changes nothing.
 */

export interface ReconcileResult {
  repo: string;
  open: number;
  replayed: { number: number; head: string; outcome: PullRequestOutcome }[];
  error?: string;
}

export async function reconcileGithubWorkspace(
  workspaceId: string,
  deps: { openPullRequests?: (repo: string) => Promise<Record<string, unknown>[]>; now?: () => Date } = {},
): Promise<ReconcileResult[]> {
  const db = admin();
  const targets = await db.from("analysis_targets").select("repo_full_name").eq("workspace_id", workspaceId);
  if (targets.error) throw new Error(`analysis_targets: ${targets.error.message}`);
  const list =
    deps.openPullRequests ??
    (async (repo: string) => openPullRequests((await getProviderToken(workspaceId, "github")).accessToken, repo));

  const results: ReconcileResult[] = [];
  for (const { repo_full_name: repo } of (targets.data ?? []) as { repo_full_name: string }[]) {
    try {
      const prs = await list(repo);
      const nodes = await db
        .from("nodes")
        .select("external_id, version")
        .eq("workspace_id", workspaceId)
        .eq("type", "PullRequest")
        .in("external_id", prs.map((pr) => `${repo}#${pr.number}`));
      if (nodes.error) throw new Error(`nodes: ${nodes.error.message}`);
      const seenHead = new Map(((nodes.data ?? []) as { external_id: string; version: string | null }[]).map((n) => [n.external_id, n.version]));

      const replayed: ReconcileResult["replayed"] = [];
      for (const pr of prs) {
        const number = Number(pr.number);
        const head = text(asRecord(pr.head).sha);
        if (!head || seenHead.get(`${repo}#${number}`) === head) continue;
        const payload = { action: "synchronize", number, pull_request: pr, repository: { full_name: repo }, sender: { login: "unify-reconcile" } };
        const deliveryId = `reconcile:${repo}#${number}@${head}`;
        const body = JSON.stringify(payload);
        await persistDelivery({ workspaceId, provider: "github", deliveryId, eventId: `github:${deliveryId}`, payload });
        const outcome = await processPullRequestDelivery(db, {
          workspaceId,
          deliveryId,
          payload,
          rawHash: createHash("sha256").update(body).digest("hex"),
          receivedAt: deps.now?.() ?? new Date(),
        });
        replayed.push({ number, head, outcome });
      }
      results.push({ repo, open: prs.length, replayed });
    } catch (error) {
      results.push({ repo, open: 0, replayed: [], error: error instanceof Error ? error.message : String(error) });
    }
  }
  return results;
}

/** Workspaces with a GitHub connection, for the scheduled pass. */
export async function githubConnectedWorkspaces(): Promise<{ id: string; slug: string }[]> {
  const { data, error } = await admin().from("integration_connections").select("workspace_id, workspaces(slug)").eq("provider", "github");
  if (error) throw new Error(`integration_connections: ${error.message}`);
  return ((data ?? []) as unknown as { workspace_id: string; workspaces: { slug: string } | null }[]).map((row) => ({
    id: row.workspace_id,
    slug: row.workspaces?.slug ?? row.workspace_id,
  }));
}
