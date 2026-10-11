-- =============================================================================
-- UNIFY — 00014: two vocabulary additions the verification pipeline needs
--
-- Both are *system* vocabulary (run outcomes and finding kinds), not the
-- frozen dataset label taxonomy — verdict, freshness, review and reason codes
-- are untouched (Action Plan §2).
--
--   stop_reason + MALFORMED_OUTPUT
--     The bounded loop can end three ways already: nothing applicable, a
--     normal verify, a critic pass, the pass cap, or the model being down. It
--     was missing the fourth failure: the model answered, but not in the
--     schema. §11.8 rejects that output at the gate — but the pass still needs
--     a logged stop reason that says so, rather than `VERIFIED`.
--
--   finding_kind + criterion_verification
--     `findings.origin = 'verdict'` rows need a `kind`; the enum only carried
--     the four rule-produced kinds (Rules 1–3 + P4). A verdict-origin finding
--     is the evidence case for one atomic criterion (FR-11, FR-15).
--
-- Owner: Abdullah Amin. Contracts: packages/contracts/src/enums.ts.
-- =============================================================================

alter type public.stop_reason add value 'MALFORMED_OUTPUT';

alter type public.finding_kind add value 'criterion_verification';
