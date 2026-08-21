from unify.pipeline import build_store


def _pairs(store):
    return {tuple(sorted([l.source, l.target])) for l in store.links}


def test_auto_links_reference_extraction():
    store = build_store()
    pairs = _pairs(store)
    # S1: PR title names the Jira key; ticket description holds the Figma URL
    assert ("PROJ-15", "gh:pr:42") in pairs
    assert ("PROJ-15", "fig:ABC123") in pairs
    assert ("gh:commit:c1", "gh:pr:42") in pairs
    assert ("gh:commit:c2", "gh:pr:42") in pairs
    assert ("PROJ-15", "gh:commit:c1") in pairs


def test_unresolved_refs_become_suggestions_not_links():
    store = build_store()
    pairs = _pairs(store)
    # references to non-ingested entities must NOT silently link
    assert ("PROJ-16", "fig:DEF999") not in pairs
    assert ("gh:pr:60", "PROJ-99") not in pairs
    # ...they are queued for manual confirmation instead (Section 4.1)
    pending = {(s.source_entity_id, s.ref) for s in store.pending_suggestions()}
    assert ("PROJ-16", "fig:DEF999") in pending
    assert ("gh:pr:60", "PROJ-99") in pending


def test_manual_link_and_no_cross_chain_links():
    store = build_store()
    pairs = _pairs(store)
    # manual link from manual_links.json
    assert ("PROJ-22", "fig:JKL333") in pairs
    # labeled negative cross-chain pairs must not exist
    assert ("PROJ-15", "gh:pr:51") not in pairs
    assert ("fig:GHI789", "gh:pr:42") not in pairs
    assert ("PROJ-21", "fig:ABC123") not in pairs


def test_below_threshold_confidence_degrades_to_suggestion(monkeypatch):
    import unify.resolution.linker as linker_mod

    monkeypatch.setattr(linker_mod, "AUTO_LINK_CONFIDENCE", 0.5)
    store = build_store()
    pairs = {tuple(sorted([l.source, l.target])) for l in store.links}
    # with confidence below the trust threshold, no auto links are trusted...
    assert ("PROJ-15", "gh:pr:42") not in pairs
    # ...every reference degrades to a pending suggestion
    below = {
        (s.source_entity_id, s.ref)
        for s in store.suggestions
        if s.reason == "below_threshold"
    }
    assert ("gh:pr:42", "PROJ-15") in below
