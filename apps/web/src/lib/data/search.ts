import { createHash } from "node:crypto";
import { buildSearchIndex, tokenSuggestionsFor } from "@/lib/domain/search-index";
import type { QueryToken, SearchMatch, SearchMeta } from "@/lib/domain/search";
import { loadExplorerGraph } from "./graph";
import { listFindings } from "./queries";
import { listRules } from "./rules";

export async function loadSearchIndex(): Promise<{ matches: SearchMatch[]; suggestions: QueryToken[]; meta: SearchMeta }> {
  const started = Date.now();
  const now = new Date();
  const [findings, graph, rules] = await Promise.all([listFindings(), loadExplorerGraph(), listRules(now)]);
  const matches = buildSearchIndex({ findings, graph, rules, now });
  return {
    matches,
    suggestions: tokenSuggestionsFor(matches),
    meta: {
      engine: `${matches.length} records indexed`,
      indexSha: createHash("sha256").update(matches.map((m) => m.id).join("\n")).digest("hex").slice(0, 12),
      latencyMs: Date.now() - started,
    },
  };
}
