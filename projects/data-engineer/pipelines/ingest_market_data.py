"""Ingest the vendor EOD market-data CSV into the (SQLite) warehouse landing zone.

Idempotent: re-running replaces the day's partition rather than appending duplicates.
This mirrors the real Airflow task `ingest_market_data` that lands the EOD feed in S3 -> Snowflake.
"""
from __future__ import annotations

import csv
import os
import sqlite3

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")


def connect() -> sqlite3.Connection:
    return sqlite3.connect(os.path.join(DATA, "warehouse.db"))


def ingest(conn: sqlite3.Connection) -> dict[str, int]:
    """Land the feed, then clean it: dedupe (symbol,date) and quarantine bad prices.

    Returns row counts so the run summary can show what was loaded vs. quarantined.
    This cleaning step is the hardening the junior engineer added over the month.
    """
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS raw_market_data_landing")
    cur.execute("""
        CREATE TABLE raw_market_data_landing (
            symbol TEXT, date TEXT, open REAL, high REAL, low REAL,
            close REAL, volume INTEGER, currency TEXT
        )""")
    path = os.path.join(DATA, "market_data.csv")
    landed = 0
    with open(path, newline="") as f:
        for row in csv.DictReader(f):
            cur.execute(
                "INSERT INTO raw_market_data_landing VALUES (?,?,?,?,?,?,?,?)",
                (row["symbol"], row["date"], float(row["open"]), float(row["high"]),
                 float(row["low"]), float(row["close"]), int(row["volume"]),
                 row["currency"]))
            landed += 1

    # Quarantine non-positive prices so they never reach the clean table.
    cur.execute("DROP TABLE IF EXISTS quarantine_market_data")
    cur.execute("""CREATE TABLE quarantine_market_data AS
                   SELECT * FROM raw_market_data_landing WHERE close IS NULL OR close <= 0""")
    quarantined = cur.execute("SELECT COUNT(*) FROM quarantine_market_data").fetchone()[0]

    # Clean table: drop bad prices and dedupe (symbol,date), keeping the last row seen.
    cur.execute("DROP TABLE IF EXISTS raw_market_data")
    cur.execute("""
        CREATE TABLE raw_market_data AS
        SELECT symbol, date, open, high, low, close, volume, currency FROM (
            SELECT *, ROW_NUMBER() OVER (PARTITION BY symbol, date ORDER BY rowid DESC) rn
            FROM raw_market_data_landing
            WHERE close IS NOT NULL AND close > 0)
        WHERE rn = 1""")
    clean = cur.execute("SELECT COUNT(*) FROM raw_market_data").fetchone()[0]
    conn.commit()
    return {"landed": landed, "clean": clean, "quarantined": quarantined}


if __name__ == "__main__":
    c = connect()
    print(f"raw_market_data: {ingest(c)}")
    c.close()
