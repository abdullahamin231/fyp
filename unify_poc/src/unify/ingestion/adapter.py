import json

from .normalizer import normalize


class Adapter:
    """Pluggable source of raw vendor records. Implementations return raw
    dicts in the common pre-normalization schema so linking/conflict logic
    never changes when swapping fixtures for live APIs."""

    def load_raw(self):
        raise NotImplementedError

    def load(self):
        entities = []
        events = []
        for raw in self.load_raw():
            ents, evs = normalize(raw)
            entities.extend(ents)
            events.extend(evs)
        return entities, events


class FixtureAdapter(Adapter):
    def __init__(self, path):
        self.path = path

    def load_raw(self):
        with open(self.path) as f:
            return json.load(f)
