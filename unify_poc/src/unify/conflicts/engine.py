from datetime import datetime, timezone

from ..config import ROLE_FOR_RULE, SEVERITY_FOR_RULE
from .rules import ALL_RULES


def run_rules(store):
    """Evaluate all rules, dedupe alerts, assign role/severity and compute
    per-alert event->alert latency from event ingestion timestamps."""
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    alerts = []
    for rule in ALL_RULES:
        alerts.extend(rule(store, now))

    seen = set()
    deduped = []
    for a in alerts:
        if a.key in seen:
            continue
        seen.add(a.key)
        a.role = ROLE_FOR_RULE.get(a.rule, "pm")
        a.severity = SEVERITY_FOR_RULE.get(a.rule, "warning")
        a.latency_ms = _alert_latency_ms(a, store)
        deduped.append(a)
    return deduped


def _alert_latency_ms(alert, store):
    """Latency = alert emission time minus the latest ingestion time among the
    events that triggered it (includes queue/replay delay by construction)."""
    times = []
    for ev in store.events_for(alert.entity_ids):
        if ev.ingested_at:
            times.append(_parse(ev.ingested_at))
    if not times:
        return 0.0
    latest = max(times)
    emission = datetime.now(timezone.utc)
    return round(max((emission - latest).total_seconds() * 1000.0, 0.0), 3)


def _parse(ts):
    return datetime.strptime(ts, "%Y-%m-%dT%H:%M:%S.%f%z")
