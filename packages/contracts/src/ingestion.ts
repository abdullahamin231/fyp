import { createHash } from "node:crypto";
import { sourceToolSchema, type SourceTool } from "./enums.js";
import {
  eventDedupeKey,
  normalisedEventSchema,
  type NormalisedEvent,
} from "./event.js";
import { isoDateTime, nonEmpty, uuid } from "./scalars.js";
import { z } from "zod";

/**
 * The adapter boundary. Vendor-specific code stops here; everything below it
 * operates on the normalised event envelope and resource checkpoints.
 */
export const vendorDeliverySchema = z.strictObject({
  deliveryId: nonEmpty,
  workspaceId: uuid,
  sourceTool: sourceToolSchema,
  resourceId: nonEmpty,
  entityType: nonEmpty,
  entityId: nonEmpty,
  version: z.string().min(1).nullable(),
  action: nonEmpty,
  stateBefore: z.string().nullable().optional(),
  stateAfter: z.string().nullable().optional(),
  actor: nonEmpty,
  occurredAt: isoDateTime,
  payload: z.record(z.string(), z.unknown()),
});
export type VendorDelivery = z.infer<typeof vendorDeliverySchema>;

export interface VendorResource {
  resourceId: string;
  entityType: string;
  entityId: string;
  version: string | null;
  action: string;
  stateBefore?: string | null;
  stateAfter?: string | null;
  actor: string;
  occurredAt: string;
  payload: Record<string, unknown>;
}

export interface VendorAdapter {
  poll(workspaceId: string, sourceTool: SourceTool): VendorResource[];
}

export interface IngestionCheckpoint {
  workspaceId: string;
  sourceTool: SourceTool;
  resourceId: string;
  lastEventId: string | null;
  lastStateAt: string | null;
  lastSuccessAt: string | null;
  sourceStale: boolean;
}

export type IngestionResult =
  | { status: "inserted"; event: NormalisedEvent; stateChanged: boolean }
  | { status: "duplicate"; event: NormalisedEvent; stateChanged: false }
  | { status: "ignored_older"; event: NormalisedEvent; stateChanged: false }
  | { status: "reconciled"; event: NormalisedEvent; stateChanged: boolean };

export interface IngestionSnapshot {
  events: NormalisedEvent[];
  resources: Map<string, NormalisedEvent>;
  checkpoints: IngestionCheckpoint[];
}

