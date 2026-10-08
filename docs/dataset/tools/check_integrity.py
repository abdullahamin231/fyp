"""Automated integrity check for UNIFY case packets (Action Plan §9).

Checks, per case: schema-required fields present; base/head SHAs resolve in
the cloned repository; head patch applies and matches its recorded SHA-256;
every candidate span's file exists at the evaluated head, its line range is in
bounds, and its content hash still matches; test logs referenced exist;
no obvious secrets; no label or origin fields leaked into annotator packets.

Usage: python check_integrity.py <dataset_dir> <repos_dir> > 08_integrity_report.md
"""
import glob, hashlib, json, os, re, shutil, subprocess, sys, tempfile

DS, REPOS = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
DIRS = {"RHF": "react-hook-form", "EXC": "excalidraw", "MAN": "mantine"}
REQ = ["case_id", "dataset_version", "repository", "versions", "change_under_review", "intent",
       "design_evidence", "code_evidence", "test_evidence", "candidate_spans", "events"]
LEAK = re.compile(r"intended|CONTROLLED|MUTATION|mutation|\"origin\"|constructor", re.I)
SECRET = re.compile(r"(ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY|xox[baprs]-[A-Za-z0-9-]+)")


def git(repo, *a):
    return subprocess.run(["git", "-C", repo, *a], capture_output=True, text=True)


rows, fails = [], 0
for p in sorted(glob.glob(os.path.join(DS, "04_cases", "P*.json"))):
    raw = open(p).read()
    c = json.loads(raw)
    cid, repo = c["case_id"], os.path.join(REPOS, DIRS[c["repository"]["repo_id"]])
    checks = []
    checks.append(("required fields", all(k in c for k in REQ), ""))
    v = c["versions"]
    checks.append(("base SHA resolves", git(repo, "cat-file", "-e", v["base_sha"] + "^{commit}").returncode == 0, v["base_sha"][:10]))
    checks.append(("head SHA resolves", git(repo, "cat-file", "-e", v["head_sha"] + "^{commit}").returncode == 0, v["head_sha"][:10]))
    tmp = tempfile.mkdtemp()
    git(repo, "worktree", "add", "-f", "--detach", tmp, v["head_sha"])
    if v.get("head_patch"):
        pf = os.path.join(DS, "04_cases", v["head_patch"])
        ok_hash = hashlib.sha256(open(pf, "rb").read()).hexdigest() == v["head_patch_sha256"]
        ok_apply = subprocess.run(["git", "-C", tmp, "apply", pf], capture_output=True).returncode == 0
        checks.append(("head patch hash + applies", ok_hash and ok_apply, os.path.basename(pf)))
    for s in c["candidate_spans"]:
        f = os.path.join(tmp, s["file"])
        ok, note = os.path.exists(f), ""
        if ok:
            L = open(f, encoding="utf-8").read().split("\n")
            ok = 1 <= s["start_line"] <= s["end_line"] <= len(L)
            if ok:
                h = hashlib.sha256("\n".join(L[s["start_line"] - 1:s["end_line"]]).encode()).hexdigest()
                ok = h == s["content_sha256"]
                note = "" if ok else "content hash mismatch"
            else:
                note = "line range out of bounds"
        else:
            note = "file missing"
        checks.append((f"span {s['span_id']}", ok, note))
    for t in c["test_evidence"]["test_runs"]:
        if t.get("log"):
            checks.append(("test log present", os.path.exists(os.path.join(DS, "04_cases", t["log"])), t["log"]))
    checks.append(("no label/origin leak", not LEAK.search(raw), ""))
    checks.append(("no secrets", not SECRET.search(raw), ""))
    git(repo, "worktree", "remove", "--force", tmp)
    shutil.rmtree(tmp, ignore_errors=True)
    bad = [x for x in checks if not x[1]]
    fails += len(bad)
    rows.append((cid, len(checks), bad))

print("# Integrity report — UNIFY pilot-0.1\n")
print(f"Cases checked: {len(rows)} · checks run: {sum(r[1] for r in rows)} · failures: {fails}\n")
print("| Case | Checks | Result | Failures |\n|---|---|---|---|")
for cid, n, bad in rows:
    print(f"| {cid} | {n} | {'PASS' if not bad else 'FAIL'} | {'; '.join(f'{b[0]} ({b[2]})' for b in bad)} |")
print("\nChecks per case: required fields; base/head SHA resolve; head patch SHA-256 and clean apply; "
      "each candidate span's file exists at the evaluated head, line range in bounds, content hash unchanged; "
      "referenced test logs exist; no label/origin leak in the annotator packet; secret scan.")
print("\nNot yet checked (pilot): duplicate detection across splits (no splits frozen yet); "
      "checksum manifest of frozen cases (cases are not frozen).")
