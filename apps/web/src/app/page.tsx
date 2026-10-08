import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Icon } from "@/components/ui/icon";
import { Badge, ToolPill } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/stat-card";
import { SyncToast } from "@/components/dashboard/sync-toast";
import { findings } from "@/lib/mock/findings";
import { activity } from "@/lib/mock/activity";

const critical = findings.filter(
  (f) => f.status === "open" && (f.severity === "critical" || f.severity === "warning"),
);

const progress = [
  { label: "Design Flow", value: "82%", width: 82, tone: "bg-secondary", delta: "↑ 4%", deltaTone: "text-secondary" },
  { label: "Implementation", value: "65%", width: 65, tone: "bg-primary", delta: "↑ 12%", deltaTone: "text-primary" },
  { label: "Tickets Done", value: "14/20", width: 70, tone: "bg-tertiary", delta: "Pending", deltaTone: "text-tertiary" },
];

const githubRepos = [
  { name: "unify-core/main", branch: "feat: websocket-sync", age: "4m ago", status: "PASSED" },
  { name: "unify-ui/refactor", branch: "fix: bento-spacing", age: "12m ago", status: "RUNNING" },
  { name: "unify-web/release", branch: "chore: cut v2.0.1", age: "1h ago", status: "PASSED" },
];

const jiraTickets = [
  { key: "PROJ-88", summary: "Checkout modal step indicator", state: "In Review", priority: "P1", tone: "border-primary" },
  { key: "PROJ-91", summary: "Watcher mute controls", state: "In Progress", priority: "P2", tone: "border-tertiary" },
  { key: "PROJ-102", summary: "Event contract priority field", state: "Todo", priority: "P3", tone: "border-outline-variant" },
];

const figmaUpdates = [
  { name: "CheckoutModal_v3", meta: "Updated by Haaniah • 2h ago", swatch: "from-[#f24e1e]/40 to-[#4f46e5]/20" },
  { name: "System Tokens / Spacing", meta: "Updated by Mishal • 5h ago", swatch: "from-secondary/30 to-primary-container/30" },
];