export interface IngestionEngineOptions {
  workspaceId: string;
  now?: () => string;
  staleAfterMs?: number;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(value: unknown): string {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

function resourceKey(sourceTool: SourceTool, resourceId: string): string {
  return `${sourceTool}:${resourceId}`;
}

function versionOrder(version: string | null, occurredAt: string): string {
  if (version !== null && /^\d+$/.test(version)) {
    return `0:${version}`;
  }
  return `1:${occurredAt}\u0000${version ?? ""}`;
}

function isNewer(candidate: NormalisedEvent, current: NormalisedEvent | undefined): boolean {
  if (!current) return true;
  if (
    candidate.version !== null &&
    current.version !== null &&
    /^\d+$/.test(candidate.version) &&
    /^\d+$/.test(current.version)
  ) {
    return BigInt(candidate.version) > BigInt(current.version);
  }
  const candidateVersion = versionOrder(candidate.version, candidate.occurredAt);
  const currentVersion = versionOrder(current.version, current.occurredAt);
  return candidateVersion > currentVersion;
}

function eventId(sourceTool: SourceTool, deliveryId: string): string {
  return `evt-${sha256(`${sourceTool}:${deliveryId}`).slice(0, 24)}`;
}

function toEvent(delivery: VendorDelivery, receivedAt: string): NormalisedEvent {
  return normalisedEventSchema.parse({
    schemaVersion: 1,
    eventId: eventId(delivery.sourceTool, delivery.deliveryId),
    vendorDeliveryId: delivery.deliveryId,
    workspaceId: delivery.workspaceId,
    sourceTool: delivery.sourceTool,
    entityType: delivery.entityType,
    entityId: delivery.entityId,
    version: delivery.version,
    action: delivery.action,
    stateBefore: delivery.stateBefore ?? null,
    stateAfter: delivery.stateAfter ?? null,
    actor: delivery.actor,
    occurredAt: delivery.occurredAt,
    receivedAt,
    references: [],
    rawHash: sha256(delivery.payload),
  });
}

/**
 * Deterministic in-memory ingestion core for demos and contract tests.
 *
 * The maps model the database uniqueness/checkpoint constraints: an event is
 * persisted before it can advance a resource, and an older delivery never
 * rewinds the materialised current state.
 */
export class IngestionEngine {
  private readonly eventsByDedupe = new Map<string, NormalisedEvent>();
  private readonly currentByResource = new Map<string, NormalisedEvent>();
  private readonly checkpointsByResource = new Map<string, IngestionCheckpoint>();
  private readonly unavailableSince = new Map<SourceTool, number>();
  private readonly now: () => string;
  private readonly staleAfterMs: number;

  constructor(private readonly options: IngestionEngineOptions) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.staleAfterMs = options.staleAfterMs ?? 15 * 60 * 1000;
    if (!Number.isFinite(this.staleAfterMs) || this.staleAfterMs <= 0) {
      throw new Error("staleAfterMs must be a positive finite number");
    }
  }

  ingest(delivery: VendorDelivery): IngestionResult {
    const parsed = vendorDeliverySchema.parse(delivery);
    if (parsed.workspaceId !== this.options.workspaceId) {
      throw new Error("delivery workspace does not match the ingestion engine");
    }

    const event = toEvent(parsed, this.now());
    const dedupe = eventDedupeKey(event);
    if (this.eventsByDedupe.has(dedupe)) {
      return { status: "duplicate", event, stateChanged: false };
    }

    this.eventsByDedupe.set(dedupe, event);
    const stateChanged = this.applyEvent(event, parsed.sourceTool, parsed.resourceId);
    return stateChanged
      ? { status: "inserted", event, stateChanged: true }
      : { status: "ignored_older", event, stateChanged: false };
  }

  reconcile(sourceTool: SourceTool, adapter: VendorAdapter): IngestionResult[] {
    try {
      const resources = adapter.poll(this.options.workspaceId, sourceTool);
      const results = resources.map((resource) => {
        const delivery = {
          deliveryId: `reconcile:${resource.resourceId}:${resource.version ?? resource.occurredAt}`,
          workspaceId: this.options.workspaceId,
          sourceTool: "system",
          resourceId: resource.resourceId,
          entityType: resource.entityType,
          entityId: resource.entityId,
          version: resource.version,
          action: "reconciled",
          stateBefore: null,
          stateAfter: resource.stateAfter ?? null,
          actor: "system",
          occurredAt: resource.occurredAt,
          payload: {
            sourceTool,
            resourceId: resource.resourceId,
            ...resource.payload,
          },
        } satisfies VendorDelivery;
        const event = toEvent(delivery, this.now());
        const dedupe = eventDedupeKey(event);
        if (this.eventsByDedupe.has(dedupe)) {
          return { status: "duplicate" as const, event, stateChanged: false as const };
        }
        this.eventsByDedupe.set(dedupe, event);
        const stateChanged = this.applyEvent(event, sourceTool, resource.resourceId);
        return { status: "reconciled" as const, event, stateChanged };
      });
      this.unavailableSince.delete(sourceTool);
      this.setSourceStale(sourceTool, false);
      return results;
    } catch (error) {
      const now = Date.parse(this.now());
      const since = this.unavailableSince.get(sourceTool) ?? now;
      this.unavailableSince.set(sourceTool, since);
      if (now - since >= this.staleAfterMs) this.setSourceStale(sourceTool, true);
      throw error;
    }
  }

  getCheckpoint(sourceTool: SourceTool, resourceId = ""): IngestionCheckpoint {
    return (
      this.checkpointsByResource.get(resourceKey(sourceTool, resourceId)) ?? {
        workspaceId: this.options.workspaceId,
        sourceTool,
        resourceId,
        lastEventId: null,
        lastStateAt: null,
        lastSuccessAt: null,
        sourceStale: false,
      }
    );
  }

  snapshot(): IngestionSnapshot {
    return {
      events: [...this.eventsByDedupe.values()],
      resources: new Map(this.currentByResource),
      checkpoints: [...this.checkpointsByResource.values()],
    };
  }

  private advanceCheckpoint(event: NormalisedEvent, stateSourceTool: SourceTool, resourceId: string): void {
    const key = resourceKey(stateSourceTool, resourceId);
    const previous = this.getCheckpoint(stateSourceTool, resourceId);
    this.checkpointsByResource.set(key, {
      ...previous,
      sourceTool: stateSourceTool,
      lastEventId: event.eventId,
      lastStateAt: event.occurredAt,
      lastSuccessAt: event.receivedAt,
    });
  }

  private applyEvent(event: NormalisedEvent, stateSourceTool: SourceTool, resourceId: string): boolean {
    const key = resourceKey(stateSourceTool, resourceId);
    const current = this.currentByResource.get(key);
    const stateChanged = isNewer(event, current);
    if (stateChanged) this.currentByResource.set(key, event);
    this.advanceCheckpoint(event, stateSourceTool, resourceId);
    return stateChanged;
  }

  private setSourceStale(sourceTool: SourceTool, stale: boolean): void {
    for (const [key, checkpoint] of this.checkpointsByResource) {
      if (checkpoint.sourceTool === sourceTool) {
        this.checkpointsByResource.set(key, { ...checkpoint, sourceStale: stale });
      }
    }
  }
}

/**
 * The deterministic half of §8.4's SOURCE_STALE marking.
 *
 * A source is stale when its checkpoint has been quiet for at least
 * `staleAfterMs`. A checkpoint that never recorded a success is stale by
 * definition — nobody can claim freshness that was never observed — and a
 * `lastSuccessAt` in the future (clock skew between the vendor and us) reads
 * as fresh rather than stale, because the quiet window has not opened yet.
 */
export function isSourceStale(
  checkpoint: Pick<IngestionCheckpoint, "lastSuccessAt">,
  now: string,
  staleAfterMs: number,
): boolean {
  if (!Number.isFinite(staleAfterMs) || staleAfterMs <= 0) {
    throw new Error("staleAfterMs must be a positive finite number");
  }
  if (checkpoint.lastSuccessAt === null) return true;
  const quietForMs = Date.parse(now) - Date.parse(checkpoint.lastSuccessAt);
  if (Number.isNaN(quietForMs)) {
    throw new Error("checkpoint.lastSuccessAt is not a parseable timestamp");
  }
  return quietForMs > staleAfterMs;
}

/** A controllable vendor double for duplicate, outage, and replay scenarios. */
export class MockVendor implements VendorAdapter {
  private available = true;
  private readonly resources = new Map<string, VendorResource>();

  constructor(
    readonly sourceTool: Exclude<SourceTool, "system">,
    initialResources: VendorResource[] = [],
  ) {
    for (const resource of initialResources) this.resources.set(resource.resourceId, resource);
  }

  setAvailable(available: boolean): void {
    this.available = available;
  }

  upsert(resource: VendorResource): void {
    this.resources.set(resource.resourceId, resource);
  }

  poll(workspaceId: string, sourceTool: SourceTool): VendorResource[] {
    if (!this.available) throw new Error(`${this.sourceTool} vendor is unavailable`);
    if (sourceTool !== this.sourceTool) throw new Error("source tool does not match mock vendor");
    void workspaceId;
    return [...this.resources.values()];
  }

  delivery(
    workspaceId: string,
    resourceId: string,
    deliveryId: string,
  ): VendorDelivery {
    const resource = this.resources.get(resourceId);
    if (!resource) throw new Error(`unknown mock resource: ${resourceId}`);
    return {
      deliveryId,
      workspaceId,
      sourceTool: this.sourceTool,
      ...resource,
    };
  }
}
