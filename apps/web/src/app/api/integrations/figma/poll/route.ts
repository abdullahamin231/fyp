import { NextResponse, type NextRequest } from "next/server";
import { pollFigmaWorkspace } from "@/lib/integrations/figma-poll";
import { requireWorkspaceAdmin } from "@/lib/integrations/server";

export async function POST(request: NextRequest) {
  const slug = new URL(request.url).searchParams.get("workspace");
  if (!slug) return NextResponse.json({ error: "workspace is required" }, { status: 400 });
  try {
    const { workspaceId } = await requireWorkspaceAdmin(slug);
    return NextResponse.json({ results: await pollFigmaWorkspace(workspaceId) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not poll Figma" }, { status: 400 });
  }
}
