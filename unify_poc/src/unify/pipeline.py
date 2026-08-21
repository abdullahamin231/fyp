import os
import json
import time

from .ingestion.fixtures import load_fixtures
from .resolution.linker import Linker
from .conflicts.engine import run_rules
from .notify.sink import emit, route
from .eval.harness import evaluate, load_labels
from .store.memory_store import MemoryStore

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(HERE, "..", "..", "data")
MANUAL_LINKS = os.path.join(DATA_DIR, "manual_links.json")
LABELS = os.path.join(DATA_DIR, "labels.json")


def build_store(data_dir=DATA_DIR, manual_path=MANUAL_LINKS):
    store = MemoryStore()
    entities, events = load_fixtures(data_dir)
    for e in entities:
        store.add_entity(e)
    for ev in events:
        store.add_event(ev)
    Linker(store, manual_path=manual_path).link()
    return store


def run_pipeline(data_dir=DATA_DIR, manual_path=MANUAL_LINKS, labels_path=LABELS):
    store = build_store(data_dir, manual_path)
    start = time.perf_counter()
    alerts = run_rules(store)
    processing_ms = (time.perf_counter() - start) * 1000.0
    alerts = route(alerts)
    emit(alerts)
    report = None
    if labels_path and os.path.exists(labels_path):
        labels = load_labels(labels_path)
        report = evaluate(store, alerts, labels, processing_ms)
    return store, alerts, report


if __name__ == "__main__":
    s, a, r = run_pipeline()
    print(json.dumps(r, indent=2))
