# Daily Report — Day 10 · Wednesday, June 10, 2026

**To:** Sarah Chen (Manager) · **From:** Junior Data Engineer · **Project:** Meridian EOD Data Platform


**Week 2 assignment:** [`assignments/week-2.md`](../../assignments/week-2.md)

## Today: Positions mart + fan-out fix

### What I did
- Built `positions` (net qty + gross USD notional) at account×symbol×date.
- Found a fan-out (duplicate join key) inflating notional; fixed the grain.

### Evidence
- **positions_rows:** 238
- **grain:** account×symbol×date

### Metrics
- EOD landed before 7:00pm ET cutoff: **NO — see blockers**
- Pipeline runtime (prod-scale): **5.3s**
- Data-quality issues caught: **0**

### Blockers
Fan-out debugging pushed EOD ~15 min late; flagged early at 1pm.

### Next
Reconcile 3 sample trades by hand.
