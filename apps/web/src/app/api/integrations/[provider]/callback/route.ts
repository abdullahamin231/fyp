import { NextResponse, type NextRequest } from "next/server";
import { createHmac } from "node:crypto";
import { providerAppCredentials, saveConnection, type ProviderAppCredentials } from "@/lib/integrations/server";
import { isProvider, type IntegrationProvider } from "@/lib/integrations/types";

function verifyState(state: string, expectedProvider: IntegrationProvider) {
  const [encoded, signature] = state.split(".");
  const secret = process.env.OAUTH_STATE_SECRET;
  if (!encoded || !signature || !secret) throw new Error("Invalid OAuth state");
  const expected = createHmac("sha256", secret).update(encoded).digest("base64url");
  if (signature !== expected) throw new Error("Invalid OAuth state signature");
  const value = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as {
    provider: IntegrationProvider; workspace: string; workspaceId?: string; userId: string; exp: number;
  };
  if (value.provider !== expectedProvider || value.exp < Date.now()) throw new Error("Expired OAuth state");
  return value;
}

async function exchange(
  provider: IntegrationProvider,
  code: string,
  redirectUri: string,
  credentials: ProviderAppCredentials,
) {
  type TokenConfig = {
    tokenUrl: string;
    /** Provider-specific extra form fields. Values are always strings because
     *  the whole object is spread into a URLSearchParams below. */
    body: Record<string, string>;
  };
  const allProviders: Record<IntegrationProvider, TokenConfig> = {
    github: {
      tokenUrl: "https://github.com/login/oauth/access_token",
      body: { redirect_uri: redirectUri },
    },
    jira: {
      tokenUrl: "https://auth.atlassian.com/oauth/token",
      body: { audience: "api.atlassian.com", grant_type: "authorization_code", redirect_uri: redirectUri },
    },
    figma: {
      tokenUrl: "https://api.figma.com/v1/oauth/token",
      // Figma requires the same redirect_uri as the authorize step.
      body: { redirect_uri: redirectUri },
    },
  };
  const configs = allProviders[provider];
  // Figma takes the client credentials as HTTP Basic auth, not in the form body.
  const basicAuth = provider === "figma";
  const form = new URLSearchParams({
    grant_type: "authorization_code",
    ...(basicAuth ? {} : { client_id: credentials.clientId, client_secret: credentials.clientSecret }),
    code,
    ...configs.body,
  });
  const headers: Record<string, string> = { "content-type": "application/x-www-form-urlencoded", accept: "application/json" };
  if (basicAuth) headers.authorization = `Basic ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString("base64")}`;
  const response = await fetch(configs.tokenUrl, {
    method: "POST",
    headers,
    body: form,
  });
  if (!response.ok) throw new Error(`OAuth token exchange failed (${response.status})`);
  return (await response.json()) as { access_token?: string; refresh_token?: string; expires_in?: number; scope?: string };
}

/** Where to send the browser afterwards: the workspace's integrations page.
 *  The slug is only read from the state to build a path (validated as kebab-case);
 *  the state is verified separately before anything is stored. */
function returnPath(state: string | null): string {
  try {
    const encoded = state?.split(".")[0];
    const slug = encoded ? (JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as { workspace?: string }).workspace : undefined;
    if (slug && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return `/workspaces/${slug}/integrations`;
  } catch {}
  return "/workspaces";
}

export async function GET(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider: rawProvider } = await context.params;
  if (!isProvider(rawProvider)) return NextResponse.json({ error: "Unsupported provider" }, { status: 404 });
  const provider = rawProvider;
  try {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const oauthError = request.nextUrl.searchParams.get("error");
    if (oauthError) throw new Error(`Provider denied access: ${oauthError}`);
    if (!code || !state) throw new Error("OAuth callback is missing code or state");
    const stateValue = verifyState(state, provider);
    const workspaceId = stateValue.workspaceId ?? stateValue.workspace;
    const credentials = await providerAppCredentials(workspaceId, provider);
    const redirectUri = `${request.nextUrl.origin}/api/integrations/${provider}/callback`;
    const token = await exchange(provider, code, redirectUri, credentials);
    if (!token.access_token) throw new Error("Provider returned no access token");
    await saveConnection({
      workspaceId,
      provider,
      userId: stateValue.userId,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000).toISOString() : undefined,
      scopes: token.scope?.split(/[ ,]+/).filter(Boolean) ?? [],
      webhookSecret: credentials.webhookSecret,
    });
    return NextResponse.redirect(new URL(`${returnPath(state)}?integration=${provider}&connected=1`, request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth callback failed";
    return NextResponse.redirect(new URL(`${returnPath(request.nextUrl.searchParams.get("state"))}?integration=${provider}&error=${encodeURIComponent(message)}`, request.url));
  }
}
