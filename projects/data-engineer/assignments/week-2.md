# Assignment — Week 2 (Jun 8–12, 2026)

**From:** Sarah Chen · **To:** Junior Data Engineer · **Theme:** Transformations & positions

## Goal
Turn raw trades into a **positions** mart PMs can trust, normalized to **USD** using daily FX.

## Tasks
1. Build `stg_transactions` (typed, signed quantity, USD notional via `fx_rates`).
2. Build `positions` = net qty + gross notional per account × symbol × date.
3. Handle multi-currency correctly (GBP/EUR/JPY → USD).
4. Open a PR; include before/after row counts and a sample reconciliation.

## Acceptance criteria
- USD notional matches a hand-check on 3 sample trades.
- `positions` grain is exactly account × symbol × date (no fan-out).
- PR reviewed and merged with a rollback note.

## Notes
- FX is point-in-time per trade_date — don't use today's rate for last week's trade.
