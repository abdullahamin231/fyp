import os
from .adapter import FixtureAdapter


def load_fixtures(data_dir):
    entities = []
    events = []
    for name in ["github.json", "jira.json", "figma.json"]:
        path = os.path.join(data_dir, name)
        if not os.path.exists(path):
            continue
        ents, evs = FixtureAdapter(path).load()
        entities.extend(ents)
        events.extend(evs)
    return entities, events
