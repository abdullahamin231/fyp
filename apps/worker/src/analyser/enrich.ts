import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { decryptSecret } from "@unify/contracts/secret-box";
import type { Config } from "../config.js";
import { analyse } from "./analyse.js";
import { toGraph } from "./payloads.js";
import { publishGraph, publishViaSupabase } from "./publish.js";
import { loadCriterion, type CriterionInfo } from "../graph/nodes.js";

/**
 * Evidence enrichment — the worker half of the live chain.
 *
 * The webhook path can only see tickets and pull requests: it has no access to
 * a repository's git objects, and the web app runs where code execution is not
 * possible. The worker runs where it is. So on claim, before building the
 * packet, the worker ensures the evidence graph carries the code/test evidence
 * for this job's (repo, base, head):
 *
 *   criterion → Ticket (REFERENCES, from ingestion)
 *             → PullRequest (TRACKS, from the linker)
 *             → repo + base/head (job row)
 *             → analysis_targets entry (00025) — the only sanctioned repo/command pair
 *             → clone or cache + fetch the two commits
 *             → analyser → graph nodes/edges → publish_analysis RPC
 *
 * Rules this module keeps, in order of importance:
 *
 *   1. It refuses to analyse a repository that has no `analysis_targets` row
 *      for the workspace. An analysis run is never silent: where it runs, on
 *      which commit pair, and with which test command, are all recorded.
 *   2. Any failure throws and fails the *job* — enrichment that cannot run
 *      must never become a verdict. The runner's catch records the reason.
 *   3. It is idempotent: nodes are upserted by (workspace, type, external_id),
 *      and an existing commit node for the head skips the whole path, so a
 *      re-enqueued job is a no-op rather than a duplicate publish.
 */

const REPO_FULL_NAME = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

export type EnrichmentOutcome =
  | { status: "published"; nodes: number; edgesInserted: number; edgesSkipped: number; testRunPassed: boolean | null }
  | { status: "already-present" }
  | { status: "no-pull-request"; ticketExternalId: string }
  | { status: "no-target"; repo: string }
  | { status: "no-commit-pair"; headCommit: string };

export interface EnrichDeps {
  client: SupabaseClient;
  config: Config;
  logger?: (message: string, fields?: Record<string, unknown>) => void;
  /** Test seam: resolve (repo) → a local git directory. Default: clone/fetch cache. */
  resolveRepoDir?: (repo: string, config: Config, token: string | null) => Promise<string>;
}

interface NodeRow {
  id: string;
  type: string;
  external_id: string;
  /** The linker records the PR's head commit here (00015 step 2). */
  version: string | null;
  payload: Record<string, unknown> | null;
}

/** The repository + pull-request node a job's change is verified against. */
async function findPullRequest(
  client: SupabaseClient,
  criterion: CriterionInfo,
  headCommit: string,
): Promise<{ ticket: NodeRow; pullRequest: NodeRow } | { ticket: NodeRow; pullRequest: null } | null> {
  // Hop 1 from the criterion: ingestion linked the ticket that owns it.
  const { data: incident, error: incidentError } = await client
    .from("edges")
    .select("from_id, to_id, type")
    .or(`from_id.eq.${criterion.id},to_id.eq.${criterion.id}`)
    .eq("link_state", "active");
  if (incidentError) throw new Error(`enrich: criterion edges: ${incidentError.message}`);
  const edges = (incident ?? []) as { from_id: string; to_id: string; type: string }[];
  if (edges.length === 0) return null;

  const neighbourIds = [...new Set(edges.flatMap((e) => [e.from_id, e.to_id]))].filter((id) => id !== criterion.id);
  const { data: neighbours, error: neighbourError } = await client
    .from("nodes")
    .select("id, type, external_id, version, payload")
    .in("id", neighbourIds);
  if (neighbourError) throw new Error(`enrich: criterion neighbours: ${neighbourError.message}`);
  const ticket = ((neighbours ?? []) as NodeRow[]).find((node) => node.type === "Ticket");
  if (!ticket) return null;

  // Hop 2: the PRs the linker attached to that ticket.
  const { data: trackEdges, error: trackError } = await client
    .from("edges")
    .select("from_id, to_id")
    .eq("type", "TRACKS")
    .eq("link_state", "active")
    .or(`from_id.eq.${ticket.id},to_id.eq.${ticket.id}`);
  if (trackError) throw new Error(`enrich: TRACKS edges: ${trackError.message}`);
  const prIds = [
    ...new Set(
      ((trackEdges ?? []) as { from_id: string; to_id: string }[]).flatMap((e) => [e.from_id, e.to_id]),
    ),
  ].filter((id) => id !== ticket.id);
  if (prIds.length === 0) return { ticket, pullRequest: null };

  const { data: prs, error: prError } = await client
    .from("nodes")
    .select("id, type, external_id, version, payload")
    .in("id", prIds);
  if (prError) throw new Error(`enrich: pull request nodes: ${prError.message}`);
  const pullRequests = ((prs ?? []) as NodeRow[]).filter((node) => node.type === "PullRequest");
  if (pullRequests.length === 0) return { ticket, pullRequest: null };

  // The change this job verifies is the one at the job's head commit — a ticket
  // can have several open pull requests, and attributing one PR's evidence to
  // another's packet is a provenance error, not a convenience. The linker
  // records the head on the node's `version` column (00015 step 2); `payload`
  // is a fallback for rows written by other paths.
  const atHead = pullRequests.find(
    (node) => node.version === headCommit || node.payload?.headSha === headCommit,
  );
  if (atHead) return { ticket, pullRequest: atHead };

  // The PR has moved on since this job was queued. Its delivery history still
  // records which PR was at this head (00015 writes the head as the event's
  // version), so an older job keeps its evidence instead of starving.
  const { data: history, error: historyError } = await client
    .from("events")
    .select("entity_id")
    .eq("entity_type", "PullRequest")
    .eq("version", headCommit)
    .in("entity_id", pullRequests.map((node) => node.external_id))
    .limit(1);
  if (historyError) throw new Error(`enrich: pull request history: ${historyError.message}`);
  const wasAtHead = (history ?? [])[0] as { entity_id: string } | undefined;
  return { ticket, pullRequest: pullRequests.find((node) => node.external_id === wasAtHead?.entity_id) ?? null };
}

