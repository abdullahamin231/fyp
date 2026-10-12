import { RULE_META, evidenceSpanSchema, type EvidenceSpan } from "@unify/contracts";
import type {
  ArtifactRef,
  Citation,
  CriterionResult,
  Finding,
  FindingStatus,
  Severity,
  ToolKind,
  Verdict,
} from "@/lib/types";
import type {
  DbFindingState,
  DbSeverity,
  FindingRow,
  NodeRow,
  PacketRow,
  VerdictRow,
} from "./rows";

/**
 * Database → view-model mapping for the reviewer surface.
 *
 * Pure and side-effect free, for one reason: the vocabulary *does* differ
 * (four severities → three chips, six finding states → six statuses, verdict
 * spans → citations with an excerpt). Keeping every translation in one file
 * means the difference is a documented decision instead of a `??` scattered
 * through components.
 */

/* ------------------------------------------------------------------ severity */

/**
 * `critical|high|medium|low` → the three chips this UI was designed around.
 * `high` is the interesting case: a contradicted criterion and a design-drift
 * rule both land at `high`, and both deserve the warning treatment rather than
 * the critical one — critical is reserved for "the change breaks a test".
 */
const SEVERITY_TO_WEB: Record<DbSeverity, Severity> = {
  critical: "critical",
  high: "warning",
  medium: "info",
  low: "info",
};

export function severityToWeb(severity: DbSeverity): Severity {
  return SEVERITY_TO_WEB[severity] ?? "info";
}

/** The six stored states are the six shown — no collapsing. */
export function statusToWeb(state: DbFindingState): FindingStatus {
  return state;
}

/* ---------------------------------------------------------------------- age */

