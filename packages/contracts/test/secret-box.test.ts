import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "../src/secret-box.js";

describe("secret box (plaintext storage)", () => {
  it("round-trips without needing a key", () => {
    expect(decryptSecret(encryptSecret("gho_token"))).toBe("gho_token");
  });
});
