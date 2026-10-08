"""Build UNIFY pilot case packets from pinned commits.

For each case spec this script:
  * checks out the pinned head commit into a scratch tree (and applies the
    mutation patch for CONTROLLED_MUTATION cases),
  * computes the changed hunks (base -> head) with exact line ranges,
  * resolves every candidate code span (relevant AND hard-negative) to exact
    line ranges in that tree, so annotators label spans, not guesses,
  * writes an annotator-facing packet (04_cases/<id>.json) with NO intended
    label and NO origin field, and a constructor-only key row.

Usage: python build_cases.py <repos_dir> <work_dir> <dataset_dir>
"""
import csv, hashlib, json, os, re, shutil, subprocess, sys

REPOS, WORK, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
DATASET_VERSION = "pilot-0.1"
RETRIEVED = "2026-10-08"


def sh(*a, cwd=None):
    return subprocess.run(a, cwd=cwd, capture_output=True, text=True, check=True).stdout


def sha256_file(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()


def tree_for(case):
    """Scratch tree for the case's head (+ mutation)."""
    repo = os.path.join(REPOS, case["repo_dir"])
    dst = os.path.join(WORK, "trees", case["id"])
    if os.path.exists(dst):
        subprocess.run(["git", "worktree", "remove", "--force", dst], cwd=repo, capture_output=True)
        shutil.rmtree(dst, ignore_errors=True)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    sh("git", "worktree", "add", "-f", "--detach", dst, case["head"], cwd=repo)
    if case.get("mutation_patch"):
        sh("git", "apply", os.path.join(WORK, case["mutation_patch"]), cwd=dst)
    return dst


def find_span(tree, path, start_regex, occurrence=1):
    """Return (start, end) 1-based lines of the block that begins at the line
    matching start_regex. The block ends at the first later line, at the same
    indentation, that closes it ('}', '};', ')', ');' or '});')."""
    lines = open(os.path.join(tree, path), encoding="utf-8").read().split("\n")
    hits = [i for i, l in enumerate(lines) if re.search(start_regex, l)]
    if len(hits) < occurrence:
        raise SystemExit(f"span not found: {path} /{start_regex}/")
    i = hits[occurrence - 1]
    indent = len(lines[i]) - len(lines[i].lstrip())
    for j in range(i + 1, len(lines)):
        l = lines[j]
        if l.strip() and len(l) - len(l.lstrip()) == indent and re.match(r"^\s*(\}\}|\}|\)|\}\)|\]\)|\}, \[.*\]\))[;,]?\s*$", l):
            return i + 1, j + 1
    raise SystemExit(f"span end not found: {path} line {i+1}")


def changed_hunks(case, tree):
    """Hunks of base -> working tree (head [+ mutation]), new-side line ranges."""
    out = sh("git", "diff", "--unified=0", case["base"], "--", ".", cwd=tree)
    hunks, cur = [], None
    for l in out.split("\n"):
        if l.startswith("+++ "):
            cur = None if l.endswith("/dev/null") else l[6:]
        m = re.match(r"^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@", l)
        if m and cur:
            s, n = int(m.group(3)), int(m.group(4) or 1)
            hunks.append({"file": cur, "start_line": s if n else s, "end_line": s + n - 1 if n else s,
                          "kind": "test" if re.search(r"(\.test\.|__tests__)", cur) else "code",
                          "lines_added": n})
    return hunks


def build(case):
    tree = tree_for(case)
    spans = []
    for k, sp in enumerate(case["candidate_spans"], 1):
        if "lines" in sp:
            s, e = sp["lines"]
        else:
            s, e = find_span(tree, sp["file"], sp["start"], sp.get("occurrence", 1))
        text = "\n".join(open(os.path.join(tree, sp["file"]), encoding="utf-8").read().split("\n")[s - 1:e])
        spans.append({"span_id": f"{case['id']}-S{k}", "file": sp["file"], "symbol": sp["symbol"],
                      "start_line": s, "end_line": e,
                      "content_sha256": hashlib.sha256(text.encode()).hexdigest()})
    repo_url = case["repo_url"]
    packet = {
        "case_id": case["id"],
        "dataset_version": DATASET_VERSION,
        "repository": {"repo_id": case["repo_id"], "url": repo_url, "licence": "MIT"},
        "versions": {
            "base_sha": sh("git", "rev-parse", case["base"], cwd=tree).strip(),
            "head_sha": sh("git", "rev-parse", case["head"], cwd=tree).strip(),
            "head_patch": f"patches/{case['id']}.head.patch" if case.get("mutation_patch") else None,
            "head_patch_sha256": sha256_file(os.path.join(WORK, case["mutation_patch"])) if case.get("mutation_patch") else None,
        },
        "change_under_review": case["change_under_review"],
        "intent": {
            "criterion_id": f"{case['id']}-C1",
            "criterion": case["criterion"],
            "source": case["intent_source"],
            "source_quote": case["intent_quote"],
            "issue_url": case.get("issue_url"),
            "issue_body_retrieved": False,
            "criterion_version": 1,
        },
        "design_evidence": case.get("design_evidence", {"status": "NOT_APPLICABLE",
                                                         "note": "No Figma file or structured design constraint exists for this public repository."}),
        "code_evidence": {"changed_hunks": [h for h in changed_hunks(case, tree) if h["kind"] == "code"]},
        "test_evidence": {"changed_test_hunks": [h for h in changed_hunks(case, tree) if h["kind"] == "test"],
                          "test_runs": case["test_runs"]},
        "candidate_spans": spans,
        "events": case["events"],
    }
    path = os.path.join(OUT, "04_cases", f"{case['id']}.json")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    json.dump(packet, open(path, "w"), indent=2)
    if case.get("mutation_patch"):
        os.makedirs(os.path.join(OUT, "04_cases", "patches"), exist_ok=True)
        shutil.copy(os.path.join(WORK, case["mutation_patch"]), os.path.join(OUT, "04_cases", "patches", f"{case['id']}.head.patch"))
    for t in case["test_runs"]:
        if t.get("log"):
            os.makedirs(os.path.join(OUT, "04_cases", "test_logs"), exist_ok=True)
            shutil.copy(os.path.join(WORK, t["log"]), os.path.join(OUT, "04_cases", "test_logs", f"{case['id']}.log"))
            t["log"] = f"test_logs/{case['id']}.log"
    json.dump(packet, open(path, "w"), indent=2)
    return packet, spans


if __name__ == "__main__":
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "_constructor_only"))
    from cases_spec import CASES  # constructor-only: holds intended labels, never committed
    key_rows = []
    for c in CASES:
        packet, spans = build(c)
        key_rows.append({
            "case_id": c["id"], "repo_id": c["repo_id"], "origin": c["origin"],
            "intended_verdict": c["intended"]["verdict"], "intended_freshness": c["intended"]["freshness_state"],
            "intended_reason_code": c["intended"].get("reason_code", ""),
            "intended_review_required": c["intended"]["review_required"],
            "relevant_spans": ";".join(s["span_id"] for s, sp in zip(spans, c["candidate_spans"]) if sp["role"] == "relevant"),
            "hard_negative_spans": ";".join(s["span_id"] for s, sp in zip(spans, c["candidate_spans"]) if sp["role"] == "hard_negative"),
            "construction_note": c["intended"]["note"],
        })
        print(f"built {c['id']}: {len(spans)} spans")
    kp = os.path.join(OUT, "_constructor_only", "constructor_key.csv")
    os.makedirs(os.path.dirname(kp), exist_ok=True)
    with open(kp, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(key_rows[0].keys()))
        w.writeheader(); w.writerows(key_rows)
