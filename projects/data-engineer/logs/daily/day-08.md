# Daily Report — Day 08 · Monday, June 8, 2026

**To:** Sarah Chen (Manager) · **From:** Junior Data Engineer · **Project:** Meridian EOD Data Platform


**Week 2 assignment:** [`assignments/week-2.md`](../../assignments/week-2.md)

## Today: Staging transactions model

### What I did
- Built `stg_transactions`: typed columns, signed quantity (BUY +, SELL −).
- Parsed trade_date from timestamp for point-in-time joins.

### Evidence
- **staged_rows:** 309
- **accounts:** 3

### Metrics
- EOD landed before 7:00pm ET cutoff: **yes**
- Pipeline runtime (prod-scale): **5.2s**
- Data-quality issues caught: **0**

### Blockers
None.

### Next
Normalize notional to USD via daily FX.
