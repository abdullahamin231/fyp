import { readFile } from "node:fs/promises";
import {
  fixtureBundleSchema,
  fixtureBundleSources,
  type FixtureBundle,
} from "../../fixture/bundle.js";
import type { EvidenceBundle, EvidenceProvider, ProviderContext } from "../provider.js";

/**
 * Evidence from a frozen case bundle (tests, CI, offline demos).
 *
 * Pure and synchronous in behaviour: loading a bundle performs no I/O beyond
 * reading the file the caller already chose, so a packet built from a bundle
 * is fully determined by its bytes — which is what makes it usable as the
 * reference input for reproducibility checks (FR-08).
 */
export class FixtureEvidenceProvider implements EvidenceProvider {
  readonly name = "fixture";

  constructor(private readonly bundle: FixtureBundle) {}

  async load(_ctx: ProviderContext): Promise<EvidenceBundle> {
    return fixtureBundleSources(this.bundle);
  }
}

/** Read and strictly validate a bundle file. Malformed cases fail here, loudly. */
export async function loadFixtureBundle(path: string): Promise<FixtureBundle> {
  const raw = await readFile(path, "utf8");
  const parsed = fixtureBundleSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.map(String).join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    throw new Error(`fixture bundle ${path} is invalid — ${detail}`);
  }
  return parsed.data;
}
