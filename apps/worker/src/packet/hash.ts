import { sha256 } from "./tokens.js";

/**
 * Canonical JSON — object keys sorted, array order preserved.
 *
 * Two packets built from the same evidence must hash identically no matter how
 * the evidence was assembled in memory, so the packet hash is taken over this
 * form rather than over `JSON.stringify` of whatever object happens to be at
 * hand (FR-08 byte-identical reproducibility).
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalise(value));
}

function canonicalise(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalise);
  if (value !== null && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(source).sort()) {
      out[key] = canonicalise(source[key]);
    }
    return out;
  }
  return value;
}

/** SHA-256 over the canonical form of a value. */
export function canonicalHash(value: unknown): string {
  return sha256(canonicalJson(value));
}
