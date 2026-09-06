"use strict";

const TOOL_COLOR = { figma: "var(--figma)", github: "var(--github)", jira: "var(--jira)", slack: "var(--slack)" };
const SEV = { warning: "var(--drift)", info: "var(--github)", critical: "var(--crit)" };

let STATE = null;
let selectedEntity = null;   // entity id
let selectedAlert = null;     // index into STATE.alerts
let runTimer = null;

// ---------------------------------------------------------------------------
// boot
// ---------------------------------------------------------------------------
fetch("/api/state")
  .then((r) => r.json())
  .then((s) => { STATE = s; init(); })
  .catch((e) => { document.getElementById("boot").textContent = "Failed to load pipeline state: " + e; });

function init() {
  document.getElementById("boot").style.display = "none";
  buildMeta();
  buildStepper();
  buildSourceDock();
  buildGraph();
  buildAlerts();
  buildSuggestions();
  buildEval();
  window.addEventListener("scroll", () => {}, { passive: true });
}

function el(id) { return document.getElementById(id); }
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function toolClass(tool) { return "pill--" + tool; }

// ---------------------------------------------------------------------------
// meta strip
// ---------------------------------------------------------------------------
function buildMeta() {
  const m = STATE.meta;
  el("meta-strip").innerHTML = [
    ["entities", m.entities], ["events", m.events], ["links", m.links],
    ["alerts", m.alerts], ["deliveries", m.deliveries], ["suggestions", m.suggestions],
  ].map(([k, v]) => `<div><b>${v}</b><small>${k}</small></div>`).join("");
}

// ---------------------------------------------------------------------------
// PIPELINE STEPPER
// ---------------------------------------------------------------------------
const STAGES = [
  {
    n: "01 · INGEST", t: "One format for every tool",
    explain: "Each vendor event is pulled from its source and read into the engine. Figma frames, Git pull requests & commits, Jira tickets, and the Slack channels where alerts land — all enter here as raw, tool-specific records.",
    mini: "FixtureAdapter / GitHubAdapter share one interface → normalization is source-agnostic.",
    data: stageIngest,
  },
  {
    n: "02 · NORMALIZE", t: "A shared record",
    explain: "Raw records are rewritten to a common schema: id, tool, type, title, status, time, and the references they carry. References are extracted from titles and descriptions (e.g. a Jira key named in a PR, a Figma link in a ticket).",
    mini: "extract_jira() / extract_figma() pull cross-references out of free text.",
    data: stageNormalize,
  },
  {
    n: "03 · LINK", t: "Connected by what they say",
    explain: "No shared ID is required. Items connect automatically through the references they contain. References that cannot be resolved (e.g. a deleted Figma frame) are never dropped — they become suggestions awaiting human confirmation.",
    mini: "AUTO_LINK_CONFIDENCE=" + "0.9" + " above trust threshold " + "0.8" + " → trusted auto-link; below → suggestion.",
    data: stageLink,
  },
  {
    n: "04 · DETECT", t: "Workflow drift, not pixel drift",
    explain: "Conflict rules run over the linked graph and timeline. Each rule looks for a specific out-of-sync pattern — e.g. a design changed after its code already started — and fires an alert with the exact entities and events involved.",
    mini: "Rules: design_changed_after_code · ticket_stale_in_progress · done_without_code.",
    data: stageDetect,
  },
  {
    n: "05 · ROUTE", t: "To the role that owns it",
    explain: "Every fired alert is delivered to the owning role's channels — dashboard plus a Slack channel — with a logged delivery record. Noise thresholds suppress excess deliveries so people are not flooded.",
    mini: "ROLE_CHANNELS maps each rule → role → [dashboard, slack:#channel].",
    data: stageRoute,
  },
];

function buildStepper() {
  el("stages").innerHTML = STAGES.map((s, i) =>
    `<button class="stage-btn" data-stage="${i}"><span class="n">${esc(s.n)}</span><span class="t">${esc(s.t)}</span></button>`
  ).join("");
  el("stages").querySelectorAll(".stage-btn").forEach((b) => {
    b.addEventListener("click", () => setStage(parseInt(b.dataset.stage, 10)));
  });
  el("run-btn").addEventListener("click", runPipeline);
  setStage(0);
}