const slackMessages = [
  {
    author: "Jordan T.",
    time: "10:45 AM",
    initials: "JT",
    body: (
      <>
        Hey <span className="text-primary">@Alex</span>, the{" "}
        <span className="text-secondary">#PR-142</span> build is failing on staging. Can you take a
        look?
      </>
    ),
  },
  {
    author: "Maria G.",
    time: "9:12 AM",
    initials: "MG",
    body: (
      <>
        Just pushed the final frames for the <span className="text-primary">#unify-v2</span> release.
      </>
    ),
  },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="flex items-end justify-between">
        <PageHeader
          title="Overview"
          description="System integrity at 94%. 3 critical conflicts detected."
        />
        <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-secondary/10 border border-secondary/20 text-secondary text-[12px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          Live Sync Active
        </span>
      </div>

      {/* Top row — critical conflicts + project status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <section className="glass-card rounded-xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="warning" className="text-error" fill />
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Critical Conflicts
              </h3>
            </div>
            <span className="font-label-caps text-label-caps text-on-surface-variant">
              {critical.length} Active
            </span>
          </div>
          <div className="flex-1">
            <div className="divide-y divide-outline-variant">
              {critical.map((f) => (
                <Link
                  key={f.id}
                  href={`/conflicts/${f.id}`}
                  className="flex items-start gap-4 p-4 hover:bg-surface-container-high transition-colors cursor-pointer group"
                >
                  <div
                    className={`mt-1 flex items-center justify-center w-8 h-8 rounded ${
                      f.severity === "critical"
                        ? "bg-error-container/20 text-error"
                        : "bg-tertiary-container/20 text-tertiary"
                    }`}
                  >
                    <Icon
                      name={f.severity === "critical" ? "sync_problem" : "variables"}
                      className="text-[18px]"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1 gap-3">
                      <span className="text-body-md font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                        {f.title}
                      </span>
                      <span className="text-body-sm text-on-surface-variant shrink-0">
                        {f.ageLabel} ago
                      </span>
                    </div>
                    <p className="text-body-sm text-on-surface-variant leading-relaxed line-clamp-2">
                      {f.summary}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={`/conflicts/${f.id}`}
                        className="px-3 py-1 bg-surface-container-highest border border-outline-variant text-[11px] font-bold rounded-md hover:bg-primary hover:text-on-primary transition-all"
                      >
                        Review evidence
                      </Link>
                      <span className="px-3 py-1 border border-outline-variant text-[11px] font-bold rounded-md text-on-surface-variant hover:bg-surface-container-low transition-all cursor-pointer">
                        View Diff
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="glass-card rounded-xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="rocket_launch" className="text-secondary" fill />
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Unify Alpha v2.0
              </h3>
            </div>
            <div className="flex -space-x-2">
              {["AR", "HI", "MF"].map((initials) => (
                <span
                  key={initials}
                  className="w-6 h-6 rounded-full border-2 border-surface bg-surface-container-high grid place-items-center text-[8px] font-bold text-on-surface-variant"
                >
                  {initials}
                </span>
              ))}
              <span className="w-6 h-6 rounded-full bg-surface-container-high border-2 border-surface grid place-items-center text-[8px] font-bold text-on-surface-variant">
                +4
              </span>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {progress.map((item) => (
                <div key={item.label} className="space-y-2">
                  <span className="font-label-caps text-label-caps text-on-surface-variant block uppercase tracking-wider">
                    {item.label}
                  </span>
                  <div className="flex items-end gap-2">
                    <span className="text-headline-sm text-headline-sm font-bold text-on-surface">
                      {item.value}
                    </span>
                    <span className={`text-[10px] mb-1 font-bold ${item.deltaTone}`}>
                      {item.delta}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                    <div className={`${item.tone} h-full`} style={{ width: `${item.width}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-surface-container-lowest/50 rounded-lg p-4 border border-outline-variant/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-body-sm font-bold text-on-surface">Active Jira Cycles</span>
                <Icon name="open_in_new" className="text-on-surface-variant text-[18px]" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-body-sm flex-1 truncate">PROJ-88: Checkout modal steps</span>
                  <span className="text-[10px] font-mono-code bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant">
                    IN-REVIEW
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-body-sm flex-1 truncate">
                    PROJ-91: Watcher mute controls
                  </span>
                  <span className="text-[10px] font-mono-code bg-primary-container text-white px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Graph quick view */}
      <section className="glass-card rounded-xl overflow-hidden h-96 relative">
        <div className="relative z-10 h-full flex flex-col">
          <div className="px-6 py-4 border-b border-outline-variant bg-surface/80 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="hub" className="text-primary" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Cross-Platform Dependency Graph
              </h3>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 rounded bg-surface-container-high border border-outline-variant text-[10px] font-mono-code">
                8 Nodes
              </span>
              <span className="px-2 py-1 rounded bg-surface-container-high border border-outline-variant text-[10px] font-mono-code">
                6 Edges
              </span>
            </div>
          </div>
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            <svg
              className="absolute w-full h-full pointer-events-none"
              viewBox="0 0 1000 400"
              preserveAspectRatio="xMidYMid meet"
            >
              <path className="graph-line" d="M200,200 L400,100" fill="none" stroke="#4fdbc8" strokeWidth="1.5" />
              <path className="graph-line" d="M200,200 L400,300" fill="none" stroke="#4fdbc8" strokeWidth="1.5" />
              <path className="graph-line" d="M400,100 L700,200" fill="none" stroke="#c3c0ff" strokeWidth="1.5" />
              <path className="graph-line" d="M400,300 L700,200" fill="none" stroke="#c3c0ff" strokeWidth="1.5" />
              <path className="graph-line" d="M700,200 L850,200" fill="none" stroke="#ffb95f" strokeWidth="1.5" />
            </svg>

            <div className="absolute left-[150px] top-[180px] group cursor-pointer">
              <div className="w-24 p-2 bg-surface-container border border-secondary rounded-lg text-center transition-all group-hover:scale-110 shadow-lg shadow-secondary/10">
                <div className="flex justify-center mb-1">
                  <Icon name="design_services" className="text-secondary text-[20px]" />
                </div>
                <div className="text-[10px] font-bold truncate">CheckoutModal_v3</div>
              </div>
            </div>
            <div className="absolute left-[360px] top-[70px] group cursor-pointer">
              <div className="w-24 p-2 bg-surface-container border border-primary rounded-lg text-center transition-all group-hover:scale-110 shadow-lg shadow-primary/10">
                <div className="flex justify-center mb-1">
                  <Icon name="code" className="text-primary text-[20px]" />
                </div>
                <div className="text-[10px] font-bold truncate">PR #142</div>
              </div>
            </div>
            <div className="absolute left-[360px] top-[270px] group cursor-pointer">
              <div className="w-24 p-2 bg-surface-container border border-primary rounded-lg text-center transition-all group-hover:scale-110 shadow-lg shadow-primary/10">
                <div className="flex justify-center mb-1">
                  <Icon name="code" className="text-primary text-[20px]" />
                </div>
                <div className="text-[10px] font-bold truncate">PROJ-88</div>
              </div>
            </div>
            <div className="absolute left-[650px] top-[170px] group cursor-pointer">
              <div className="w-24 p-2 bg-surface-container border border-tertiary rounded-lg text-center transition-all group-hover:scale-110 shadow-lg shadow-tertiary/10">
                <div className="flex justify-center mb-1">
                  <Icon name="chat" className="text-tertiary text-[20px]" />
                </div>
                <div className="text-[10px] font-bold truncate">#dev-sync</div>
              </div>
            </div>
            <div className="absolute right-[50px] top-[180px] group cursor-pointer">
              <div className="w-28 p-2 bg-surface-container-high border border-outline rounded-lg text-center opacity-70">
                <div className="flex justify-center mb-1">
                  <Icon name="cloud_done" className="text-outline text-[20px]" />
                </div>
                <div className="text-[10px] font-bold truncate">Verdict Gate</div>
              </div>
            </div>
            <div className="absolute bottom-4 right-6 bg-surface-container/80 backdrop-blur-sm p-3 rounded-lg border border-outline-variant max-w-xs">
              <p className="text-[11px] text-on-surface-variant italic">
                system-confirmed link between Figma frame `CheckoutModal_v3` and GitHub PR #142 —
                reversible, provenance recorded.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tool widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
        <div className="glass-card rounded-xl overflow-hidden flex flex-col h-72">
          <div className="px-4 py-3 bg-[#24292e]/30 border-b border-outline-variant flex items-center gap-2">
            <Icon name="merge_type" className="text-secondary text-[18px]" />
            <span className="font-label-caps text-label-caps text-on-surface">GitHub Repos</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {githubRepos.map((repo) => (
              <div
                key={repo.name}
                className="p-2.5 rounded bg-surface-container-low border border-outline-variant/30 hover:border-primary transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-1 gap-2">
                  <span className="text-body-sm font-bold truncate">{repo.name}</span>
                  <span
                    className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      repo.status === "PASSED"
                        ? "text-secondary bg-secondary/10"
                        : "text-primary bg-primary/10"
                    }`}
                  >
                    <Icon
                      name={repo.status === "PASSED" ? "check_circle" : "refresh"}
                      className={`text-[10px] ${repo.status === "RUNNING" ? "animate-spin" : ""}`}
                    />
                    {repo.status}
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant flex items-center gap-2">
                  <span className="truncate">{repo.branch}</span>
                  <span>•</span>
                  <span className="shrink-0">{repo.age}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl overflow-hidden flex flex-col h-72">
          <div className="px-4 py-3 bg-primary-container/10 border-b border-outline-variant flex items-center gap-2">
            <Icon name="confirmation_number" className="text-primary text-[18px]" />
            <span className="font-label-caps text-label-caps text-on-surface">Jira Tickets</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {jiraTickets.map((ticket) => (
              <div
                key={ticket.key}
                className={`group flex flex-col gap-1 p-2 border-l-2 ${ticket.tone} bg-surface-container-high/40 cursor-pointer`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono-code text-on-surface-variant">
                    {ticket.key}
                  </span>
                  <span className="text-body-sm font-bold flex-1 truncate">{ticket.summary}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[9px] px-1.5 py-0.5 bg-surface-container-highest rounded text-on-surface-variant">
                    {ticket.state}
                  </span>
                  <span className="text-[9px] text-primary font-bold">{ticket.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl overflow-hidden flex flex-col h-72">
          <div className="px-4 py-3 bg-[#F24E1E]/10 border-b border-outline-variant flex items-center gap-2">
            <Icon name="pentagon" className="text-[#F24E1E] text-[18px]" />
            <span className="font-label-caps text-label-caps text-on-surface">Figma Updates</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {figmaUpdates.map((update) => (
              <div
                key={update.name}
                className="flex flex-col gap-2 p-1 rounded-lg bg-surface-container-low border border-outline-variant/30 overflow-hidden"
              >
                <div
                  className={`h-20 w-full bg-gradient-to-br ${update.swatch} rounded`}
                  aria-hidden
                />
                <div className="px-1 py-1">
                  <span className="text-body-sm font-bold block truncate">{update.name}</span>
                  <span className="text-[10px] text-on-surface-variant">{update.meta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl overflow-hidden flex flex-col h-72">
          <div className="px-4 py-3 bg-[#4A154B]/30 border-b border-outline-variant flex items-center gap-2">
            <Icon name="forum" className="text-[#36C5F0] text-[18px]" />
            <span className="font-label-caps text-label-caps text-on-surface">Slack Activity</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {slackMessages.map((message) => (
              <div key={message.author} className="flex gap-3">
                <span className="w-8 h-8 rounded shrink-0 bg-surface-container-high grid place-items-center text-[10px] font-bold text-on-surface-variant">
                  {message.initials}
                </span>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-on-surface">{message.author}</span>
                    <span className="text-[9px] text-on-surface-variant">{message.time}</span>
                  </div>
                  <div className="text-[12px] text-on-surface-variant leading-tight line-clamp-2">
                    {message.body}
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-outline-variant/50">
              <div className="flex items-center gap-2 mb-2">
                <Badge tone="accent">Latest verdict</Badge>
                <span className="text-[10px] text-on-surface-variant">verifier/local-qwen</span>
              </div>
              <div className="space-y-1.5">
                {activity.slice(0, 2).map((event) => (
                  <div key={event.id} className="flex items-start gap-2">
                    <ToolPill tool={event.tool}>{event.tool}</ToolPill>
                    <span className="text-[11px] text-on-surface-variant line-clamp-1 flex-1">
                      {event.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SyncToast />
    </AppShell>
  );
}