export function ageLabel(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

/* ---------------------------------------------------------------- citations */

/** Which tool owns a citation locator — heuristics kept honest by the `(…)` labels. */
function toolForLocator(file: string): ToolKind {
  if (file === "(graph)") return "git";
  if (file.startsWith("(")) return "jira";
  return "github";
}

function locatorFor(span: EvidenceSpan): string {
  const symbol = span.symbol ? `#${span.symbol}` : "";
  const lines = span.startLine ? `:${span.startLine}-${span.endLine}` : "";
  return `${span.file}${symbol}${lines}`;
}

/** First few lines of the cited text — what the reviewer reads to judge the span. */
function excerptFrom(content: string | undefined): string {
  if (!content || content.trim() === "") return "(quoted text not stored in this packet)";
  const lines = content.split("\n").slice(0, 4).join("\n");
  return lines.length > 220 ? `${lines.slice(0, 220)}…` : lines;
}

/**
 * Verdict spans → citations, resolved against the packet the verdict was
 * computed from. `resolved` is not decoration: false means the span's id is
 * not in the manifest, i.e. the verdict cites something the packet did not
 * contain — the gate's `INVALID_CITATION` case, shown to the reviewer as a gap.
 */
export function citationsFrom(verdict: VerdictRow, packet: PacketRow | null): Citation[] {
  const spans = evidenceSpanSchema.array().safeParse(verdict.evidence);
  if (!spans.success) return [];

  const manifest = packet?.manifest?.slots ?? [];
  const items = manifest.flatMap((slot) => slot.included);

  return spans.data.map((span) => {
    const item = items.find((candidate) => candidate.id === span.spanId);
    return {
      locator: locatorFor(span),
      excerpt: excerptFrom(item?.content),
      tool: toolForLocator(span.file),
      resolved: item !== undefined,
    };
  });
}

/* ---------------------------------------------------------------- artifacts */

function pill(tool: ToolKind, ref: string, label: string): ArtifactRef {
  return { tool, ref, label };
}

/**
 * What the change touched, from the verdict's own citations plus the packet's
 * commits. Derived rather than queried: the evidence case is about what the
 * model actually cited, not about what the change might contain elsewhere.
 */
export function artifactsFrom(
  verdict: VerdictRow,
  packet: PacketRow | null,
  requirementRef: string | null,
): ArtifactRef[] {
  const out: ArtifactRef[] = [];
  const spans = evidenceSpanSchema.array().safeParse(verdict.evidence);
  if (spans.success) {
    const files = [...new Set(spans.data.map((span) => span.file).filter((f) => !f.startsWith("(")))];
    for (const file of files.slice(0, 4)) out.push(pill("github", file, "changed file"));
  }
  if (packet) {
    out.push(pill("git", packet.head_commit.slice(0, 8), "verified commit"));
  }
  if (requirementRef) out.push(pill("jira", requirementRef, "requirement"));
  return out;
}

/* --------------------------------------------------------------- the finding */

export interface FindingViewContext {
  verdict: VerdictRow | null;
  packet: PacketRow | null;
  criterion: NodeRow | null;
}

/**
 * One `findings` row → the `Finding` the detail screen renders.
 *
 * A verdict-origin finding carries its whole evidence case inline: verdict
 * status, gate outcome, stop reason, freshness, reason code and the citations
 * resolved against the packet. That is why this page needs no extra API — the
 * rows already are the evidence case.
 */
export function findingView(row: FindingRow, ctx: FindingViewContext): Finding {
  const { verdict, packet, criterion } = ctx;
  const requirementRef = criterion?.payload?.requirementRef ?? null;
  // Rule-origin findings carry the rule id end-to-end; verdict-origin findings
  // are not a policy, so they carry `null` and a "Criterion verification" title.
  const policyId = row.origin === "rule" && row.rule_id ? row.rule_id : null;
  const policyTitle = policyId ? (RULE_META[policyId]?.title ?? "Criterion verification") : "Criterion verification";

  const citations = verdict ? citationsFrom(verdict, packet) : [];
  const missingEvidence = verdict?.missing_evidence ? [verdict.missing_evidence] : [];

  const criterionResult: CriterionResult | null = verdict
    ? {
        criterionId: row.subject_node_id,
        requirementRef: requirementRef ?? row.subject_node_id.slice(0, 8),
        text: criterion?.payload?.text ?? row.annotation,
        verdict: verdict.status as Verdict,
        freshness: verdict.freshness_state,
        reviewRequired: verdict.review_required,
        ...(verdict.reason_code
          ? { reasonCode: verdict.reason_code as CriterionResult["reasonCode"] }
          : {}),
        evidence: citations,
        missingEvidence,
        ...(verdict.divergence_tag ? { divergenceTag: verdict.divergence_tag } : {}),
      }
    : {
        criterionId: row.subject_node_id,
        requirementRef: requirementRef ?? row.subject_node_id.slice(0, 8),
        text: criterion?.payload?.text ?? row.annotation,
        verdict: "INSUFFICIENT_EVIDENCE",
        freshness: "UNKNOWN",
        reviewRequired: true,
        evidence: [],
      };

  return {
    id: row.id,
    policy: policyId,
    policyTitle: policyTitle,
    title: row.annotation,
    severity: severityToWeb(row.severity),
    status: statusToWeb(row.state),
    artifacts: artifactsFrom(
      verdict ?? ({} as VerdictRow),
      packet,
      requirementRef,
    ),
    ageLabel: ageLabel(row.created_at),
    createdAt: row.created_at,
    assignedTo: [],
    team: "",
    summary: row.annotation,
    verdict: (verdict?.status as Verdict) ?? "INSUFFICIENT_EVIDENCE",
    freshness: verdict?.freshness_state ?? "UNKNOWN",
    reviewRequired: verdict?.review_required ?? true,
    ...(verdict?.reason_code
      ? { reasonCode: verdict.reason_code as Finding["reasonCode"] }
      : {}),
    criteria: [criterionResult],
    ...(verdict?.gate_outcome ? { gateOutcome: verdict.gate_outcome } : {}),
    ...(verdict?.stop_reason ? { stopReason: verdict.stop_reason } : {}),
    ...(verdict?.pass_count !== undefined ? { passCount: verdict.pass_count } : {}),
    ...(packet?.packet_hash ? { packetHash: packet.packet_hash } : {}),
    ...(verdict?.model_and_run?.modelId ? { modelId: verdict.model_and_run.modelId } : {}),
    ...(packet ? { baseCommit: packet.base_commit, headCommit: packet.head_commit } : {}),
    ...(criterion?.payload?.text ? { criterionText: criterion.payload.text } : {}),
    ...(row.superseded_by_id ? { supersededById: row.superseded_by_id } : {}),
  };
}
