from datetime import datetime, timezone

from ..config import MAX_ALERTS_PER_ROLE_PER_RUN, ROLE_CHANNELS
from ..models import Delivery


def route(alerts, now=None):
    """Partition alerts into per-role delivery channels with a delivery log.

    FR-04 evidence: every alert produces one Delivery record per channel,
    either 'delivered' or 'suppressed_threshold' when the per-role noise
    threshold (Section 8.1) is exceeded.
    """
    if now is None:
        now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    deliveries = []
    per_role_count = {}
    for a in alerts:
        channels = ROLE_CHANNELS.get(a.role, ["dashboard"])
        for ch in channels:
            n = per_role_count.get(a.role, 0)
            status = "delivered" if n < MAX_ALERTS_PER_ROLE_PER_RUN else "suppressed_threshold"
            per_role_count[a.role] = n + 1
            deliveries.append(
                Delivery(
                    rule=a.rule,
                    entity_ids=list(a.entity_ids),
                    role=a.role,
                    channel=ch,
                    status=status,
                    delivered_at=now,
                )
            )
    return deliveries


def emit(alerts, deliveries, log_path="alerts.json", delivery_log_path="notifications.json"):
    import json

    alert_records = [a.to_dict() for a in alerts]
    with open(log_path, "w") as f:
        json.dump(alert_records, f, indent=2)
    delivery_records = [d.to_dict() for d in deliveries]
    with open(delivery_log_path, "w") as f:
        json.dump(delivery_records, f, indent=2)
    for d in deliveries:
        if d.status == "delivered":
            print(f"[{d.channel}] -> {d.role}: {d.rule} {d.entity_ids}")
        else:
            print(f"[{d.channel}] -> {d.role}: {d.rule} SUPPRESSED (noise threshold)")
    return alert_records, delivery_records
