#!/usr/bin/env bash
# Builds each diagram to a standalone PDF (and a PNG preview) in ./rendered
# Usage: ./build.sh            (all)      ./build.sh usecase   (one)
set -e
cd "$(dirname "$0")"
mkdir -p rendered .build
figs=("$@"); [ ${#figs[@]} -eq 0 ] && figs=(usecase erd domain-model anchor-reanchoring layered-arch components dfd verifier-loop autonomy-ladder)
for f in "${figs[@]}"; do
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
  cp .build/$f.pdf rendered/$f.pdf
  command -v pdftoppm >/dev/null && pdftoppm -png -r 110 -singlefile rendered/$f.pdf rendered/$f
  echo "built rendered/$f.pdf"
done
