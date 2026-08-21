from unify.conflicts.engine import run_rules
from unify.graph.layout import compute_layout
from unify.pipeline import build_store


def _layout(store=None, alerts=()):
    store = store or build_store()
    return compute_layout(store, alerts), store


def test_every_entity_appears_exactly_once():
    layout, store = _layout()
    node_ids = [n["id"] for n in layout["nodes"]]
    assert sorted(node_ids) == sorted(store.entities.keys())
    assert len(node_ids) == len(set(node_ids))


def test_every_link_appears_as_edge():
    layout, store = _layout()
    edge_pairs = {
        frozenset((e["source"], e["target"])) for e in layout["edges"]
    }
    link_pairs = {frozenset((l.source, l.target)) for l in store.links}
    assert edge_pairs == link_pairs


def test_layout_is_deterministic():
    l1, _ = _layout()
    l2, _ = _layout()
    assert [(n["id"], n["x"], n["y"]) for n in l1["nodes"]] == [
        (n["id"], n["x"], n["y"]) for n in l2["nodes"]
    ]


def test_columns_group_by_tool():
    layout, _ = _layout()
    xs = {c["tool"]: c["x"] for c in layout["columns"]}
    assert len(set(xs.values())) == 3
    for n in layout["nodes"]:
        if n["type"] == "commit":
            continue  # commits share the github column but sit below their PR
        assert n["x"] == xs[n["tool"]]


def test_commits_sit_below_their_pr():
    layout, _ = _layout()
    by_id = {n["id"]: n for n in layout["nodes"]}
    for cid in ("gh:commit:c1", "gh:commit:c2"):
        assert by_id[cid]["y"] > by_id["gh:pr:42"]["y"]
        assert by_id[cid]["x"] == by_id["gh:pr:42"]["x"]


def test_stale_flag_propagates_to_nodes():
    store = build_store()
    store.mark_tool_stale("figma", "test")
    layout = compute_layout(store)
    stale = {n["id"] for n in layout["nodes"] if n["stale"]}
    assert {"fig:ABC123", "fig:GHI789", "fig:JKL333"} <= stale


def test_alert_edges_highlighted():
    store = build_store()
    alerts = run_rules(store)
    layout = compute_layout(store, alerts)
    alert_edges = {
        frozenset((e["source"], e["target"])) for e in layout["edges"] if e["in_alert"]
    }
    # the S1 conflict chain's internal links must be highlighted...
    assert frozenset(("PROJ-15", "gh:pr:42")) in alert_edges
    # ...but unrelated links must not be
    assert frozenset(("PROJ-20", "gh:pr:51")) not in alert_edges


def test_pending_suggestions_become_ghosts():
    layout, store = _layout()
    ghost_refs = {g["ref"] for g in layout["ghosts"]}
    pending_refs = {s.ref for s in store.pending_suggestions()}
    assert ghost_refs == pending_refs
    assert {"PROJ-99", "fig:DEF999"} <= ghost_refs
    # each ghost keeps a link back to its source entity
    node_ids = {n["id"] for n in layout["nodes"]}
    for g in layout["ghosts"]:
        assert g["source"] in node_ids


def test_canvas_bounds_contain_all_nodes():
    layout, _ = _layout()
    assert layout["height"] >= max(n["y"] for n in layout["nodes"]) + 40
    assert all(0 < n["x"] < layout["width"] for n in layout["nodes"])
