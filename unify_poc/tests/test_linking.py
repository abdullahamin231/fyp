from unify.pipeline import build_store


def test_auto_links():
    store = build_store()
    pairs = {tuple(sorted([l.source, l.target])) for l in store.links}
    assert ("PROJ-15", "gh:pr:42") in pairs
    assert ("PROJ-15", "fig:ABC123") in pairs
    assert ("gh:commit:c1", "gh:pr:42") in pairs
    assert ("gh:commit:c2", "gh:pr:42") in pairs
