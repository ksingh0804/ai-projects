"""A tiny, dependency-free data-quality engine.

This is a miniature of Great Expectations / dbt tests / Soda. A *check* asserts a
property of a table and returns a structured result. Checks have a severity:

  - BLOCKING: failure should stop the pipeline (e.g. a primary key is duplicated).
  - WARN:     failure is logged but the pipeline proceeds (e.g. 0.2% null emails).

Why severities? In real platforms not every defect should page someone at 3am.
You gate on the ones that corrupt downstream math, and you monitor the rest.
"""
from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Optional

import duckdb


@dataclass
class CheckResult:
    name: str
    table: str
    severity: str          # BLOCKING | WARN
    passed: bool
    observed: float
    threshold: Optional[float]
    detail: str = ""

    def to_dict(self):
        return asdict(self)


@dataclass
class DQReport:
    results: list[CheckResult] = field(default_factory=list)

    def add(self, r: CheckResult):
        self.results.append(r)

    @property
    def blocking_failures(self):
        return [r for r in self.results if not r.passed and r.severity == "BLOCKING"]

    @property
    def warnings(self):
        return [r for r in self.results if not r.passed and r.severity == "WARN"]

    def summary(self):
        return {
            "total": len(self.results),
            "passed": sum(1 for r in self.results if r.passed),
            "failed": sum(1 for r in self.results if not r.passed),
            "blocking_failed": len(self.blocking_failures),
            "warnings": len(self.warnings),
        }


def _scalar(con: duckdb.DuckDBPyConnection, sql: str) -> float:
    v = con.sql(sql).fetchone()[0]
    return float(v) if v is not None else 0.0


# --- reusable check primitives -------------------------------------------------

def not_null(con, table, column, severity="BLOCKING", max_null_rate=0.0) -> CheckResult:
    total = _scalar(con, f"SELECT count(*) FROM {table}")
    nulls = _scalar(con, f"SELECT count(*) FROM {table} WHERE {column} IS NULL")
    rate = (nulls / total) if total else 0.0
    return CheckResult(f"not_null[{column}]", table, severity,
                       passed=rate <= max_null_rate, observed=round(rate, 5),
                       threshold=max_null_rate,
                       detail=f"{int(nulls)}/{int(total)} nulls in {column}")


def unique(con, table, column, severity="BLOCKING") -> CheckResult:
    dupes = _scalar(con, f"""
        SELECT count(*) FROM (
            SELECT {column} FROM {table} GROUP BY {column} HAVING count(*) > 1
        )""")
    return CheckResult(f"unique[{column}]", table, severity,
                       passed=dupes == 0, observed=dupes, threshold=0,
                       detail=f"{int(dupes)} duplicated key values in {column}")


def non_negative(con, table, column, severity="BLOCKING") -> CheckResult:
    bad = _scalar(con, f"SELECT count(*) FROM {table} WHERE {column} < 0")
    return CheckResult(f"non_negative[{column}]", table, severity,
                       passed=bad == 0, observed=bad, threshold=0,
                       detail=f"{int(bad)} rows with negative {column}")


def accepted_values(con, table, column, values, severity="WARN") -> CheckResult:
    vlist = ",".join(f"'{v}'" for v in values)
    bad = _scalar(con, f"SELECT count(*) FROM {table} WHERE {column} NOT IN ({vlist})")
    return CheckResult(f"accepted_values[{column}]", table, severity,
                       passed=bad == 0, observed=bad, threshold=0,
                       detail=f"{int(bad)} rows with {column} outside accepted set")


def relationship(con, table, column, ref_table, ref_column, severity="BLOCKING") -> CheckResult:
    """Foreign-key integrity: every value in table.column exists in ref_table.ref_column."""
    orphans = _scalar(con, f"""
        SELECT count(*) FROM {table} t
        LEFT JOIN {ref_table} r ON t.{column} = r.{ref_column}
        WHERE t.{column} IS NOT NULL AND r.{ref_column} IS NULL""")
    return CheckResult(f"relationship[{column}->{ref_table}.{ref_column}]", table, severity,
                       passed=orphans == 0, observed=orphans, threshold=0,
                       detail=f"{int(orphans)} orphan rows")


def row_count_min(con, table, minimum, severity="BLOCKING") -> CheckResult:
    n = _scalar(con, f"SELECT count(*) FROM {table}")
    return CheckResult("row_count_min", table, severity,
                       passed=n >= minimum, observed=n, threshold=minimum,
                       detail=f"{int(n)} rows (min {minimum})")


def freshness(con, table, ts_column, max_lag_days, severity="WARN") -> CheckResult:
    """Data freshness: newest record should be within max_lag_days of the latest data we have."""
    lag = _scalar(con, f"""
        SELECT date_diff('day', max({ts_column}),
                         (SELECT max({ts_column}) FROM {table}))
        FROM {table}""")
    return CheckResult("freshness", table, severity,
                       passed=lag <= max_lag_days, observed=lag, threshold=max_lag_days,
                       detail=f"max lag {lag} days")
