-- =============================================================================
-- UNIFY — 00009: at most one live edge per (from, to, type)
--
-- `edges` had no uniqueness, so processing two events that mention the same
-- link (a PR opened, then edited; or a webhook redelivered with a new id)
-- would store the link twice. Deterministic linking
-- (apps/worker/src/linking/link-pull-request.ts) inserts with
--   on conflict (from_id, to_id, type) where valid_to is null do nothing
-- which relies on this index.
--
-- Partial (`where valid_to is null`): only the *current* edge is unique. A
-- link that was closed (valid_to set) can be followed by a new one later,
-- which keeps the temporal history the ERD's valid_from/valid_to describes.
-- Dismissed/revoked edges still have valid_to null, so a re-mention does not
-- create a second, active copy next to a reviewer's dismissal.
-- =============================================================================

create unique index edges_live_identity_uidx
  on public.edges (from_id, to_id, type)
  where valid_to is null;
