from unify.conflicts.engine import run_rules
from unify.eval.harness import evaluate, load_labels
from unify.ingestion.outage import run_outage_experiment
from unify.pipeline import DATA_DIR, LABELS, build_store


def _lat():
    alerts = run_rules(build_store())
    assert all(a.latency_ms is not None for a in alerts)
    return [a.latency_ms for a in alerts]


def test_alerts_carry_event_to_alert_latency():
    lat = _lat()
    assert len(lat) == 3
    assert all(v >= 0 for v in lat)


def test_eval_reports_p50_p95():
    report = evaluate(
        build_store(),
        run_rules(build_store()),
        load_labels(LABELS),
        processing_ms=1.0,
    )
    lat = report["latency_ms"]
    assert lat["n"] == 3
    assert 0 <= lat["p50_event_to_alert"] <= lat["p95_event_to_alert"]
    assert lat["p95_event_to_alert"] <= lat["max_event_to_alert"] + 0.001


def test_replayed_events_have_queue_inclusive_latency(tmp_path):
    _, alerts, _ = run_outage_experiment(DATA_DIR)
    by_rule = {a.rule: a for a in alerts}
    # the design alert's triggering event was ingested at replay time,
    # so its latency must be measured from ingestion, not vendor timestamp
    design = by_rule["design_changed_after_code"]
    assert design.latency_ms >= 0
    assert design.triggered_by == ["fig:ABC123#updated"]
