#!/usr/bin/env python3
r"""Regenerate UNIFY's traceability matrix renderings from the canonical CSV.

Sources of truth
----------------
docs/traceability/traceability_matrix.csv
    Canonical, machine-readable matrix. Hand-maintained (one row per
    requirement: FR-01..FR-29 and NFR-01..NFR-14 from chapter 4).

Outputs
-------
docs/traceability/traceability_matrix.md     readable rendering, grouped by requirement type
docs/traceability/chapter4_table.tex         LaTeX longtable fragment (FR + NFR rows), suitable
                                             for \input from chapter 4

Usage
-----
    python3 docs/traceability/build_matrix.py

Run this at every gate (proposal §18.1 delivery gates, and the evaluation tag
freeze in TODO §7) and commit the CSV together with both generated files.
The script fails loudly if a requirement is dropped, duplicated, renumbered
outside the chapter-4 range, or given an invalid status/test/step value.
"""

from __future__ import annotations

import csv
import hashlib
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
CSV_PATH = HERE / "traceability_matrix.csv"
MD_PATH = HERE / "traceability_matrix.md"
TEX_PATH = HERE / "chapter4_table.tex"

COLUMNS = [
    "requirement_id",
    "requirement_title",
    "source_proposal_ref",
    "requirement_type",
    "design_element",
    "design_figure",
    "module",
    "code_artifact",
    "test_case",
    "demo_step",
    "status",
    "evidence_link",
    "owner",
    "notes",
]

# The requirement IDs are owned by chapter 4; nothing else may appear here.
EXPECTED_IDS = (
    [f"FR-{i:02d}" for i in range(1, 30)]      # FR-01..FR-29
    + [f"NFR-{i:02d}" for i in range(1, 15)]   # NFR-01..NFR-14
)
EXPECTED_ROWS = len(EXPECTED_IDS)              # 43

STATUSES = {"designed", "implemented", "partially_implemented", "not_started"}
TEST_IDS = {f"T{i}" for i in range(1, 12)}     # TODO §3.4, T1..T11
# Provisional tokens (see README.md): derived from the demo protocol's phases
# until TODO §7's demo script numbers its own steps.
DEMO_STEPS = {"--", "demo-normal", "demo-edge", "demo-failure", "demo-evidence", "demo-boundaries"}
TYPE_LABEL = {"functional": "Functional requirements (FR)", "non_functional": "Non-functional requirements (NFR)"}

# Worksheet §5 "Requirement traceability" columns -> matrix columns.
WORKSHEET_VIEW = [
    ("Requirement (ID)", ["requirement_id"]),
    ("Design element (diagram/component)", ["design_element", "design_figure"]),
    ("Implementation (path/function/module)", ["module", "code_artifact"]),
    ("Test or validation (test/result)", ["test_case", "status"]),
    ("Demo step", ["demo_step"]),
    ("Owner", ["owner"]),
]


