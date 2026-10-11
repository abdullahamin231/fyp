"""External-reviewer agreement for the UNIFY pilot.

The review site (mishalfatima09.github.io/unify-review) gives each reviewer one
of five fixed batches of three cases, so every case is labelled by a different
pair of people. Cohen's kappa needs the same two raters on every item, so this
script uses Krippendorff's alpha (nominal), which allows any number of raters
per item and different raters on different items.

It reports, separately from the internal Cohen's kappa in agreement.py:
  1. alpha among the external reviewers, per field, with a bootstrap 95% CI
     over cases;
  2. how often each external label matches the adjudicated reference
     (the two internal annotators' agreed labels, or the adjudicated label
     where they disagreed: 05_raw_annotations/ + 06_adjudication_log.csv);
  3. a reference x external confusion matrix for the verdict;
  4. evidence-span overlap with the reference, over rows that marked spans;
  5. the reviewer panel (by reviewer id only: no names are printed).

The constructor's answer key (_constructor_only/) is not read.

Usage:
  python agreement_multi.py <dataset_dir> <external_csv> [<external_csv> ...]
"""
import csv
import random
import statistics
import sys
from collections import Counter, defaultdict
from pathlib import Path

FIELDS = ["verdict", "freshness_state"]
VERDICTS = ["SUPPORTED", "CONTRADICTED", "PARTIAL", "INSUFFICIENT_EVIDENCE"]


def spans(text):
    return {s.strip() for s in text.replace(",", ";").split(";") if s.strip()}


def load_reference(dataset_dir):
    """Agreed internal labels, overridden by the adjudication log."""
    d = Path(dataset_dir)
    a = {r["case_id"]: r for r in csv.DictReader(open(d / "05_raw_annotations/annotator_A_abdullah.csv", encoding="utf-8"))}
    b = {r["case_id"]: r for r in csv.DictReader(open(d / "05_raw_annotations/annotator_B_haaniah.csv", encoding="utf-8"))}
    adj = {r["case_id"]: r for r in csv.DictReader(open(d / "06_adjudication_log.csv", encoding="utf-8"))}
    ref = {}
    for cid in sorted(a):
        if cid in adj:
            r = adj[cid]
            ref[cid] = {
                "verdict": r["adjudicated_verdict"].strip().upper(),
                "freshness_state": r["adjudicated_freshness"].strip().upper(),
                "spans": spans(r["adjudicated_relevant_spans"]),
            }
        else:
            # Not in the log means A and B agreed on every field.
            for f in FIELDS + ["relevant_span_ids"]:
                assert a[cid][f].strip().upper() == b[cid][f].strip().upper(), f"{cid} {f}: not adjudicated but A != B"
            ref[cid] = {
                "verdict": a[cid]["verdict"].strip().upper(),
                "freshness_state": a[cid]["freshness_state"].strip().upper(),
                "spans": spans(a[cid]["relevant_span_ids"]),
            }
    return ref, a, b


def load_external(paths):
    rows = []
    for p in paths:
        for r in csv.DictReader(open(p, encoding="utf-8")):
            if r.get("verdict", "").strip():
                rows.append(r)
    return rows


def krippendorff_alpha(units):
    """Nominal alpha. `units` maps item -> list of values (one per rater)."""
    o = defaultdict(float)  # coincidence matrix o[(c, k)]
    for values in units.values():
        m = len(values)
        if m < 2:
            continue
        for i, c in enumerate(values):
            for j, k in enumerate(values):
                if i != j:
                    o[(c, k)] += 1 / (m - 1)
    n_c = Counter()
    for (c, _k), v in o.items():
        n_c[c] += v
    n = sum(n_c.values())
    if n <= 1:
        return float("nan")
    observed = sum(v for (c, k), v in o.items() if c != k)
    expected = sum(n_c[c] * n_c[k] for c in n_c for k in n_c if c != k) / (n - 1)
    return 1.0 if expected == 0 else 1 - observed / expected


