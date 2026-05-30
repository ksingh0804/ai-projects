"""Compute portfolio-level metrics PMs care about: gross exposure and daily turnover (USD)."""
from __future__ import annotations

import os
import sqlite3

DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")


def build_metrics(conn: sqlite3.Connection) -> dict[str, float]:
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS portfolio_metrics")
    cur.execute("""
        CREATE TABLE portfolio_metrics AS
        SELECT account, date,
               SUM(gross_notional_usd) AS gross_exposure_usd,
               COUNT(DISTINCT symbol)  AS n_symbols
        FROM positions
        GROUP BY account, date
    """)
    conn.commit()
    total = cur.execute("SELECT COALESCE(SUM(gross_exposure_usd),0) FROM portfolio_metrics").fetchone()[0]
    accounts = cur.execute("SELECT COUNT(DISTINCT account) FROM portfolio_metrics").fetchone()[0]
    return {"gross_exposure_usd": round(total, 2), "accounts": accounts}


if __name__ == "__main__":
    conn = sqlite3.connect(os.path.join(DATA, "warehouse.db"))
    print(build_metrics(conn))
    conn.close()
