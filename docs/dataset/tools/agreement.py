"""Inter-annotator agreement for the UNIFY pilot (Action Plan §8).

Reports raw agreement and Cohen's kappa for verdict, freshness_state and
review_required, and evidence-span agreement (mean Jaccard / IoU over the
candidate spans each annotator marked relevant). Lists every disagreement.

Usage: python agreement.py <annotator_A.csv> <annotator_B.csv>
"""
import csv, sys
from collections import Counter


def load(p):
    return {r["case_id"]: r for r in csv.DictReader(open(p)) if r.get("verdict", "").strip()}


def kappa(a, b):
    n = len(a)
    po = sum(x == y for x, y in zip(a, b)) / n
    ca, cb = Counter(a), Counter(b)
    pe = sum(ca[k] * cb[k] for k in set(ca) | set(cb)) / (n * n)
    return po, (po - pe) / (1 - pe) if pe < 1 else 1.0


A, B = load(sys.argv[1]), load(sys.argv[2])
ids = sorted(set(A) & set(B))
if not ids:
    sys.exit("No case labelled by both annotators yet.")
print(f"Cases labelled by both annotators: {len(ids)}\n")
print("| Field | Raw agreement | Cohen's kappa |\n|---|---|---|")
for f in ["verdict", "freshness_state", "review_required"]:
    a = [A[i][f].strip().upper() for i in ids]; b = [B[i][f].strip().upper() for i in ids]
    po, k = kappa(a, b)
    print(f"| {f} | {po:.2f} | {k:.2f} |")
jac = []
for i in ids:
    sa = {s for s in A[i]["relevant_span_ids"].replace(",", ";").split(";") if s.strip()}
    sb = {s for s in B[i]["relevant_span_ids"].replace(",", ";").split(";") if s.strip()}
    jac.append(1.0 if not sa and not sb else len(sa & sb) / len(sa | sb))
print(f"\nEvidence spans: mean Jaccard (IoU) = {sum(jac)/len(jac):.2f}; exact match = {sum(j == 1 for j in jac)}/{len(jac)}")
print("\nGate: verdict kappa >= 0.70 (Action Plan §8). Below the gate: analyse disagreements, revise the manual, re-pilot.")
print("\n## Disagreements (send to adjudication)\n\n| Case | Field | A | B |\n|---|---|---|---|")
for i in ids:
    for f in ["verdict", "freshness_state", "review_required", "relevant_span_ids"]:
        if A[i][f].strip().upper() != B[i][f].strip().upper():
            print(f"| {i} | {f} | {A[i][f]} | {B[i][f]} |")
