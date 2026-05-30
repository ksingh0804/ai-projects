# Assignment — Week 4 (Jun 22–30, 2026)

**From:** Sarah Chen · **To:** Junior Data Engineer · **Theme:** Performance, metrics & handover

## Goal
Make the pipeline **fast and observable**, ship the `portfolio_metrics` PMs asked for, and
leave a clean trail.

## Tasks
1. Profile the slow positions build; cut runtime (indexing / set-based SQL / fewer scans).
2. Build `portfolio_metrics` (gross exposure, #symbols per account/day).
3. Add run summary + freshness logging; document the runbook.
4. Month-end: write a short retro and hand over open items.

## Acceptance criteria
- Positions build runtime reduced measurably vs. Week 2 baseline.
- `portfolio_metrics` reconciles to `positions`.
- Runbook + retro committed; no orphaned TODOs.

## Notes
- Freshness before features — don't regress the EOD landing time while optimizing.