/** Repo name recorded on the PR node by ingestion (`owner/name`). */
function repoOf(pullRequest: NodeRow): string | null {
  const repo = pullRequest.payload?.repo;
  return typeof repo === "string" && REPO_FULL_NAME.test(repo) ? repo : null;
}

async function commitNodeExists(
  client: SupabaseClient,
  workspaceId: string,
  headCommit: string,
): Promise<boolean> {
  // The analyser's commit node id is `commit:<head 12>` (payloads.ts), so this
  // is exactly "evidence for this head is already in the graph".
  const { data, error } = await client
    .from("nodes")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("type", "Commit")
    .eq("external_id", `commit:${headCommit.slice(0, 12)}`)
    .maybeSingle();
  if (error) throw new Error(`enrich: commit lookup: ${error.message}`);
  return data !== null;
}

async function analysisTarget(
  client: SupabaseClient,
  workspaceId: string,
  repo: string,
): Promise<{ testCommand: string | null } | null> {
  const { data, error } = await client
    .from("analysis_targets")
    .select("test_command")
    .eq("workspace_id", workspaceId)
    .eq("repo_full_name", repo)
    .maybeSingle();
  if (error) throw new Error(`enrich: analysis target: ${error.message}`);
  const row = data as { test_command: string | null } | null;
  if (!row) return null;
  // Empty string is "no command", not an empty shell command.
  const command = typeof row.test_command === "string" && row.test_command.trim() ? row.test_command : null;
  return { testCommand: command };
}

/**
 * The token to read this workspace's repositories: its GitHub OAuth
 * connection, or the worker-wide ANALYSIS_GIT_TOKEN when it has none.
 */
async function workspaceGitToken(client: SupabaseClient, workspaceId: string, config: Config): Promise<string | null> {
  if (config.encryptionKey) {
    const { data, error } = await client
      .from("integration_connections")
      .select("access_token_ciphertext")
      .eq("workspace_id", workspaceId)
      .eq("provider", "github")
      .maybeSingle();
    if (error) throw new Error(`enrich: github connection: ${error.message}`);
    const sealed = (data as { access_token_ciphertext: string } | null)?.access_token_ciphertext;
    if (sealed) return decryptSecret(sealed, config.encryptionKey);
  }
  return config.gitToken ?? null;
}

/** git's own auth header for one command, so the token is never written to .git/config. */
export function gitAuthArgs(token: string | null): string[] {
  if (!token) return [];
  const basic = Buffer.from(`x-access-token:${token}`).toString("base64");
  return ["-c", `http.https://github.com/.extraheader=AUTHORIZATION: basic ${basic}`];
}

