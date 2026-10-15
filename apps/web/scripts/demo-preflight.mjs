/**
 * Demo preflight — run this 30 minutes before the supervisor arrives, and once
 * more right before you start. It checks every moving part the live demo
 * depends on and prints PASS / WARN / FAIL with the fix for anything not green.
 *
 * It only reads: no webhook is sent, no row is written.
 *
 * Usage:
 *   node scripts/demo-preflight.mjs [workspace-slug] [--repo owner/name] [--base URL]
 *
 *   terminal:  cd apps/web && node scripts/demo-preflight.mjs mishals-workspace
 */
import { execFileSync } from "node:child_process";
import { createDecipheriv, createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

let envFile = "";
for (const name of [".env.local", ".env"]) {
  try {
    envFile = readFileSync(new URL(`../${name}`, import.meta.url), "utf8");
    break;
  } catch {
    // try the next convention
  }
}
for (const line of envFile.split(/\r?\n/)) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
process.env.SUPABASE_SERVICE_ROLE_KEY ??= process.env.SUPABASE_SECRET_KEY;

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const slug = (() => {
  for (let i = 0; i < args.length; i += 1) {
    if (args[i].startsWith("--")) { i += 1; continue; }
    return args[i];
  }
  return "mishals-workspace";
})();
const repo = flag("repo") ?? "abdullahamin231/fyp";
const base = (flag("base") ?? "https://unify-web-weld.vercel.app").replace(/\/$/, "");
const repoRoot = new URL("../../../", import.meta.url);

const results = [];
const report = (level, name, detail, fix) => {
  results.push(level);
  const tag = { PASS: "\x1b[32mPASS\x1b[0m", WARN: "\x1b[33mWARN\x1b[0m", FAIL: "\x1b[31mFAIL\x1b[0m" }[level];
  console.log(`${tag}  ${name}${detail ? `\n      ${detail}` : ""}${fix && level !== "PASS" ? `\n      fix: ${fix}` : ""}`);
};
const sh = (cmd, cmdArgs) => {
  try {
    return execFileSync(cmd, cmdArgs, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch (error) {
    return { error: (error.stderr || error.stdout || error.message || "").toString().trim() };
  }
};

console.log(`UNIFY demo preflight · workspace ${slug} · repo ${repo} · ${base}\n`);

// 1. Local environment ---------------------------------------------------------
const need = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "INTEGRATION_ENCRYPTION_KEY"];
const missing = need.filter((k) => !process.env[k]);
if (!envFile || missing.length) {
  report("FAIL", "apps/web env file", missing.length ? `missing: ${missing.join(", ")}` : "no .env.local or .env",
    "copy the values from Vercel → Project Settings → Environment Variables into apps/web/.env.local");
  process.exit(1);
}
report("PASS", "apps/web env file", "Supabase URL, service key and encryption key present");

// 2. Deployed app ---------------------------------------------------------------
try {
  const res = await fetch(`${base}/login`, { redirect: "manual" });
  report(res.status === 200 ? "PASS" : "FAIL", "deployed web app", `GET ${base}/login → ${res.status}`,
    "check the Vercel deployment for the demo branch is READY");
} catch (error) {
  report("FAIL", "deployed web app", String(error.message ?? error), "no network, or the URL is wrong (--base)");
}

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 3. Workspace ------------------------------------------------------------------
const ws = await db.from("workspaces").select("id, name, slug").eq("slug", slug).maybeSingle();
if (ws.error || !ws.data) {
  report("FAIL", `workspace "${slug}"`, ws.error?.message ?? "not found", "pass the right slug as the first argument");
  process.exit(1);
}
const workspaceId = ws.data.id;
report("PASS", `workspace "${slug}"`, `${ws.data.name} · ${workspaceId}`);

// 4. Provider connections --------------------------------------------------------
const key = createHash("sha256").update(process.env.INTEGRATION_ENCRYPTION_KEY).digest();
const decrypts = (v) => {
  try {
    const [iv, tag, ct] = v.split(".");
    const d = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
    d.setAuthTag(Buffer.from(tag, "base64url"));
    Buffer.concat([d.update(Buffer.from(ct, "base64url")), d.final()]);
    return true;
  } catch {
    return false;
  }
};
const conns = await db.from("integration_connections")
  .select("provider, external_account_name, webhook_secret_ciphertext")
  .eq("workspace_id", workspaceId);
for (const provider of ["github", "jira", "figma"]) {
  const row = (conns.data ?? []).find((c) => c.provider === provider);
  const optional = provider === "figma";
  if (!row) {
    report(optional ? "WARN" : "FAIL", `${provider} connection`, "none",
      optional
        ? `optional beat — connect Figma in /settings/integrations?workspace=${slug}`
        : provider === "github"
          ? `node scripts/github-webhook-setup.mjs ${slug} ${repo}`
          : `register + connect Jira once in /settings/integrations?workspace=${slug}`);
    continue;
  }
  const secretOk = !row.webhook_secret_ciphertext || decrypts(row.webhook_secret_ciphertext);
  report(secretOk ? "PASS" : "FAIL", `${provider} connection`, `account: ${row.external_account_name ?? "—"}`,
    "INTEGRATION_ENCRYPTION_KEY differs from the server's — copy Vercel's value into .env.local");
}

// 5. Analysis target ---------------------------------------------------------------
const target = await db.from("analysis_targets").select("repo_full_name, test_command")
  .eq("workspace_id", workspaceId).eq("repo_full_name", repo).maybeSingle();
if (!target.data) {
  report("FAIL", `analysis target ${repo}`, "missing — the worker refuses to analyse an unregistered repo",
    `add it under /settings/workspace?workspace=${slug} → Analysis targets`);
} else {
  const cmd = target.data.test_command ?? "";
  const swallows = /\bnpm (run )?test\b/.test(cmd);
  report(cmd && !swallows ? "PASS" : "FAIL", `analysis target ${repo}`, `test command: ${cmd || "(none)"}`,
    swallows
      ? "npm swallows a failing script inside a workspace — use: cd packages/contracts && npm install --ignore-scripts && npx vitest run"
      : "set a test command, or the CONTRADICTED beat has no failing run to cite");
}

// 6. Demo tickets + criteria ----------------------------------------------------------
for (const ticket of ["UNI-7", "UNI-8"]) {
  const t = await db.from("nodes").select("id").eq("workspace_id", workspaceId).eq("type", "Ticket").eq("external_id", ticket).maybeSingle();
  const c = await db.from("nodes").select("external_id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId).eq("type", "Criterion").like("external_id", `${ticket}/AC-%`);
  report(t.data && (c.count ?? 0) > 0 ? "PASS" : "WARN", `ticket ${ticket}`,
    t.data ? `${c.count ?? 0} criteria` : "not ingested yet",
    "fine before the demo — the demo replays it; it must exist BEFORE its PR is reopened (landmine 8)");
}

// 7. Verification queue ------------------------------------------------------------------
const stale = new Date(Date.now() - 5 * 60_000).toISOString();
const stuck = await db.from("verification_jobs").select("id, state, enqueued_at")
  .eq("workspace_id", workspaceId).in("state", ["queued", "running"]).lt("enqueued_at", stale);
report((stuck.data ?? []).length === 0 ? "PASS" : "WARN", "verification queue",
  `${(stuck.data ?? []).length} job(s) queued/running for over 5 minutes`,
  "the worker is down or wedged — restart it (sudo systemctl restart unify-worker) before the demo");
const lastJob = await db.from("verification_jobs").select("state, finished_at, last_stop_reason, last_error")
  .eq("workspace_id", workspaceId).order("enqueued_at", { ascending: false }).limit(1).maybeSingle();
if (lastJob.data) {
  report(lastJob.data.state === "failed" ? "WARN" : "PASS", "last verification job",
    `${lastJob.data.state} · stop ${lastJob.data.last_stop_reason ?? "—"}${lastJob.data.last_error ? ` · ${lastJob.data.last_error.slice(0, 120)}` : ""}`,
    "read journalctl -u unify-worker -n 50 for the cause");
}

// 8. Worker on this machine -----------------------------------------------------------------
const active = sh("systemctl", ["is-active", "unify-worker"]);
const workers = sh("pgrep", ["-fc", "tsx.*src/index.ts"]);
const workerCount = typeof workers === "string" ? Number(workers) : 0;
if (active === "active") {
  report(workerCount <= 1 ? "PASS" : "FAIL", "worker service", `unify-worker active · ${workerCount} worker process(es)`,
    "stale `npm run dev` workers race the service — kill every extra one (landmine 9)");
} else {
  report("FAIL", "worker service", `systemctl: ${typeof active === "string" ? active : active.error}`,
    "cd apps/worker && ./deploy/install.sh   (or: sudo systemctl start unify-worker)");
}
const config = readFileSync(new URL("apps/worker/src/config.ts", repoRoot), "utf8");
const fabricate = /stubFabricate:\s*"(\w+)"/.exec(config)?.[1];
const provider = /modelProvider:\s*"(\w+)"/.exec(config)?.[1];
report(fabricate === "none" ? "PASS" : "FAIL", "fault injection disarmed", `stubFabricate: "${fabricate}" · modelProvider: "${provider}"`,
  "git checkout -- apps/worker/src/config.ts && sudo systemctl restart unify-worker");
const branch = sh("git", ["-C", new URL(".", repoRoot).pathname, "rev-parse", "--abbrev-ref", "HEAD"]);
report("PASS", "worker source branch", typeof branch === "string" ? branch : branch.error);

// 9. Demo PRs ---------------------------------------------------------------------------------
for (const number of [47, 48]) {
  const pr = sh("gh", ["pr", "view", String(number), "--repo", repo, "--json", "state,title,headRefOid"]);
  if (typeof pr !== "string") {
    report("WARN", `PR #${number}`, pr.error.split("\n")[0], "gh auth login");
    continue;
  }
  const { state, title, headRefOid } = JSON.parse(pr);
  report("PASS", `PR #${number}`, `${state} · ${headRefOid.slice(0, 7)} · ${title}`);
}

const fails = results.filter((r) => r === "FAIL").length;
const warns = results.filter((r) => r === "WARN").length;
console.log(`\n${results.length - fails - warns} pass · ${warns} warn · ${fails} fail${fails ? "  — fix every FAIL before the demo" : "  — ready"}`);
process.exitCode = fails ? 1 : 0;
