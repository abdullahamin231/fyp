import { Icon } from "@/components/ui/icon";
import { SectionLabel } from "@/components/ui/panel";
import type { ArtifactRef, CriterionResult, Finding, ToolKind } from "@/lib/types";

const toolVisual: Record<ToolKind, { mark: string; box: string; icon: string; label: string }> = {
  figma: { mark: "F", box: "bg-[#F24E1E]/20 text-[#FF7262]", icon: "draw", label: "Figma" },
  github: { mark: "GH", box: "bg-primary/20 text-primary", icon: "merge_type", label: "GitHub" },
  jira: { mark: "J", box: "bg-tertiary/20 text-tertiary", icon: "confirmation_number", label: "Jira" },
  slack: { mark: "S", box: "bg-[#4A154B]/40 text-[#36C5F0]", icon: "chat", label: "Slack" },
  git: { mark: "GIT", box: "bg-error-container/30 text-error", icon: "hub", label: "Commit" },
  test: { mark: "T", box: "bg-tertiary/20 text-tertiary", icon: "experiment", label: "Test" },
};

const stateByTool: Record<ToolKind, string> = {
  figma: "Published",
  github: "Merged",
  jira: "In Progress",
  slack: "Delivered",
  git: "Anchored",
  test: "Reported",
};

const integrityByFreshness: Record<Finding["freshness"], { label: string; className: string }> = {
  CURRENT: { label: "Signature valid", className: "text-secondary" },
  STALE: { label: "Stale snapshot", className: "text-tertiary" },
  UNKNOWN: { label: "Unverified", className: "text-muted" },
};

function firstCitation(criteria: CriterionResult[], tool: ToolKind) {
  for (const criterion of criteria) {
    for (const citation of criterion.evidence) {
      if (citation.tool === tool) return citation;
    }
  }
  return undefined;
}

/** Tool-specific specimen box — mirrors the preview blocks in the reference. */
function Specimen({
  artifact,
  finding,
}: {
  artifact: ArtifactRef;
  finding: Finding;
}) {
  const citation = firstCitation(finding.criteria, artifact.tool);
  const gap = finding.criteria.find((c) => c.missingEvidence?.length)?.missingEvidence?.[0];

  if (artifact.tool === "figma") {
    return (
      <div className="w-full min-h-28 rounded bg-surface-container-lowest p-stack-comfortable mb-stack-comfortable flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between text-micro-label font-mono-code text-muted">
          <span>Frame: {artifact.ref}</span>
          <span className="text-secondary font-semibold">
            {citation ? "Citation resolved" : "No diff captured"}
          </span>
        </div>
        <div className="flex items-center justify-center gap-3">
          <div className="w-20 h-12 rounded bg-surface-container-high border-2 border-dashed border-secondary/40 flex items-center justify-center">
            <span className="font-mono-code text-micro-label text-secondary">Design</span>
          </div>
          <Icon name="arrow_forward" className="text-muted text-[16px]" />
          <div className="w-20 h-12 rounded bg-surface-container-highest flex items-center justify-center">
            <span className="font-mono-code text-micro-label text-muted">Code</span>
          </div>
        </div>
        <span className="text-micro-label font-mono-code text-muted truncate">
          {citation ? citation.locator : artifact.label}
        </span>
      </div>
    );
  }

  if (artifact.tool === "github" || artifact.tool === "git") {
    return (
      <div className="w-full min-h-28 rounded bg-surface-container-lowest p-stack-comfortable mb-stack-comfortable font-mono-code text-micro-label overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted text-micro-label">
          <span>Ref: {artifact.ref}</span>
          <span>Base: main</span>
        </div>
        <div className="text-secondary truncate">
          {citation ? citation.excerpt : "— no excerpt captured in packet —"}
        </div>
        <div className="text-muted text-micro-label truncate">
          {citation ? citation.locator : "Anchored via deterministic linker"}
        </div>
        <div className="text-micro-label text-muted truncate">
          {finding.criteria.reduce((n, c) => n + c.evidence.length, 0)} citations in packet
        </div>
      </div>
    );
  }

  if (artifact.tool === "jira") {
    // DATA HOLE — replace with the ticket API's real completion percentage.
    const pct = 0;
    return (
      <div className="w-full min-h-28 rounded bg-surface-container-lowest p-stack-comfortable mb-stack-comfortable flex flex-col justify-between">
        <div className="flex items-center justify-between text-micro-label font-mono-code text-muted">
          <span>{finding.team}</span>
          <span className="text-tertiary font-semibold">Age {finding.ageLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-full bg-surface-container-highest rounded-full h-2">
            <div className="bg-tertiary h-2 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-tertiary font-mono-code text-micro-label">{pct}%</span>
        </div>
        <div className="text-micro-label text-on-surface-variant truncate font-body-sm">
          {gap ?? "Acceptance criteria anchored to this ticket."}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-28 rounded bg-surface-container-lowest p-stack-comfortable mb-stack-comfortable font-mono-code text-micro-label overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between text-muted text-micro-label">
        <span>{artifact.label}</span>
        <span className="text-secondary">Recorded</span>
      </div>
      <div className="text-on-surface-variant truncate">{artifact.ref}</div>
      <div className="text-muted truncate">
        {citation ? citation.excerpt : finding.summary}
      </div>
    </div>
  );
}

/** One "Affected Artifacts Under Inspection" card (Figma / GitHub / Jira / …). */
export function AffectedArtifactCard({
  artifact,
  finding,
}: {
  artifact: ArtifactRef;
  finding: Finding;
}) {
  const visual = toolVisual[artifact.tool];
  const integrity = integrityByFreshness[finding.freshness];

  return (
    <div className="rounded-xl bg-surface-container-low p-gutter flex flex-col justify-between shadow-md relative overflow-hidden group">
      <div className="flex items-start justify-between gap-2 mb-stack-comfortable">
        <div className="flex items-center gap-stack-compact min-w-0">
          <div
            className={`w-8 h-8 rounded flex items-center justify-center font-mono-code font-bold text-[14px] shrink-0 ${visual.box}`}
          >
            {visual.mark}
          </div>
          <div className="min-w-0">
            <SectionLabel>{artifact.label}</SectionLabel>
            <h3 className="text-body-lg font-semibold text-on-surface truncate">{artifact.ref}</h3>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-secondary/15 text-secondary font-mono-code text-micro-label font-semibold shrink-0">
          {stateByTool[artifact.tool]}
        </span>
      </div>

      <Specimen artifact={artifact} finding={finding} />

      <div className="space-y-stack-compact font-mono-code text-[12px]">
        <div className="flex justify-between text-on-surface-variant">
          <span className="text-muted">Owner:</span>
          <span className="text-on-surface font-semibold">
            {artifact.title ?? finding.assignedTo[0] ?? "—"}
          </span>
        </div>
        <div className="flex justify-between text-on-surface-variant">
          <span className="text-muted">Last mod:</span>
          <span>{finding.ageLabel} ago</span>
        </div>
        <div className="flex justify-between text-on-surface-variant">
          <span className="text-muted">Integrity check:</span>
          <span className={integrity.className}>{integrity.label}</span>
        </div>
      </div>

      <div className="mt-stack-comfortable pt-stack-compact flex items-center justify-end gap-2">
        <button
          type="button"
          className="text-primary hover:text-muted font-mono-code text-body-sm flex items-center gap-1"
        >
          <span>Open in {visual.label}</span>
          <Icon name="open_in_new" className="text-[14px]" />
        </button>
      </div>
    </div>
  );
}
