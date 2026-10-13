import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { IntegrationProvider } from "./types";

export type ProviderAppCredentials = {
  clientId: string;
  clientSecret: string;
  webhookSecret: string;
};

function admin() {
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) is required for integrations");
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function encryptionKey() {
  const value = process.env.INTEGRATION_ENCRYPTION_KEY;
  if (!value) throw new Error("INTEGRATION_ENCRYPTION_KEY is required for integrations");
  return createHash("sha256").update(value).digest();
}

export function encryptSecret(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptSecret(value: string): string {
  const [iv, tag, ciphertext] = value.split(".");
  if (!iv || !tag || !ciphertext) throw new Error("Malformed encrypted integration secret");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8");
}

export async function providerAppCredentials(
  workspaceId: string,
  provider: IntegrationProvider,
): Promise<ProviderAppCredentials> {
  const { data, error } = await admin()
    .from("integration_apps")
    .select("client_id, client_secret_ciphertext, webhook_secret_ciphertext")
    .eq("workspace_id", workspaceId)
    .eq("provider", provider)
    .maybeSingle();
  if (error) throw new Error(`Could not load ${provider} app registration: ${error.message}`);
  if (!data) {
    throw new Error(
      `No ${provider} app is registered for this workspace. ` +
      `Register one in workspace settings before connecting.`,
    );
  }
  return {
    clientId: data.client_id,
    clientSecret: decryptSecret(data.client_secret_ciphertext),
    webhookSecret: decryptSecret(data.webhook_secret_ciphertext),
  };
}

export async function saveProviderApp(input: {
  workspaceId: string;
  provider: IntegrationProvider;
  userId: string;
  clientId: string;
  clientSecret: string;
}): Promise<{ webhookSecret: string }> {
  const webhookSecret = randomBytes(32).toString("hex");
  const { error } = await admin().from("integration_apps").upsert({
    workspace_id: input.workspaceId,
    provider: input.provider,
    client_id: input.clientId.trim(),
    client_secret_ciphertext: encryptSecret(input.clientSecret.trim()),
    webhook_secret_ciphertext: encryptSecret(webhookSecret),
    created_by: input.userId,
    updated_at: new Date().toISOString(),
  }, { onConflict: "workspace_id,provider" });
  if (error) throw new Error(`Could not save ${input.provider} app registration: ${error.message}`);
  return { webhookSecret };
}

export async function providerAppStatus(workspaceId: string) {
  const { data, error } = await admin()
    .from("integration_apps")
    .select("provider, client_id, updated_at")
    .eq("workspace_id", workspaceId);
  if (error) throw new Error(`Could not load app registrations: ${error.message}`);
  return data ?? [];
}

export async function requireWorkspaceAdmin(workspaceSlug: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Authentication required");
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id")
    .eq("slug", workspaceSlug)
    .maybeSingle();
  if (workspaceError) throw new Error(`Could not load workspace: ${workspaceError.message}`);
  if (!workspace) throw new Error("Workspace not found");
  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspace.id)
    .eq("user_id", auth.user.id)
    .in("role", ["owner", "admin"])
    .maybeSingle();
  if (membershipError) throw new Error(`Could not load workspace membership: ${membershipError.message}`);
  if (!membership) throw new Error("Workspace administrator access required");
  return { userId: auth.user.id, workspaceId: workspace.id as string };
}

export async function saveConnection(input: {
  workspaceId: string;
  provider: IntegrationProvider;
  userId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  externalAccountId?: string;
  externalAccountName?: string;
  scopes: string[];
  webhookSecret?: string;
}) {
  const { error } = await admin().from("integration_connections").upsert({
    workspace_id: input.workspaceId,
    provider: input.provider,
    access_token_ciphertext: encryptSecret(input.accessToken),
    refresh_token_ciphertext: input.refreshToken ? encryptSecret(input.refreshToken) : null,
    token_expires_at: input.expiresAt ?? null,
    external_account_id: input.externalAccountId ?? null,
    external_account_name: input.externalAccountName ?? null,
    scopes: input.scopes,
    webhook_secret_ciphertext: input.webhookSecret ? encryptSecret(input.webhookSecret) : null,
    created_by: input.userId,
    updated_at: new Date().toISOString(),
  }, { onConflict: "workspace_id,provider" });
  if (error) throw new Error(`Could not save integration: ${error.message}`);
}

export async function connectionForWebhook(workspaceId: string, provider: IntegrationProvider) {
  const { data, error } = await admin()
    .from("integration_connections")
    .select("webhook_secret_ciphertext")
    .eq("workspace_id", workspaceId)
    .eq("provider", provider)
    .maybeSingle();
  if (error) throw new Error(`Could not load integration: ${error.message}`);
  if (!data?.webhook_secret_ciphertext) throw new Error("Webhook secret is not configured");
  return decryptSecret(data.webhook_secret_ciphertext);
}

export async function persistDelivery(input: {
  workspaceId: string;
  provider: IntegrationProvider;
  deliveryId: string;
  eventId: string | null;
  payload: Record<string, unknown>;
}) {
  const { error } = await admin().from("integration_deliveries").upsert({
    workspace_id: input.workspaceId,
    provider: input.provider,
    vendor_delivery_id: input.deliveryId,
    event_id: input.eventId,
    raw_payload: input.payload,
  }, { onConflict: "workspace_id,provider,vendor_delivery_id", ignoreDuplicates: true });
  if (error) throw new Error(`Could not persist webhook delivery: ${error.message}`);
}
