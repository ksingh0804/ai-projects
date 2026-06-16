"""Data-contract validation against source extracts.

A *data contract* is a machine-readable agreement between a producer (e.g. the OMS
team) and consumers (the data platform): the schema, keys, value domains, and
freshness a dataset promises. Validating incoming data against it catches *schema
drift* and *semantic drift* the moment a producer changes something upstream.

Severity model (matches production):
  - STRUCTURAL drift (a required column missing / unparseable) is BLOCKING: the
    pipeline cannot safely proceed.
  - ROW-LEVEL violations (null-rate, min, accepted-values, duplicate keys) are WARN
    here, because the silver layer + quarantine already handle bad rows. They are
    still recorded so you can alert when violation *rates* spike.

Reads contracts/*.json, validates data/raw/*.csv, writes data/_metrics/contract_validation.json.
"""
from __future__ import annotations

import glob
import json
import os

import duckdb

import common as C

CONTRACTS_DIR = os.path.join(C.PROJECT_ROOT, "contracts")


def _scalar(con, sql):
    v = con.sql(sql).fetchone()[0]
    return 0 if v is None else v


def validate_contract(con, contract: dict) -> dict:
    name = contract["dataset"]
    path = os.path.join(C.RAW, f"{name}.csv")
    results = []
    if not os.path.exists(path):
        return {"dataset": name, "ok": False, "structural_failures": 1,
                "results": [{"check": "file_exists", "severity": "STRUCTURAL",
                             "passed": False, "detail": "missing extract"}]}

    con.execute(f"CREATE OR REPLACE VIEW _src AS "
                f"SELECT * FROM read_csv_auto('{path}', header=true, sample_size=-1)")
    cols = {r[0] for r in con.sql("DESCRIBE _src").fetchall()}
    total = _scalar(con, "SELECT count(*) FROM _src")

    for c in contract["columns"]:
        col = c["name"]
        present = col in cols
        results.append({"check": f"column_present[{col}]", "severity": "STRUCTURAL",
                        "passed": present, "detail": "" if present else "column missing"})
        if not present:
            continue
        if c.get("required"):
            nulls = _scalar(con, f"SELECT count(*) FROM _src WHERE {col} IS NULL")
            rate = (nulls / total) if total else 0
            thr = c.get("max_null_rate", 0.0)
            results.append({"check": f"null_rate[{col}]", "severity": "WARN",
                            "passed": rate <= thr, "observed": round(rate, 5),
                            "threshold": thr, "detail": f"{nulls} nulls"})
        if "min" in c:
            bad = _scalar(con, f"SELECT count(*) FROM _src WHERE TRY_CAST({col} AS DOUBLE) < {c['min']}")
            results.append({"check": f"min[{col}>={c['min']}]", "severity": "WARN",
                            "passed": bad == 0, "observed": bad, "detail": f"{bad} below min"})
        if "accepted_values" in c:
            vlist = ",".join(f"'{v}'" for v in c["accepted_values"])
            bad = _scalar(con, f"SELECT count(*) FROM _src WHERE {col} NOT IN ({vlist})")
            results.append({"check": f"accepted_values[{col}]", "severity": "WARN",
                            "passed": bad == 0, "observed": bad, "detail": f"{bad} out of domain"})
        if c.get("unique"):
            dup = _scalar(con, f"SELECT count(*) FROM (SELECT {col} FROM _src GROUP BY {col} HAVING count(*)>1)")
            results.append({"check": f"unique[{col}]", "severity": "WARN",
                            "passed": dup == 0, "observed": dup, "detail": f"{dup} dup keys"})

    structural_failures = sum(1 for r in results if r["severity"] == "STRUCTURAL" and not r["passed"])
    return {"dataset": name, "ok": structural_failures == 0,
            "structural_failures": structural_failures,
            "warnings": sum(1 for r in results if r["severity"] == "WARN" and not r["passed"]),
            "results": results}


def main():
    C.ensure_dirs()
    con = duckdb.connect()
    reports = [validate_contract(con, json.load(open(p)))
               for p in sorted(glob.glob(os.path.join(CONTRACTS_DIR, "*.json")))]
    out = {"datasets": reports,
           "structural_failures": sum(r["structural_failures"] for r in reports),
           "warnings": sum(r.get("warnings", 0) for r in reports)}
    json.dump(out, open(os.path.join(C.METRICS, "contract_validation.json"), "w"), indent=2)

    print("Data-contract validation")
    print("-" * 40)
    for r in reports:
        status = "OK" if r["ok"] else "STRUCTURAL DRIFT"
        print(f"  {r['dataset']:<16} {status:<18} warnings={r.get('warnings',0)}")
        for c in r["results"]:
            if not c["passed"]:
                print(f"     [{c['severity']:<10}] {c['check']}: {c['detail']}")
    print(f"\n  structural_failures={out['structural_failures']}  warnings={out['warnings']}")
    if out["structural_failures"]:
        print("BLOCKED: source schema drift detected.")
        raise SystemExit(1)
    print("OK: contracts satisfied structurally (row-level violations are quarantined downstream).")


if __name__ == "__main__":
    main()