function setStage(i) {
  clearRun();
  el("stages").querySelectorAll(".stage-btn").forEach((b, j) => {
    b.classList.toggle("active", j === i);
    b.classList.toggle("done", j < i);
  });
  el("stage-progress").querySelector("i").style.width = ((i + 1) / STAGES.length * 100) + "%";
  const s = STAGES[i];
  el("stage-text").innerHTML =
    `<h3>${esc(s.t)}</h3><p>${esc(s.explain)}</p><div class="mini">${esc(s.mini)}</div>`;
  el("stage-data").innerHTML = s.data();
  // scrolling the graph to show the matching slice when relevant
  if (i === 2) { selectedAlert = null; applyHighlight(null); }
  if (i === 3) { renderAlertsInto(null); }
}

function runPipeline() {
  if (runTimer) { clearRun(); return; }
  el("run-btn").textContent = "■ Stop";
  let i = 0;
  setStage(0);
  runTimer = setInterval(() => {
    i++;
    if (i >= STAGES.length) { clearRun(); return; }
    setStage(i);
  }, 1700);
}
function clearRun() {
  if (runTimer) { clearInterval(runTimer); runTimer = null; }
  el("run-btn").textContent = "▶ Run pipeline";
}

function stageIngest() {
  const rows = [];
  const push = (tool, items, key) => {
    rows.push(`<div class="row"><span class="k">${tool.toUpperCase()}</span> <span class="v">${items.length} raw records</span></div>`);
    items.slice(0, 3).forEach((it) => {
      rows.push(`<div class="row">&nbsp;&nbsp;<span class="v">${esc(it.id || it.title)}</span> <span class="k">— ${esc((it.title || "").slice(0, 32))}</span></div>`);
    });
  };
  push("figma", STATE.sources.figma);
  push("github", STATE.sources.github);
  push("jira", STATE.sources.jira);
  const chans = Object.keys(STATE.sources.slack);
  rows.push(`<div class="row"><span class="k">SLACK</span> <span class="v">${chans.length} channels</span> <span class="k">(alert sink)</span></div>`);
  chans.forEach((c) => rows.push(`<div class="row">&nbsp;&nbsp;<span class="ref">#${esc(c)}</span> <span class="k">— ${STATE.sources.slack[c].length} delivered</span></div>`));
  return rows.join("");
}

function stageNormalize() {
  return STATE.entities.slice().sort((a, b) => a.tool.localeCompare(b.tool)).map((e) => {
    const refs = e.refs.length ? ` <span class="ref">→ ${e.refs.map(esc).join(", ")}</span>` : "";
    return `<div class="row"><span class="k">${esc(e.tool)}</span> <span class="v">${esc(e.id)}</span> <span class="k">${(e.type || "").replace("_", " ")} · ${esc(e.status || "—")}</span>${refs}</div>`;
  }).join("");
}

function stageLink() {
  const links = STATE.links.map((l) =>
    `<div class="row"><span class="v">${esc(l.source)}</span> <span class="k">↔</span> <span class="v">${esc(l.target)}</span> <span class="k">[${esc(l.kind)} · ${l.confidence}]</span> <span class="ref">${esc(l.provenance)}</span></div>`
  ).join("");
  const sugg = STATE.suggestions.length
    ? `<div class="row" style="color:var(--faint)">— awaiting confirmation —</div>` + STATE.suggestions.map((s) =>
        `<div class="row"><span class="v">${esc(s.source_entity_id)}</span> <span class="k">→</span> <span class="ref">${esc(s.ref)}</span> <span class="k">(${esc(s.reason)})</span></div>`
      ).join("")
    : `<div class="row" style="color:var(--faint)">no unresolved references</div>`;
  return `<div class="k" style="color:var(--faint)">auto & manual links</div>` + links + sugg;
}

