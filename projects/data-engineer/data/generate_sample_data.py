"""Generate synthetic financial datasets for the Meridian EOD pipeline.

Produces three CSVs in this folder:
  - market_data.csv   (symbol, date, open, high, low, close, volume, currency)
  - transactions.csv  (trade_id, account, symbol, side, quantity, price, currency, ts)
  - fx_rates.csv      (currency, date, rate_to_usd)

Deterministic (seeded) so the pipeline + reports are reproducible.
Standard library only.
"""
from __future__ import annotations

import csv
import os
import random
from datetime import date, datetime, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
SEED = 20260601
random.seed(SEED)

SYMBOLS = {
    "AAPL": ("USD", 190.0),
    "MSFT": ("USD", 410.0),
    "JPM": ("USD", 195.0),
    "HSBA.L": ("GBP", 6.8),
    "SAP.DE": ("EUR", 175.0),
    "TM": ("JPY", 2900.0),
    "NVDA": ("USD", 120.0),
    "BARC.L": ("GBP", 2.1),
}
ACCOUNTS = ["FUND_A", "FUND_B", "FUND_C"]
FX_BASE = {"USD": 1.0, "GBP": 1.27, "EUR": 1.08, "JPY": 0.0064}

START = date(2026, 6, 1)
TRADING_DAYS = 22  # June 2026 weekdays


def trading_dates(start: date, n: int) -> list[date]:
    out, d = [], start
    while len(out) < n:
        if d.weekday() < 5:  # Mon-Fri
            out.append(d)
        d += timedelta(days=1)
    return out


def write_market_data(dates: list[date]) -> None:
    rows = []
    prices = {s: p for s, (_, p) in SYMBOLS.items()}
    for d in dates:
        for sym, (ccy, _) in SYMBOLS.items():
            drift = random.uniform(-0.02, 0.022)
            prev = prices[sym]
            close = max(0.5, prev * (1 + drift))
            high = close * random.uniform(1.0, 1.015)
            low = close * random.uniform(0.985, 1.0)
            openp = random.uniform(low, high)
            volume = int(random.uniform(1e5, 5e6))
            prices[sym] = close
            rows.append([sym, d.isoformat(), round(openp, 4), round(high, 4),
                         round(low, 4), round(close, 4), volume, ccy])
    # Intentionally inject a few realistic data issues for the DQ checks to find:
    rows.append(["AAPL", dates[3].isoformat(), 191.0, 192.0, 190.0, 191.5, 1_000_000, "USD"])  # duplicate
    rows.append(["MSFT", dates[10].isoformat(), 0, 0, 0, 0, 0, "USD"])  # zero/negative price
    with open(os.path.join(HERE, "market_data.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["symbol", "date", "open", "high", "low", "close", "volume", "currency"])
        w.writerows(rows)
    print(f"market_data.csv: {len(rows)} rows")


def write_transactions(dates: list[date]) -> None:
    rows = []
    tid = 1000
    for d in dates:
        for _ in range(random.randint(8, 20)):
            sym = random.choice(list(SYMBOLS))
            ccy = SYMBOLS[sym][0]
            side = random.choice(["BUY", "SELL"])
            qty = random.choice([100, 200, 250, 500, 1000])
            price = round(SYMBOLS[sym][1] * random.uniform(0.95, 1.05), 4)
            ts = datetime.combine(d, datetime.min.time()) + timedelta(
                hours=random.randint(9, 16), minutes=random.randint(0, 59))
            rows.append([tid, random.choice(ACCOUNTS), sym, side, qty, price, ccy,
                         ts.isoformat()])
            tid += 1
    # Inject a duplicate trade id and a null account (DQ should flag these):
    dup = list(rows[5]); rows.append(dup)
    bad = list(rows[7]); bad[1] = ""; bad[0] = tid; rows.append(bad)
    with open(os.path.join(HERE, "transactions.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["trade_id", "account", "symbol", "side", "quantity", "price",
                    "currency", "ts"])
        w.writerows(rows)
    print(f"transactions.csv: {len(rows)} rows")


def write_fx(dates: list[date]) -> None:
    rows = []
    rates = dict(FX_BASE)
    for d in dates:
        for ccy, _ in rates.items():
            rates[ccy] = max(0.0001, rates[ccy] * (1 + random.uniform(-0.005, 0.005))
                             if ccy != "USD" else 1.0)
            rows.append([ccy, d.isoformat(), round(rates[ccy], 6)])
    with open(os.path.join(HERE, "fx_rates.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["currency", "date", "rate_to_usd"])
        w.writerows(rows)
    print(f"fx_rates.csv: {len(rows)} rows")


def main() -> None:
    dates = trading_dates(START, TRADING_DAYS)
    write_market_data(dates)
    write_transactions(dates)
    write_fx(dates)
    print(f"Generated {TRADING_DAYS} trading days starting {START} (seed={SEED}).")


if __name__ == "__main__":
    main()
