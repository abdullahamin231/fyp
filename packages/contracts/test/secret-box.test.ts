import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "../src/secret-box.js";

describe("secret box", () => {
  it("round-trips and never repeats a ciphertext", () => {
    const a = encryptSecret("gho_token", "k");
    expect(decryptSecret(a, "k")).toBe("gho_token");
    expect(encryptSecret("gho_token", "k")).not.toBe(a);
  });

  it("decrypts the format the web app has been storing", () => {
    // The web app's original algorithm, passphrase "golden", fixed IV of 7s.
    expect(decryptSecret("BwcHBwcHBwcHBwcH.IUZJ-Kx39AaMMbsLqNGW3w.L-ruk6IYM8WJDw", "golden")).toBe("gho_golden");
  });

  it("refuses a wrong key or a tampered value", () => {
    const sealed = encryptSecret("secret", "right");
    expect(() => decryptSecret(sealed, "wrong")).toThrow();
    const [iv, tag, body] = sealed.split(".");
    expect(() => decryptSecret(`${iv}.${tag}.${body!.slice(0, -2)}AA`, "right")).toThrow();
    expect(() => decryptSecret("nodots", "right")).toThrow("Malformed");
  });
});