function stageDetect() {
  if (!STATE.alerts.length) return `<div class="row" style="color:var(--faint)">no conflicts detected</div>`;
  return STATE.alerts.map((a, i) =>
    `<div class="row" style="cursor:pointer" data-alert="${i}"><span class="ref">${esc(a.rule)}</span> <span class="k">→ ${esc(STATE.roles[a.role] ? STATE.roles[a.role].label : a.role)}</span><br>&nbsp;&nbsp;<span class="v">${esc(a.entity_ids.join(" · "))}</span></div>`
  ).join("");
}

function stageRoute() {
  const byRole = {};
  STATE.deliveries.forEach((d) => {
    byRole[d.role] = byRole[d.role] || [];
    byRole[d.role].push(d);
  });
  return Object.keys(byRole).map((role) => {
    const label = STATE.roles[role] ? STATE.roles[role].label : role;
    const ds = byRole[role].map((d) =>
      `<div class="row">&nbsp;&nbsp;<span class="${d.channel.startsWith("slack:") ? "ref" : "v"}">${esc(d.channel)}</span> <span class="k">· ${esc(d.status)}</span></div>`
    ).join("");
    return `<div class="row"><span class="v">${esc(label)}</span> <span class="k">(${role}) — ${byRole[role].length} deliveries</span></div>` + ds;
  }).join("");
}

// ---------------------------------------------------------------------------
// SOURCE DOCK
// ---------------------------------------------------------------------------
const SRC_TABS = [
  { id: "figma", label: "Figma" },
  { id: "github", label: "Git · GitHub" },
  { id: "jira", label: "Jira" },
  { id: "slack", label: "Slack" },
];

function buildSourceDock() {
  el("src-tabs").innerHTML = SRC_TABS.map((t, i) =>
    `<button class="tab${i === 0 ? " active" : ""}" data-tab="${t.id}"><span class="dot" style="background:${TOOL_COLOR[t.id]}"></span>${t.label} <span class="count" id="cnt-${t.id}"></span></button>`
  ).join("");
  el("src-tabs").querySelectorAll(".tab").forEach((b) => {
    b.addEventListener("click", () => {
      el("src-tabs").querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      renderSource(b.dataset.tab);
    });
  });
  renderSource("figma");
}

function renderSource(tab) {
  const host = el("src-grid");
  if (tab === "slack") { host.innerHTML = renderSlack(); wireSlack(); return; }
  const items = STATE.sources[tab] || [];
  el("cnt-" + tab).textContent = items.length;
  host.innerHTML = items.map((it) => {
    const id = it.id;
    const refs = collectRefs(tab, it);
    const refHtml = refs.map((r) => {
      const unresolved = !STATE.entities.some((e) => e.id === r.target);
      return `<span class="refchip${unresolved ? " unresolved" : ""}" title="${esc(r.via)}">${esc(r.target)}</span>`;
    }).join("");
    return `<div class="src-card" data-id="${esc(id)}">
      <div class="top"><span class="id">${esc(id)}</span><span class="badge">${esc((it.status || it.action || "—").toString())}</span></div>
      <p class="title">${esc(it.title || "")}</p>
      <div class="meta"><span>${esc(it.actor || "")}</span><span>${esc((it.timestamp || "").slice(0, 10))}</span></div>
      ${refHtml ? `<div class="refs">${refHtml}</div>` : ""}
    </div>`;
  }).join("");
  host.querySelectorAll(".src-card").forEach((c) => {
    c.addEventListener("click", () => selectEntity(c.dataset.id, true));
  });
}

