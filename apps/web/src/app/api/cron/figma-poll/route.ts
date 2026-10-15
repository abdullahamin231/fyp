import { NextResponse } from "next/server";
import { figmaWatchedWorkspaces, pollFigmaWorkspace } from "@/lib/integrations/figma-poll";

/**
 * Scheduled Figma polling (Vercel Cron → `vercel.json`).
 *
 * Polling is the interval-based half of the Figma integration: it cannot see
 * Dev Mode status changes or file deletions (the webhook path covers those),
 * and a file's first poll only baselines it. This route runs the same
 * `pollFigmaWorkspace` the workspace surface's "Poll now" button runs, over
 * every workspace that has at least one watched file.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. Without the
 * secret configured the route refuses every call rather than polling
 * unauthenticated — a poll uses a stored OAuth token, so it must never be
 * publicly triggerable.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const presented = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!secret || presented !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaces = await figmaWatchedWorkspaces();
  const results: Record<string, unknown> = {};
  for (const workspace of workspaces) {
    try {
      results[workspace.slug] = await pollFigmaWorkspace(workspace.id);
    } catch (error) {
      results[workspace.slug] = { error: error instanceof Error ? error.message : "Poll failed" };
    }
  }
  return NextResponse.json({ workspaces: workspaces.length, results });
}
