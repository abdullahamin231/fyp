import { NextResponse, type NextRequest } from "next/server";
import { adapters } from "@/lib/integrations/adapters";
import { asRecord, rawHash, text } from "@/lib/integrations/common";
import { connectionForWebhook, persistDelivery } from "@/lib/integrations/server";
import { isProvider } from "@/lib/integrations/types";
import { recordCheckpoint } from "@/lib/integrations/checkpoints";
import { loadJiraCriteriaField } from "@/lib/integrations/pipeline-settings";
import {
  evaluateWorkflowRule,
  ingestJiraIssue,
  processPullRequestDelivery,
  upsertNormalizedEvents,
} from "@/lib/integrations/pipeline";
import { githubDeliveryEventId } from "@/lib/integrations/events";
import { admin } from "@/lib/supabase/admin";

const MAX_BODY_BYTES = 10 * 1024 * 1024;

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
    const db = admin();
    let events = adapter.normalise(payload, receivedAt, headers);
    const deliveryId = events[0]?.vendorDeliveryId
      ?? headers.get("x-github-delivery")
      ?? headers.get("x-atlassian-webhook-identifier")
      ?? `${rawProvider}:${rawHash(rawBody)}`;
    let firstEvent = events[0];
    // A GitHub pull-request event is recorded by the linker itself (one
    // transaction: event, PR node, TRACKS edges), so the plain insert below is
    // skipped for it. Inserting it here first would make the linker see its own
    // delivery as a duplicate and link nothing.
    const isPullRequest = rawProvider === "github" && firstEvent?.entityType === "pull_request";
    if (!isPullRequest) {
      events = await upsertNormalizedEvents(db, workspaceId, rawProvider, events, rawHash(rawBody));
      firstEvent = events[0];
    }
    const githubEventId = isPullRequest ? await githubDeliveryEventId(db, workspaceId, deliveryId) : null;
    await persistDelivery({
      workspaceId,
      provider: rawProvider,
      deliveryId,
      eventId: isPullRequest ? githubEventId : (firstEvent?.eventId ?? null),
      payload,
    });
    const pipeline: Record<string, unknown> = {};
    if (isPullRequest) {
      Object.assign(pipeline, await processPullRequestDelivery(db, { workspaceId, deliveryId, payload, rawHash: rawHash(rawBody), receivedAt }));
      await recordCheckpoint(db, {
        workspaceId,
        provider: rawProvider,
        resource: { provider: "github", repositoryFullName: text(asRecord(payload.repository).full_name) ?? "" },
        eventId: githubEventId!,
        eventTime: firstEvent!.occurredAt,
      });
    }
    if (rawProvider === "jira" && firstEvent) {
      const ticket = await ingestJiraIssue(
        db,
        workspaceId,
        firstEvent.eventId,
        payload,
        await loadJiraCriteriaField(workspaceId, db),
        firstEvent.occurredAt,
      );
      if (ticket) {
        pipeline.ticket = ticket;
        if (ticket.kind === "ticket") pipeline.findingsCreated = await evaluateWorkflowRule(db, ticket.nodeId);
      }
      await recordCheckpoint(db, {
        workspaceId,
        provider: rawProvider,
        resource: { provider: "jira", projectKey: firstEvent.entityId.split("-")[0]! },
        eventId: firstEvent.eventId,
        eventTime: firstEvent.occurredAt,
      });
    }
    if (rawProvider === "figma" && events.length > 0) {
      await recordCheckpoint(db, {
        workspaceId,
        provider: rawProvider,
        resource: {
          provider: "figma",
          fileKey: text(payload.file_key) ?? text(payload.fileKey) ?? events[0]!.entityId.split(":")[0]!,
        },
        eventId: events[0]!.eventId,
        eventTime: events[0]!.occurredAt,
      });
    }
    return NextResponse.json({ accepted: true, events: events.length, ...pipeline });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook rejected";
    const status = message.includes("signature") || message.includes("passcode") ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
