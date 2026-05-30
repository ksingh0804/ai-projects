"""Transform raw trades + market data + FX into positions and USD-normalized P&L inputs.

Builds two derived tables:
  - stg_transactions : cleaned trades (typed, USD-normalized notional)
  - positions        : net quantity per account x symbol x date

Mirrors a dbt model layer (staging -> mart).
"""
from __future__ import annotations

import csv
import os
import sqlite3

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")


def _load_fx(conn: sqlite3.Connection) -> dict[tuple[str, str], float]:
    fx: dict[tuple[str, str], float] = {}
    with open(os.path.join(DATA, "fx_rates.csv"), newline="") as f:
        for r in csv.DictReader(f):
            fx[(r["currency"], r["date"])] = float(r["rate_to_usd"])
    return fx


def transform(conn: sqlite3.Connection) -> dict[str, int]:
    cur = conn.cursor()
    fx = _load_fx(conn)

    cols = """trade_id INTEGER, account TEXT, symbol TEXT, side TEXT,
              quantity INTEGER, price REAL, currency TEXT, ts TEXT,
              trade_date TEXT, signed_qty INTEGER, notional_usd REAL"""
    cur.execute("DROP TABLE IF EXISTS stg_landing")
    cur.execute(f"CREATE TABLE stg_landing ({cols})")

    with open(os.path.join(DATA, "transactions.csv"), newline="") as f:
        for r in csv.DictReader(f):
            trade_date = r["ts"][:10]
            rate = fx.get((r["currency"], trade_date), 1.0)
            qty = int(r["quantity"])
            signed = qty if r["side"] == "BUY" else -qty
            notional_usd = round(qty * float(r["price"]) * rate, 2)
            cur.execute(
                "INSERT INTO stg_landing VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                (int(r["trade_id"]), r["account"] or None, r["symbol"], r["side"],
                 qty, float(r["price"]), r["currency"], r["ts"], trade_date,
                 signed, notional_usd))

    # Quarantine trades with no account; they must not flow into positions.
    cur.execute("DROP TABLE IF EXISTS quarantine_transactions")
    cur.execute("CREATE TABLE quarantine_transactions AS "
                "SELECT * FROM stg_landing WHERE account IS NULL")

    # Clean staging: drop null-account trades and dedupe trade_id (keep first seen).
    cur.execute("DROP TABLE IF EXISTS stg_transactions")
    cur.execute("""
        CREATE TABLE stg_transactions AS
        SELECT trade_id, account, symbol, side, quantity, price, currency, ts,
               trade_date, signed_qty, notional_usd
        FROM (
            SELECT *, ROW_NUMBER() OVER (PARTITION BY trade_id ORDER BY rowid ASC) rn
            FROM stg_landing
            WHERE account IS NOT NULL)
        WHERE rn = 1""")
    rows = cur.execute("SELECT COUNT(*) FROM stg_transactions").fetchone()[0]

    cur.execute("DROP TABLE IF EXISTS positions")
    cur.execute("""
        CREATE TABLE positions AS
        SELECT account, symbol, trade_date AS date,
               SUM(signed_qty) AS net_qty,
               SUM(ABS(notional_usd)) AS gross_notional_usd
        FROM stg_transactions
        WHERE account IS NOT NULL
        GROUP BY account, symbol, trade_date
    """)
    conn.commit()
    pos = cur.execute("SELECT COUNT(*) FROM positions").fetchone()[0]
    return {"stg_transactions": rows, "positions": pos}


if __name__ == "__main__":
    conn = sqlite3.connect(os.path.join(DATA, "warehouse.db"))
    print(transform(conn))
    conn.close()
