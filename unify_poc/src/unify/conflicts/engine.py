from datetime import datetime, timezone

from ..config import ROLE_FOR_RULE, SEVERITY_FOR_RULE
from .rules import ALL_RULES


def run_rules(store):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    alerts = []
    for rule in ALL_RULES:
        alerts.extend(rule(store, now))
    for a in alerts:
        a.role = ROLE_FOR_RULE.get(a.rule, "pm")
        a.severity = SEVERITY_FOR_RULE.get(a.rule, "warning")
    return alerts
