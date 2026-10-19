/**
 * Jira delivery replay (§13.4 sanctioned fallback).
 *
 * Posts real-shaped Jira webhook payloads at the real webhook endpoint with a
 * valid HMAC signature — the same verification the route applies to a live
 * Jira delivery — so the entire ingestion path (normalise → Ticket node →
 * criteria → Rule 2 → checkpoint) runs exactly as it would in production.
 * Say "replayed" out loud when you use it; it is a delivery source substitute,
 * not an implementation substitute.
 *
 * Usage:
 *   node scripts/jira-replay.mjs <workspace-slug-or-uuid> [options]
 *
 * Options:
 *   --issue UNI-7                 issue key (default: UNI-7)
 *   --summary "..."               issue summary
 *   --criteria "c1;;c2;;c3"       acceptance criteria, ;; separated, rendered
 *                                 into the description's Acceptance Criteria
 *                                 section (the strict fallback parser)
 *   --status "To Do"              ticket status
 *   --event jira:issue_updated    webhook event name
 *   --to-status "In Progress"     changelog status target (issue_updated only)
 *   --file payload.json           replay this captured payload instead of
 *                                 building one (venue-network fallback)
 *   --base https://your-unify-host  (or set UNIFY_BASE_URL)
 *   --dry-run                     print the payload and the URL, send nothing
 *
 *   terminal:  node scripts/jira-replay.mjs mishals-workspace --issue UNI-7 \
 *                --summary "Discount codes at checkout" \
 *                --criteria "the total drops by the code percentage;;the receipt shows the discounted total"
 */
import { createDecipheriv, createHash, createHmac } from "node:crypto";
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
if (!envFile) {
  console.error(
    "Neither apps/web/.env.local nor apps/web/.env was found. Create one with the\n" +
    "values from the Vercel project (Project Settings -> Environment Variables):\n" +
    "NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY),\n" +
    "INTEGRATION_ENCRYPTION_KEY.",
  );
  process.exit(1);
}
for (const line of envFile.split(/\r?\n/)) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
process.env.SUPABASE_SERVICE_ROLE_KEY ??= process.env.SUPABASE_SECRET_KEY;
const need = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "INTEGRATION_ENCRYPTION_KEY"];
const missing = need.filter((k) => !process.env[k]);
if (missing.length) { console.error("Missing in apps/web/.env.local:", missing.join(", ")); process.exitCode = 1; throw new Error("__stop__"); }

const key = createHash("sha256").update(process.env.INTEGRATION_ENCRYPTION_KEY).digest();
const decrypt = (v) => {
  const [iv, tag, ct] = v.split(".");
  const d = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
  d.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([d.update(Buffer.from(ct, "base64url")), d.final()]).toString("utf8");
};

function die(msg) { console.error(msg); process.exitCode = 1; throw new Error("__stop__"); }
process.on("uncaughtException", (e) => { if (e?.message !== "__stop__") { console.error(e); process.exitCode = 1; } });

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
// First positional argument: not a flag, and not the value of one.
const workspaceArg = (() => {
  for (let i = 0; i < args.length; i += 1) {
    if (args[i].startsWith("--")) { i += 1; continue; }
    return args[i];
  }
  return undefined;
})();
const base = (flag("base") ?? process.env.UNIFY_BASE_URL ?? "").replace(/\/$/, "");
if (!base && !args.includes("--dry-run")) {
  console.error("Pass --base https://your-unify-host (or set UNIFY_BASE_URL).");
  process.exit(1);
}
const dryRun = args.includes("--dry-run");

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1. Workspace (slug or id)
let q = db.from("workspaces").select("id, name, slug");
const ws = /^[0-9a-f-]{36}$/i.test(workspaceArg ?? "") ? (await q.eq("id", workspaceArg)) : (await q.eq("slug", workspaceArg));
if (ws.error) die(`Could not read workspaces: ${ws.error.message}`);
const workspace = ws.data?.[0];
if (!workspace) die(`No workspace "${workspaceArg}".`);
console.log(`Workspace: ${workspace.name} (slug ${workspace.slug}, id ${workspace.id})`);

// 2. The Jira connection's webhook secret — the same secret the route verifies against
const conn = await db.from("integration_connections").select("webhook_secret_ciphertext, external_account_name")
  .eq("workspace_id", workspace.id).eq("provider", "jira").maybeSingle();
if (conn.error) die(`Could not read integration_connections: ${conn.error.message}`);
if (!conn.data?.webhook_secret_ciphertext) {
  die(`No Jira connection for this workspace. Register the Jira app and connect once in /settings/integrations?workspace=${workspace.slug}, then run this again.`);
}
let secret;
try {
  secret = decrypt(conn.data.webhook_secret_ciphertext);
} catch {
  die("The Jira webhook secret could not be decrypted (INTEGRATION_ENCRYPTION_KEY mismatch?). Reconnect Jira or run where the key is present.");
}

// 3. The payload: built here, or a captured file for the venue fallback
const issueKey = flag("issue") ?? "UNI-7";
const summary = flag("summary") ?? "Discount codes at checkout";
const status = flag("status") ?? "To Do";
const event = flag("event") ?? "jira:issue_created";
const criteria = (flag("criteria") ?? "the total drops by the code percentage;;the receipt shows the discounted total").split(";;").map((s) => s.trim()).filter(Boolean);
const description = [
  "As a shopper I want to apply a discount code at checkout so my total drops.",
  "",
  "## Acceptance Criteria",
  ...criteria.map((c) => `- ${c}`),
].join("\n");

const file = flag("file");
let payload;
if (file) {
  payload = JSON.parse(readFileSync(file, "utf8"));
  console.log(`Replaying captured payload from ${file}`);
} else {
  const now = new Date().toISOString();
  payload = {
    timestamp: Date.now(),
    webhookEvent: event,
    issue_event_type_name: event.replace("jira:issue_", "issue_"),
    user: { accountId: "demo-reviewer", displayName: "Demo Reviewer" },
    issue: {
      id: `demo-${issueKey}`,
      key: issueKey,
      self: `https://unify-demo.atlassian.net/rest/api/2/issue/${issueKey}`,
      fields: {
        summary,
        description,
        updated: now,
        status: { name: status, statusCategory: { key: status.toLowerCase() === "done" ? "done" : "new" } },
        assignee: { displayName: "Mishal Fatima" },
        project: { key: issueKey.split("-")[0] },
      },
    },
    changelog: event === "jira:issue_updated" && flag("to-status")
      ? { items: [{ field: "status", fromString: flag("status") ?? "To Do", toString: flag("to-status") }] }
      : undefined,
  };
}

const body = Buffer.from(JSON.stringify(payload), "utf8");
const deliveryId = `replay:${issueKey}:${event}:${Date.now().toString(36)}`;
const signature = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
const url = `${base}/api/webhooks/jira/${workspace.id}`;

if (dryRun) {
  console.log(`POST ${url}`);
  console.log(body.toString("utf8"));
  process.exit(0);
}

console.log(`POST ${url}`);
console.log(`delivery ${deliveryId} · ${criteria.length} criteria in the description · event ${event}`);
const response = await fetch(url, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-hub-signature": signature,
    "x-atlassian-webhook-identifier": deliveryId,
  },
  body,
});
const json = await response.json().catch(() => null);
console.log(`${response.status} ${JSON.stringify(json)}`);
process.exitCode = response.ok ? 0 : 1;
