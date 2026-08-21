from ..models import Link


class MemoryStore:
    def __init__(self):
        self.entities = {}
        self.events = {}
        self.links = []

    def add_entity(self, e):
        self.entities[e.id] = e

    def add_event(self, e):
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
