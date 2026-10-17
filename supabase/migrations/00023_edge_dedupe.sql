-- =============================================================================
-- UNIFY — 00010: one current edge per (from, to, type)
--
-- The `edges` table had no uniqueness on its logical identity, so the same link
-- could be stored twice: a re-delivered vendor payload, a replayed
-- reconciliation, or a reviewer re-mentioning a key the system had already
-- resolved all produced a second row for what is one link. Findings then fired
-- twice against the "same" edge and the graph showed N copies of one fact.
--
-- NOTE ON NUMBERING: this was proposed as `00009_edge_dedupe.sql`, but 00009 is
-- already `00009_seed_rules.sql`. Renumbered to 00010 rather than rebaking a
-- migration that is applied to the remote project.
-- =============================================================================

-- ---- clean up any duplicates already present -------------------------------
--
-- Must run before the unique index, or creation fails on existing dupes. Keep
-- the newest edge per identity and `revoke` the older ones rather than deleting
-- them: `edges` is referenced by `code_anchors` and is part of the audit trail,
-- so the rows are retained and merely marked non-current.
with ranked as (
  select
    id,
    row_number() over (
      partition by from_id, to_id, type
      order by valid_from desc, created_at desc, id desc
    ) as rn
  from public.edges
  where link_state <> 'revoked'
)
update public.edges e
set link_state  = 'revoked',
    valid_to    = greatest(e.valid_to, now()),
    metadata    = e.metadata || jsonb_build_object(
                    'revokedReason', 'superseded_by_dedupe',
                    'revokedBy', 'migration:00010_edge_dedupe'
                  )
from ranked r
where e.id = r.id
  and r.rn > 1;

-- ---- the constraint ---------------------------------------------------------
--
-- Scoped to `link_state <> 'revoked'`, which is what makes this more than a
-- plain unique index. Three states exist; they play three different roles:
--
--   active    — the link is live. Occupies the slot.
--   dismissed — a reviewer judged this link wrong. STILL occupies the slot.
--   revoked   — the link was retracted / invalidated at source. Frees the slot.
--
-- The consequence, and it is deliberate: dismissing a link is sticky. Once a
-- reviewer dismisses (PR, ticket, type), mentioning that key again does NOT
-- resurrect the link — the dismissed row still holds the identity, so a fresh
-- insert violates this index. That is the property we want: a human "no" is not
-- overturned by the next vendor webhook, and the reviewer stays the authority
-- over what counts as a link.
--
-- The escape hatch is `revoked`. To genuinely re-establish a dismissed link you
-- revoke the old row (audited, with a reason) and insert afresh. That keeps the
-- reversal explicit and attributable instead of silently re-asserting itself.
create unique index edges_current_identity_uidx
  on public.edges (from_id, to_id, type)
  where link_state <> 'revoked';
