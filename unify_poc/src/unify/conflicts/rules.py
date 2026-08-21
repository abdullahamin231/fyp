from ..models import Alert, EntityType, Tool
from ._helpers import earliest_commit_ts, linked_pull_requests, linked_tickets


def rule_design_changed_after_code(store, now):
    alerts = []
    frames = [e for e in store.all_entities() if e.type == EntityType.FIGMA_FRAME.value]
    for f in frames:
        updates = [
            ev
            for ev in store.all_events()
            if ev.entity_id == f.id and ev.action in ("updated", "version_changed")
        ]
        for upd in updates:
            for ticket in linked_tickets(f, store):
                for pr in linked_pull_requests(ticket, store):
                    first_commit = earliest_commit_ts(pr, store)
                    if first_commit and upd.timestamp > first_commit:
                        alerts.append(
                            Alert(
                                rule="design_changed_after_code",
                                entity_ids=[f.id, ticket.id, pr.id],
                                role="",
                                severity="",
                                message=(
                                    f"Design '{f.title}' was updated ({upd.timestamp}) "
                                    f"after code for '{pr.title}' started ({first_commit}). "
                                    f"Implementation may now be out of sync."
                                ),
                                timestamp=now,
                            )
                        )
    return alerts


def rule_ticket_stale_in_progress(store, now):
    alerts = []
    tickets = [e for e in store.all_entities() if e.type == EntityType.TICKET.value]
    for t in tickets:
        if t.status != "In Progress":
            continue
        for pr in linked_pull_requests(t, store):
            if pr.raw.get("merged_at"):
                alerts.append(
                    Alert(
                        rule="ticket_stale_in_progress",
                        entity_ids=[t.id, pr.id],
                        role="",
                        severity="",
                        message=(
                            f"Ticket '{t.title}' is still 'In Progress' but linked PR "
                            f"'{pr.title}' was merged ({pr.raw.get('merged_at')})."
                        ),
                        timestamp=now,
                    )
                )
    return alerts


def rule_done_without_code(store, now):
    alerts = []
    tickets = [e for e in store.all_entities() if e.type == EntityType.TICKET.value]
    for t in tickets:
        if t.status != "Done":
            continue
        if not linked_pull_requests(t, store):
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
                )
            )
    return alerts


ALL_RULES = [
    rule_design_changed_after_code,
    rule_ticket_stale_in_progress,
    rule_done_without_code,
]
