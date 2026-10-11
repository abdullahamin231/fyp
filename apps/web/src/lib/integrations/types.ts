export type IntegrationProvider = "figma" | "github" | "jira";

export type EventReference = {
  sourceTool: IntegrationProvider;
  entityType: string;
  entityId: string;
  url?: string;
  provenance: string;
};

export type NormalizedIntegrationEvent = {
  eventId: string;
  vendorDeliveryId: string;
  sourceTool: IntegrationProvider;
  entityType: string;
  entityId: string;
  version: string | null;
  action: string;
  stateBefore: string | null;
  stateAfter: string | null;
  actor: string;
  occurredAt: string;
  receivedAt: string;
  references: EventReference[];
  rawHash: string;
  payload: Record<string, unknown>;
};

export type IntegrationAdapter = {
  provider: IntegrationProvider;
  verify(rawBody: Buffer, headers: Headers, secret: string): void;
  normalise(payload: unknown, receivedAt: Date, headers: Headers): NormalizedIntegrationEvent[];
};

export function isProvider(value: string): value is IntegrationProvider {
  return value === "figma" || value === "github" || value === "jira";
}
