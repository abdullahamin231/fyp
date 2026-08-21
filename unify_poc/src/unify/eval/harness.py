import json


def _pair_key(a, b):
    return tuple(sorted([a, b]))


def _prf(tp, fp, fn, tn=0):
    tp, fp, fn, tn = (
        len(x) if isinstance(x, set) else x for x in (tp, fp, fn, tn)
    )
    precision = tp / (tp + fp) if (tp + fp) else 1.0
    recall = tp / (tp + fn) if (tp + fn) else 1.0
    f1 = (
        2 * precision * recall / (precision + recall)
        if (precision + recall)
        else 0.0
    )
    fpr = fp / (fp + tn) if (fp + tn) else 0.0
    return {
        "true_positive": tp,
        "false_positive": fp,
        "false_negative": fn,
        "true_negative": tn,
        "precision": round(precision, 3),
        "recall": round(recall, 3),
        "f1": round(f1, 3),
        "false_positive_rate": round(fpr, 3),
    }


def evaluate(store, alerts, labels, processing_ms=0.0):
    """Negatives-aware evaluation.

    Links: expected_links must be produced; expected_non_links are tempting
    pairs that must NOT be produced. Alerts: expected_alerts must fire;
    expected_silences are (rule, entities) that must stay quiet.
    """
    expected_links = {_pair_key(a, b) for a, b in labels.get("expected_links", [])}
    non_link_labels = {_pair_key(a, b) for a, b in labels.get("expected_non_links", [])}
    produced_links = {_pair_key(l.source, l.target) for l in store.links}

    tp_links = expected_links & produced_links
    fn_links = expected_links - produced_links
    # false positives: any produced link not in the positive label set,
    # measured against the labeled sample scope.
    fp_links = produced_links - expected_links
    tn_links = non_link_labels - produced_links

    def alert_key(d):
        return (d["rule"], tuple(sorted(d["entities"])))

    expected_alerts = {alert_key(d) for d in labels.get("expected_alerts", [])}
    silence_labels = {alert_key(d) for d in labels.get("expected_silences", [])}
    produced_alerts = {a.key for a in alerts}

    tp_alerts = expected_alerts & produced_alerts
    fn_alerts = expected_alerts - produced_alerts
    fp_alerts = produced_alerts - expected_alerts
    tn_alerts = silence_labels - produced_alerts

    latencies = sorted(a.latency_ms for a in alerts if a.latency_ms is not None)

    def pct(values, p):
        if not values:
            return 0.0
        idx = min(int(len(values) * p), len(values) - 1)
        return values[idx]

    return {
        "linking": {
            **_prf(tp_links, fp_links, fn_links, tn_links),
            "expected": len(expected_links),
            "non_link_checks": len(non_link_labels),
            "produced": len(produced_links),
        },
        "alerts": {
            **_prf(tp_alerts, fp_alerts, fn_alerts, tn_alerts),
            "expected": len(expected_alerts),
            "silence_checks": len(silence_labels),
            "produced": len(produced_alerts),
        },
        "latency_ms": {
            "batch_rule_eval": round(processing_ms, 3),
            "p50_event_to_alert": pct(latencies, 0.50),
            "p95_event_to_alert": pct(latencies, 0.95),
            "max_event_to_alert": latencies[-1] if latencies else 0.0,
            "n": len(latencies),
        },
    }


def load_labels(path):
    with open(path) as f:
        return json.load(f)


def summarize(report):
    """Human-readable multi-line summary of an eval report."""
    l, a, lat = report["linking"], report["alerts"], report["latency_ms"]
    lines = [
        "=== Evaluation ===",
        f"Linking : precision={l['precision']} recall={l['recall']} f1={l['f1']} "
        f"fpr={l['false_positive_rate']} "
        f"(tp={l['true_positive']} fp={l['false_positive']} "
        f"fn={l['false_negative']} tn={l['true_negative']})",
        f"Alerts  : precision={a['precision']} recall={a['recall']} f1={a['f1']} "
        f"fpr={a['false_positive_rate']} "
        f"(tp={a['true_positive']} fp={a['false_positive']} "
        f"fn={a['false_negative']} tn={a['true_negative']})",
        f"Latency : p50={lat['p50_event_to_alert']}ms "
        f"p95={lat['p95_event_to_alert']}ms max={lat['max_event_to_alert']}ms "
        f"(event->alert, n={lat['n']}); batch rule-eval {lat['batch_rule_eval']}ms",
    ]
    return "\n".join(lines)
