import { createClient } from "@/lib/supabase/server";
import type { EvalMetric } from "@/lib/types";

/**
 * Evaluation tiles, computed from the verdicts the verifier has stored. Every
 * number is a count over real rows; nothing is estimated. Runs as the
 * signed-in reviewer, so RLS limits it to their workspaces.
 */

interface VerdictLite {
  status: string;
  gate_outcome: string;
  stop_reason: string;
  review_required: boolean;
}

function percent(part: number, whole: number): string {
  return whole === 0 ? "—" : `${Math.round((part / whole) * 100)}%`;
}

export async function loadEvalMetrics(): Promise<EvalMetric[]> {
  const client = await createClient();
  const res = await client
    .from("verdicts")
    .select("status, gate_outcome, stop_reason, review_required")
    .limit(5000);
  if (res.error) throw new Error(`verdicts: ${res.error.message}`);
  const verdicts = (res.data ?? []) as VerdictLite[];

  const total = verdicts.length;
  const gatePassed = verdicts.filter((v) => v.gate_outcome === "PASSED").length;
  const downgraded = verdicts.filter((v) => v.gate_outcome === "DOWNGRADED").length;
  const rejected = verdicts.filter((v) => v.gate_outcome === "REJECTED").length;
  const modelFailures = verdicts.filter(
    (v) => v.stop_reason === "MODEL_UNAVAILABLE" || v.stop_reason === "MALFORMED_OUTPUT",
  ).length;
  const reviews = verdicts.filter((v) => v.review_required).length;

  return [
    {
      id: "verdicts",
      label: "Verdicts stored",
      value: String(total),
      status: total > 0 ? "pass" : "watch",
    },
    {
      id: "gate-passed",
      label: "Passed the gate unchanged",
      value: percent(gatePassed, total),
      target: "100%",
      status: total === 0 ? "watch" : gatePassed === total ? "pass" : "watch",
    },
    {
      id: "gate-changed",
      label: "Downgraded or rejected by the gate",
      value: String(downgraded + rejected),
      status: downgraded + rejected === 0 ? "pass" : "watch",
    },
    {
      id: "model-failures",
      label: "Model unavailable or malformed",
      value: String(modelFailures),
      target: "0",
      status: modelFailures === 0 ? "pass" : "fail",
    },
    {
      id: "needs-review",
      label: "Needing human review",
      value: String(reviews),
      status: reviews === 0 ? "pass" : "watch",
    },
  ];
}
