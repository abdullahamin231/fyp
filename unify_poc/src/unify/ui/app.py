from flask import Flask, render_template

from unify.graph.layout import compute_layout
from unify.pipeline import run_pipeline, DATA_DIR
from unify.feed.feed import entity_feed
from unify.config import ROLE_LABELS

app = Flask(__name__)


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


def alert_view(a, store, deliveries):
    ids = a.entity_ids
    ents = []
    for i in ids:
        e = store.get_entity(i)
        if e:
            ents.append(
                {
                    "id": e.id,
                    "title": e.title,
                    "tool": e.tool,
                    "type": e.type,
                    "status": e.status,
                    "stale": e.stale,
                }
            )
    link_lines = []
    for l in store.links:
        if l.source in ids and l.target in ids:
            link_lines.append(
                {
                    "a": l.source,
                    "b": l.target,
                    "kind": l.kind,
                    "provenance": l.provenance,
                    "conf": l.confidence,
                }
            )
    return {
        "rule": a.rule,
        "role": a.role,
        "severity": a.severity,
        "message": a.message,
        "entities": ents,
        "links": link_lines,
        "latency_ms": a.latency_ms,
        "deliveries": [d.to_dict() for d in deliveries if d.rule == a.rule],
    }


def build_context():
    store, alerts, deliveries, report = run_pipeline(data_dir=DATA_DIR)
    return {
        "store": store,
        "tools": tool_entities(store),
        "alerts": [alert_view(a, store, deliveries) for a in alerts],
        "deliveries": deliveries,
        "suggestions": store.pending_suggestions(),
        "report": report,
        "role_labels": ROLE_LABELS,
    }


@app.route("/")
def index():
    return render_template("index.html", **build_context())


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
