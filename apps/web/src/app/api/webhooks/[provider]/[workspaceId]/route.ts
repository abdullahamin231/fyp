import { NextResponse, type NextRequest } from "next/server";
import { adapters } from "@/lib/integrations/adapters";
import { rawHash } from "@/lib/integrations/common";
import { connectionForWebhook, persistDelivery } from "@/lib/integrations/server";
import { isProvider } from "@/lib/integrations/types";
import { evaluateWorkflowRule, linkPullRequestFromGithub, upsertTicketFromJira } from "@/lib/integrations/pipeline";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const MAX_BODY_BYTES = 10 * 1024 * 1024;

function admin() {
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) is required for webhooks");
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: NextRequest, context: { params: Promise<{ provider: string; workspaceId: string }> }) {
  const { provider: rawProvider, workspaceId } = await context.params;
  if (!isProvider(rawProvider)) return NextResponse.json({ error: "Unsupported provider" }, { status: 404 });
  const rawBody = Buffer.from(await request.arrayBuffer());
  if (rawBody.byteLength > MAX_BODY_BYTES) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  try {
    const secret = await connectionForWebhook(workspaceId, rawProvider);
    const adapter = adapters[rawProvider];
    const headers = request.headers;
    adapter.verify(rawBody, headers, secret);
    const payload = JSON.parse(rawBody.toString("utf8")) as Record<string, unknown>;
    const receivedAt = new Date();
    const events = adapter.normalise(payload, receivedAt, headers);
    const deliveryId = events[0]?.vendorDeliveryId
      ?? headers.get("x-github-delivery")
      ?? headers.get("x-atlassian-webhook-identifier")
      ?? `${rawProvider}:${rawHash(rawBody)}`;
    const firstEvent = events[0];
    // A GitHub pull-request event is recorded by the linker itself (one
    // transaction: event, PR node, TRACKS edges), so the plain insert below is
    // skipped for it. Inserting it here first would make the linker see its own
    // delivery as a duplicate and link nothing.
    const isPullRequest = rawProvider === "github" && firstEvent?.entityType === "pull_request";
    await persistDelivery({
      workspaceId,
      provider: rawProvider,
      deliveryId,
      eventId: isPullRequest ? `github:${deliveryId}` : (firstEvent?.eventId ?? null),
      payload,
    });
    const db = admin();
    const pipeline: Record<string, unknown> = {};
    if (isPullRequest) {
      const link = await linkPullRequestFromGithub(db, workspaceId, deliveryId, payload, rawHash(rawBody), receivedAt);
      pipeline.linking = link;
      if (link.prNodeId) pipeline.findingsCreated = await evaluateWorkflowRule(db, link.prNodeId);
    } else if (events.length > 0) {
      const { error } = await db.from("events").upsert(events.map((event) => ({
        event_id: event.eventId,
        vendor_delivery_id: event.vendorDeliveryId,
        workspace_id: workspaceId,
        source_tool: rawProvider,
        entity_type: event.entityType,
        entity_id: event.entityId,
        version: event.version,
        action: event.action,
        state_before: event.stateBefore,
        state_after: event.stateAfter,
        actor: event.actor,
        occurred_at: event.occurredAt,
        received_at: event.receivedAt,
        references: event.references,
        raw_hash: rawHash(rawBody),
        schema_version: 1,
      })), { onConflict: "event_id", ignoreDuplicates: true });
      if (error) throw new Error(`Could not persist normalized event: ${error.message}`);
    }
    if (rawProvider === "jira" && firstEvent) {
      const ticket = await upsertTicketFromJira(db, workspaceId, payload, firstEvent.occurredAt);
      if (ticket) {
        pipeline.ticket = ticket;
        pipeline.findingsCreated = await evaluateWorkflowRule(db, ticket.ticketNodeId);
      }
    }
    return NextResponse.json({ accepted: true, events: events.length, ...pipeline });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook rejected";
    const status = message.includes("signature") || message.includes("passcode") ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
