/**
 * Figma webhook smoke test (INTEGRATION_WEBHOOK_TESTING.md §9 and §10, Figma rows).
 *
 * Runs against the app on localhost, so no tunnel and no Figma OAuth app are
 * needed. The webhook route reads the passcode from integration_connections
 * (normally written by the OAuth callback); if the workspace has no Figma
 * connection yet, this script writes one marked "smoke test (no OAuth)" with
 * the encrypted FIGMA_WEBHOOK_SECRET and a placeholder instead of a token.
 *
 *   terminal 1:  npm run dev
 *   terminal 2:  node scripts/figma-webhook-smoke.mjs [workspace-uuid] [base-url]
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const need = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "INTEGRATION_ENCRYPTION_KEY", "FIGMA_WEBHOOK_SECRET"];
const missing = need.filter((k) => !process.env[k]);
if (missing.length) { console.error("Missing in apps/web/.env.local:", missing.join(", ")); process.exitCode = 1; throw new Error("__stop__"); }

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

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const secret = process.env.FIGMA_WEBHOOK_SECRET;
const base = (process.argv[3] ?? "http://localhost:3000").replace(/\/$/, "");

// 1. Workspace and a workspace owner/admin (integration_connections.created_by must be a real user)
let workspaceId = process.argv[2];
let q = db.from("workspaces").select("id, name, slug, created_by, created_at").order("created_at", { ascending: false });
if (workspaceId) q = q.eq("id", workspaceId);
const wsList = await q;
if (wsList.error) die(`Could not read workspaces: ${wsList.error.message}`);
if (workspaceId && !wsList.data?.length) die(`No workspace with id ${workspaceId}.`);
let ws = null, ownerId = null;
for (const w of wsList.data) {
  const m = await db.from("workspace_members").select("user_id, role").eq("workspace_id", w.id).in("role", ["owner", "admin"]).limit(1).maybeSingle();
  const uid = w.created_by ?? m.data?.user_id ?? null;
  if (uid) { ws = w; ownerId = uid; break; }
}
if (!ws && !process.argv[2]) {
  // The onboarding screen does not create workspaces yet, so make a test one
  // owned by the most recently signed-up user (a trigger adds the owner membership).
  const users = await db.auth.admin.listUsers({ page: 1, perPage: 50 });
  if (users.error) die(`Could not list users: ${users.error.message}`);
  const newest = [...(users.data?.users ?? [])].sort((x, y) => String(y.created_at).localeCompare(String(x.created_at)))[0];
  if (!newest) die("No users yet. Sign up once at http://localhost:3000/signup, then run this again.");
  const made = await db.from("workspaces").insert({ name: "Figma smoke test", slug: `figma-smoke-${Date.now().toString(36)}`, created_by: newest.id }).select("id, name, slug, created_by").single();
  if (made.error) die(`Could not create a test workspace: ${made.error.message}`);
  ws = made.data; ownerId = newest.id;
  console.log(`Created test workspace "${ws.name}" owned by ${newest.email ?? newest.id}.`);
}
if (!ws) die("That workspace has no owner/admin user.");
workspaceId = ws.id;
console.log(`Workspace: ${ws.name} (slug ${ws.slug}, id ${workspaceId})`);

// 2. Figma connection holding the passcode
const conn = await db.from("integration_connections").select("webhook_secret_ciphertext, external_account_name")
  .eq("workspace_id", workspaceId).eq("provider", "figma").maybeSingle();
if (conn.error) die("Could not read integration_connections (is migration 00010_integrations applied?):" + " " + conn.error.message);
if (!conn.data) {
  const { error } = await db.from("integration_connections").insert({
    workspace_id: workspaceId, provider: "figma",
    access_token_ciphertext: encrypt("smoke-test-placeholder-not-a-token"),
    webhook_secret_ciphertext: encrypt(secret),
    external_account_name: "smoke test (no OAuth)", scopes: [], created_by: ownerId,
  });
  if (error) die("Could not create the Figma connection:" + " " + error.message);
  console.log("Figma connection: created for the smoke test (no OAuth).");
} else if (!conn.data.webhook_secret_ciphertext || (() => { try { return decrypt(conn.data.webhook_secret_ciphertext); } catch { return null; } })() !== secret) {
  die(`A Figma connection exists ("${conn.data.external_account_name ?? "?"}") but its passcode is not FIGMA_WEBHOOK_SECRET (or it was encrypted with a different INTEGRATION_ENCRYPTION_KEY). Reconnect Figma or fix the secret; nothing was changed.`);
} else console.log("Figma connection: exists, passcode matches.");

// 3. Requests
const run = Date.now().toString(36);
const url = `${base}/api/webhooks/figma/${workspaceId}`;
const post = async (body, to = url) => {
  const r = await fetch(to, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  let json = null; try { json = await r.json(); } catch {}
  return { status: r.status, json };
};
const ev = (id, extra) => ({ id, passcode: secret, file_key: `smoke-file-${run}`, timestamp: new Date().toISOString(), user: { handle: "integration-test" }, ...extra });
const count = async (table, deliveryId) => {
  const col = table === "events" ? "vendor_delivery_id" : "vendor_delivery_id";
  const { count, error } = await db.from(table).select("*", { count: "exact", head: true }).eq(col, deliveryId).eq(table === "events" ? "source_tool" : "provider", "figma");
  if (error) throw new Error(error.message);
  return count;
};

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok, detail }); };

const v1 = `smoke-${run}-version`;
const a = await post(ev(v1, { event_type: "FILE_VERSION_UPDATE", version_id: `v-${run}` }));
check("FILE_VERSION_UPDATE accepted", a.status === 200 && a.json?.events === 1, `${a.status} ${JSON.stringify(a.json)}`);

const b = await post(ev(v1, { event_type: "FILE_VERSION_UPDATE", version_id: `v-${run}` }));
const nDel = await count("integration_deliveries", v1), nEv = await count("events", v1);
check("Same delivery twice: one receipt, one event", b.status === 200 && nDel === 1 && nEv === 1, `${b.status}; receipts ${nDel}, events ${nEv}`);

const c = await post({ ...ev(`smoke-${run}-bad`, { event_type: "FILE_VERSION_UPDATE" }), passcode: "wrong-passcode" });
check("Wrong passcode rejected (401)", c.status === 401, `${c.status} ${JSON.stringify(c.json)}`);

const d = await post(ev(`smoke-${run}-noisy`, { event_type: "FILE_UPDATE" }));
check("FILE_UPDATE ignored (200, 0 events)", d.status === 200 && d.json?.events === 0, `${d.status} ${JSON.stringify(d.json)}`);

const dm = `smoke-${run}-devmode`;
const e = await post(ev(dm, { event_type: "DEV_MODE_STATUS_UPDATE", node_id: "1:2", previous_status: "NONE", status: "READY_FOR_DEV" }));
check("DEV_MODE_STATUS_UPDATE accepted", e.status === 200 && e.json?.events === 1, `${e.status} ${JSON.stringify(e.json)}`);

const f = await post(ev(`smoke-${run}-x`, { event_type: "FILE_VERSION_UPDATE" }), `${base}/api/webhooks/slack/${workspaceId}`);
check("Unsupported provider (404)", f.status === 404, String(f.status));

// 4. What landed in events
const { data: rows } = await db.from("events")
  .select("event_id, entity_type, entity_id, version, action, state_before, state_after, actor")
  .eq("source_tool", "figma").in("vendor_delivery_id", [v1, dm]);
const ver = rows?.find((r) => r.action === "FILE_VERSION_UPDATE");
const dev = rows?.find((r) => r.action === "DEV_MODE_STATUS_UPDATE");
check("Version event normalised (design_artifact, version id)", ver?.entity_type === "design_artifact" && ver?.version === `v-${run}`, JSON.stringify(ver));
check("Dev-mode event carries the transition", dev?.state_before === "NONE" && dev?.state_after === "READY_FOR_DEV", JSON.stringify(dev));

console.log("");
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}\n      ${r.detail}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed (run ${run})`);
process.exitCode = failed ? 1 : 0;
