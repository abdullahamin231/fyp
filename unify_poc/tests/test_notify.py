import json

from unify.conflicts.engine import run_rules
from unify.notify.sink import emit, route
from unify.pipeline import build_store


def _alerts():
    return run_rules(build_store())


def test_route_partitions_by_role_channels():
    deliveries = route(_alerts())
    by_role = {}
    for d in deliveries:
        by_role.setdefault(d.role, set()).add(d.channel)
    assert "slack:#design" in by_role["designer"]
    assert "slack:#pm" in by_role["pm"]
    assert "slack:#dev" in by_role["developer"]
    # every alert reaches every channel of its role
    slack_for = {"designer": "slack:#design", "developer": "slack:#dev", "pm": "slack:#pm"}
    for a in _alerts():
        chans = {d.channel for d in deliveries if d.rule == a.rule}
        assert chans == {"dashboard", slack_for[a.role]}


def test_delivery_log_written(tmp_path):
    alerts = _alerts()
    deliveries = route(alerts)
    alert_log = tmp_path / "alerts.json"
    delivery_log = tmp_path / "notifications.json"
    emit(alerts, deliveries, str(alert_log), str(delivery_log))
    data = json.loads(delivery_log.read_text())
    # 3 alerts x 2 channels each = 6 delivery records (FR-04 evidence)
    assert len(data) == len(alerts) * 2
    assert all(d["status"] == "delivered" for d in data)
    assert all("delivered_at" in d for d in data)


def test_noise_threshold_suppresses_excess_deliveries():
    from unify.config import MAX_ALERTS_PER_ROLE_PER_RUN

    alerts = _alerts() + _alerts() + _alerts()
    deliveries = route(alerts)
    pm_delivered = [
        d for d in deliveries if d.role == "pm" and d.status == "delivered"
    ]
    pm_suppressed = [
        d for d in deliveries if d.role == "pm" and d.status == "suppressed_threshold"
    ]
    assert len(pm_delivered) <= MAX_ALERTS_PER_ROLE_PER_RUN * len(
        [c for c in ["dashboard", "slack:#pm"]]
    )
    assert pm_suppressed, "excess deliveries must be suppressed, not dropped silently"


def test_duplicate_alerts_deduped():
    alerts = _alerts() + _alerts()
    keys = {a.key for a in alerts}
    assert len(keys) == 3
