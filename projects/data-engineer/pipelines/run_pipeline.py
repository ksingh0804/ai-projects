"""Daily EOD pipeline orchestrator (a tiny stand-in for the Airflow DAG).

Stages: ingest -> transform -> data quality -> portfolio metrics.
Fails non-zero if any *blocking* data-quality check fails (mirrors on-call paging).
Writes a run summary to data/last_run.json for the reporting layer.
"""
from __future__ import annotations

import json
import os
import sqlite3
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")
sys.path.insert(0, HERE)

import ingest_market_data as ingest          # noqa: E402
import transform_transactions as transform    # noqa: E402
import data_quality as dq                      # noqa: E402
import portfolio_metrics as pm                 # noqa: E402


def main() -> int:
    started = time.time()
    conn = sqlite3.connect(os.path.join(DATA, "warehouse.db"))

    md = ingest.ingest(conn)
    tx = transform.transform(conn)
    checks = dq.run_checks(conn)
    dq_summary = dq.summarize(checks)
    metrics = pm.build_metrics(conn)

    quarantined = (
        conn.execute("SELECT COUNT(*) FROM quarantine_market_data").fetchone()[0]
        + conn.execute("SELECT COUNT(*) FROM quarantine_transactions").fetchone()[0]
    )

    elapsed = round(time.time() - started, 3)
    summary = {
        "elapsed_seconds": elapsed,
        "rows": {"market_data": md["clean"], **tx},
        "quarantined": quarantined,
        "data_quality": dq_summary,
        "portfolio": metrics,
    }
    with open(os.path.join(DATA, "last_run.json"), "w") as f:
        json.dump(summary, f, indent=2)

    print(json.dumps(summary, indent=2))
    conn.close()

    if dq_summary["blocking_failed"] > 0:
        print(f"\nPIPELINE FAILED: {dq_summary['blocking_failed']} blocking DQ check(s).",
              file=sys.stderr)
        return 1
    print("\nPIPELINE OK: all blocking checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