function collectRefs(tool, it) {
  const out = [];
  if (tool === "jira") {
    const m = (it.description || "").match(/figma\.com\/(?:file|design)\/([A-Za-z0-9]+)/g) || [];
    m.forEach((u) => out.push({ target: "fig:" + u.split("/")[2], via: "description link" }));
  } else if (tool === "github") {
    const k = (it.title || "").match(/[A-Z][A-Z0-9_]+-\d+/g) || [];
    k.forEach((x) => out.push({ target: x, via: "PR title names Jira key" }));
    (it.commits || []).forEach((c) => {
      const ck = (c.message || "").match(/[A-Z][A-Z0-9_]+-\d+/g) || [];
      ck.forEach((x) => out.push({ target: x, via: "commit " + c.sha + " message" }));
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// SLACK view (sinks / deliveries)
// ---------------------------------------------------------------------------
function renderSlack() {
  const chans = STATE.sources.slack;
  const keys = Object.keys(chans);
  if (!keys.length) return `<p class="empty">No Slack deliveries in this run.</p>`;
  return `<div class="slack-wrap">` + keys.map((c) => {
    const msgs = chans[c].map((d, i) => {
      const a = STATE.alerts.find((x) => x.rule === d.rule && sameEnts(x.entity_ids, d.entity_ids));
      const body = a ? a.message : d.rule;
      return `<div class="msg" data-alert-rule="${esc(d.rule)}" data-ents="${esc(JSON.stringify(d.entity_ids))}">
        <div class="mhead"><span class="rule">${esc(d.rule)}</span><span>${esc((d.delivered_at || "").slice(11, 19))}</span></div>
        <div class="mbody">${esc(body)}</div></div>`;
    }).join("");
    return `<div class="slack-chan"><div class="chead"><span class="hash">#</span><span class="chname">${esc(c)}</span></div><div class="msgs">${msgs}</div></div>`;
  }).join("") + `</div>`;
}
function wireSlack() {
  el("src-grid").querySelectorAll(".msg").forEach((m) => {
    m.addEventListener("click", () => {
      const idx = STATE.alerts.findIndex((x) => x.rule === m.dataset.alertRule && sameEnts(x.entity_ids, JSON.parse(m.dataset.ents)));
      if (idx >= 0) { focusAlert(idx); document.getElementById("conflicts").scrollIntoView({ behavior: "smooth" }); }
    });
  });
}
function sameEnts(a, b) { return a.length === b.length && a.every((x) => b.includes(x)); }

// ---------------------------------------------------------------------------
// INTERACTIVE GRAPH
// ---------------------------------------------------------------------------
function buildGraph() {
  const g = STATE.graph;
  const svg = el("graph-svg");
  svg.setAttribute("viewBox", `0 0 ${g.width} ${g.height}`);
  let s = "";
  // column headers + separators
  g.columns.forEach((c) => { s += `<text class="colhead" x="${c.x}" y="46">${esc(c.label)}</text>`; });
  for (let i = 0; i < g.columns.length - 1; i++) {
    const x = (g.columns[i].x + g.columns[i + 1].x) / 2;
    s += `<line class="sep" x1="${x}" y1="70" x2="${x}" y2="${g.height - 30}"/>`;
  }
  // edges
  g.edges.forEach((e, i) => {
    const cls = "edge" + (e.in_alert ? " alert" : (e.kind === "manual" ? " manual" : ""));
    s += `<path class="${cls}" data-ei="${i}" data-s="${esc(e.source)}" data-t="${esc(e.target)}"
      d="M ${e.x1} ${e.y1} C ${e.x1 + (e.x2 - e.x1) * 0.42} ${e.y1}, ${e.x2 - (e.x2 - e.x1) * 0.42} ${e.y2}, ${e.x2} ${e.y2}">
      <title>${esc(e.source)} ↔ ${esc(e.target)}\n${esc(e.kind)} link · conf ${e.confidence}\n${esc(e.provenance)}${e.in_alert ? "\npart of a fired conflict" : ""}</title></path>`;
  });
  // ghost edges
  g.ghosts.forEach((gh) => {
    s += `<path class="edge ghost" data-ghost="1" d="M ${gh.sx} ${gh.sy} C ${gh.sx - 40} ${gh.sy}, ${gh.x + 30} ${gh.y - 10}, ${gh.x + gh.r} ${gh.y}">
      <title>${esc(gh.source)} → ${esc(gh.ref)} (${esc(gh.reason)}) — awaiting manual confirmation</title></path>`;
  });
  // nodes
  g.nodes.forEach((n, i) => {
    const cls = `gnode gnode--${n.tool}${n.type === "commit" ? " gnode--commit" : ""}${n.stale ? " gnode--stale" : ""}`;
    s += `<g class="${cls}" data-ni="${i}" data-id="${esc(n.id)}">
      <circle class="gcirc" cx="${n.x}" cy="${n.y}" r="${n.r}"/>
      ${n.stale ? `<circle class="gring" cx="${n.x}" cy="${n.y}" r="${n.r + 5}"/>` : ""}
      <text class="id" x="${n.x}" y="${n.y + n.r + 15}">${esc(n.id)}</text>
      ${n.type !== "commit" ? `<text x="${n.x}" y="${n.y + n.r + 30}">${esc((n.title || "").slice(0, 18))}</text>` : ""}
      <title>${esc(n.id)} — ${esc(n.title)}\n${esc(n.tool)} · ${esc(n.type)}${n.status ? " · " + esc(n.status) : ""}${n.stale ? "\nstale/unverified" : ""}</title>
    </g>`;
  });
  // ghost nodes
  g.ghosts.forEach((gh) => {
    s += `<g class="ghost"><circle cx="${gh.x}" cy="${gh.y}" r="${gh.r}"/><text x="${gh.x}" y="${gh.y + gh.r + 13}">${esc(gh.label)}</text>
      <title>${esc(gh.ref)} — unresolved reference from ${esc(gh.source)} (${esc(gh.reason)}); awaiting manual confirmation</title></g>`;
  });
  svg.innerHTML = s;

  svg.querySelectorAll(".gnode").forEach((node) => {
    node.addEventListener("click", (ev) => { ev.stopPropagation(); selectEntity(node.dataset.id, false); });
    node.addEventListener("mouseenter", () => hoverEntity(node.dataset.id));
    node.addEventListener("mouseleave", () => { if (!selectedEntity) applyHighlight(null); else applyHighlight(activeSet()); });
  });
  svg.addEventListener("click", () => { selectedEntity = null; selectedAlert = null; renderAlertsInto(null); applyHighlight(null); renderDetail(null); });

  const shell = el("graph-shell");
  el("tg-conflicts").addEventListener("click", () => toggleFilter("tg-conflicts", shell, "hide-conflicts"));
  el("tg-sugg").addEventListener("click", () => toggleFilter("tg-sugg", shell, "hide-sugg"));
}

function toggleFilter(btnId, shell, cls) {
  const btn = el(btnId);
  btn.classList.toggle("on");
  shell.classList.toggle(cls, !btn.classList.contains("on"));
}

function neighborMap() {
  const map = {};
  STATE.graph.edges.forEach((e) => {
    (map[e.source] = map[e.source] || new Set()).add(e.target);
    (map[e.target] = map[e.target] || new Set()).add(e.source);
  });
  return map;
}

function hoverEntity(id) {
  const nb = neighborMap()[id] || new Set();
  const keep = new Set([id, ...nb]);
  dimGraph(keep);
}

function activeSet() {
  if (selectedAlert != null) return new Set(STATE.alerts[selectedAlert].entity_ids);
  if (selectedEntity) {
    const nb = neighborMap()[selectedEntity] || new Set();
    return new Set([selectedEntity, ...nb]);
  }
  return null;
}

function applyHighlight(keep) {
  dimGraph(keep);
}

function dimGraph(keep) {
  const svg = el("graph-svg");
  svg.querySelectorAll(".gnode").forEach((n) => {
    n.classList.toggle("dim", keep ? !keep.has(n.dataset.id) : false);
  });
  svg.querySelectorAll(".edge:not(.ghost)").forEach((e) => {
    const on = keep ? (keep.has(e.dataset.s) && keep.has(e.dataset.t)) : true;
    e.classList.toggle("dim", !on);
  });
}

function selectEntity(id, fromSource) {
  selectedEntity = id;
  selectedAlert = null;
  renderAlertsInto(null);
  const keep = activeSet();
  applyHighlight(keep);
  renderDetail(id);
  if (fromSource) el("graph").scrollIntoView({ behavior: "smooth" });
}

// ---------------------------------------------------------------------------
// DETAIL PANEL
// ---------------------------------------------------------------------------
function renderDetail(id) {
  const host = el("detail");
  if (!id) {
    const total = STATE.graph.edges.length;
    host.innerHTML = `<div class="empty">Click any node in the graph, a source card, or an alert to inspect how it links. ${total} links across ${STATE.meta.entities} entities.</div>`;
    return;
  }
  const e = STATE.entities.find((x) => x.id === id);
  if (!e) { host.innerHTML = `<div class="empty">Unknown entity ${esc(id)}.</div>`; return; }
  const links = STATE.links.filter((l) => l.source === id || l.target === id);
  const chain = links.map((l) => (l.source === id ? l.target : l.source));
  const events = STATE.events.filter((ev) => ev.entity_id === id).sort((a, b) => (a.timestamp || "").localeCompare(b.timestamp || ""));
  const alertsHere = STATE.alerts.filter((a) => a.entity_ids.includes(id));

  const linkRows = links.map((l) => {
    const other = l.source === id ? l.target : l.source;
    return `<span class="pill ${toolClass(STATE.entities.find((x) => x.id === other)?.tool || "")}" data-go="${esc(other)}">${esc(other)}</span>`;
  }).join("");
  const evRows = events.length ? events.map((ev) =>
    `<tr><td>${esc((ev.timestamp || "").slice(0, 10))}</td><td class="e">${esc(ev.actor)}</td><td>${esc(ev.action)}</td>${ev.references && ev.references.length ? `<td class="ref">${ev.references.map(esc).join(", ")}</td>` : "<td></td>"}</tr>`
  ).join("") : `<tr><td colspan="4" class="empty">No events.</td></tr>`;
  const alertTags = alertsHere.length ? alertsHere.map((a, i) =>
    `<span class="tag tag--rule" style="cursor:pointer" data-alert="${STATE.alerts.indexOf(a)}">${esc(a.rule)}</span>`
  ).join(" ") : `<span class="empty">not part of any fired conflict</span>`;

  host.innerHTML = `
    <h3>${esc(e.title)}</h3>
    <p class="sub">${esc(e.id)} · ${esc(e.tool)} · ${esc((e.type || "").replace("_", " "))} · ${esc(e.status || "no status")}${e.stale ? ` · <span style="color:var(--drift)">stale/unverified${e.stale_reason ? " (" + esc(e.stale_reason) + ")" : ""}</span>` : ""}</p>
    ${e.refs && e.refs.length ? `<div class="kv"><span class="k">references:</span>${e.refs.map((r) => `<span class="refchip">${esc(r)}</span>`).join("")}</div>` : ""}
    <div class="chain" style="margin-top:0"><span class="k" style="color:var(--faint);font-family:var(--mono);font-size:.7rem">linked to:</span>${linkRows || '<span class="empty">no links</span>'}</div>
    <h2 style="font-size:1rem;margin:.4rem 0 .5rem">Activity timeline</h2>
    <table><tr><th>Date</th><th>Actor</th><th>Action</th><th>Refs</th></tr>${evRows}</table>
    <h2 style="font-size:1rem;margin:1rem 0 .5rem">Conflicts involving this entity</h2>
    <div>${alertTags}</div>`;

  host.querySelectorAll("[data-go]").forEach((p) => p.addEventListener("click", () => selectEntity(p.dataset.go, false)));
  host.querySelectorAll("[data-alert]").forEach((a) => a.addEventListener("click", () => focusAlert(parseInt(a.dataset.alert, 10))));
}

// ---------------------------------------------------------------------------
// CONFLICTS
// ---------------------------------------------------------------------------
function buildAlerts() {
  renderAlertsInto(null);
}

function renderAlertsInto(exceptIdx) {
  const host = el("alerts-grid");
  if (!STATE.alerts.length) { host.innerHTML = `<p class="empty">No conflicts detected in the current data.</p>`; return; }
  host.innerHTML = STATE.alerts.map((a, i) => {
    if (i === exceptIdx) return "";
    const sel = i === selectedAlert ? " sel" : "";
    const chain = a.entity_ids.map((id, j) => {
      const e = STATE.entities.find((x) => x.id === id);
      return `<span class="pill ${toolClass(e ? e.tool : "")}">${esc(id)}</span>` + (j < a.entity_ids.length - 1 ? `<span class="pill arrow">—</span>` : "");
    }).join("");
    const deliv = a.deliveries.map((d) =>
      `<span class="d${d.channel.startsWith("slack:") ? " slack" : ""}">${esc(d.channel)} · ${esc(d.status)}</span>`
    ).join("");
    return `<article class="alert${sel}" data-alert="${i}">
      <div class="meta"><span class="tag tag--rule">${esc(a.rule)}</span><span>→ ${esc(STATE.roles[a.role] ? STATE.roles[a.role].label : a.role)}</span><span>${esc(a.severity)}</span>${a.latency_ms != null ? `<span>event→alert ${a.latency_ms} ms</span>` : ""}</div>
      <p class="msg">${esc(a.message)}</p>
      <div class="chain">${chain}</div>
      <div class="deliv">${deliv}</div>
    </article>`;
  }).join("");
  host.querySelectorAll(".alert").forEach((c) => c.addEventListener("click", () => focusAlert(parseInt(c.dataset.alert, 10))));
}

function focusAlert(idx) {
  selectedAlert = idx;
  selectedEntity = null;
  renderAlertsInto(null);
  const keep = new Set(STATE.alerts[idx].entity_ids);
  applyHighlight(keep);
  renderDetail(null);
  el("graph").scrollIntoView({ behavior: "smooth" });
}

// ---------------------------------------------------------------------------
// SUGGESTIONS
// ---------------------------------------------------------------------------
function buildSuggestions() {
  const host = el("sugg-grid");
  if (!STATE.suggestions.length) { host.innerHTML = `<p class="empty">No unresolved references — every reference resolved to a known entity.</p>`; return; }
  host.innerHTML = STATE.suggestions.map((s) =>
    `<article class="alert" style="border-left-color:var(--faint);cursor:default">
      <div class="meta"><span class="tag">${esc(s.source_entity_id)}</span><span class="pill arrow">→</span><span class="tag">${esc(s.ref)}</span><span>${esc(s.reason)}</span></div>
      <p class="msg" style="color:var(--static)">No entity matches this reference in the connected tools. Queued for manual confirmation instead of being silently dropped.</p>
    </article>`
  ).join("");
}

// ---------------------------------------------------------------------------
// EVAL
// ---------------------------------------------------------------------------
function buildEval() {
  const host = el("eval-strip");
  const r = STATE.report;
  if (!r) { host.innerHTML = `<p class="empty">No evaluation labels loaded.</p>`; return; }
  const card = (b, sm) => `<div><b>${b}</b><small>${sm}</small></div>`;
  host.innerHTML =
    card(r.linking.precision, "linking precision") +
    card(r.linking.recall, "linking recall") +
    card(r.linking.f1, "linking F1") +
    card(r.linking.false_positive_rate, "linking FPR") +
    card(r.alerts.precision, "alert precision") +
    card(r.alerts.recall, "alert recall") +
    card(r.alerts.false_positive_rate, "alert FPR") +
    card(r.latency_ms.p50_event_to_alert + " ms", "p50 event→alert") +
    card(r.latency_ms.p95_event_to_alert + " ms", "p95 event→alert");
  el("eval-note").textContent =
    `Measured against a hand-labeled set: ${r.linking.expected} expected links, ${r.linking.non_link_checks} labeled non-links, ${r.alerts.expected} expected alerts, ${r.alerts.silence_checks} expected silences.`;
}
