/**
 * GitHub webhook wiring — one command to make the GitHub leg live.
 *
 * The webhook route verifies every delivery against the workspace connection's
 * webhook secret (migration 00010). Repository webhooks are configured on the
 * repo, not in UNIFY, so this script does the half that lives in UNIFY and
 * prints the half that lives on GitHub:
 *
 *   1. sets (or resets) the GitHub connection's webhook secret for a workspace
 *   2. prints the payload URL to point the repository webhook at
 *   3. prints the exact `gh api` command that creates the hook
 *   4. sends a signed `ping` delivery and asserts the route accepted it
 *
 * The `ping` self-test is the real proof: the same verification a live
 * pull_request delivery goes through, end to end, before anyone opens a PR.
 *
 * Usage:
 *   node scripts/github-webhook-setup.mjs <workspace-slug-or-uuid> [repo owner/name]
 *   node scripts/github-webhook-setup.mjs mishals-workspace abdullahamin231/fyp
 */
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

let envFile = "";
try {
  envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
} catch {
  console.error(
    "apps/web/.env.local not found. Create it with the values from the Vercel project\n" +
    "(Project Settings -> Environment Variables): NEXT_PUBLIC_SUPABASE_URL,\n" +
    "SUPABASE_SERVICE_ROLE_KEY, INTEGRATION_ENCRYPTION_KEY.",
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
if (missing.length) { console.error("Missing in apps/web/.env.local:", missing.join(", ")); process.exit(1); }

const key = createHash("sha256").update(process.env.INTEGRATION_ENCRYPTION_KEY).digest();
const encrypt = (v) => {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([c.update(v, "utf8"), c.final()]);
  return `${iv.toString("base64url")}.${c.getAuthTag().toString("base64url")}.${enc.toString("base64url")}`;
};
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
const positional = args.filter((a) => !a.startsWith("--"));
const workspaceArg = positional[0];
const repo = positional[1] ?? flag("repo") ?? "abdullahamin231/fyp";
const base = (flag("base") ?? "https://unify-web-weld.vercel.app").replace(/\/$/, "");

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1. Workspace
let q = db.from("workspaces").select("id, name, slug");
const ws = /^[0-9a-f-]{36}$/i.test(workspaceArg ?? "") ? await q.eq("id", workspaceArg) : await q.eq("slug", workspaceArg);
if (ws.error) die(`Could not read workspaces: ${ws.error.message}`);
const workspace = ws.data?.[0];
if (!workspace) die(`No workspace "${workspaceArg}".`);
console.log(`Workspace: ${workspace.name} (slug ${workspace.slug}, id ${workspace.id})`);

// 2. The connection that holds the webhook secret (created_by must be a real user)
const member = await db.from("workspace_members").select("user_id, role").eq("workspace_id", workspace.id).in("role", ["owner", "admin"]).limit(1).maybeSingle();
if (member.error) die(`Could not read workspace members: ${member.error.message}`);
if (!member.data) die("That workspace has no owner/admin to own the connection.");

// 3. Set the webhook secret. A new one invalidates the previous hook config —
//    there is no way to read the old secret back, so printing it is the point.
const secret = randomBytes(32).toString("hex");
const { data: owner } = await db.auth.admin.getUserById(member.data.user_id);
const upsert = await db.from("integration_connections").upsert(
  {
    workspace_id: workspace.id,
    provider: "github",
    access_token_ciphertext: encrypt("webhook-only-no-oauth"),
    webhook_secret_ciphertext: encrypt(secret),
    external_account_name: "webhook delivery (no OAuth)",
    scopes: [],
    created_by: member.data.user_id,
    updated_at: new Date().toISOString(),
  },
  { onConflict: "workspace_id,provider" },
);
if (upsert.error) die(`Could not set the webhook secret: ${upsert.error.message}`);
void owner;
console.log(`GitHub connection: webhook secret set (replaces any previous one).`);

// 4. Print the GitHub half, verbatim
const url = `${base}/api/webhooks/github/${workspace.id}`;
console.log(`
--- GitHub side (run once, repo admin) ---------------------------------------
Payload URL : ${url}
Content type: application/json
Secret      : ${secret}
Events      : Pull requests   (add "Pushes" only if you want push deliveries)

gh api --method POST repos/${repo}/hooks \\
  -F 'config[url]=${url}' \\
  -F 'config[content_type]=json' \\
  -F 'config[secret]=${secret}' \\
  -F 'events[]=pull_request'
------------------------------------------------------------------------------`);

// 5. The ping self-test: the route's own signature verification, end to end
const body = Buffer.from(JSON.stringify({ zen: "Design for failure.", hook_id: 0, repository: { full_name: repo } }));
const delivery = `ping-${Date.now().toString(36)}`;
const response = await fetch(url, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-github-event": "ping",
    "x-github-delivery": delivery,
    "x-hub-signature-256": `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`,
  },
  body,
});
const json = await response.json().catch(() => null);
const deliveryRow = await db.from("integration_deliveries").select("id").eq("vendor_delivery_id", delivery).maybeSingle();
console.log(`ping self-test: ${response.status} ${JSON.stringify(json)}`);
console.log(`delivery recorded: ${deliveryRow.data ? "yes" : "NO"}`);
const ok = response.status === 200 && deliveryRow.data !== null;
console.log(ok ? "GitHub leg is live — the route verified the signature and recorded the delivery." : "The route rejected the delivery. Check the URL and the deployment.");
process.exitCode = ok ? 0 : 1;
