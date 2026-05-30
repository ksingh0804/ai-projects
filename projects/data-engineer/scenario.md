# Real-World Scenario

## The company

**Meridian Asset Management** is a mid-size investment firm (~$8B AUM) running long/short
equity and multi-asset strategies. Portfolio managers (PMs), risk, and compliance all depend
on **trustworthy, on-time data**: end-of-day (EOD) market prices, executed trades, positions,
FX rates, and reference data.

If the data is late or wrong, PMs trade on stale prices, risk reports misstate exposure, and
compliance can miss a breach. So the **Data Platform Engineering** team treats freshness,
correctness, and lineage as first-class.

## The team & stack

- **Team:** Data Platform Engineering (6 people) inside the Technology org.
- **Warehouse:** Snowflake (the simulation uses local **SQLite** as a stand-in warehouse).
- **Orchestration:** Apache Airflow (DAGs scheduled to land EOD data by 7:00pm ET).
- **Transformation:** dbt + Python; **Spark** for heavy batch.
- **Storage:** AWS S3 raw/landing zone.
- **Data quality:** Great Expectations-style checks (the simulation ships a lightweight,
  dependency-free equivalent in `pipelines/data_quality.py`).
- **Languages:** Python (primary), SQL (heavy).

## My role: Junior Data Engineer

I joined Meridian's Data Platform team this month. I own small, well-scoped pieces of the EOD
pipeline under supervision: ingesting a market-data feed, building transformation models,
writing data-quality checks, and tuning a slow query. I report to **Sarah Chen**.

### Expectations set on day 1

1. **File a daily report every working day** — what I was assigned, what I shipped, evidence
   (metrics/code), blockers, and tomorrow's plan.
2. **Never break EOD freshness** — pipelines must finish before the 7:00pm ET cutoff.
3. **Data quality is not optional** — every pipeline ships with checks; failed checks page.
4. **Ask early, document always** — blockers raised same-day, decisions written down.
5. **Leave a trail** — code reviewed via PR, lineage and runbooks kept current.

## Key business datasets (modeled here)

| Dataset | Grain | Source | Why it matters |
|---------|-------|--------|----------------|
| `market_data` | symbol × date | Vendor EOD feed (CSV) | Pricing & valuation |
| `transactions` | trade id | Order management system | Positions & P&L |
| `fx_rates` | currency × date | FX vendor | Multi-currency NAV |
| `positions` (derived) | account × symbol × date | Computed | Risk & exposure |
| `portfolio_metrics` (derived) | account × date | Computed | PM dashboards |

## Definition of "done" on this team

- Pipeline runs idempotently and lands before cutoff.
- Data-quality suite passes (or fails loudly with a clear reason).
- Code is reviewed, documented, and has a rollback path.
- A short report explains *what changed and why*.

See the people I work with: [Manager — Sarah Chen](personas/manager.md) ·
[Performance Coach — Coach Ada](personas/performance-coach.md).
