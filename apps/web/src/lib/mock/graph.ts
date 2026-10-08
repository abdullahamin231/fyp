import type {
  GraphEdge,
  GraphModel,
  GraphNode,
  LinkEligibility,
  ToolKind,
} from "@/lib/types";

/**
 * Richer graph models for the two explorer screens (`/graph` and
 * `/graph/artifacts`).
 *
 * The shapes extend `GraphModel` / `GraphNode` / `GraphEdge` from
 * `@/lib/types` — they are a superset, never a fork, so the screens keep
 * working when the mock layer is swapped for the graph API.
 *
 * Positions are **centres** in stage pixels: both explorers position cards
 * with `translate(-50%, -50%)` and draw edges centre → centre, so opaque
 * cards always cover the line ends.
 */

/** Accent tone for node chrome — always one of the design-token colours. */
export type NodeTone = "primary" | "secondary" | "tertiary" | "error" | "outline";

/** Relation vocabulary (`RelationLink["relation"]`) plus finding triggers. */
export type EdgeRelation =
  | "SATISFIES"
  | "REFERENCES"
  | "IMPLEMENTS"
  | "VERIFIES"
  | "BLOCKS"
  | "TRIGGERS";

export interface NodeField {
  label: string;
  value: string;
  tone?: NodeTone;
}

/** A graph node plus everything the detail / inspector panels render. */
export interface ExplorerNode extends GraphNode {
  /** Type caption, e.g. `Figma Frame`. */
  kindLabel: string;
  /** Sub-title under the node name in detail panels. */
  subtitle: string;
  /** Small right-hand caption drawn on the canvas card. */
  meta: string;
  metaTone?: NodeTone;
  /** Detail panel body. */
  description: string;
  /** Machine locator, e.g. `figma::node::204:8891`. */
  locator: string;
  /** Provenance / metadata rows. */
  fields: NodeField[];
  /** Primary footer action label, e.g. `Open in Figma`. */
  action: string;
  /** Active divergence carried by (or directly attached to) this node. */
  findingId?: string;
  /** Pulsing conflict treatment on the canvas. */
  conflict?: boolean;
}

/**
 * An edge with the eligibility distinction the product is built on:
 * only `confirmed` / `system-confirmed` links may support a decisive finding —
 * `inferred` / `unconfirmed` links are displayed but never decide.
 */
export interface ExplorerEdge extends Omit<GraphEdge, "label"> {
  label: EdgeRelation;
  eligibility: LinkEligibility;
  confidence: number;
  provenance: "explicit" | "inferred" | "manual" | "reconciled";
  confirmedBy?: string;
}

export interface ExplorerGraph extends GraphModel {
  nodes: ExplorerNode[];
  edges: ExplorerEdge[];
}

export function isDecisive(eligibility: LinkEligibility): boolean {
  return eligibility === "confirmed" || eligibility === "system-confirmed";
}

export interface GraphStats {
  nodes: number;
  edges: number;
  orphans: number;
  findings: number;
  decisive: number;
}

export function graphStats(graph: ExplorerGraph): GraphStats {
  const linked = new Set<string>();
  for (const edge of graph.edges) {
    linked.add(edge.from);
    linked.add(edge.to);
  }
  return {
    nodes: graph.nodes.length,
    edges: graph.edges.length,
    orphans: graph.nodes.filter((node) => !linked.has(node.id)).length,
    findings: graph.nodes.filter((node) => node.kind === "finding").length,
    decisive: graph.edges.filter((edge) => isDecisive(edge.eligibility)).length,
  };
}

/* ------------------------------------------------------ relationship graph */

/**
 * `/graph` — the relationship explorer canvas: six artefacts across four
 * tools plus the open finding, with a deliberate mix of link eligibility
 * (solid = decisive, dashed = inferred, dotted = unconfirmed).
 */
