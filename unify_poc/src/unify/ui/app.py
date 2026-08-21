from flask import Flask, render_template

from unify.pipeline import run_pipeline, DATA_DIR
from unify.feed.feed import entity_feed
from unify.config import ROLE_LABELS

app = Flask(__name__)


def tool_entities(store):
    groups = {"figma": [], "github": [], "jira": []}
    for e in store.all_entities():
        if e.tool in groups:
            groups[e.tool].append(
                {"id": e.id, "title": e.title, "type": e.type, "status": e.status}
            )
    return groups


def alert_view(a, store):
    ids = a.entity_ids
    ents = []
    for i in ids:
        e = store.get_entity(i)
        if e:
            ents.append(
                {"id": e.id, "title": e.title, "tool": e.tool, "type": e.type, "status": e.status}
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
    }


def build_context():
    store, alerts, report = run_pipeline(data_dir=DATA_DIR)
    return {
        "store": store,
        "tools": tool_entities(store),
        "alerts": [alert_view(a, store) for a in alerts],
        "report": report,
        "role_labels": ROLE_LABELS,
    }


@app.route("/")
def index():
    return render_template("index.html", **build_context())


@app.route("/entity/<eid>")
def entity(eid):
    store, _, _ = run_pipeline(data_dir=DATA_DIR)
    feed = entity_feed(store, eid)
    if not feed:
        return f"Unknown entity {eid}", 404
    return render_template("entity.html", feed=feed, role_labels=ROLE_LABELS)


@app.route("/run")
def run_again():
    return index()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
