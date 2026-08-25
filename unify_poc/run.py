import argparse
import contextlib
import io
import json
import os
import sys

from unify.eval.harness import summarize
from unify.ingestion.outage import run_outage_experiment
from unify.pipeline import run_pipeline

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(HERE, "data")


def print_suggestions(store):
    pending = store.pending_suggestions()
    if not pending:
        return
    print(f"\n{len(pending)} unresolved reference(s) queued for manual confirmation:")
    for s in pending:
        print(f"  [{s.source_entity_id}] -> {s.ref} ({s.reason})")


def main():
    parser = argparse.ArgumentParser(description="Unify POC engine CLI")
    parser.add_argument("--data-dir", default=DATA_DIR, help="path to fixture data")
    parser.add_argument("--json", action="store_true", help="print eval report as JSON")
    parser.add_argument(
        "--live-github",
        metavar="OWNER/REPO",
        help="ingest live PRs from a GitHub repo via REST (GITHUB_TOKEN optional)",
    )
    parser.add_argument(
        "--live-figma",
        metavar="FILE_KEY_OR_URL",
        help="ingest a live Figma file via REST (FIGMA_TOKEN required); "
        "accepts a bare file key or a figma.com file/design URL",
    )
    parser.add_argument("--max-prs", type=int, default=5, help="max PRs to fetch in live mode")
    parser.add_argument(
        "--experiment-outage",
        action="store_true",
        help="run the Section 12/13 failure experiment: one tool unreachable, "
        "events queued, entities marked stale, replay on reconnect",
    )
    args = parser.parse_args()

    if args.experiment_outage:
        store, alerts, report = run_outage_experiment(args.data_dir)
        print(json.dumps(report, indent=2))
        return

    if args.json:
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            store, alerts, deliveries, report = run_pipeline(
                data_dir=args.data_dir,
                github_repo=args.live_github,
                figma_file_key=args.live_figma,
                max_prs=args.max_prs,
                write_logs=True,
            )
        print(json.dumps(report, indent=2) if report else "{}")
        return

    store, alerts, deliveries, report = run_pipeline(
        data_dir=args.data_dir,
        github_repo=args.live_github,
        figma_file_key=args.live_figma,
        max_prs=args.max_prs,
        write_logs=True,
    )

    live = []
    if args.live_github:
        live.append(f"github:{args.live_github}")
    if args.live_figma:
        live.append(f"figma:{args.live_figma}")
    mode = " + ".join(live) if live else "fixtures"
    print(f"\n[{mode}] Ingested {len(store.all_entities())} entities, "
          f"{len(store.all_events())} events, {len(store.links)} links.")
    print(f"Generated {len(alerts)} alerts, {len(deliveries)} deliveries.")
    print_suggestions(store)

    if report:
        if args.json:
            print(json.dumps(report, indent=2))
        else:
            print()
            print(summarize(report))
    elif live:
        print("\n(live mode: label-based evaluation applies to the fixture scenario only)")


if __name__ == "__main__":
    sys.exit(main())
