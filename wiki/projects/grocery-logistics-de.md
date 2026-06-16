---
title: FreshCart — End-to-End Grocery + Logistics Data Engineering Project
type: project
tags: [data-engineering, portfolio, lakehouse, streaming, dbt, kimball, careers]
created: 2026-06-08
updated: 2026-06-15
---

# FreshCart Data Platform

A **runnable, portfolio-grade** end-to-end data engineering project in the **grocery + last-mile logistics** domain (an Instacart / Amazon Fresh / DoorDash / Gopuff analog), built to land a data-engineering job. Runs locally for $0 on Python + DuckDB; every component maps 1:1 to a production tool. Follows the "build real work, not just interview" idea from [grad-jobs-research](grad-jobs-research.md).

Project files: `projects/grocery-logistics-de/` (code in `src/`, narrative in `docs/00..07`).

## What it covers (every DE layer)
- **Medallion lakehouse** bronze -> silver -> gold (Parquet + DuckDB).
- **Kimball star schema**: conformed dims + fact tables, surrogate keys, grain, SCD2 notes.
- **Batch ELT** with a data-quality engine (blocking vs warn) + **quarantine** (no silent loss).
- **Streaming**: event-time windows, **watermarks**, exactly-once dedup, live ETA, late side-output.
- **Data contracts** (JSON) catching upstream schema drift.
- **Orchestration DAG** (`orchestrate.py`): topological order, retries, downstream short-circuit, **freshness SLA**.
- **Tests** (data invariants + unit) + **CI/CD** (GitHub Actions) + **IaC** (Terraform) + **Docker**.
- **Analytics KPIs** + leak-free **ML feature** tables (ETA + demand forecasting).

## Verified run facts (deterministic, seeded)
- ~200k source rows across 9 systems -> 26,983 orders / 118,624 order lines after cleaning.
- 57 bad rows quarantined; **12/12 DQ checks pass** (run exits 1 on blocking failure).
- Streaming: 8 duplicates deduped, 5 late events to side-output, ETA MAE ~5 min, 7/9 windows closed by watermark.
- KPIs from gold: ~$1.31M GMV, ~25.5% margin, **91.5% on-time** delivery, 8.5% stockout, ~1.6% cold-chain excursions.
- ML: `corr(distance, delivery_minutes) = 0.907`; ~60k leak-free demand training rows. **10/10 tests pass.**

## Build process
Built in **5 iterations** per the user's request (foundation -> batch -> streaming -> orchestration/observability -> productionization). Tooling installed: `duckdb`, `pandas`, `pyarrow`. Everything reproduced end-to-end via `python src/orchestrate.py`.

## How to run
```
cd projects/grocery-logistics-de
pip install -r requirements.txt
python src/orchestrate.py        # full platform; or run src/*.py stage by stage
python -m unittest discover -s tests
```

## Map to production / companies
DuckDB->Snowflake/BigQuery; SQL transforms->dbt+Spark; micro-batch->Kafka+Flink; DAG->Airflow/Dagster; DQ->Great Expectations/Soda; Parquet->Iceberg/Delta. Domain maps to Instacart/Amazon Fresh/Walmart (orders/catalog/inventory/forecasting) and DoorDash/Uber Eats/Gopuff (GPS, live ETA, on-time SLAs).

## 30-day AWS curriculum

Day-by-day learning path (planning → SageMaker deployment): `projects/grocery-logistics-de/docs/08-30-day-aws-curriculum.md`. Covers charter through ML endpoint deploy on AWS; ~1–2 hr/day.

## Related
- [grad-jobs-research](grad-jobs-research.md) — the unemployment research + "build real work" rationale this project executes.
- Interview guide: `projects/grocery-logistics-de/docs/07-interview-guide.md`.
- AWS curriculum: `projects/grocery-logistics-de/docs/08-30-day-aws-curriculum.md`.