export const relationshipGraph: ExplorerGraph = {
  nodes: [
    {
      id: "REQ-88",
      label: "PROJ-88",
      kind: "requirement",
      tool: "jira",
      x: 450,
      y: 150,
      kindLabel: "Jira Ticket",
      subtitle: "Jira ticket · Core Checkout",
      meta: "IN_PROGRESS",
      metaTone: "secondary",
      description:
        "Checkout modal must keep the three-step progress indicator when the payment form is collapsed. Anchors acceptance criteria AC-1..AC-3 for policy P1.",
      locator: "jira::issue::PROJ-88",
      fields: [
        { label: "Project", value: "Core Checkout" },
        { label: "Priority", value: "P1 High", tone: "error" },
        { label: "Freshness", value: "CURRENT", tone: "secondary" },
        { label: "Anchor", value: "commit-pinned" },
      ],
      action: "Open in Jira",
    },
    {
      id: "FIG-1",
      label: "CheckoutModal_v3",
      kind: "design",
      tool: "figma",
      x: 450,
      y: 450,
      kindLabel: "Figma Frame",
      subtitle: "Figma frame · Unify-DS / UI",
      meta: "v3.2",
      metaTone: "primary",
      description:
        "Approved checkout modal frame — the step indicator is visible in both the collapsed and expanded variants. This is the reference the verifier cites against PR #142.",
      locator: "figma::node::204:8891",
      fields: [
        { label: "Library", value: "Unify-DS-Core" },
        { label: "Last modified", value: "Oct 8 · 10:44 UTC" },
        { label: "Author", value: "@sarah_ux", tone: "secondary" },
        { label: "Sync", value: "Published", tone: "secondary" },
      ],
      action: "Open in Figma",
    },
    {
      id: "PR-142",
      label: "PR #142",
      kind: "pr",
      tool: "github",
      x: 760,
      y: 110,
      kindLabel: "GitHub Pull Request",
      subtitle: "GitHub pull request · unify-core",
      meta: "2 CONFLICTS",
      metaTone: "error",
      description:
        "feat(chk): modal refactor — 8 files changed, 214 insertions, 96 deletions. The merged change diverges from the anchored design intent recorded on PROJ-88.",
      locator: "github::pr::unify-core#142",
      fields: [
        { label: "Author", value: "Sam Okafor" },
        { label: "State", value: "MERGED" },
        { label: "Divergence", value: "2 commits", tone: "error" },
        { label: "Freshness", value: "CURRENT", tone: "secondary" },
      ],
      action: "Open in GitHub",
      findingId: "CONF-1048",
      conflict: true,
    },
    {
      id: "CODE-1",
      label: "CheckoutModal.tsx",
      kind: "code",
      tool: "github",
      x: 760,
      y: 300,
      kindLabel: "Code Unit",
      subtitle: "GitHub code unit · src/checkout",
      meta: "8ef2a1",
      metaTone: "primary",
      description:
        "Anchored symbol `CheckoutModal` still hides the step indicator while collapsed — the evidence span cited by finding CONF-1048.",
      locator: "git::blob::8ef2a1::src/checkout/CheckoutModal.tsx",
      fields: [
        { label: "Symbol", value: "CheckoutModal" },
        { label: "Lines", value: "118-141" },
        { label: "Commit", value: "8ef2a1" },
        { label: "Freshness", value: "CURRENT", tone: "secondary" },
      ],
      action: "Open in GitHub",
      findingId: "CONF-1048",
    },
    {
      id: "TEST-1",
      label: "checkout.spec.ts",
      kind: "test",
      tool: "github",
      x: 1030,
      y: 470,
      kindLabel: "Test Suite",
      subtitle: "GitHub test · src/checkout/__tests__",
      meta: "0.72 INFERRED",
      metaTone: "tertiary",
      description:
        "Regression suite for the checkout flow. Its VERIFIES edge is only inferred (0.72), so it is drawn dashed: visible, confirmable — but never decisive on its own.",
      locator: "git::blob::main::src/checkout/__tests__/checkout.spec.ts",
      fields: [
        { label: "Assertions", value: "18" },
        { label: "Last run", value: "PASSED", tone: "secondary" },
        { label: "Eligibility", value: "inferred", tone: "tertiary" },
        { label: "Confidence", value: "0.72" },
      ],
      action: "Open in GitHub",
    },
    {
      id: "CONF-1048",
      label: "CONF-1048",
      kind: "finding",
      x: 1030,
      y: 140,
      kindLabel: "Finding",
      subtitle: "Finding · P1 Design Drift after PR Merge",
      meta: "OPEN",
      metaTone: "error",
      description:
        "Merged change contradicts the anchored design intent for PROJ-88: CONTRADICTED on AC-1, PARTIAL on AC-2, INSUFFICIENT_EVIDENCE on AC-3 (SOURCE_STALE).",
      locator: "finding::CONF-1048",
      fields: [
        { label: "Policy", value: "P1 Design Drift" },
        { label: "Severity", value: "Critical", tone: "error" },
        { label: "Status", value: "Open" },
        { label: "Review", value: "Required", tone: "tertiary" },
      ],
      action: "Open finding",
      findingId: "CONF-1048",
      conflict: true,
    },
  ],
  edges: [
    {
      from: "REQ-88",
      to: "PR-142",
      label: "REFERENCES",
      eligible: true,
      eligibility: "confirmed",
      confidence: 1,
      provenance: "explicit",
      confirmedBy: "Sam Okafor",
    },
    {
      from: "REQ-88",
      to: "CODE-1",
      label: "SATISFIES",
      eligible: true,
      eligibility: "confirmed",
      confidence: 1,
      provenance: "explicit",
      confirmedBy: "Alex Rivera",
    },
    {
      from: "FIG-1",
      to: "CODE-1",
      label: "IMPLEMENTS",
      eligible: true,
      eligibility: "system-confirmed",
      confidence: 0.94,
      provenance: "reconciled",
    },
    {
      from: "CODE-1",
      to: "CONF-1048",
      label: "TRIGGERS",
      eligible: true,
      eligibility: "confirmed",
      confidence: 1,
      provenance: "explicit",
    },
    {
      from: "TEST-1",
      to: "CODE-1",
      label: "VERIFIES",
      eligible: false,
      eligibility: "inferred",
      confidence: 0.72,
      provenance: "inferred",
    },
    {
      from: "FIG-1",
      to: "REQ-88",
      label: "SATISFIES",
      eligible: false,
      eligibility: "unconfirmed",
      confidence: 0.41,
      provenance: "inferred",
    },
  ],
};

