from unify.eval.harness import evaluate, load_labels
from unify.pipeline import LABELS, build_store


def _report():
    store = build_store()
    from unify.conflicts.engine import run_rules

    return evaluate(store, run_rules(store), load_labels(LABELS))


def test_expected_links_all_found():
    r = _report()["linking"]
    assert r["true_positive"] == 13
    assert r["false_negative"] == 0


def test_labeled_non_links_are_not_linked():
    r = _report()["linking"]
    assert r["true_negative"] == 6
    assert r["false_positive"] == 0


def test_silences_are_respected():
    r = _report()["alerts"]
    assert r["true_negative"] == 4
    assert r["false_positive"] == 0
    assert r["false_negative"] == 0


def test_fpr_uses_true_negatives():
    r = _report()
    # with zero FPs and labeled negatives present, FPR must be exactly 0
    assert r["linking"]["false_positive_rate"] == 0.0
    assert r["alerts"]["false_positive_rate"] == 0.0


def test_eval_detects_injected_false_positive():
    """Guard against circular evaluation: if the system produced a link that
    the labels say must not exist, the harness must catch it."""
    store = build_store()

    class FakeAlert:
        rule = "ticket_stale_in_progress"
        entity_ids = ["PROJ-20", "gh:pr:51"]
        role = "pm"
        severity = "warning"
        latency_ms = 1.0

        @property
        def key(self):
            return (self.rule, tuple(sorted(self.entity_ids)))

    labels = load_labels(LABELS)
    report = evaluate(store, [FakeAlert()], labels)
    assert report["alerts"]["false_positive"] >= 1
    assert report["alerts"]["precision"] < 1.0
