import os
import json

from unify.pipeline import build_store
from unify.conflicts.engine import run_rules
from unify.notify.sink import route, emit


def test_emit_writes_json(tmp_path):
    store = build_store()
    alerts = route(run_rules(store))
    out = tmp_path / "alerts.json"
    emit(alerts, log_path=str(out))
    assert out.exists()
    data = json.loads(out.read_text())
    assert len(data) == len(alerts)
    assert all("role" in d and "rule" in d for d in data)
