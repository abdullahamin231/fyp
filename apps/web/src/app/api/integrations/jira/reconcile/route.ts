import { NextResponse, type NextRequest } from "next/server";
import { reconcileJiraWorkspace } from "@/lib/integrations/jira-reconcile";
import { requireWorkspaceAdmin } from "@/lib/integrations/server";

/** Replay any Jira issue updated in the last day that the graph has not recorded (admin, `?workspace=<slug>`). */
export async function POST(request: NextRequest) {
  const slug = new URL(request.url).searchParams.get("workspace");
  if (!slug) return NextResponse.json({ error: "workspace is required" }, { status: 400 });
  try {
    const { workspaceId } = await requireWorkspaceAdmin(slug);
    return NextResponse.json(await reconcileJiraWorkspace(workspaceId));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not reconcile Jira" }, { status: 400 });
  }
}
