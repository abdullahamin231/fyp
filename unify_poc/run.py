import argparse
import json
import os

from unify.pipeline import run_pipeline

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")


def main():
    parser = argparse.ArgumentParser(description="Unify POC engine CLI")
    parser.add_argument("--data-dir", default=DATA_DIR, help="path to fixture data")
    parser.add_argument("--json", action="store_true", help="print eval report as JSON")
    args = parser.parse_args()

    store, alerts, report = run_pipeline(data_dir=args.data_dir)
    print(f"\nIngested {len(store.all_entities())} entities, "
          f"{len(store.all_events())} events, {len(store.links)} links.")
    print(f"Generated {len(alerts)} alerts.\n")
    if report:
        if args.json:
            print(json.dumps(report, indent=2))
        else:
            print("=== Evaluation ===")
            print(f"Linking   : precision={report['linking']['precision']} "
                  f"recall={report['linking']['recall']} "
                  f"(tp={report['linking']['true_positive']}, "
                  f"fp={report['linking']['false_positive']}, "
                  f"fn={report['linking']['false_negative']})")
            print(f"Alerts    : precision={report['alerts']['precision']} "
                  f"recall={report['alerts']['recall']} "
                  f"false_positive_rate={report['alerts']['false_positive_rate']} "
                  f"(tp={report['alerts']['true_positive']}, "
                  f"fp={report['alerts']['false_positive']}, "
                  f"fn={report['alerts']['false_negative']})")
            print(f"Latency   : {report['latency_ms']} ms (batch rule-eval)")


if __name__ == "__main__":
    main()
