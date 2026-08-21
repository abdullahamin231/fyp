import json
from collections import defaultdict


def _pair_key(a, b):
    return tuple(sorted([a, b]))


def evaluate(store, alerts, labels, processing_ms=0.0):
    expected_links = [_pair_key(a, b) for a, b in labels.get("expected_links", [])]
    produced_links = [_pair_key(l.source, l.target) for l in store.links]

    expected_link_set = set(expected_links)
    produced_link_set = set(produced_links)
    tp_links = expected_link_set & produced_link_set
    fp_links = produced_link_set - expected_link_set
    fn_links = expected_link_set - produced_link_set

    link_precision = len(tp_links) / len(produced_link_set) if produced_link_set else 1.0
    link_recall = len(tp_links) / len(expected_link_set) if expected_link_set else 1.0

    def alert_key(a):
        return (a.rule, tuple(sorted(a.entity_ids)))

    expected_alerts = set(
        (d["rule"], tuple(sorted(d["entities"]))) for d in labels.get("expected_alerts", [])
    )
    produced_alerts = set(alert_key(a) for a in alerts)

    tp_a = expected_alerts & produced_alerts
    fp_a = produced_alerts - expected_alerts
    fn_a = expected_alerts - produced_alerts

    alert_precision = len(tp_a) / len(produced_alerts) if produced_alerts else 1.0
    alert_recall = len(tp_a) / len(expected_alerts) if expected_alerts else 1.0
    false_positive_rate = len(fp_a) / len(produced_alerts) if produced_alerts else 0.0

    return {
        "linking": {
            "expected": len(expected_link_set),
            "produced": len(produced_link_set),
            "true_positive": len(tp_links),
            "false_positive": len(fp_links),
            "false_negative": len(fn_links),
            "precision": round(link_precision, 3),
            "recall": round(link_recall, 3),
        },
        "alerts": {
            "expected": len(expected_alerts),
            "produced": len(produced_alerts),
            "true_positive": len(tp_a),
            "false_positive": len(fp_a),
            "false_negative": len(fn_a),
            "precision": round(alert_precision, 3),
            "recall": round(alert_recall, 3),
            "false_positive_rate": round(false_positive_rate, 3),
        },
        "latency_ms": round(processing_ms, 3),
    }


def load_labels(path):
    with open(path) as f:
        return json.load(f)
