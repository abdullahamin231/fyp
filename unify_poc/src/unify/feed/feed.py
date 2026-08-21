def build_chain(store, eid, max_depth=6):
    seen = set()
    frontier = [(eid, 0)]
    chain = []
    while frontier:
        cur, depth = frontier.pop(0)
        if cur in seen or depth > max_depth:
            continue
        seen.add(cur)
        chain.append(cur)
        for nid, _ in store.neighbors(cur):
            if nid not in seen:
                frontier.append((nid, depth + 1))
    return chain


def entity_feed(store, eid):
    e = store.get_entity(eid)
    if not e:
        return None
    chain = build_chain(store, eid)
    chain_ids = set(chain)
    events = sorted(
        [ev for ev in store.all_events() if ev.entity_id in chain_ids],
        key=lambda x: x.timestamp,
    )
    return {
        "entity": {
            "id": e.id,
            "tool": e.tool,
            "type": e.type,
            "title": e.title,
            "status": e.status,
        },
        "linked": [i for i in chain if i != eid],
        "timeline": [
            {
                "timestamp": ev.timestamp,
                "actor": ev.actor,
                "entity": ev.entity_id,
                "action": ev.action,
            }
            for ev in events
        ],
    }
