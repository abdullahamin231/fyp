from unify.pipeline import build_store
from unify.conflicts.engine import run_rules


def test_rules_fire():
    store = build_store()
    alerts = run_rules(store)
    rules = {a.rule for a in alerts}
    assert "design_changed_after_code" in rules
    assert "ticket_stale_in_progress" in rules
    assert "done_without_code" in rules


def test_roles_assigned():
    store = build_store()
    alerts = run_rules(store)
    for a in alerts:
        assert a.role in ("designer", "developer", "pm")
