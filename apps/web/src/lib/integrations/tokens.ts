import { admin } from "@/lib/supabase/admin";
import { decryptSecret, encryptSecret, providerAppCredentials } from "./server";
import type { IntegrationProvider } from "./types";

/**
 * One way to get a usable provider token for a workspace: refreshed when it is
 * about to expire, with rotated refresh tokens stored back, and a typed error
 * when only a human reconnecting can fix it.
 *
 * The per-provider differences live in the two tables below, not in branches.
 */

export class ReconnectRequired extends Error {
  constructor(provider: IntegrationProvider, reason: string) {
    super(`${provider} needs to be reconnected: ${reason}`);
    this.name = "ReconnectRequired";
  }
}

interface RefreshSpec {
  url: string;
  /** How the app's client credentials travel. */
  clientAuth: "basic" | "body";
  encoding: "form" | "json";
  grantType: boolean;
}

/**
 * GitHub OAuth-app tokens do not expire unless expiring tokens are enabled,
 * in which case refresh rotates like Atlassian's. Figma's refresh returns no
 * new refresh token; the old one stays valid.
 * https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/
 * https://developers.figma.com/docs/rest-api/oauth-apps/
 */
const REFRESH: Record<IntegrationProvider, RefreshSpec> = {
  github: { url: "https://github.com/login/oauth/access_token", clientAuth: "body", encoding: "form", grantType: true },
  jira: { url: "https://auth.atlassian.com/oauth/token", clientAuth: "body", encoding: "json", grantType: true },
  figma: { url: "https://api.figma.com/v1/oauth/refresh", clientAuth: "basic", encoding: "form", grantType: false },
};

export interface ProviderAccount {
  id: string | null;
  name: string | null;
}

/** Who the token belongs to. For Jira the id is the site's cloudId, which every REST call needs. */
const IDENTITY: Record<IntegrationProvider, (token: string, fetchImpl: typeof fetch) => Promise<ProviderAccount>> = {
  async github(token, fetchImpl) {
    const user = (await getJson(fetchImpl, "https://api.github.com/user", token)) as { id?: number; login?: string };
    return { id: user.id === undefined ? null : String(user.id), name: user.login ?? null };
  },
  async jira(token, fetchImpl) {
    const sites = (await getJson(fetchImpl, "https://api.atlassian.com/oauth/token/accessible-resources", token)) as {
      id: string;
      name: string;
      url: string;
    }[];
    const site = sites[0];
    return { id: site?.id ?? null, name: site ? `${site.name} (${new URL(site.url).host})` : null };
  },
  async figma(token, fetchImpl) {
    const me = (await getJson(fetchImpl, "https://api.figma.com/v1/me", token)) as { id?: string; handle?: string; email?: string };
    return { id: me.id ?? null, name: me.handle ?? me.email ?? null };
  },
};

async function getJson(fetchImpl: typeof fetch, url: string, token: string): Promise<unknown> {
  const response = await fetchImpl(url, { headers: { authorization: `Bearer ${token}`, accept: "application/json" } });
  if (!response.ok) throw new Error(`${new URL(url).host} returned ${response.status}`);
  return response.json();
}

export function fetchProviderIdentity(provider: IntegrationProvider, token: string, fetchImpl: typeof fetch = fetch) {
  return IDENTITY[provider](token, fetchImpl);
}

/**
 * A real OAuth grant always carries scopes. A row without any holds only a
 * webhook secret (an older setup script stored a placeholder token beside
 * it), and its token must never be sent anywhere.
 */
export function isOAuthGrant(scopes: string[] | null | undefined): boolean {
  return (scopes ?? []).length > 0;
}

/** Refresh this long before expiry, so a token never dies mid-request. */
const SKEW_MS = 60_000;

export interface ProviderToken {
  accessToken: string;
  account: ProviderAccount;
}

export async function getProviderToken(
  workspaceId: string,
  provider: IntegrationProvider,
  deps: { fetch?: typeof fetch; now?: () => number } = {},
): Promise<ProviderToken> {
  const fetchImpl = deps.fetch ?? fetch;
  const now = deps.now ?? Date.now;
  const db = admin();
  const { data, error } = await db
    .from("integration_connections")
    .select("access_token_ciphertext, refresh_token_ciphertext, token_expires_at, external_account_id, external_account_name, scopes")
    .eq("workspace_id", workspaceId)
    .eq("provider", provider)
    .maybeSingle();
  if (error) throw new Error(`Could not load ${provider} connection: ${error.message}`);
  if (!data?.access_token_ciphertext) throw new ReconnectRequired(provider, "not connected");
  if (!isOAuthGrant(data.scopes)) throw new ReconnectRequired(provider, "only a webhook secret is stored; connect with OAuth");
  const account = { id: data.external_account_id ?? null, name: data.external_account_name ?? null };

  const expiresAt = data.token_expires_at ? Date.parse(data.token_expires_at) : null;
  if (expiresAt === null || expiresAt - SKEW_MS > now()) {
    return { accessToken: decryptSecret(data.access_token_ciphertext), account };
  }
  if (!data.refresh_token_ciphertext) throw new ReconnectRequired(provider, "token expired and there is no refresh token");

  const refreshToken = decryptSecret(data.refresh_token_ciphertext);
  const spec = REFRESH[provider];
  const credentials = await providerAppCredentials(workspaceId, provider);
  const fields: Record<string, string> = {
    ...(spec.grantType ? { grant_type: "refresh_token" } : {}),
    ...(spec.clientAuth === "body" ? { client_id: credentials.clientId, client_secret: credentials.clientSecret } : {}),
    refresh_token: refreshToken,
  };
  const headers: Record<string, string> = {
    accept: "application/json",
    "content-type": spec.encoding === "json" ? "application/json" : "application/x-www-form-urlencoded",
  };
  if (spec.clientAuth === "basic") {
    headers.authorization = `Basic ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString("base64")}`;
  }
  const response = await fetchImpl(spec.url, {
    method: "POST",
    headers,
    body: spec.encoding === "json" ? JSON.stringify(fields) : new URLSearchParams(fields),
  });
  const body = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
  };
  if (!response.ok || !body.access_token) {
    throw new ReconnectRequired(provider, `refresh failed (${body.error ?? response.status})`);
  }

  const update = await db
    .from("integration_connections")
    .update({
      access_token_ciphertext: encryptSecret(body.access_token),
      ...(body.refresh_token ? { refresh_token_ciphertext: encryptSecret(body.refresh_token) } : {}),
      token_expires_at: body.expires_in ? new Date(now() + body.expires_in * 1000).toISOString() : null,
      updated_at: new Date(now()).toISOString(),
    })
    .eq("workspace_id", workspaceId)
    .eq("provider", provider);
  if (update.error) throw new Error(`Could not store refreshed ${provider} token: ${update.error.message}`);
  return { accessToken: body.access_token, account };
}
