# Assignment — Week 3 (Jun 15–19, 2026)

**From:** Sarah Chen · **To:** Junior Data Engineer · **Theme:** Data quality (no check, no merge)

## Goal
Ship a **data-quality suite** that fails loudly and quarantines bad rows so they never reach
PM-facing tables.

## Tasks
1. Author checks: positive prices, OHLC consistency, unique `(symbol,date)`, unique `trade_id`,
   non-null account, positions referential integrity.
2. Mark which checks are **blocking** (page on-call) vs. **quarantine** (route + warn).
3. Wire the suite into the pipeline so blocking failures exit non-zero.
4. Backfill: quarantine the known bad rows already in the feed.

## Acceptance criteria
- Pipeline exits non-zero on a seeded blocking failure (prove it).
- Bad rows land in quarantine tables, not in `positions`.
- Suite results written to the run summary.

## Notes
- This is the highest-leverage work this month. Treat it as production-critical.
