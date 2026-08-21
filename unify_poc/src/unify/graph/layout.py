"""Deterministic server-side layout for the relationship-graph view.

Three fixed columns by tool (figma | github | jira); commits sit as small
satellites beneath their PR. Identical store state always produces identical
coordinates, so the view is stable and unit-testable. No JS required.
"""

COL_X = {"figma": 190, "github": 600, "jira": 1010}
WIDTH = 1200
TOP = 120
GAP = 108
COMMIT_GAP = 64
PAD_BOTTOM = 70

TYPE_RADIUS = {
    "figma_frame": 26,
    "pull_request": 26,
    "ticket": 26,
    "commit": 9,
}

TOOL_FOR_TYPE = {
    "figma_frame": "figma",
    "pull_request": "github",
    "commit": "github",
    "ticket": "jira",
}


def _truncate(s, n=22):
    s = s or ""
    return s if len(s) <= n else s[: n - 1] + "…"


def compute_layout(store, alerts=()):
    """Return {"nodes": […], "edges": […], "width", "height", "columns"}.

    Nodes: id, label, tool, type, x, y, r, stale, status, ghost.
    Edges: source, target, kind, confidence, provenance, in_alert, dashed.
    """
    alert_pairs = set()
    for a in alerts:
        ids = a.entity_ids
        for i in range(len(ids)):
            for j in range(i + 1, len(ids)):
                alert_pairs.add(frozenset((ids[i], ids[j])))

    entities = sorted(store.all_entities(), key=lambda e: e.id)
    prs = [e for e in entities if e.type == "pull_request"]
    frames = [e for e in entities if e.type == "figma_frame"]
    tickets = [e for e in entities if e.type == "ticket"]
    commits = [e for e in entities if e.type == "commit"]

    # group commits under their (first linked) PR; leftovers become primaries
    commits_by_pr = {}
    loose_commits = []
    for c in commits:
        pr_neighbors = [
            n
            for n, _ in store.neighbors(c.id)
            if store.get_entity(n) and store.get_entity(n).type == "pull_request"
        ]
        if pr_neighbors:
            commits_by_pr.setdefault(sorted(pr_neighbors)[0], []).append(c)
        else:
            loose_commits.append(c)

    def column_height(items):
        h = 0
        for p in items:
            h += GAP + COMMIT_GAP * len(commits_by_pr.get(p.id, []))
        return h + GAP * len(loose_commits)

    columns = {
        "figma": frames,
        "github": prs,
        "jira": tickets,
    }
    heights = {tool: column_height(items) for tool, items in columns.items()}
    max_h = max(heights.values(), default=0)
    height = TOP + max_h + PAD_BOTTOM

    pos = {}

    def place(tool, items):
        y = TOP + (max_h - heights[tool]) / 2
        out = []
        for e in items:
            pos[e.id] = y
            out.append(_node(e, COL_X[tool], y))
            y += GAP
            for c in sorted(commits_by_pr.get(e.id, []), key=lambda x: x.id):
                pos[c.id] = y
                out.append(_node(c, COL_X[tool], y))
                y += COMMIT_GAP
        for c in sorted(loose_commits, key=lambda x: x.id):
            if c.tool == tool:
                pos[c.id] = y
                out.append(_node(c, COL_X[tool], y))
                y += GAP
        return out

    nodes = []
    nodes += place("figma", frames)
    nodes += place("github", prs)
    nodes += place("jira", tickets)

    edges = []
    for l in store.links:
        if l.source not in pos or l.target not in pos:
            continue
        edges.append(
            {
                "source": l.source,
                "target": l.target,
                "kind": l.kind,
                "confidence": l.confidence,
                "provenance": l.provenance,
                "in_alert": frozenset((l.source, l.target)) in alert_pairs,
                "x1": COL_X[TOOL_FOR_TYPE[_type_of(store, l.source)]],
                "y1": pos[l.source],
                "x2": COL_X[TOOL_FOR_TYPE[_type_of(store, l.target)]],
                "y2": pos[l.target],
            }
        )

    # pending suggestions -> hollow ghost nodes beside their source
    ghosts = []
    occupied = {}
    for s in store.pending_suggestions():
        src_type = _type_of(store, s.source_entity_id)
        if src_type is None or s.source_entity_id not in pos:
            continue
        base_x = COL_X[TOOL_FOR_TYPE[src_type]]
        gx = base_x - 78 if src_type != "commit" else base_x - 60
        gy = pos[s.source_entity_id] + 34
        key = (s.source_entity_id,)
        n = occupied.get(key, 0)
        gy += n * 30
        occupied[key] = n + 1
        ghosts.append(
            {
                "id": s.ref,
                "label": _truncate(s.ref, 16),
                "ref": s.ref,
                "source": s.source_entity_id,
                "reason": s.reason,
                "x": gx,
                "y": gy,
                "sx": base_x,
                "sy": pos[s.source_entity_id],
                "r": 12,
            }
        )

    return {
        "nodes": nodes,
        "edges": edges,
        "ghosts": ghosts,
        "width": WIDTH,
        "height": height,
        "columns": [
            {"tool": "figma", "label": "FIGMA", "x": COL_X["figma"]},
            {"tool": "github", "label": "GITHUB", "x": COL_X["github"]},
            {"tool": "jira", "label": "JIRA", "x": COL_X["jira"]},
        ],
    }


def _type_of(store, eid):
    e = store.get_entity(eid)
    return e.type if e else None


def _node(e, x, y):
    return {
        "id": e.id,
        "label": _truncate(e.title),
        "tool": e.tool,
        "type": e.type,
        "x": x,
        "y": y,
        "r": TYPE_RADIUS.get(e.type, 20),
        "stale": e.stale,
        "status": e.status,
        "ghost": False,
    }