def fail(message: str) -> "None":
    print(f"build_matrix.py: ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def load_rows() -> list[dict[str, str]]:
    if not CSV_PATH.is_file():
        fail(f"missing canonical CSV: {CSV_PATH}")
    with CSV_PATH.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames != COLUMNS:
            fail(
                "column mismatch.\n"
                f"  expected: {COLUMNS}\n"
                f"  found:    {reader.fieldnames}"
            )
        rows = list(reader)

    # --- structural assertions (fail loudly if a requirement is ever dropped) ---
    if len(rows) != EXPECTED_ROWS:
        fail(f"expected exactly {EXPECTED_ROWS} data rows, found {len(rows)}")

    seen: dict[str, int] = {}
    for index, row in enumerate(rows, start=2):  # line 1 is the header
        rid = row["requirement_id"]
        if rid in seen:
            fail(f"duplicate requirement_id {rid!r} (CSV lines {seen[rid]} and {index})")
        seen[rid] = index
        if not all(row[col].strip() for col in COLUMNS):
            empty = [col for col in COLUMNS if not row[col].strip()]
            fail(f"{rid}: empty cell(s): {', '.join(empty)} (use '--' for a known gap)")
        if row["status"] not in STATUSES:
            fail(f"{rid}: invalid status {row['status']!r} (allowed: {sorted(STATUSES)})")
        if row["requirement_type"] not in TYPE_LABEL:
            fail(f"{rid}: invalid requirement_type {row['requirement_type']!r}")
        for token in [t.strip() for t in row["test_case"].split(",")]:
            if token != "--" and token not in TEST_IDS:
                fail(f"{rid}: test_case token {token!r} is not one of T1..T11 (or '--')")
        if row["demo_step"] not in DEMO_STEPS:
            fail(f"{rid}: invalid demo_step {row['demo_step']!r} (allowed: {sorted(DEMO_STEPS)})")

    missing = [rid for rid in EXPECTED_IDS if rid not in seen]
    extra = [rid for rid in seen if rid not in EXPECTED_IDS]
    if missing:
        fail(f"missing requirement(s): {', '.join(missing)}")
    if extra:
        fail(f"unexpected requirement id(s): {', '.join(extra)}")

    # Requirement-type sanity: FR-xx must be functional, NFR-xx non-functional.
    for row in rows:
        want = "non_functional" if row["requirement_id"].startswith("NFR") else "functional"
        if row["requirement_type"] != want:
            fail(f"{row['requirement_id']}: requirement_type must be {want!r}")

    return rows


def cell(value: str) -> str:
    """Render a cell for markdown (newlines and pipes would break the table)."""
    return value.replace("|", "\\|").replace("\n", " ").strip()


def md_table(rows: list[dict[str, str]], columns: list[tuple[str, list[str]]]) -> list[str]:
    out = ["| " + " | ".join(header for header, _ in columns) + " |",
           "|" + "|".join(["---"] * len(columns)) + "|"]
    for row in rows:
        cells = []
        for _header, keys in columns:
            if len(keys) == 1:
                cells.append(cell(row[keys[0]]))
            else:
                parts = [row[k] for k in keys if row[k] != "--"]
                cells.append(cell(" · ".join(parts) if parts else "--"))
        out.append("| " + " | ".join(cells) + " |")
    return out


def markdown(rows: list[dict[str, str]], digest: str) -> str:
    fr = [r for r in rows if r["requirement_type"] == "functional"]
    nfr = [r for r in rows if r["requirement_type"] == "non_functional"]

    counts: dict[str, int] = {}
    for row in rows:
        counts[row["status"]] = counts.get(row["status"], 0) + 1

    dash_counts = {
        col: sum(1 for r in rows if r[col] == "--")
        for col in ("design_figure", "module", "code_artifact", "test_case", "demo_step", "evidence_link")
    }

    body: list[str] = []
    body += [
        "# UNIFY traceability matrix",
        "",
        "> **Generated file — do not edit by hand.**",
        "> Source: [`traceability_matrix.csv`](traceability_matrix.csv)  ",
        "> Generator: `python3 docs/traceability/build_matrix.py`  ",
        f"> CSV SHA-256 (first 12): `{digest[:12]}` · rows: **{len(rows)}** "
        f"({len(fr)} FR + {len(nfr)} NFR)",
        "",
        "Regenerate and commit at every gate (proposal §18.1 delivery gates and the",
        "evaluation tag freeze, TODO §7). See [`README.md`](README.md) for column",
        "definitions, the worksheet §5 mapping and the discrepancy register.",
        "",
        "## Coverage",
        "",
        f"- Requirements: **{len(rows)}** = 29 functional (FR-01..FR-29) + "
        f"14 non-functional (NFR-01..NFR-14); no gaps, no duplicates "
        f"(asserted by `build_matrix.py`).",
        "- Status: " + ", ".join(f"`{k}` {counts.get(k, 0)}" for k in sorted(counts)),
        "- Empty cells (`--`): "
        + ", ".join(f"{col} {n}" for col, n in dash_counts.items()),
        "",
        "## Functional requirements (FR-01..FR-29)",
        "",
    ]
    main_cols = [
        ("ID", ["requirement_id"]),
        ("Requirement", ["requirement_title"]),
        ("Design element", ["design_element"]),
        ("Figure", ["design_figure"]),
        ("Module", ["module"]),
        ("Code artefact", ["code_artifact"]),
        ("Test", ["test_case"]),
        ("Demo", ["demo_step"]),
        ("Status", ["status"]),
        ("Evidence", ["evidence_link"]),
        ("Owner", ["owner"]),
    ]
    body += md_table(fr, main_cols)
    body += ["", "## Non-functional requirements (NFR-01..NFR-14)", ""]
    body += md_table(nfr, main_cols)
    body += ["", "## Proposal reference", ""]
    body += md_table(rows, [
        ("ID", ["requirement_id"]),
        ("Proposal source", ["source_proposal_ref"]),
        ("Type", ["requirement_type"]),
    ])

    body += ["", "## Worksheet §5 view", "",
             "The six columns of `FYP1 Mid Pre-Evaluation Student Worksheet.docx` §5",
             "(\"Requirement traceability\"), rendered from the same rows:", ""]
    body += md_table(rows, WORKSHEET_VIEW)

    body += ["", "## Notes and gaps", ""]
    for row in rows:
        body.append(f"- **{row['requirement_id']}** — {row['notes']}")

    body += ["", "---", "",
             "Owners: Abdullah Amin maintains this file; Haaniah Ismail and Mishal Fatima",
             "feed their rows. Every `implemented`/`partially_implemented` claim must be",
             "backed by a command that was actually run against the repository at the",
             "gate (see README.md).", ""]
    return "\n".join(body)


def tex_escape(text: str) -> str:
    """Escape LaTeX specials in a plain-text cell, keeping `code` spans as \\texttt.

    Break points are inserted after '/' and '\\_' so that long paths and module
    paths can wrap inside a p{} column instead of overflowing it.
    """
    import re

    spans = re.findall(r"`([^`]+)`", text)
    placeholders = {}
    for i, span in enumerate(spans):
        key = f"@@SPAN{i}@@"
        placeholders[key] = span
        text = text.replace(f"`{span}`", key, 1)

    text = text.replace("\\", r"\textbackslash{}")
    for special, replacement in (
        ("&", r"\&"), ("%", r"\%"), ("#", r"\#"), ("_", r"\_"),
        ("{", r"\{"), ("}", r"\}"), ("$", r"\$"), ("^", r"\textasciicircum{}"),
        ("~", r"\textasciitilde{}"),
    ):
        text = text.replace(special, replacement)
    text = text.replace("–", "--").replace("—", "--").replace("→", r"$\rightarrow$")
    text = text.replace("/", "/\\allowbreak{}").replace(r"\_", r"\_\allowbreak{}")
    text = text.replace(":", ":\\allowbreak{}")
    text = re.sub(r"\.(?=[A-Za-z])", lambda _m: ".\\allowbreak{}", text)

    for key, span in placeholders.items():
        inner = span.replace("&", r"\&").replace("%", r"\%").replace("#", r"\#")
        inner = inner.replace("_", r"\_").replace("{", r"\{").replace("}", r"\}")
        inner = inner.replace("$", r"\$").replace("\\", r"\textbackslash{}")
        inner = inner.replace("/", "/\\allowbreak{}").replace(r"\_", r"\_\allowbreak{}")
        text = text.replace(key, f"\\texttt{{{inner}}}")
    return text


def tex_status(status: str) -> str:
    """Break the compound status words so they fit a p{} column.

    Uses \\newline, not \\\\: the columns are prefixed with
    >{\\raggedright\\arraybackslash}, which restores \\\\ to the array row
    terminator (a \\\\ inside a cell would end the whole table row).
    """
    if "_" not in status:
        return status
    head, tail = status.split("_", 1)
    return f"{head}\\newline {tail}"


def latex(rows: list[dict[str, str]], digest: str) -> str:
    """Longtable fragment with the same FR + NFR rows as the CSV."""
    fr = [r for r in rows if r["requirement_type"] == "functional"]
    nfr = [r for r in rows if r["requirement_type"] == "non_functional"]

    # p{} widths are fractions of \linewidth. The body starts with \small and a
    # reduced \tabcolsep (both scoped to the fragment by \begingroup/\endgroup)
    # so that the fixed 2 x 3pt of tabcolsep per column boundary (42pt for 7
    # columns) leaves the p{} widths room for their longest unbreakable tokens.
    col = lambda w: f">{{\\raggedright\\arraybackslash\\hspace{{0pt}}}}p{{{w}\\linewidth}}"
    spec = " ".join(col(w) for w in (0.07, 0.16, 0.17, 0.115, 0.06, 0.17, 0.085))
    header = ("\\textbf{ID} & \\textbf{Requirement} & \\textbf{Design element} & "
              "\\textbf{Module} & \\textbf{Test} & \\textbf{Status} & "
              "\\textbf{Demo} \\\\")
    line = [header, "\\hline"]

    def emit(row: dict[str, str]) -> None:
        figure = row["design_figure"]
        design = row["design_element"]
        design_cell = design if figure == "--" else f"{design} [{figure}]"
        values = [
            row["requirement_id"],
            row["requirement_title"],
            design_cell,
            row["module"],
            row["test_case"],
            row["status"],
            row["demo_step"],
        ]
        cells = [tex_escape(v) for v in values]
        cells[5] = tex_status(row["status"])
        line.append(" & ".join(cells) + " \\\\")

    for row in fr:
        emit(row)
    line.append("\\hline")
    line.append("\\multicolumn{7}{l}{\\textbf{Non-functional requirements (NFR-01--NFR-14)}} \\\\")
    line.append("\\hline")
    for row in nfr:
        emit(row)
    line.append("\\hline")

    body = "\n".join(line)
    return f"""% =============================================================================
% UNIFY traceability matrix -- GENERATED FILE, DO NOT EDIT BY HAND.
% Source:  docs/traceability/traceability_matrix.csv (sha256 {digest[:12]})
% Generate: python3 docs/traceability/build_matrix.py
% Rows: {len(rows)} (FR-01..FR-29 and NFR-01..NFR-14), identical to the CSV and to
%        docs/traceability/traceability_matrix.md.
% Needs in the preamble: \\usepackage{{longtable}} \\usepackage{{array}}
% (array is required for the >{{\\raggedright\\arraybackslash\\hspace{{0pt}}}}
% column prefixes that keep long paths wrapping inside their column).
% Columns: ID, Requirement, Design element [+figure], Module, Test, Status, Demo.
% Owner and proposal reference live in the CSV and the markdown rendering.
% Row text is \\small with \\tabcolsep=3pt, scoped to the fragment by \\begingroup.
% To use it in place of the existing Table~\\ref{{tab:traceability}} in
% chapters/chapter4_requirements.tex, replace that longtable with one line
% (pdflatex runs from the report directory, so the path is relative to it):
%     \\input{{../../traceability/chapter4_table}}
% or copy this file next to main.tex and \\input{{chapter4_table}}.
% (the fragment's label is tab:traceability-full; rename it if it replaces the
% labelled table). Not yet wired in -- the chapter owner reviews first.
% =============================================================================
\\begingroup
\\small
\\setlength{{\\tabcolsep}}{{3pt}}
\\begin{{longtable}}{{{spec}}}
\\caption{{Requirements traceability matrix (FR and NFR) generated from the
repository matrix.}}\\label{{tab:traceability-full}}\\\\
\\hline
{body}
\\end{{longtable}}
\\endgroup
"""


def main() -> None:
    rows = load_rows()
    digest = hashlib.sha256(CSV_PATH.read_bytes()).hexdigest()

    MD_PATH.write_text(markdown(rows, digest), encoding="utf-8")
    TEX_PATH.write_text(latex(rows, digest), encoding="utf-8")

    fr = sum(1 for r in rows if r["requirement_type"] == "functional")
    nfr = len(rows) - fr
    statuses: dict[str, int] = {}
    for row in rows:
        statuses[row["status"]] = statuses.get(row["status"], 0) + 1
    print(f"OK: {len(rows)} rows ({fr} FR + {nfr} NFR), no duplicate requirement_id")
    print("    status: " + ", ".join(f"{k}={v}" for k, v in sorted(statuses.items())))
    print(f"    wrote {MD_PATH.relative_to(HERE.parent.parent)}")
    print(f"    wrote {TEX_PATH.relative_to(HERE.parent.parent)}")


if __name__ == "__main__":
    main()
