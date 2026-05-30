# Daily Report — Day 09 · Tuesday, June 9, 2026

**To:** Sarah Chen (Manager) · **From:** Junior Data Engineer · **Project:** Meridian EOD Data Platform


**Week 2 assignment:** [`assignments/week-2.md`](../../assignments/week-2.md)

## Today: USD normalization via FX

### What I did
- Joined `fx_rates` on (currency, trade_date) to compute USD notional.
- Caught and fixed a bug: I was using today's FX for back-dated trades.

### Evidence
- **currencies:** USD/GBP/EUR/JPY
- **fx_join:** point-in-time

### Metrics
- EOD landed before 7:00pm ET cutoff: **yes**
- Pipeline runtime (prod-scale): **5.0s**
- Data-quality issues caught: **0**

### Blockers
None — the FX bug was caught by a hand-check, not a test (note for Week 3).

### Next
Build the positions mart.
