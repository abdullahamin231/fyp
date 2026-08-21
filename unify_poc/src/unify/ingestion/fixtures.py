import os

from .adapter import FixtureAdapter
from .normalizer import normalize

TOOL_FILES = ["github.json", "jira.json", "figma.json"]


def load_raw(data_dir, tools=None):
    """Load raw vendor records from fixture files, optionally restricted to
    a set of tool names (e.g. {"github", "jira"})."""
    raws = []
    for name in TOOL_FILES:
        path = os.path.join(data_dir, name)
        if not os.path.exists(path):
            continue
        for raw in FixtureAdapter(path).load_raw():
            if tools is None or raw.get("tool") in tools:
                raws.append(raw)
    return raws


def load_raw_by_tool(data_dir):
    by_tool = {}
    for name in TOOL_FILES:
        path = os.path.join(data_dir, name)
        if not os.path.exists(path):
            continue
        for raw in FixtureAdapter(path).load_raw():
            by_tool.setdefault(raw.get("tool"), []).append(raw)
    return by_tool


def ingest_raw(store, raws, include_events=True):
    """Normalize raw records into a store; returns (n_entities, n_events).

    With include_events=False only entity state is ingested (last-known
    snapshot) — used by the outage experiment while a tool is unreachable.
    """
    ne = nv = 0
    for raw in raws:
        ents, evs = normalize(raw)
        for e in ents:
            store.add_entity(e)
            ne += 1
        if include_events:
            for ev in evs:
                store.add_event(ev)
                nv += 1
    return ne, nv


def load_fixtures(data_dir):
    entities = []
    events = []
    for raw in load_raw(data_dir):
        ents, evs = normalize(raw)
        entities.extend(ents)
        events.extend(evs)
    return entities, events
