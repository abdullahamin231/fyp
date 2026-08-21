from ..models import Alert, EntityType
from ._helpers import earliest_commit_ts, linked_pull_requests, linked_tickets


def _live(e):
    return e is not None and not e.stale


def rule_design_changed_after_code(store, now):
    """One coalesced alert per (frame, ticket, pr) chain — repeated design
    updates after the first commit do not spam duplicate alerts."""
    alerts = []
    frames = [e for e in store.all_entities() if e.type == EntityType.FIGMA_FRAME.value]
    for f in frames:
        if not _live(f):
            continue
        updates = [
            ev
            for ev in store.all_events()
            if ev.entity_id == f.id and ev.action in ("updated", "version_changed")
        ]
        for ticket in linked_tickets(f, store):
            if not _live(ticket):
                continue
            for pr in linked_pull_requests(ticket, store):
                if not _live(pr):
                    continue
                first_commit = earliest_commit_ts(pr, store)
                if not first_commit:
                    continue
                late = [u for u in updates if u.timestamp > first_commit]
                if late:
                    latest = max(late, key=lambda u: u.timestamp)
                    alerts.append(
                        Alert(
                            rule="design_changed_after_code",
                            entity_ids=[f.id, ticket.id, pr.id],
                            role="",
                            severity="",
                            message=(
                                f"Design '{f.title}' was updated {len(late)} time(s) after code for "
                                f"'{pr.title}' started ({first_commit}); latest at "
                                f"{latest.timestamp}. Implementation may now be out of sync."
                            ),
                            timestamp=now,
                            triggered_by=[u.id for u in late],
                        )
                    )
    return alerts


def rule_ticket_stale_in_progress(store, now):
    alerts = []
    tickets = [e for e in store.all_entities() if e.type == EntityType.TICKET.value]
    for t in tickets:
        if not _live(t) or t.status != "In Progress":
            continue
        for pr in linked_pull_requests(t, store):
            if not _live(pr):
                continue
            merged_at = pr.raw.get("merged_at")
            if merged_at:
                merge_events = [
                    ev for ev in store.events_for([pr.id]) if ev.action == "merged"
                ]
                alerts.append(
                    Alert(
                        rule="ticket_stale_in_progress",
                        entity_ids=[t.id, pr.id],
                        role="",
                        severity="",
                        message=(
                            f"Ticket '{t.title}' is still 'In Progress' but linked PR "
                            f"'{pr.title}' was merged ({merged_at})."
                        ),
                        timestamp=now,
                        triggered_by=[ev.id for ev in merge_events],
                    )
                )
    return alerts


def rule_done_without_code(store, now):
    alerts = []
    tickets = [e for e in store.all_entities() if e.type == EntityType.TICKET.value]
    for t in tickets:
        if not _live(t) or t.status != "Done":
            continue
        if not linked_pull_requests(t, store):
            transition_events = [
                ev
                for ev in store.events_for([t.id])
                if ev.action.startswith("transitioned:")
            ]
            alerts.append(
                Alert(
                    rule="done_without_code",
                    entity_ids=[t.id],
                    role="",
                    severity="",
                    message=(
                        f"Ticket '{t.title}' is 'Done' but has no linked pull request. "
                        f"Change may be undocumented in code."
                    ),
                    timestamp=now,
                    triggered_by=[ev.id for ev in transition_events],
                )
            )
    return alerts


ALL_RULES = [
    rule_design_changed_after_code,
    rule_ticket_stale_in_progress,
    rule_done_without_code,
]
