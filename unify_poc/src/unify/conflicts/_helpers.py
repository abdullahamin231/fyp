from ..models import EntityType


def earliest_commit_ts(pr, store):
    ts = []
    for cid, _ in store.neighbors(pr.id):
        c = store.get_entity(cid)
        if c and c.type == EntityType.COMMIT.value and c.timestamp:
            ts.append(c.timestamp)
    return min(ts) if ts else None


def linked_pull_requests(ticket, store):
    prs = []
    for nid, _ in store.neighbors(ticket.id):
        e = store.get_entity(nid)
        if e and e.type == EntityType.PULL_REQUEST.value:
            prs.append(e)
    return prs


def linked_tickets(frame, store):
    out = []
    for nid, _ in store.neighbors(frame.id):
        e = store.get_entity(nid)
        if e and e.type == EntityType.TICKET.value:
            out.append(e)
    return out
