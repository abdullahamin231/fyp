import os
import time

from .conflicts.engine import run_rules
from .eval.harness import evaluate, load_labels
from .ingestion.fixtures import ingest_raw, load_raw, load_raw_by_tool
from .notify.sink import emit, route
from .resolution.linker import Linker
from .store.memory_store import MemoryStore

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(HERE, "..", "..", "data")
MANUAL_LINKS = os.path.join(DATA_DIR, "manual_links.json")
LABELS = os.path.join(DATA_DIR, "labels.json")


def build_store(data_dir=DATA_DIR, manual_path=MANUAL_LINKS):
    store = MemoryStore()
    ingest_raw(store, load_raw(data_dir))
    Linker(store, manual_path=manual_path).link()
    return store


def run_pipeline(
    data_dir=DATA_DIR,
    manual_path=MANUAL_LINKS,
    labels_path=LABELS,
    github_repo=None,
    github_token=None,
    max_prs=5,
    write_logs=True,
):
    """Full pipeline: ingest -> normalize -> link -> detect -> route -> log.

    With github_repo set ("owner/repo"), live GitHub PRs/commits are fetched
    via REST and ingested in place of the github fixture — the Adapter swap
    the POC is required to demonstrate. Label-based evaluation only applies
    to the fixture scenario, so it is skipped in live mode.
    """
    store = MemoryStore()

    by_tool = load_raw_by_tool(data_dir)
    if github_repo:
        from .ingestion.github_api import GitHubAdapter

        by_tool["github"] = GitHubAdapter(
            github_repo, token=github_token, max_prs=max_prs
        ).load_raw()
    for raws in by_tool.values():
        ingest_raw(store, raws)

    Linker(store, manual_path=manual_path).link()

    start = time.perf_counter()
    alerts = run_rules(store)
    processing_ms = (time.perf_counter() - start) * 1000.0

    deliveries = route(alerts)
    if write_logs:
        emit(alerts, deliveries)

    report = None
    if labels_path and not github_repo and os.path.exists(labels_path):
        report = evaluate(store, alerts, load_labels(labels_path), processing_ms)
    return store, alerts, deliveries, report


if __name__ == "__main__":
    s, a, d, r = run_pipeline(write_logs=False)
    print(f"{len(s.all_entities())} entities, {len(a)} alerts")
