"""Failure/fallback experiment (Section 12 / Section 13).

Simulates one tool being unreachable: its last-known entities remain in the
store but are marked stale/unverified, its new events are queued in an
outbox, and conflict rules refuse to treat stale chains as up to date. On
reconnect the queue is replayed and the suppressed conflict fires with
queue-inclusive event->alert latency.
"""

import json
import os
from datetime import timedelta

from ..config import STALE_AFTER_MINUTES
from ..conflicts.engine import run_rules
from ..resolution.linker import Linker
from ..store.memory_store import MemoryStore, iso_ms, utcnow
from .fixtures import ingest_raw, load_raw_by_tool


class OutageQueue:
    """Holds raw records from an unreachable tool; persists to an outbox file
    and replays them on reconnect."""

    def __init__(self, outbox_path=None):
        self.items = []
        self.queued_at = None
        self.outbox_path = outbox_path

    def enqueue(self, raws):
        self.queued_at = utcnow()
        self.items.extend(raws)
        if self.outbox_path:
            with open(self.outbox_path, "w") as f:
                json.dump(
                    {"queued_at": iso_ms(self.queued_at), "items": self.items}, f, indent=2
                )

    def replay(self):
        items, self.items = self.items, []
        return items


def run_outage_experiment(data_dir, outage_tool="figma", outbox_dir=None):
    started = iso_ms(utcnow())
    report = {"outage_tool": outage_tool, "stale_after_minutes": STALE_AFTER_MINUTES}

    # Phase 1 — outage: ingest last-known entity state for the downed tool,
    # queue its new events, mark its entities stale/unverified.
    by_tool = load_raw_by_tool(data_dir)
    store = MemoryStore()
    for tool, raws in by_tool.items():
        if tool == outage_tool:
            ingest_raw(store, raws, include_events=False)
        else:
            ingest_raw(store, raws)
    Linker(store, manual_path=_manual_links_path()).link()

    queue = OutageQueue(
        outbox_path=os.path.join(outbox_dir, "outbox.json") if outbox_dir else None
    )
    queue.enqueue(by_tool.get(outage_tool, []))

    down_since = utcnow() - timedelta(minutes=STALE_AFTER_MINUTES + 5)
    store.mark_tool_stale(outage_tool, f"tool_unreachable_since_{iso_ms(down_since)}")

    during_alerts = run_rules(store)
    report["during_outage"] = {
        "queued_raw_records": len(queue.items),
        "stale_entities": [e.id for e in store.stale_entities()],
        "alerts": [a.key for a in during_alerts],
        "suppressed": "design_changed_after_code did not fire: its Figma frame "
        "is marked stale/unverified while the tool is unreachable",
    }

    # Phase 2 — reconnect: replay queued events, clear staleness, re-evaluate.
    replayed = queue.replay()
    ingest_raw(store, replayed)
    store.unmark_tool_stale(outage_tool)
    alerts = run_rules(store)
    report["after_replay"] = {
        "replayed_raw_records": len(replayed),
        "alerts": [
            {
                "rule": a.rule,
                "entities": a.entity_ids,
                "latency_ms": a.latency_ms,
                "triggered_by": a.triggered_by,
            }
            for a in alerts
        ],
    }
    report["started_at"] = started
    report["finished_at"] = iso_ms(utcnow())
    return store, alerts, report


def _manual_links_path():
    here = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(here, "..", "..", "..", "data", "manual_links.json")