def bootstrap_ci(units, reps=5000, seed=7):
    keys = list(units)
    rng = random.Random(seed)
    vals = []
    for _ in range(reps):
        sample = {f"{i}:{k}": units[k] for i, k in enumerate(rng.choice(keys) for _ in keys)}
        a = krippendorff_alpha(sample)
        if a == a:  # skip NaN
            vals.append(a)
    vals.sort()
    return vals[int(0.025 * len(vals))], vals[int(0.975 * len(vals)) - 1]


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    ref, a, b = load_reference(sys.argv[1])
    ext = load_external(sys.argv[2:])
    by_case = defaultdict(list)
    for r in ext:
        by_case[r["case_id"]].append(r)

    reviewers = {}
    for r in ext:
        reviewers.setdefault(r["reviewer_id"], r)
    print(f"External reviewers: {len(reviewers)}; labelled rows: {len(ext)}; cases covered: {len(by_case)}/{len(ref)}")
    print(f"Labels per case: {dict(sorted(Counter(len(v) for v in by_case.values()).items()))}")
    versions = Counter(r["manual_version"] for r in ext)
    print(f"Manual/site version: {dict(versions)}\n")

    # 1. alpha among external reviewers, next to the internal pair for comparison
    print("| Field | External alpha | 95% CI (bootstrap over cases) | Internal alpha (A,B) |")
    print("|---|---|---|---|")
    for f in FIELDS:
        units = {c: [r[f].strip().upper() for r in rs] for c, rs in by_case.items()}
        internal = {c: [a[c][f].strip().upper(), b[c][f].strip().upper()] for c in ref}
        lo, hi = bootstrap_ci(units)
        print(f"| {f} | {krippendorff_alpha(units):.2f} | [{lo:.2f}, {hi:.2f}] | {krippendorff_alpha(internal):.2f} |")
    pair_same = sum(len({r['verdict'] for r in rs}) == 1 for rs in by_case.values())
    print(f"\nCases where both external reviewers chose the same verdict: {pair_same}/{len(by_case)}")

    # 2. match with the adjudicated reference
    print("\n| Field | External rows matching the reference |\n|---|---|")
    for f in FIELDS:
        hits = sum(r[f].strip().upper() == ref[r["case_id"]][f] for r in ext)
        print(f"| {f} | {hits}/{len(ext)} ({hits/len(ext):.2f}) |")
    both = sum(all(r["verdict"].strip().upper() == ref[c]["verdict"] for r in rs) for c, rs in by_case.items())
    none = sum(all(r["verdict"].strip().upper() != ref[c]["verdict"] for r in rs) for c, rs in by_case.items())
    print(f"\nVerdict: both externals match the reference on {both}/{len(by_case)} cases; neither matches on {none}/{len(by_case)}")

    # 3. confusion matrix
    print("\nVerdict confusion (rows = reference, columns = external label)\n")
    short = {"SUPPORTED": "SUP", "CONTRADICTED": "CON", "PARTIAL": "PAR", "INSUFFICIENT_EVIDENCE": "INS"}
    print("| ref \\ ext | " + " | ".join(short[v] for v in VERDICTS) + " |")
    print("|---|" + "---|" * len(VERDICTS))
    conf = Counter((ref[r["case_id"]]["verdict"], r["verdict"].strip().upper()) for r in ext)
    for rv in VERDICTS:
        print(f"| {short[rv]} | " + " | ".join(str(conf[(rv, ev)]) for ev in VERDICTS) + " |")

    # 4. spans
    marked = [r for r in ext if spans(r["relevant_span_ids"])]
    ious = [len(spans(r["relevant_span_ids"]) & ref[r["case_id"]]["spans"]) /
            len(spans(r["relevant_span_ids"]) | ref[r["case_id"]]["spans"]) for r in marked]
    print(f"\nEvidence spans: {len(marked)}/{len(ext)} rows marked at least one span (optional on the site)")
    if ious:
        print(f"Over those rows: mean IoU with the reference = {statistics.mean(ious):.2f}; exact match = {sum(i == 1 for i in ious)}/{len(ious)}")

    # 5. panel
    years = [int(r["years_experience"]) for r in reviewers.values() if r["years_experience"].strip()]
    mins = defaultdict(int)
    for r in ext:
        mins[r["reviewer_id"]] += int(r["minutes_spent"] or 0)
    print(f"\nPanel: {len(reviewers)} external reviewers; experience reported by {len(years)}: "
          f"median {statistics.median(years)} years (range {min(years)}-{max(years)})")
    print(f"Time on the case screens per reviewer (3 cases): median {statistics.median(mins.values())} min "
          f"(range {min(mins.values())}-{max(mins.values())})")
    no_just = sum(1 for r in ext if not r["justification"].strip())
    print(f"Rows without a written justification: {no_just}/{len(ext)}")

    print("\n## Per case (reference vs external labels)\n\n| Case | Reference | External |\n|---|---|---|")
    for c in sorted(by_case):
        labs = "; ".join(f"{r['reviewer_id']}: {r['verdict']}/{r['freshness_state']}" for r in by_case[c])
        mark = "" if all(r["verdict"].strip().upper() == ref[c]["verdict"] for r in by_case[c]) else " *"
        print(f"| {c}{mark} | {ref[c]['verdict']}/{ref[c]['freshness_state']} | {labs} |")
    print("\n* = at least one external verdict differs from the reference")


if __name__ == "__main__":
    main()
