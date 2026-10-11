import { NextResponse, type NextRequest } from "next/server";
import { createHmac, randomBytes } from "node:crypto";
import { isProvider } from "@/lib/integrations/types";
import { requireWorkspaceAdmin } from "@/lib/integrations/server";

function sign(value: string) {
  const secret = process.env.OAUTH_STATE_SECRET;
  if (!secret) throw new Error("OAUTH_STATE_SECRET is required for integrations");
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export async function GET(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  if (!isProvider(provider)) return NextResponse.json({ error: "Unsupported provider" }, { status: 404 });
  const workspace = request.nextUrl.searchParams.get("workspace");
  if (!workspace) return NextResponse.json({ error: "workspace is required" }, { status: 400 });
  try {
    const { userId, workspaceId } = await requireWorkspaceAdmin(workspace);
    const statePayload = Buffer.from(JSON.stringify({
      provider, workspace, workspaceId, userId, nonce: randomBytes(16).toString("hex"), exp: Date.now() + 10 * 60_000,
    })).toString("base64url");
    const state = `${statePayload}.${sign(statePayload)}`;
    const callback = `${request.nextUrl.origin}/api/integrations/${provider}/callback`;
    const config = {
      github: {
        url: "https://github.com/login/oauth/authorize",
        clientId: process.env.GITHUB_CLIENT_ID,
        scope: process.env.GITHUB_OAUTH_SCOPE ?? "read:org read:user",
      },
      jira: {
        url: "https://auth.atlassian.com/authorize",
        clientId: process.env.JIRA_CLIENT_ID,
        scope: process.env.JIRA_OAUTH_SCOPE ?? "read:jira-work read:jira-user offline_access",
      },
      figma: {
        url: "https://www.figma.com/oauth",
        clientId: process.env.FIGMA_CLIENT_ID,
        scope: process.env.FIGMA_OAUTH_SCOPE ?? "file_content:read file_metadata:read",
      },
    }[provider];
    if (!config.clientId) throw new Error(`${provider.toUpperCase()}_CLIENT_ID is not configured`);
    const url = new URL(config.url);
    url.searchParams.set("client_id", config.clientId);
    url.searchParams.set("redirect_uri", callback);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", config.scope);
    url.searchParams.set("state", state);
    if (provider === "jira") url.searchParams.set("audience", "api.atlassian.com");
    return NextResponse.redirect(url);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Authorization failed" }, { status: 400 });
  }
}
