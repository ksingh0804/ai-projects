# FreshCart — Interview Guide (How to land the DE job with this project)

This project is built to be *talked about*. Below is how to present it and the exact
questions it lets you answer with "I built that," not "I read about that."

## 1. The 60-second pitch
> "I built FreshCart, an end-to-end data platform for an online-grocery + last-mile
> delivery company. It ingests batch source extracts and a real-time event stream into
> a medallion lakehouse, conforms them into a Kimball star schema, and serves analytics,
> real-time order ETAs, and ML features. It's gated by data-quality checks and data
> contracts, orchestrated as a DAG with retries and a freshness SLA, tested in CI, and
> deployable via Terraform + Docker. Everything runs locally for $0 but every component
> maps to a production tool — DuckDB->Snowflake, my micro-batch loop->Kafka+Flink,
> my DAG runner->Airflow."

## 2. Project facts you can quote (from real runs)
- ~200k source rows across 9 systems; 26,983 orders / 118,624 order lines after cleaning.
- 57 bad rows quarantined (null FC, future timestamps, non-positive qty/price); **0 silently dropped**.
- 12/12 data-quality checks pass; the run `exit 1`s if a blocking check fails.
- Streaming: 8 at-least-once duplicates deduped, 5 late events to a side-output, ETA MAE ~5 min.
- Business KPIs from gold: ~$1.31M GMV, ~25.5% margin, **91.5% on-time** delivery, 8.5% stockout rate, ~1.6% cold-chain excursions.
- ML: `corr(distance, delivery_minutes) = 0.907`; ~60k leak-free demand-forecast training rows.

## 3. Map to the most common DE interview questions

| Interview question | Where this project answers it |
|---|---|
| "Design a data warehouse / star schema." | `docs/02-data-model.md` — facts, dims, **grain**, surrogate keys, conformed dims, SCD2. |
| "ETL vs ELT?" | `docs/03` — ELT with medallion; why bronze is immutable + replayable. |
| "How do you handle data quality?" | `dq.py` (blocking vs warn), quarantine, + `contracts/` for schema drift. |
| "Explain event time vs processing time / watermarks." | `docs/04` + `stream_processor.py` — event-time windows, watermark, allowed lateness, side-output. |
| "Exactly-once?" | idempotent dedup on `event_id` turning at-least-once into exactly-once **effect**. |
| "SCD Type 2?" | `docs/02` §4 — where price/tier history matters and how the surrogate key enables it. |
| "How do you orchestrate / handle failures?" | `orchestrate.py` — DAG, topological order, retries, downstream short-circuit, SLA. |
| "How would this scale / control cost?" | `docs/06` §6 — partitioning, Iceberg/Delta, warehouse auto-suspend, Glacier lifecycle. |
| "Write a SQL query for X." | `analytics.py` — GMV, on-time %, stockout, repeat-rate, top categories, daily trend. |
| "Feature engineering / point-in-time correctness?" | `ml_features.py` — lags/rolling windows, dispatch-time-only ETA features. |
| "How do you test data pipelines?" | `tests/` — data invariants + pure-logic unit tests, run in CI. |

## 4. Two deep-dive stories to rehearse
**A. "A bad upstream load almost hit the dashboards."**
Tell how silver quarantines null-FC / clock-skewed / negative-quantity rows, the blocking DQ gate fails the run, and contracts would have caught a renamed column at the boundary. Shows you think about *trust*, not just moving bytes.

**B. "Real-time ETA was wrong during a rush."**
Tell how out-of-order GPS pings made processing-time windows wrong, so you switched to event-time + watermark + allowed lateness with a late side-output, and you monitor ETA MAE to know when to retrain. Shows real streaming depth.

## 5. How it maps to specific companies
- **Instacart / Amazon Fresh / Walmart** — orders, catalog, inventory, fulfillment-center modeling, demand forecasting.
- **DoorDash / Uber Eats / Gopuff / Getir** — real-time driver GPS, live ETA, on-time SLAs, dispatch.
- **Any cold-chain grocer** — the temperature-excursion compliance facts.

## 6. Suggested resume bullets
- Built an end-to-end grocery/logistics **lakehouse** (medallion bronze/silver/gold) over ~200k-row multi-source data with a Kimball **star schema** in SQL/DuckDB (ports to Snowflake/dbt).
- Implemented a **streaming** processor with event-time windowing, **watermarks**, exactly-once dedup, and live-ETA state; ETA MAE ~5 min.
- Added a **data-quality** engine + **data contracts** with blocking gates and row quarantine; **0** silent data loss.
- Orchestrated with a dependency **DAG** (retries, SLA), **tested** in **CI**, deployable via **Terraform + Docker**.
- Shipped **ML feature** tables (leak-free lags/rolling windows) for ETA + demand forecasting.

## 7. What to build next (to go even further)
- Swap the SQL into real **dbt** models + dbt tests.
- Run the batch layer on **Spark** and the stream on **Flink/Spark Structured Streaming**.
- Convert gold to **Iceberg/Delta** with partitioning + time travel.
- Add a small **dashboard** (Streamlit/Superset) over `mart.*` and train the ETA model from `feat_eta`.
