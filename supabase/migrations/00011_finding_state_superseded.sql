-- =============================================================================
-- UNIFY — 00011: finding_state gains 'superseded'
--
-- Closes the gap the mid-report ERD (diagrams/erd.tex) and the finding
-- lifecycle diagram (diagrams/06_state_machines.tex) already describe: a
-- finding whose verdict is replaced by a newer one is not "resolved", it is
-- superseded, and the original is kept so the older verdict stays re-readable.
--
-- This is split from 00012 deliberately. PostgreSQL lets ALTER TYPE ... ADD
-- VALUE run inside a transaction, but the new value cannot be *used* until
-- after that transaction commits. 00012 references 'superseded' in a CHECK, so
-- the value has to land in its own migration first.
-- =============================================================================

alter type public.finding_state
  add value if not exists 'superseded';
