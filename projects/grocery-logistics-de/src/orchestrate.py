"""A minimal dependency-aware DAG runner (a teaching-sized Airflow/Dagster).

Defines the FreshCart pipeline as a DAG of tasks, runs them in topological order
(respecting dependencies), with per-task retries, timing, and structured run logging
for observability. Independent branches (batch vs streaming) could run in parallel;
we run sequentially for deterministic, readable output but mark where parallelism applies.

Each task is an external command (like an Airflow BashOperator / PythonOperator),
so a failure in one task fails its downstream dependents but not unrelated branches.

Outputs:
  data/_metrics/last_dag_run.json   - latest run (per-task status, duration, attempts)
  data/_metrics/dag_runs.jsonl      - append-only run history (for trend/observability)
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone

import common as C

PY = sys.executable


@dataclass
class Task:
    name: str
    cmd: list[str]
    deps: list[str] = field(default_factory=list)
    retries: int = 1            # total attempts = retries + 1
    timeout_s: int = 300


# The DAG. generate -> (contracts -> batch_elt) and (stream_simulate -> stream_process);
# analytics depends on the batch gold being built.
TASKS = [
    Task("generate_data",   [PY, "src/generate_data.py"]),
    Task("validate_contracts", [PY, "src/contracts.py"], deps=["generate_data"]),
    Task("batch_elt",       [PY, "src/run_pipeline.py"], deps=["validate_contracts"]),
    Task("stream_simulate", [PY, "src/stream_simulator.py"], deps=["generate_data"]),
    Task("stream_process",  [PY, "src/stream_processor.py"], deps=["stream_simulate"]),
    Task("analytics",       [PY, "src/analytics.py"], deps=["batch_elt"], retries=0),
]


def topo_order(tasks: list[Task]) -> list[Task]:
    by_name = {t.name: t for t in tasks}
    indeg = {t.name: 0 for t in tasks}
    children = {t.name: [] for t in tasks}
    for t in tasks:
        for d in t.deps:
            indeg[t.name] += 1
            children[d].append(t.name)
    queue = [n for n, d in indeg.items() if d == 0]
    order = []
    while queue:
        queue.sort()  # deterministic
        n = queue.pop(0)
        order.append(by_name[n])
        for c in children[n]:
            indeg[c] -= 1
            if indeg[c] == 0:
                queue.append(c)
    if len(order) != len(tasks):
        raise RuntimeError("cycle detected in DAG")
    return order


def run_task(t: Task) -> dict:
    attempts = 0
    last_err = ""
    start = time.time()
    while attempts <= t.retries:
        attempts += 1
        try:
            proc = subprocess.run(t.cmd, cwd=C.PROJECT_ROOT, capture_output=True,
                                  text=True, timeout=t.timeout_s)
            if proc.returncode == 0:
                return {"task": t.name, "status": "success", "attempts": attempts,
                        "duration_s": round(time.time() - start, 2),
                        "tail": proc.stdout.strip().splitlines()[-1:] or [""]}
            last_err = (proc.stderr or proc.stdout).strip().splitlines()[-1:] or [""]
            last_err = last_err[0]
        except subprocess.TimeoutExpired:
            last_err = f"timeout after {t.timeout_s}s"
    return {"task": t.name, "status": "failed", "attempts": attempts,
            "duration_s": round(time.time() - start, 2), "error": last_err}


def freshness_sla() -> dict:
    """Observability: is the freshest gold data within SLA of 'now'?"""
    try:
        import duckdb
        con = duckdb.connect(C.WAREHOUSE_DB)
        max_order = con.sql("SELECT max(order_ts) FROM gold.fct_orders").fetchone()[0]
        con.close()
        lag_h = (datetime.now() - max_order).total_seconds() / 3600.0
        return {"max_order_ts": str(max_order), "lag_hours": round(lag_h, 1),
                "sla_hours": 24, "within_sla": lag_h <= 24}
    except Exception as e:
        return {"error": str(e)}


def main():
    C.ensure_dirs()
    order = topo_order(TASKS)
    print("DAG execution order:", " -> ".join(t.name for t in order))
    print("=" * 64)

    results = {}
    failed = set()
    run_start = time.time()
    for t in order:
        # skip if any upstream dependency failed (downstream short-circuit)
        if any(d in failed for d in t.deps):
            results[t.name] = {"task": t.name, "status": "skipped",
                               "reason": "upstream_failed", "attempts": 0, "duration_s": 0}
            print(f"  SKIP  {t.name:<20} (upstream failed)")
            failed.add(t.name)
            continue
        r = run_task(t)
        results[t.name] = r
        if r["status"] != "success":
            failed.add(t.name)
        icon = {"success": "OK  ", "failed": "FAIL", "skipped": "SKIP"}[r["status"]]
        print(f"  {icon}  {t.name:<20} {r['duration_s']:>6}s  attempts={r['attempts']}"
              + ("" if r["status"] == "success" else f"  err={r.get('error','')}"))

    sla = freshness_sla()
    run = {
        "run_at": datetime.now(timezone.utc).isoformat(),
        "total_duration_s": round(time.time() - run_start, 2),
        "tasks": list(results.values()),
        "success": len(failed) == 0,
        "failed_tasks": sorted(failed),
        "freshness_sla": sla,
    }
    json.dump(run, open(os.path.join(C.METRICS, "last_dag_run.json"), "w"), indent=2)
    with open(os.path.join(C.METRICS, "dag_runs.jsonl"), "a") as f:
        f.write(json.dumps({"run_at": run["run_at"], "success": run["success"],
                            "duration_s": run["total_duration_s"],
                            "failed_tasks": run["failed_tasks"]}) + "\n")

    print("=" * 64)
    print(f"DAG {'SUCCEEDED' if run['success'] else 'FAILED'} in {run['total_duration_s']}s")
    if "lag_hours" in sla:
        print(f"Freshness SLA: gold lag {sla['lag_hours']}h (SLA {sla['sla_hours']}h) "
              f"-> {'within SLA' if sla['within_sla'] else 'BREACH'}")
    if not run["success"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
