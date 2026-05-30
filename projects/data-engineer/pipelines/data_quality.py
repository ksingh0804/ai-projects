"""Lightweight, dependency-free data-quality suite (a Great Expectations stand-in).

Each check returns a DQResult. The suite fails loudly: any failed *blocking* check makes
run_pipeline exit non-zero, mirroring "no check, no merge / failed checks page on-call".
"""
from __future__ import annotations

import os
import sqlite3
from dataclasses import dataclass

DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")


@dataclass
class DQResult:
    name: str
    passed: bool
    detail: str
    blocking: bool = True


def _scalar(conn, sql) -> int:
    return conn.execute(sql).fetchone()[0]


def run_checks(conn: sqlite3.Connection) -> list[DQResult]:
    results: list[DQResult] = []

    # 1) No null/zero/negative prices in market data
    bad_prices = _scalar(conn,
        "SELECT COUNT(*) FROM raw_market_data WHERE close IS NULL OR close <= 0")
    results.append(DQResult("market_data.close_positive", bad_prices == 0,
                            f"{bad_prices} rows with non-positive close"))

    # 2) high >= low and high >= close
    ohlc = _scalar(conn,
        "SELECT COUNT(*) FROM raw_market_data WHERE high < low OR high < close")
    results.append(DQResult("market_data.ohlc_consistent", ohlc == 0,
                            f"{ohlc} rows violate high>=low/close"))

    # 3) Duplicate (symbol,date) in market data
    dup_md = _scalar(conn, """
        SELECT COUNT(*) FROM (
          SELECT symbol, date, COUNT(*) c FROM raw_market_data
          GROUP BY symbol, date HAVING c > 1)""")
    results.append(DQResult("market_data.unique_symbol_date", dup_md == 0,
                            f"{dup_md} duplicate (symbol,date) keys"))

    # 4) Unique trade_id in staged transactions
    dup_tid = _scalar(conn, """
        SELECT COUNT(*) FROM (
          SELECT trade_id, COUNT(*) c FROM stg_transactions
          GROUP BY trade_id HAVING c > 1)""")
    results.append(DQResult("transactions.unique_trade_id", dup_tid == 0,
                            f"{dup_tid} duplicate trade_id values"))

    # 5) No null account on staged trades (non-blocking: we route to a quarantine table)
    null_acct = _scalar(conn,
        "SELECT COUNT(*) FROM stg_transactions WHERE account IS NULL")
    results.append(DQResult("transactions.account_not_null", null_acct == 0,
                            f"{null_acct} trades missing account", blocking=False))

    # 6) Positions reconcile: every account in positions exists in trades
    orphan = _scalar(conn, """
        SELECT COUNT(*) FROM positions p
        LEFT JOIN stg_transactions s ON p.account = s.account
        WHERE s.account IS NULL""")
    results.append(DQResult("positions.account_referential", orphan == 0,
                            f"{orphan} positions with no matching trade"))

    return results


def summarize(results: list[DQResult]) -> dict:
    failed = [r for r in results if not r.passed]
    blocking_failed = [r for r in failed if r.blocking]
    return {
        "total": len(results),
        "passed": len(results) - len(failed),
        "failed": len(failed),
        "blocking_failed": len(blocking_failed),
        "issues": [{"name": r.name, "detail": r.detail, "blocking": r.blocking}
                   for r in failed],
    }


if __name__ == "__main__":
    conn = sqlite3.connect(os.path.join(DATA, "warehouse.db"))
    res = run_checks(conn)
    for r in res:
        print(f"[{'PASS' if r.passed else 'FAIL'}] {r.name}: {r.detail}")
    conn.close()
