import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { EventReference, IntegrationProvider } from "./types";

export function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function text(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function rawHash(rawBody: Buffer): string {
  return createHash("sha256").update(rawBody).digest("hex");
}

export function verifyHmacSha256(rawBody: Buffer, signature: string | null, secret: string, prefix: string) {
  if (!signature?.startsWith(prefix)) throw new Error("Missing webhook signature");
  const supplied = Buffer.from(signature.slice(prefix.length), "hex");
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    throw new Error("Invalid webhook signature");
  }
}

export function referencesFromText(
  provider: IntegrationProvider,
  values: Array<[string, unknown]>,
): EventReference[] {
  const references: EventReference[] = [];
  const seen = new Set<string>();
  for (const [provenance, value] of values) {
    const input = text(value);
    if (!input) continue;
    for (const match of input.matchAll(/\b[A-Z][A-Z0-9]{1,9}-\d+\b/g)) {
      const key = `${provider}:Ticket:${match[0]}`;
      if (!seen.has(key)) {
        seen.add(key);
        references.push({
          sourceTool: provider,
          entityType: "Ticket",
          entityId: match[0],
          provenance,
        });
      }
    }
    for (const match of input.matchAll(/https?:\/\/[^\s<>"')]+/g)) {
      const url = match[0].replace(/[.,;]+$/, "");
      const key = `${provider}:url:${url}`;
      if (!seen.has(key)) {
        seen.add(key);
        references.push({ sourceTool: provider, entityType: "ExternalReference", entityId: url, url, provenance });
      }
    }
  }
  return references;
}
