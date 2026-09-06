from flask import Flask, jsonify, render_template

from unify.graph.layout import compute_layout
from unify.pipeline import run_pipeline, DATA_DIR
from unify.feed.feed import entity_feed
from unify.config import ROLE_LABELS, ROLE_CHANNELS
from unify.ingestion.fixtures import load_raw_by_tool

app = Flask(__name__)


# --------------------------------------------------------------------------
# Serialization: one JSON snapshot of the whole pipeline for the interactive UI
# --------------------------------------------------------------------------

def _entity_dict(e):
    return {
        "id": e.id,
        "tool": e.tool,
        "type": e.type,
        "title": e.title,
        "status": e.status,
        "timestamp": e.timestamp,
        "refs": list(e.refs),
        "stale": e.stale,
        "stale_reason": e.stale_reason,
    }


def _event_dict(ev):
    return {
        "id": ev.id,
        "actor": ev.actor,
        "entity_id": ev.entity_id,
        "action": ev.action,
        "timestamp": ev.timestamp,
        "references": list(ev.references),
    }


def _link_dict(l):
    return {
        "source": l.source,
        "target": l.target,
        "kind": l.kind,
        "confidence": l.confidence,
        "provenance": l.provenance,
    }


def _suggestion_dict(s):
    return {
        "ref": s.ref,
        "source_entity_id": s.source_entity_id,
        "reason": s.reason,
        "confidence": s.confidence,
        "status": s.status,
        "resolved_to": s.resolved_to,
    }


def _alert_dict(a, deliveries):
    return {
        "rule": a.rule,
        "entity_ids": a.entity_ids,
        "role": a.role,
        "severity": a.severity,
        "message": a.message,
        "timestamp": a.timestamp,
        "triggered_by": a.triggered_by,
        "latency_ms": a.latency_ms,
        "deliveries": [d.to_dict() for d in deliveries if d.rule == a.rule],
    }


def _build_slack(deliveries):
    """Group routed deliveries that target a Slack channel into a feed."""
    channels = {}
    for d in deliveries:
        if d.channel.startswith("slack:"):
            ch = d.channel.split(":", 1)[1]
            channels.setdefault(ch, []).append(d.to_dict())
    # stable, readable ordering
    return {k: channels[k] for k in sorted(channels)}


def serialize_state():
    store, alerts, deliveries, report = run_pipeline(data_dir=DATA_DIR)
    raw_by_tool = load_raw_by_tool(DATA_DIR)

    graph = compute_layout(store, alerts)
    # attach human titles to graph nodes for tooltips
    titles = {e.id: e.title for e in store.all_entities()}
    for n in graph["nodes"]:
        n["title"] = titles.get(n["id"], n["id"])

    roles = {}
    for role, label in ROLE_LABELS.items():
        roles[role] = {
            "label": label,
            "channels": ROLE_CHANNELS.get(role, []),
        }

    report_safe = None
    if report:
        report_safe = {
            "linking": report["linking"],
            "alerts": report["alerts"],
            "latency_ms": report["latency_ms"],
        }

    return {
        "meta": {
            "mode": "fixtures",
            "entities": len(store.all_entities()),
            "events": len(store.all_events()),
            "links": len(store.links),
            "alerts": len(alerts),
            "deliveries": len(deliveries),
            "suggestions": len(store.pending_suggestions()),
        },
        "sources": {
            "figma": raw_by_tool.get("figma", []),
            "github": raw_by_tool.get("github", []),
            "jira": raw_by_tool.get("jira", []),
            "slack": _build_slack(deliveries),
        },
        "entities": [_entity_dict(e) for e in store.all_entities()],
        "events": [_event_dict(ev) for ev in store.all_events()],
        "links": [_link_dict(l) for l in store.links],
        "suggestions": [_suggestion_dict(s) for s in store.pending_suggestions()],
        "alerts": [_alert_dict(a, deliveries) for a in alerts],
        "deliveries": [d.to_dict() for d in deliveries],
        "graph": graph,
        "roles": roles,
        "report": report_safe,
    }


# --------------------------------------------------------------------------
# Routes
# --------------------------------------------------------------------------

@app.route("/api/state")
def api_state():
    return jsonify(serialize_state())


def tool_entities(store):
    groups = {"figma": [], "github": [], "jira": []}
    for e in store.all_entities():
        if e.tool in groups:
            groups[e.tool].append(
                {
                    "id": e.id,
                    "title": e.title,
                    "type": e.type,
                    "status": e.status,
                    "stale": e.stale,
                }
            )
    return groups


def build_context():
    store, alerts, deliveries, report = run_pipeline(data_dir=DATA_DIR)
    return {
        "store": store,
        "tools": tool_entities(store),
        "alerts": [a.to_dict() for a in alerts],
        "deliveries": deliveries,
        "suggestions": store.pending_suggestions(),
        "report": report,
        "role_labels": ROLE_LABELS,
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/entity/<eid>")
def entity(eid):
    store, _, _, _ = run_pipeline(data_dir=DATA_DIR)
    feed = entity_feed(store, eid)
    if not feed:
        return f"Unknown entity {eid}", 404
    e = store.get_entity(eid)
    feed["entity"]["stale"] = e.stale
    feed["entity"]["stale_reason"] = e.stale_reason
    return render_template("entity.html", feed=feed, role_labels=ROLE_LABELS)


@app.route("/graph")
def graph():
    store, alerts, _, _ = run_pipeline(data_dir=DATA_DIR)
    layout = compute_layout(store, alerts)
    return render_template(
        "graph.html",
        nodes=layout["nodes"],
        edges=layout["edges"],
        ghosts=layout["ghosts"],
        columns=layout["columns"],
        width=layout["width"],
        height=layout["height"],
    )


@app.route("/run")
def run_again():
    return index()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
