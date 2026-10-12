# Hosted demo verdicts do not match expected outcomes

Status: open (deferred)

## Expected outcomes (offline scenario table, `npm run scenarios`)

| Case | Expected verdict | Gate | Finding |
| --- | --- | --- | --- |
| DEMO-01 baseline | SUPPORTED | PASSED | no |
| DEMO-02 failing test | CONTRADICTED | PASSED | yes |
| DEMO-03 no test | PARTIAL (critic reviewed) | PASSED | yes |
| DEMO-04 stale source | INSUFFICIENT_EVIDENCE | DOWNGRADED | yes |
| DEMO-05 unconfirmed link | INSUFFICIENT_EVIDENCE | DOWNGRADED | yes |

## What the hosted run produced

- **DEMO-02:** PARTIAL (critic lowered it from CONTRADICTED). Gate passed, finding raised.
- **DEMO-03:** INSUFFICIENT_EVIDENCE, rejected with MALFORMED_OUTPUT. Finding raised.
- **DEMO-05:** SUPPORTED, gate passed. Cause: the stored link had been confirmed by a
  user, so the gate treated it as decisive. Link reset to `model_candidate` (0.7).
  The stored verdict predates the reset. A rerun was started; check its result.

## Open questions

- Is the DEMO-02 PARTIAL a real model judgement, or a prompt/critic issue?
- Why does DEMO-03 produce malformed output on the hosted run but PARTIAL offline?
  The real model is not deterministic, so rerun a few times to measure stability.
- Decide whether the demo should show the model's own results or only cases that pass.

## Related fixes already made

- Seed now updates existing edges to match the bundle (previously stale edges stayed).
- Verdict span line numbers accept `null`; the model's invented span IDs are still
  possible and rely on the gate to catch them.
