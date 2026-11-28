import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MODEL = "inkling-2-mini:26b-a5b";
const OLLAMA_CHAT_URL = "http://127.0.0.1:11434/api/chat";
const REQUEST_TIMEOUT_MS = 180_000;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 8_000;
const MAX_HISTORY_LENGTH = 24_000;

type ChatMessage = { role: "user" | "assistant"; content: string };

export const runtime = "nodejs";
export const maxDuration = 190;

export async function POST(request: Request) {
  const client = await createClient();
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in to use Inkling Chat." }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 32_000) {
    return NextResponse.json({ error: "Conversation is too long. Clear it and start again." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!isRecord(body) || !Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > MAX_MESSAGES) {
    return NextResponse.json({ error: `Send between 1 and ${MAX_MESSAGES} conversation messages.` }, { status: 400 });
  }

  const messages: ChatMessage[] = [];
  let totalLength = 0;
  for (const message of body.messages) {
    if (
      !isRecord(message) ||
      (message.role !== "user" && message.role !== "assistant") ||
      typeof message.content !== "string" ||
      message.content.trim().length === 0 ||
      message.content.length > MAX_MESSAGE_LENGTH
    ) {
      return NextResponse.json({ error: "Each message must have a valid role and non-empty text under 8,000 characters." }, { status: 400 });
    }
    totalLength += message.content.length;
    messages.push({ role: message.role, content: message.content });
  }

  if (messages.at(-1)?.role !== "user") {
    return NextResponse.json({ error: "The latest conversation message must be from you." }, { status: 400 });
  }
  if (totalLength > MAX_HISTORY_LENGTH) {
    return NextResponse.json({ error: "Conversation is too long. Clear it and start again." }, { status: 413 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(OLLAMA_CHAT_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: false,
        options: { temperature: 0 },
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Inkling Chat: Ollama returned HTTP ${response.status}`);
      return NextResponse.json({ error: "Inkling could not complete the request. Check that the model server is running." }, { status: 502 });
    }

    const result: unknown = await response.json();
    if (!isRecord(result) || !isRecord(result.message) || typeof result.message.content !== "string" || !result.message.content.trim()) {
      console.error("Inkling Chat: Ollama returned an invalid or empty chat response");
      return NextResponse.json({ error: "Inkling returned an invalid response. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ message: result.message.content }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (controller.signal.aborted) {
      return NextResponse.json({ error: "Inkling took too long to respond. Please try again." }, { status: 504 });
    }
    console.error("Inkling Chat: request to Ollama failed", error);
    return NextResponse.json({ error: "Could not reach Inkling. Check that the model server is running." }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
