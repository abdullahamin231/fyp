/**
 * Provider secrets (`integration_connections`, `integration_apps`) are stored
 * as plain text for now: at-rest encryption was dropped as out of scope for the
 * mid evaluation. The `*_ciphertext` column names and these function names are
 * kept so encryption can be reinstated here without touching any call site.
 * The optional second argument is accepted and ignored.
 */
export function encryptSecret(value: string, _passphrase?: string): string {
  return value;
}

export function decryptSecret(value: string, _passphrase?: string): string {
  return value;
}