/* ---------------------------------------------------------- artifact graph */

/**
 * `/graph/artifacts` — the three-pane artefact explorer. Cluster 1 is the
 * checkout divergence, cluster 2 a clean auth flow, plus one orphan ticket
 * (policy P2 watches exactly that state).
 *
 * `driftAffected` drives the inspector's blast-radius panel.
 */
export const artifactGraph: ExplorerGraph = {
  nodes: [
    {
      id: "FIG-A",
      label: "CheckoutModal_v3.2",
      kind: "design",
      tool: "figma",
      x: 110,
      y: 150,
      kindLabel: "Figma Frame",
      subtitle: "Figma frame · Unify-DS / UI",
      meta: "Active Focus",
      metaTone: "primary",
      description:
        "Approved checkout modal frame. The v3.2 publish removed the `securityBadges` slot that PR #142 still renders at commit 8ef2a1.",
      locator: "figma::node::204:8891",
      fields: [
        { label: "Design system", value: "Unify-DS-Core" },
        { label: "Last modified", value: "Oct 8 · 10:44 UTC" },
        { label: "Author", value: "@sarah_ux", tone: "secondary" },
        { label: "Sync status", value: "Published", tone: "secondary" },
      ],
      action: "Open in Figma",
      findingId: "CONF-1048",
    },
    {
      id: "PR-142",
      label: "PR #142",
      kind: "pr",
      tool: "github",
      x: 340,
      y: 190,
      kindLabel: "GitHub Pull Request",
      subtitle: "GitHub pull request · unify-core",
      meta: "CONF-1048",
      metaTone: "error",
      description:
        "feat(chk): modal refactor — diverged by 2 commits from the anchored design intent and actively rendering `securityBadges`.",
      locator: "github::pr::unify-core#142",
      fields: [
        { label: "Author", value: "Sam Okafor" },
        { label: "State", value: "MERGED" },
        { label: "Divergence", value: "2 commits", tone: "error" },
        { label: "Freshness", value: "CURRENT", tone: "secondary" },
      ],
      action: "Open in GitHub",
      findingId: "CONF-1048",
      conflict: true,
    },
    {
      id: "REQ-A",
      label: "PROJ-88",
      kind: "requirement",
      tool: "jira",
      x: 555,
      y: 140,
      kindLabel: "Jira Ticket",
      subtitle: "Jira ticket · Core Checkout",
      meta: "P1 High",
      metaTone: "error",
      description:
        "Checkout modal step indicator. Canonical state IN_PROGRESS; AC-1..AC-3 are the criteria the verifier cites in CONF-1048.",
      locator: "jira::issue::PROJ-88",
      fields: [
        { label: "State", value: "IN_PROGRESS" },
        { label: "Priority", value: "P1 High", tone: "error" },
        { label: "Freshness", value: "CURRENT", tone: "secondary" },
        { label: "Anchor", value: "commit-pinned" },
      ],
      action: "Open in Jira",
      findingId: "CONF-1048",
    },
    {
      id: "SPEC",
      label: "design-tokens.json",
      kind: "code",
      tool: "github",
      x: 340,
      y: 335,
      kindLabel: "Code Unit",
      subtitle: "GitHub file · packages/design-tokens",
      meta: "38 MUTATIONS",
      metaTone: "error",
      description:
        "Design token contract consumed by the checkout UI. 38 token mutations were detected in the last change set — the drift policy P3 watches.",
      locator: "git::blob::8ef2a1::packages/design-tokens.json",
      fields: [
        { label: "Version", value: "1.8" },
        { label: "Mutations", value: "38", tone: "error" },
        { label: "Generated", value: "false" },
        { label: "Freshness", value: "CURRENT", tone: "secondary" },
      ],
      action: "Open in GitHub",
    },
    {
      id: "CONF-1048",
      label: "CONF-1048",
      kind: "finding",
      x: 555,
      y: 285,
      kindLabel: "Finding",
      subtitle: "Finding · P1 Design Drift after PR Merge",
      meta: "OPEN",
      metaTone: "error",
      description:
        "Field `securityBadges` removed in Figma v3.2 but rendered by PR #142 — open, review required, evidence packet pinned to 8ef2a1.",
      locator: "finding::CONF-1048",
      fields: [
        { label: "Policy", value: "P1 Design Drift" },
        { label: "Severity", value: "Critical", tone: "error" },
        { label: "Verdict", value: "CONTRADICTED", tone: "error" },
        { label: "Status", value: "Open" },
      ],
      action: "Open finding",
      findingId: "CONF-1048",
      conflict: true,
    },
    {
      id: "GHOST",
      label: "PROJ-102",
      kind: "requirement",
      tool: "jira",
      x: 115,
      y: 275,
      kindLabel: "Jira Ticket",
      subtitle: "Jira ticket · Core Checkout",
      meta: "ORPHAN",
      metaTone: "tertiary",
      description:
        "Event contract priority field — accepted work with no confirmed SATISFIES edge to a code unit or test. Policy P2 watches this state past the grace period.",
      locator: "jira::issue::PROJ-102",
      fields: [
        { label: "State", value: "IN_REVIEW" },
        { label: "Priority", value: "P3 Medium" },
        { label: "Anchors", value: "none", tone: "error" },
        { label: "Policy", value: "P2 watching", tone: "tertiary" },
      ],
      action: "Open in Jira",
    },
    {
      id: "LOGIN",
      label: "LoginView_v2",
      kind: "design",
      tool: "figma",
      x: 110,
      y: 500,
      kindLabel: "Figma Frame",
      subtitle: "Figma frame · Auth / Flow-A",
      meta: "Clean",
      metaTone: "secondary",
      description: "Login flow frame from the auth redesign cluster — anchors PR #139 with no divergence recorded.",
      locator: "figma::node::118:4402",
      fields: [
        { label: "Library", value: "Unify-DS-Core" },
        { label: "Author", value: "@sarah_ux" },
        { label: "Updated", value: "4d ago" },
        { label: "Sync status", value: "Published", tone: "secondary" },
      ],
      action: "Open in Figma",
    },
    {
      id: "PR-139",
      label: "PR #139",
      kind: "pr",
      tool: "github",
      x: 340,
      y: 510,
      kindLabel: "GitHub Pull Request",
      subtitle: "GitHub pull request · unify-core",
      meta: "Merged",
      metaTone: "secondary",
      description: "auth-middleware: JWT refresh handling merged 4d ago. No divergence recorded against the anchored frame.",
      locator: "github::pr::unify-core#139",
      fields: [
        { label: "Author", value: "Haaniah Ismail" },
        { label: "State", value: "MERGED", tone: "secondary" },
        { label: "Divergence", value: "none", tone: "secondary" },
        { label: "Freshness", value: "CURRENT", tone: "secondary" },
      ],
      action: "Open in GitHub",
    },
    {
      id: "REQ-B",
      label: "UNI-452",
      kind: "requirement",
      tool: "jira",
      x: 555,
      y: 500,
      kindLabel: "Jira Ticket",
      subtitle: "Jira ticket · Auth",
      meta: "Closed",
      metaTone: "secondary",
      description: "MFA session replay — closed with a confirmed REFERENCES edge to PR #139.",
      locator: "jira::issue::UNI-452",
      fields: [
        { label: "State", value: "DONE", tone: "secondary" },
        { label: "Priority", value: "P3 Medium" },
        { label: "Freshness", value: "CURRENT", tone: "secondary" },
        { label: "Anchor", value: "commit-pinned" },
      ],
      action: "Open in Jira",
    },
  ],
  edges: [
    {
      from: "FIG-A",
      to: "PR-142",
      label: "IMPLEMENTS",
      eligible: true,
      eligibility: "system-confirmed",
      confidence: 0.94,
      provenance: "reconciled",
    },
    {
      from: "PR-142",
      to: "REQ-A",
      label: "REFERENCES",
      eligible: true,
      eligibility: "confirmed",
      confidence: 1,
      provenance: "explicit",
      confirmedBy: "Sam Okafor",
    },
    {
      from: "FIG-A",
      to: "SPEC",
      label: "SATISFIES",
      eligible: false,
      eligibility: "inferred",
      confidence: 0.78,
      provenance: "inferred",
    },
    {
      from: "PR-142",
      to: "CONF-1048",
      label: "TRIGGERS",
      eligible: true,
      eligibility: "confirmed",
      confidence: 1,
      provenance: "explicit",
    },
    {
      from: "LOGIN",
      to: "PR-139",
      label: "IMPLEMENTS",
      eligible: true,
      eligibility: "confirmed",
      confidence: 1,
      provenance: "manual",
      confirmedBy: "Mishal Fatima",
    },
    {
      from: "PR-139",
      to: "REQ-B",
      label: "REFERENCES",
      eligible: true,
      eligibility: "confirmed",
      confidence: 1,
      provenance: "explicit",
      confirmedBy: "Haaniah Ismail",
    },
  ],
};

/** Nodes whose text sits inside the CONF-1048 blast radius. */
export const driftAffected: string[] = ["FIG-A", "PR-142", "REQ-A", "CONF-1048"];

/**
 * A Slack thread the linker *proposes* as a reference edge. Slack stays
 * delivery-only: even once confirmed it can be shown as provenance, never as
 * reasoning input. Positioned as an offset from its source node so it follows
 * every layout mode.
 */
export interface LinkProposal {
  id: string;
  from: string;
  offsetX: number;
  offsetY: number;
  channel: string;
  quote: string;
  confidence: number;
  relation: EdgeRelation;
  tool: ToolKind;
}

export const slackProposal: LinkProposal = {
  id: "LNK-310",
  from: "PR-142",
  offsetX: -225,
  offsetY: 200,
  channel: "#core-checkout",
  quote: '"modal update specs are in the v3.2 frame"',
  confidence: 0.84,
  relation: "REFERENCES",
  tool: "slack",
};
