/**
 * AES-256-GCM for provider secrets at rest (`integration_connections`,
 * `integration_apps`). The web app encrypts on OAuth callback; the worker
 * decrypts to clone with the workspace's own token. Server-only: imported by
 * its own subpath so client bundles never pull in `node:crypto`.
 *
 * Format: `<iv>.<tag>.<ciphertext>`, each base64url; key = SHA-256 of the
 * configured passphrase (INTEGRATION_ENCRYPTION_KEY).
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function keyFrom(passphrase: string): Buffer {
  if (!passphrase) throw new Error("INTEGRATION_ENCRYPTION_KEY is required for integrations");
  return createHash("sha256").update(passphrase).digest();
}

export function encryptSecret(value: string, passphrase: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFrom(passphrase), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptSecret(value: string, passphrase: string): string {
  const [iv, tag, ciphertext] = value.split(".");
  if (!iv || !tag || !ciphertext) throw new Error("Malformed encrypted integration secret");
  const decipher = createDecipheriv("aes-256-gcm", keyFrom(passphrase), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8");
}
