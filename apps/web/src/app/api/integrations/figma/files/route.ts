import { NextResponse, type NextRequest } from "next/server";
import {
  addFigmaWatchedFile,
  listFigmaWatchedFiles,
  removeFigmaWatchedFile,
} from "@/lib/integrations/figma-poll";
import { requireWorkspaceAdmin } from "@/lib/integrations/server";

async function workspaceAdmin(request: NextRequest) {
  const slug = new URL(request.url).searchParams.get("workspace");
  if (!slug) throw new Error("workspace is required");
  return requireWorkspaceAdmin(slug);
}

export async function GET(request: NextRequest) {
  try {
    const { workspaceId } = await workspaceAdmin(request);
    return NextResponse.json({ files: await listFigmaWatchedFiles(workspaceId) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load Figma files" }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { workspaceId, userId } = await workspaceAdmin(request);
    const body = await request.json() as { fileKey?: unknown };
    if (typeof body.fileKey !== "string" || !body.fileKey.trim()) {
      return NextResponse.json({ error: "A Figma file key is required" }, { status: 400 });
    }
    return NextResponse.json({ file: await addFigmaWatchedFile({ workspaceId, userId, fileKey: body.fileKey }) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not watch Figma file" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { workspaceId } = await workspaceAdmin(request);
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "file id is required" }, { status: 400 });
    await removeFigmaWatchedFile(workspaceId, id);
    return NextResponse.json({ removed: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not remove Figma file" }, { status: 400 });
  }
}
