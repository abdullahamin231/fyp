#!/usr/bin/env bash
# Builds each diagram to a standalone PDF (and a PNG preview) in ./rendered
# Usage: ./build.sh            (all)      ./build.sh usecase   (one)
#
# Two kinds of source live in this folder:
#   - fragments (Mishal's, Abdullah's): no \documentclass; wrapped here in a
#     standalone preamble + unify-diagram-styles, rendered at 110 dpi.
#   - self-contained (Haaniah's 05_/06_/11_): already carry \documentclass and
#     \input{unifystyle}; compiled as-is via TEXINPUTS, rendered at 200 dpi to
#     match her committed previews.
set -e
cd "$(dirname "$0")"
mkdir -p rendered .build
figs=("$@"); [ ${#figs[@]} -eq 0 ] && figs=(usecase erd domain-model anchor-reanchoring layered-arch components dfd verifier-loop autonomy-ladder 05_ingestion_sequence 06_state_machines 11_deployment)
for f in "${figs[@]}"; do
  if grep -q '\\documentclass' "$f.tex"; then
    # self-contained source: compile from .build so output lands there,
    # with ../ on TEXINPUTS so \input{unifystyle} resolves.
    (cd .build && TEXINPUTS="../:" pdflatex -interaction=nonstopmode -halt-on-error "../$f.tex" >/dev/null) \
      || { echo "FAILED: $f (see .build/$f.log)"; grep -m5 -A3 '^!' .build/$f.log; exit 1; }
    dpi=200
  else
    cat > .build/$f.tex <<TEX
\documentclass[border=10pt]{standalone}
\usepackage{mathptmx}
\usepackage[T1]{fontenc}
\input{../unify-diagram-styles}
\begin{document}
\input{../$f}
\end{document}
TEX
    (cd .build && pdflatex -interaction=nonstopmode -halt-on-error $f.tex >/dev/null) \
      || { echo "FAILED: $f (see .build/$f.log)"; grep -m5 -A3 '^!' .build/$f.log; exit 1; }
    dpi=110
  fi
  cp .build/$f.pdf rendered/$f.pdf
  command -v pdftoppm >/dev/null && pdftoppm -png -r $dpi -singlefile rendered/$f.pdf rendered/$f
  echo "built rendered/$f.pdf"
done
