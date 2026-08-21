import json

from unify.ingestion.outage import OutageQueue, run_outage_experiment
from unify.pipeline import DATA_DIR


def test_outage_queues_events_and_marks_stale():
    _, alerts, report = run_outage_experiment(DATA_DIR)
    d = report["during_outage"]
    assert d["queued_raw_records"] == 3  # the three figma fixture records
    assert set(d["stale_entities"]) == {"fig:ABC123", "fig:GHI789", "fig:JKL333"}
    # design rule suppressed while its frame is stale/unverified...
    rules = {key[0] for key in d["alerts"]}
    assert "design_changed_after_code" not in rules
    # ...but tool-independent rules still run
    assert "ticket_stale_in_progress" in rules
    assert "done_without_code" in rules


def test_replay_restores_alerts_with_latency():
    _, alerts, report = run_outage_experiment(DATA_DIR)
    assert report["after_replay"]["replayed_raw_records"] == 3
    assert {a.rule for a in alerts} == {
        "design_changed_after_code",
        "ticket_stale_in_progress",
        "done_without_code",
    }
    assert all(a.latency_ms is not None for a in alerts)


def test_outbox_persists(tmp_path):
    q = OutageQueue(outbox_path=str(tmp_path / "outbox.json"))
    q.enqueue([{"tool": "figma", "id": "fig:X"}])
    assert (tmp_path / "outbox.json").exists()
    saved = json.loads((tmp_path / "outbox.json").read_text())
    assert saved["items"][0]["id"] == "fig:X"
    assert len(q.replay()) == 1
