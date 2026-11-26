-- UNIFY — FR-14: watching is its own audit action, not a link review.
-- Only ADD VALUE statements here: older Postgres cannot run them inside a
-- transaction block, and a new value cannot be used where it is added.
-- Earlier watch rows are not rewritten: audit_log is append-only.
alter type public.audit_action add value if not exists 'artefact_watched';
alter type public.audit_action add value if not exists 'artefact_unwatched';
