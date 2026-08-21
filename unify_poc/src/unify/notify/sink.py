from ..models import Alert


def route(alerts):
    return alerts


def emit(alerts, log_path="alerts.json"):
    records = [a.to_dict() for a in alerts]
    with open(log_path, "w") as f:
        import json

        json.dump(records, f, indent=2)
    for a in alerts:
        print(f"[ALERT][{a.role.upper()}] {a.rule}: {a.message}")
    return records
