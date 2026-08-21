from datetime import datetime, timezone

from ..models import Link


def utcnow():
    return datetime.now(timezone.utc)


def iso_ms(dt):
    return dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


class MemoryStore:
    def __init__(self):
        self.entities = {}
        self.events = {}
        self.links = []
        self.suggestions = []

    def add_entity(self, e):
        self.entities[e.id] = e

    def add_event(self, e):
        if e.ingested_at is None:
            e.ingested_at = iso_ms(utcnow())
        self.events[e.id] = e

    def add_link(self, link: Link):
        if not self.has_link(link.source, link.target):
            self.links.append(link)

    def has_link(self, a, b):
        return any(
            (l.source == a and l.target == b) or (l.source == b and l.target == a)
            for l in self.links
        )

    def get_entity(self, eid):
        return self.entities.get(eid)

    def links_for(self, eid):
        return [l for l in self.links if l.source == eid or l.target == eid]

    def neighbors(self, eid):
        out = []
        for l in self.links_for(eid):
            other = l.target if l.source == eid else l.source
            out.append((other, l))
        return out

    def all_entities(self):
        return list(self.entities.values())

    def all_events(self):
        return list(self.events.values())

    def events_for(self, entity_ids):
        ids = set(entity_ids)
        return [ev for ev in self.events.values() if ev.entity_id in ids]

    def add_suggestion(self, s):
        self.suggestions.append(s)

    def pending_suggestions(self):
        return [s for s in self.suggestions if s.status == "pending"]

    def mark_tool_stale(self, tool, reason):
        for e in self.entities.values():
            if e.tool == tool:
                e.stale = True
                e.stale_reason = reason

    def unmark_tool_stale(self, tool):
        for e in self.entities.values():
            if e.tool == tool:
                e.stale = False
                e.stale_reason = None

    def stale_entities(self):
        return [e for e in self.entities.values() if e.stale]