/**
 * Make the repository available locally with both commits present.
 *
 * A non-bare clone in a stable cache dir: the analyser reads only git objects,
 * and the analyser's own test runner adds a detached worktree to the same repo
 * (which a bare clone forbids). Fetching by SHA is what GitHub allows via
 * `allowTipSHA1InWant`; if that ever fails the fallback is a full fetch.
 */
async function ensureRepoDir(repo: string, config: Config, token: string | null): Promise<string> {
  const dir = join(config.repoCacheDir, repo.replace("/", "__"));
  const url = `https://github.com/${repo}.git`;
  const auth = gitAuthArgs(token);

  if (existsSync(join(dir, ".git"))) {
    // Best-effort refresh; the per-SHA fetch in ensureCommits is the gate, so a
    // failure here is not fatal — the commit verification decides.
    try {
      execFileSync("git", [...auth, "-C", dir, "fetch", "--quiet", "--no-tags", "origin"], {
        encoding: "utf8",
        maxBuffer: 256 * 1024 * 1024,
        env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
      });
    } catch {
      /* cache may be offline; ensureCommits decides */
    }
    return dir;
  }

  mkdirSync(config.repoCacheDir, { recursive: true });
  execFileSync("git", [...auth, "clone", "--quiet", "--no-tags", url, dir], {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
  });
  return dir;
}

function ensureCommits(dir: string, shas: string[], token: string | null): void {
  const auth = gitAuthArgs(token);
  const git = (args: string[]) =>
    execFileSync("git", [...auth, "-C", dir, ...args], {
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    });
  const present = (sha: string) => {
    try {
      git(["cat-file", "-e", `${sha}^{commit}`]);
      return true;
    } catch {
      return false;
    }
  };
  const missing = shas.filter((sha) => !present(sha));
  for (const sha of missing) {
    try {
      git(["fetch", "--quiet", "--no-tags", "origin", sha]);
    } catch {
      try {
        // Fallback for servers that refuse fetch-by-SHA.
        git(["fetch", "--quiet", "--no-tags", "origin"]);
      } catch (error) {
        throw new Error(
          `enrich: could not fetch ${sha} of ${shas.join(",")}: ${(error as Error).message}`,
        );
      }
    }
    if (!present(sha)) {
      throw new Error(`enrich: commit ${sha} is not present after fetch (wrong repository?)`);
    }
  }
}

export async function ensureEvidence(
  deps: EnrichDeps,
  job: { workspace_id: string; base_commit: string; head_commit: string },
  criterion: CriterionInfo,
): Promise<EnrichmentOutcome> {
  const { client, config } = deps;
  const log = deps.logger ?? (() => {});

  if (await commitNodeExists(client, job.workspace_id, job.head_commit)) {
    return { status: "already-present" };
  }

  const found = await findPullRequest(client, criterion, job.head_commit);
  if (!found) return { status: "no-pull-request", ticketExternalId: "" };
  if (!found.pullRequest) {
    // PRs are linked to the ticket, but none sits at this job's head: the
    // graph's PR rows are stale relative to the pinned revision pair.
    return { status: "no-pull-request", ticketExternalId: found.ticket.external_id };
  }

  const repo = repoOf(found.pullRequest);
  if (!repo) return { status: "no-target", repo: "" };

  const target = await analysisTarget(client, job.workspace_id, repo);
  if (!target) return { status: "no-target", repo };

  const token = await workspaceGitToken(client, job.workspace_id, config);
  const resolve = deps.resolveRepoDir ?? ensureRepoDir;
  const dir = await resolve(repo, config, token);
  ensureCommits(dir, [job.base_commit, job.head_commit], token);

  const analysis = analyse(dir, job.base_commit, job.head_commit, {
    repo,
    runTests: target.testCommand
      ? { command: target.testCommand, timeoutMs: config.analysisTestTimeoutMs }
      : undefined,
  });
  const graph = toGraph(analysis, { pullRequestExternalId: found.pullRequest.external_id });
  const published = await publishGraph(publishViaSupabase(client), job.workspace_id, graph);

  log("evidence enrichment published", {
    repo,
    base: job.base_commit.slice(0, 12),
    head: job.head_commit.slice(0, 12),
    nodes: published.nodesInserted + published.nodesUpdated,
    edges: published.edgesInserted,
    skipped: published.edgesSkipped.length,
    testRun: analysis.testRun ? analysis.testRun.passed : null,
  });

  return {
    status: "published",
    nodes: published.nodesInserted + published.nodesUpdated,
    edgesInserted: published.edgesInserted,
    edgesSkipped: published.edgesSkipped.length,
    testRunPassed: analysis.testRun ? analysis.testRun.passed : null,
  };
}
