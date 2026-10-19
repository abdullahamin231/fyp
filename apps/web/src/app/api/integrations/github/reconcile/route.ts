import { NextResponse, type NextRequest } from "next/server";
import { reconcileGithubWorkspace } from "@/lib/integrations/github-reconcile";
import { requireWorkspaceAdmin } from "@/lib/integrations/server";

/** Replay any open pull request whose head the graph has not seen (admin, `?workspace=<slug>`). */
export async function POST(request: NextRequest) {
  const slug = new URL(request.url).searchParams.get("workspace");
  if (!slug) return NextResponse.json({ error: "workspace is required" }, { status: 400 });
  try {
    const { workspaceId } = await requireWorkspaceAdmin(slug);
    return NextResponse.json({ results: await reconcileGithubWorkspace(workspaceId) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not reconcile GitHub" }, { status: 400 });
  }
}
