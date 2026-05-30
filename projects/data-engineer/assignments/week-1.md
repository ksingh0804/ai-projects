# Assignment — Week 1 (Jun 1–5, 2026)

**From:** Sarah Chen · **To:** Junior Data Engineer · **Theme:** Onboarding + first ingestion

## Goal
Get set up and own your first piece of the EOD pipeline: **ingest the vendor market-data feed**
into the warehouse landing zone, idempotently.

## Tasks
1. Environment setup: warehouse access, repo, run the existing pipeline locally.
2. Read the EOD architecture + lineage docs; map where market data lands.
3. Build `ingest_market_data` so re-runs don't create duplicates (full-refresh the partition).
4. Land the feed before the **7:00pm ET** cutoff.

## Acceptance criteria
- Re-running ingestion twice yields identical row counts (idempotent).
- Row counts logged; feed lands before cutoff.
- A short runbook note on how to re-run on failure.

## Notes
- Don't worry about transformations yet — just clean landing.
- Ask me early if warehouse access is blocked.
