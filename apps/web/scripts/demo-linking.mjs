/**
 * Live linking demo / smoke test through the REAL webhook endpoints.
 *
 * Sends signed Jira and GitHub webhooks to the running app (localhost or the
 * deployed site) for one workspace and checks what the pipeline did:
 *
 *   1. Jira issue_created UNI-1..3            -> Ticket nodes
 *   2. GitHub PR opened "UNI-2: ..."          -> linker: PR node + TRACKS edge PR -> UNI-2
 *   3. same delivery again                    -> duplicate_event, nothing written
 *   4. PR naming UNI-4 (no ticket yet)        -> unknown_key, no edge, no fake ticket
 *   5. Jira issue_created UNI-4               -> ticket created AND the earlier PR linked to it
 *   6. PR #1 closed + merged, UNI-2 In Progress -> Rule 2 finding (shows in /conflicts)
 *
 * Signing: uses the workspace's real GitHub/Jira webhook secret if those
 * providers are connected; otherwise creates a "demo (no OAuth)" connection row
 * holding a generated secret, so the endpoint can verify the signatures.
 *
 *   node scripts/demo-linking.mjs <workspace-slug> [base-url]
 *   e.g. node scripts/demo-linking.mjs demo-unify https://unify-web-weld.vercel.app
 *
 * Needs UNIFY_RULE_GRACE_HOURS=0 on the server for step 6 to fire immediately.
 */
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
function die(msg) { console.error(msg); process.exitCode = 1; throw new Error("__stop__"); }
process.on("uncaughtException", (e) => { if (e?.message !== "__stop__") { console.error(e); process.exitCode = 1; } });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !serviceKey || !process.env.INTEGRATION_ENCRYPTION_KEY) {
  die("apps/web/.env.local needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY and INTEGRATION_ENCRYPTION_KEY");
}

