import json
from .normalizer import normalize
from ..models import Entity, Event


class Adapter:
    def load(self):
        raise NotImplementedError


class FixtureAdapter(Adapter):
    def __init__(self, path):
        self.path = path

    def load(self):
        with open(self.path) as f:
            raw_items = json.load(f)
        entities = []
        events = []
        for raw in raw_items:
            ents, evs = normalize(raw)
            entities.extend(ents)
            events.extend(evs)
        return entities, events
