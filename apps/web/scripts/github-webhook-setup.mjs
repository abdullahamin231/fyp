/**
 * GitHub webhook wiring — one command to make the GitHub leg live.
 *
 * The webhook route verifies every delivery against the workspace connection's
 * webhook secret (migration 00010). Repository webhooks are configured on the
 * repo, not in UNIFY, so this script does the half that lives in UNIFY and
 * prints the half that lives on GitHub:
 *
 *   1. rotates the webhook secret on the workspace's GitHub OAuth connection
 *      (connect GitHub in the app first; the access token is never touched)
 *   2. prints the payload URL to point the repository webhook at
 *   3. prints the exact `gh api` command that creates the hook
 *   4. sends a signed `ping` delivery and asserts the route accepted it
 *
 * The `ping` self-test is the real proof: the same verification a live
 * pull_request delivery goes through, end to end, before anyone opens a PR.
 *
 * Usage:
 *   node scripts/github-webhook-setup.mjs <workspace-slug-or-uuid> <repo owner/name> --base <https://your-unify-host>
 *   (or set UNIFY_BASE_URL instead of --base)
 */
import { createCipheriv, createHash, createHmac, randomBytes } from "node:crypto";
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
if (missing.length) { console.error("Missing in apps/web/.env.local:", missing.join(", ")); process.exit(1); }

const key = createHash("sha256").update(process.env.INTEGRATION_ENCRYPTION_KEY).digest();
const encrypt = (v) => {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([c.update(v, "utf8"), c.final()]);
  return `${iv.toString("base64url")}.${c.getAuthTag().toString("base64url")}.${enc.toString("base64url")}`;
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
const repo = positional[1] ?? flag("repo");
const base = (flag("base") ?? process.env.UNIFY_BASE_URL ?? "").replace(/\/$/, "");
if (!workspaceArg || !repo || !base) {
  console.error("Usage: node scripts/github-webhook-setup.mjs <workspace> <owner/repo> --base <https://your-unify-host>");
  process.exit(1);
}

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

// 2. The workspace's GitHub OAuth connection. Its access token is what the
//    worker clones with, so this script must never replace it.
const connection = await db
  .from("integration_connections")
  .select("id")
  .eq("workspace_id", workspace.id)
  .eq("provider", "github")
  .maybeSingle();
if (connection.error) die(`Could not read the GitHub connection: ${connection.error.message}`);
if (!connection.data) die(`Connect GitHub first: ${base}/workspaces/${workspace.slug}/integrations`);

// 3. Rotate the webhook secret. There is no way to read the old one back, so
//    printing the new one is the point; the old hook config stops verifying.
const secret = randomBytes(32).toString("hex");
const update = await db
  .from("integration_connections")
  .update({ webhook_secret_ciphertext: encrypt(secret), updated_at: new Date().toISOString() })
  .eq("id", connection.data.id);
if (update.error) die(`Could not set the webhook secret: ${update.error.message}`);
console.log("GitHub connection: webhook secret rotated (access token untouched).");

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
