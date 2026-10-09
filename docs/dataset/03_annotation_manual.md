# UNIFY Annotation Manual — v1

**Status:** v1, frozen 9 Oct 2026. The pilot (15 cases, 2 blind annotators) reached verdict κ = 0.90 (raw agreement 0.93), above the 0.70 gate (Action Plan §8). Rules R1 and R2 in §7 were added from the pilot adjudication.

## 1. What you are deciding

Each case gives you **one atomic criterion** and **one change under review** (a pull request at a pinned head commit). You answer one question:

> *Does the evidence in this case show that the change, as it exists at the evaluated head, satisfies this criterion?*

Judge the **code and test evidence**. Don't judge the PR title or the merge status. A merged PR is evidence that someone accepted it. It is not proof that it is correct.

## 2. How to work

1. Work **alone**. Don't discuss any case with anyone until **both** annotation files have been submitted.
2. Open the case packet (`04_cases/Pxx.json`). Read the criterion and `source_quote`. If there is an `issue_url`, you may open it.
3. Check out the evaluated head in the repository: `git checkout <head_sha>`. If `head_patch` is set, also run `git apply 04_cases/<head_patch>`. Some heads carry a patch. **Do not infer the label from that.**
4. Read the changed hunks and each candidate span. Look at the test runs and the log.
5. Fill in **your own** annotation sheet: one row per case, every column.

Budget about 10 minutes per case. If a case takes much longer, label it with your best judgement and say why in the justification.

## 3. The four verdicts (choose exactly one)

| Verdict | Use it when | It is **not** this when |
|---|---|---|
| **SUPPORTED** | Code at the evaluated head implements **every part** of the criterion, **and** there is evidence it works: a test that exercises it and passes, or code so direct that no reasonable reviewer would doubt it. | Something is merely plausible. "Probably works" with no test of timing or runtime behaviour → INSUFFICIENT_EVIDENCE. |
| **CONTRADICTED** | The evidence shows the criterion is **not** met. A relevant test fails, or the code visibly does the opposite of what the criterion requires. | The evidence is only missing. Absence of evidence is not contradiction → INSUFFICIENT_EVIDENCE. |
| **PARTIAL** | The criterion has separable parts, at least one is **supported** and at least one is **not**, and you can say which is which. | You can't tell which parts hold → INSUFFICIENT_EVIDENCE. |
| **INSUFFICIENT_EVIDENCE** | You can't decide from what is provided: no test for runtime behaviour, the source is stale, the change doesn't touch the criterion's code, or the criterion is too vague to check. This is the **abstention** label. | You can decide. Don't abstain just to be safe. |

### PARTIAL vs INSUFFICIENT_EVIDENCE: the rule

Choose **PARTIAL** only if you can name the supported part **and** the unsupported part, each with evidence (a span, a passing or failing test). If you can only say "something is missing", choose **INSUFFICIENT_EVIDENCE**.

### Mixed test evidence

If one test for a part passes and another test for the **same** part fails, the failing test wins for that part. A passing test that doesn't actually exercise the failing condition doesn't rescue it. Say which tests you relied on in your justification.

## 4. The other fields

| Field | Values | How to decide |
|---|---|---|
| `freshness_state` | CURRENT · STALE · UNKNOWN | **STALE** if the events show a source changed after the evidence and could not be re-read. **UNKNOWN** if you can't tell. Otherwise **CURRENT**. |
| `review_required` | true · false | **true** whenever the verdict is PARTIAL or INSUFFICIENT_EVIDENCE, or you'd want a human to check before trusting the verdict. |
| `reason_code` | SOURCE_STALE · MISSING_TEST · AMBIGUOUS_LINK · AMBIGUOUS_CRITERION · INVALID_CITATION · DYNAMIC_BEHAVIOUR · TRUNCATED_EVIDENCE · OTHER | **Required** when the verdict is INSUFFICIENT_EVIDENCE; optional otherwise. Pick the main reason. |
| `relevant_span_ids` | e.g. `P03-S1;P03-S2` | List every candidate span that is **actually relevant** to the criterion at this head. Some spans are deliberately plausible but irrelevant. Leave those out. Leave the field empty if none is relevant. |
| `justification` | free text | One to three sentences naming the exact evidence: span IDs, test names, event numbers. A label without a justification will be returned. |

## 5. Worked examples (generic; not from the pilot set)

**A. SUPPORTED.** *Criterion:* "Pressing Escape closes the modal." The change adds `if (e.key === 'Escape') close()` to the modal's key handler, and adds a test that fires Escape and asserts the modal is gone. The test passes. → SUPPORTED, CURRENT, review false. Relevant: the key-handler span. Not relevant: a similar handler in the Drawer component.

**B. CONTRADICTED.** *Criterion:* "Quantity can't go below 1." The PR title says it fixes this. The added test types 0 and expects 1, and **fails**: the clamp still uses `Math.max(value, 0)`. → CONTRADICTED. The PR's claim doesn't count against the failing test.

**C. PARTIAL.** *Criterion:* "Start date and end date are both validated against the allowed range." The start-date check is added and its test passes. The end-date path is unchanged and its unit test fails. → PARTIAL, review true. Justification names both parts.

**D. INSUFFICIENT_EVIDENCE, MISSING_TEST.** *Criterion:* "The spinner fades out over 300 ms." The change edits an animation constant and nothing tests it. → INSUFFICIENT_EVIDENCE, reason MISSING_TEST (or DYNAMIC_BEHAVIOUR), review true.

**E. INSUFFICIENT_EVIDENCE, SOURCE_STALE.** The code and tests look fine, but the events show the ticket was edited **after** the merge and the new text could not be fetched. → INSUFFICIENT_EVIDENCE, freshness STALE, reason SOURCE_STALE, review true. You can't confirm the change meets a criterion whose current wording is unknown.

**F. INSUFFICIENT_EVIDENCE, AMBIGUOUS_LINK.** The criterion is about component X, but the change under review only edits a neighbouring component Y with similar names. → INSUFFICIENT_EVIDENCE, reason AMBIGUOUS_LINK. If you believe this should be CONTRADICTED instead, label it that way and explain why. The pilot is meant to surface exactly this kind of disagreement.

## 6. After both files are in

Disagreements go to the adjudicator, who records the final label, the evidence used, and any rule added to this manual (`06_adjudication_log.csv`). **Original labels are never edited.**

## 7. Rules added after the pilot adjudication (v1)

**R1. Runtime behaviour needs a test.** Claims about React re-renders, timers, animation or other runtime timing need a test that exercises them. Reasoning from the code alone, however convincing, is not enough for SUPPORTED: label it INSUFFICIENT_EVIDENCE with MISSING_TEST and set review_required to true. *(From P10: annotators split SUPPORTED vs INSUFFICIENT_EVIDENCE.)*

**R2. On-path spans count as relevant.** A candidate span is relevant if it is on the code path that produces the behaviour the criterion describes, even if the change under review didn't modify it. A span that only shares vocabulary or sits in the same module, but is not on that path, is not relevant. *(From P03 and P05: annotators split on whether the unchanged subscription path counted.)*