const encKey = createHash("sha256").update(process.env.INTEGRATION_ENCRYPTION_KEY).digest();
const encrypt = (v) => {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", encKey, iv);
  const enc = Buffer.concat([c.update(v, "utf8"), c.final()]);
  return `${iv.toString("base64url")}.${c.getAuthTag().toString("base64url")}.${enc.toString("base64url")}`;
};
const decrypt = (v) => {
  const [iv, tag, ct] = v.split(".");
  const d = createDecipheriv("aes-256-gcm", encKey, Buffer.from(iv, "base64url"));
  d.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([d.update(Buffer.from(ct, "base64url")), d.final()]).toString("utf8");
};

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
const args = process.argv.slice(2);
const base = (args.find((x) => /^https?:\/\//.test(x)) ?? "http://localhost:3000").replace(/\/$/, "");
const slug = args.find((x) => !/^https?:\/\//.test(x));
if (!slug) die("Usage: node scripts/demo-linking.mjs <workspace-slug> [base-url]");

// --- workspace + owner ------------------------------------------------------
const ws = await db.from("workspaces").select("id, name, slug, created_by").eq("slug", slug).maybeSingle();
if (ws.error || !ws.data) die(`No workspace with slug "${slug}". ${ws.error?.message ?? ""}`);
const workspaceId = ws.data.id;
let ownerId = ws.data.created_by;
if (!ownerId) {
  const m = await db.from("workspace_members").select("user_id").eq("workspace_id", workspaceId).in("role", ["owner", "admin"]).limit(1).maybeSingle();
  ownerId = m.data?.user_id;
}
if (!ownerId) die("That workspace has no owner/admin user.");
console.log(`Workspace: ${ws.data.name} (${slug}) → ${base}\n`);

// --- webhook secrets (real if connected, else a demo connection) -------------
async function secretFor(provider) {
  const c = await db.from("integration_connections").select("webhook_secret_ciphertext, external_account_name").eq("workspace_id", workspaceId).eq("provider", provider).maybeSingle();
  if (c.error) die(`integration_connections: ${c.error.message}`);
  if (c.data?.webhook_secret_ciphertext) {
    try { return decrypt(c.data.webhook_secret_ciphertext); }
    catch { die(`The ${provider} connection was encrypted with a different INTEGRATION_ENCRYPTION_KEY than the one in .env.local. Copy the server's key into .env.local.`); }
  }
  const secret = randomBytes(32).toString("hex");
  const up = await db.from("integration_connections").upsert({
    workspace_id: workspaceId, provider,
    access_token_ciphertext: encrypt("demo-placeholder-not-a-token"),
    webhook_secret_ciphertext: encrypt(secret),
    external_account_name: "demo (no OAuth)", scopes: [], created_by: ownerId,
  }, { onConflict: "workspace_id,provider" });
  if (up.error) die(`Could not create the ${provider} demo connection: ${up.error.message}`);
  console.log(`(${provider}: no connection found, created a "demo (no OAuth)" one)`);
  return secret;
}
const ghSecret = await secretFor("github");
const jiraSecret = await secretFor("jira");

// --- senders ----------------------------------------------------------------
const sign = (secret, body) => "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
async function post(provider, body, headers) {
  const raw = JSON.stringify(body);
  const r = await fetch(`${base}/api/webhooks/${provider}/${workspaceId}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers(raw) },
    body: raw,
  });
  let json = null; try { json = await r.json(); } catch {}
  return { status: r.status, json };
}
const run = Date.now().toString(36);
const jira = (key, summary, status, category, event = "jira:issue_created") =>
  post("jira", {
    timestamp: Date.now(), webhookEvent: event, user: { displayName: "demo" },
    issue: { key, self: `https://unify-demo.atlassian.net/rest/api/3/issue/${key}`, fields: {
      summary, updated: new Date().toISOString(), status: { name: status, statusCategory: { key: category } },
    } },
  }, (raw) => ({ "x-atlassian-webhook-identifier": `demo-${run}-${key}-${event}-${randomUUID()}`, "x-hub-signature": sign(jiraSecret, raw) }));
const repo = `demo/${run}`;
const github = (delivery, number, title, branch, action = "opened", merged = false) =>
  post("github", {
    action, number, repository: { full_name: repo }, sender: { login: "demo-dev" },
    pull_request: {
      number, title, body: "", state: action === "closed" ? "closed" : "open", merged,
      updated_at: new Date().toISOString(),
      head: { ref: branch, sha: randomBytes(20).toString("hex") }, base: { ref: "main", sha: randomBytes(20).toString("hex") },
    },
  }, (raw) => ({ "x-github-delivery": delivery, "x-github-event": "pull_request", "x-hub-signature-256": sign(ghSecret, raw) }));

// --- the story --------------------------------------------------------------
const results = [];
const check = (name, ok, detail) => { results.push({ name, ok }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}\n      ${detail}`); };
const keyStatus = (res, key) => res.json?.linking?.keys?.find((k) => k.key === key)?.status;

for (const [key, summary, status, cat] of [["UNI-1", "Sign-up form", "To Do", "new"], ["UNI-2", "Login page", "In Progress", "indeterminate"], ["UNI-3", "Password reset", "To Do", "new"]]) {
  const r = await jira(key, summary, status, cat);
  check(`Jira ${key} → Ticket node`, r.status === 200 && r.json?.ticket?.key === key, `${r.status} ${JSON.stringify(r.json?.ticket ?? r.json)}`);
}

const d1 = `demo-${run}-pr1-opened`;
const a = await github(d1, 1, "UNI-2: add login page", "feature/UNI-2-login");
check("PR #1 \"UNI-2: add login page\" → linked to UNI-2", a.status === 200 && keyStatus(a, "UNI-2") === "linked", `${a.status} ${JSON.stringify(a.json?.linking ?? a.json)}`);

const b = await github(d1, 1, "UNI-2: add login page", "feature/UNI-2-login");
check("Same delivery again → duplicate, nothing written", b.status === 200 && b.json?.linking?.status === "duplicate_event", `${b.status} ${JSON.stringify(b.json?.linking ?? b.json)}`);

const c = await github(`demo-${run}-pr2-opened`, 2, "UNI-4: profile settings (UTF-8 names)", "feature/profile");
check("PR #2 names UNI-4 (no ticket yet) → unknown_key, no edge; UTF-8 ignored", c.status === 200 && keyStatus(c, "UNI-4") === "unknown_key" && !keyStatus(c, "UTF-8"), `${c.status} ${JSON.stringify(c.json?.linking ?? c.json)}`);

const e = await jira("UNI-4", "Profile settings", "To Do", "new");
check("Jira UNI-4 arrives later → PR #2 linked to it", e.status === 200 && (e.json?.ticket?.relinked ?? 0) >= 1, `${e.status} ${JSON.stringify(e.json?.ticket ?? e.json)}`);

const f = await github(`demo-${run}-pr1-merged`, 1, "UNI-2: add login page", "feature/UNI-2-login", "closed", true);
check("PR #1 merged while UNI-2 is In Progress → Rule 2 finding", f.status === 200 && f.json?.findingsCreated === 1, `${f.status} findingsCreated=${f.json?.findingsCreated} ${f.json?.error ?? ""}${f.json?.findingsCreated === 0 ? "  (is UNIFY_RULE_GRACE_HOURS=0 set on the server?)" : ""}`);

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed. See ${base}/links and ${base}/conflicts.`);
process.exitCode = failed ? 1 : 0;
