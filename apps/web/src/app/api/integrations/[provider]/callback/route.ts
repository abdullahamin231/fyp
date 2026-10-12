import { NextResponse, type NextRequest } from "next/server";
import { createHmac } from "node:crypto";
import { saveConnection } from "@/lib/integrations/server";
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

async function exchange(provider: IntegrationProvider, code: string, redirectUri: string) {
  type TokenConfig = {
    tokenUrl: string;
    clientId?: string;
    clientSecret?: string;
    /** Provider-specific extra form fields. Values are always strings because
     *  the whole object is spread into a URLSearchParams below. */
    body: Record<string, string>;
  };
  const allProviders: Record<IntegrationProvider, TokenConfig> = {
    github: {
      tokenUrl: "https://github.com/login/oauth/access_token",
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      body: { redirect_uri: redirectUri },
    },
    jira: {
      tokenUrl: "https://auth.atlassian.com/oauth/token",
      clientId: process.env.JIRA_CLIENT_ID,
      clientSecret: process.env.JIRA_CLIENT_SECRET,
      body: { audience: "api.atlassian.com", grant_type: "authorization_code", redirect_uri: redirectUri },
    },
    figma: {
      tokenUrl: "https://api.figma.com/v1/oauth/token",
      clientId: process.env.FIGMA_CLIENT_ID,
      clientSecret: process.env.FIGMA_CLIENT_SECRET,
      body: {},
    },
  };
  const configs = allProviders[provider];
  if (!configs.clientId || !configs.clientSecret) throw new Error(`${provider.toUpperCase()} OAuth credentials are not configured`);
  const form = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: configs.clientId,
    client_secret: configs.clientSecret,
    code,
    ...configs.body,
  });
  const response = await fetch(configs.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body: form,
  });
  if (!response.ok) throw new Error(`OAuth token exchange failed (${response.status})`);
  return (await response.json()) as { access_token?: string; refresh_token?: string; expires_in?: number; scope?: string };
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
    const redirectUri = `${request.nextUrl.origin}/api/integrations/${provider}/callback`;
    const token = await exchange(provider, code, redirectUri);
    if (!token.access_token) throw new Error("Provider returned no access token");
    await saveConnection({
      workspaceId: stateValue.workspaceId ?? stateValue.workspace,
      provider,
      userId: stateValue.userId,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000).toISOString() : undefined,
      scopes: token.scope?.split(/[ ,]+/).filter(Boolean) ?? [],
      webhookSecret: process.env[`${provider.toUpperCase()}_WEBHOOK_SECRET`],
    });
    return NextResponse.redirect(new URL(`/onboarding?integration=${provider}&connected=1`, request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth callback failed";
    return NextResponse.redirect(new URL(`/onboarding?integration=${provider}&error=${encodeURIComponent(message)}`, request.url));
  }
}
