from unify.conflicts.engine import run_rules
from unify.pipeline import build_store


def test_conflicts_fire_on_expected_chains():
    store = build_store()
    alerts = run_rules(store)
    keys = {a.key for a in alerts}
    assert ("design_changed_after_code", ("PROJ-15", "fig:ABC123", "gh:pr:42")) in keys
    assert ("ticket_stale_in_progress", ("PROJ-15", "gh:pr:42")) in keys
    assert ("done_without_code", ("PROJ-16",)) in keys


def test_benign_scenarios_stay_silent():
    store = build_store()
    alerts = run_rules(store)
    keys = {a.key for a in alerts}
    # design updated BEFORE first commit -> no alert
    assert ("design_changed_after_code", ("PROJ-20", "fig:GHI789", "gh:pr:51")) not in keys
    # PR not merged -> no stale-ticket alert
    assert ("ticket_stale_in_progress", ("PROJ-20", "gh:pr:51")) not in keys
    # ticket Done (not In Progress) with merged PR -> no alerts at all
    assert ("ticket_stale_in_progress", ("PROJ-21", "gh:pr:55")) not in keys
    assert ("done_without_code", ("PROJ-21",)) not in keys


def test_exactly_three_alerts_total():
    store = build_store()
    assert len(run_rules(store)) == 3


def test_repeated_design_updates_coalesce_into_one_alert():
    store = build_store()
    # simulate a second post-commit design update arriving
    from unify.models import Event

    store.add_event(
        Event(
            id="fig:ABC123#updated-2",
            actor="designer1",
            entity_id="fig:ABC123",
            action="updated",
            timestamp="2026-08-05T09:00:00Z",
        )
    )
    design_alerts = [
        a for a in run_rules(store) if a.rule == "design_changed_after_code"
    ]
    assert len(design_alerts) == 1
    assert "2 time(s)" in design_alerts[0].message


def test_roles_and_severities_assigned():
    store = build_store()
    for a in run_rules(store):
        assert a.role in ("designer", "developer", "pm")
        assert a.severity in ("warning", "info")


def test_stale_entities_are_skipped_by_rules():
    store = build_store()
    store.mark_tool_stale("figma", "tool_unreachable_since_test")
    rules = {a.rule for a in run_rules(store)}
    assert "design_changed_after_code" not in rules
