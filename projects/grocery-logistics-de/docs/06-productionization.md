# FreshCart — Productionization (Iteration 5)

Code: [`infra/`](../infra) (Terraform), [`cicd/ci.yml`](../cicd/ci.yml) (GitHub Actions), [`Dockerfile`](../Dockerfile), [`src/ml_features.py`](../src/ml_features.py), [`src/analytics.py`](../src/analytics.py).

## 1. Infrastructure as Code (Terraform)
`infra/main.tf` declares the cloud resources the local project maps to, so the platform is reproducible infrastructure rather than click-ops:

| Resource | Purpose | Local equivalent |
|---|---|---|
| `aws_s3_bucket.lake` (+ versioning + lifecycle) | the lakehouse; **versioning** so bronze is replayable; **lifecycle** archives old raw to Glacier | `data/lake/*.parquet` |
| `aws_msk_serverless_cluster.events` | Kafka topics for order + GPS events | `events.jsonl` |
| `aws_ecr_repository.pipeline` (immutable tags) | registry for the pinned pipeline image | `Dockerfile` |
| `aws_cloudwatch_metric_alarm.freshness_sla` | pages on freshness-SLA breach | the SLA check in `orchestrate.py` |

`env` is validated to `dev|staging|prod`; resources are tagged for cost attribution.

## 2. CI/CD (GitHub Actions)
`cicd/ci.yml` runs on every push/PR: **lint -> test -> build -> plan**. The `test` job is a true **end-to-end smoke**: it generates data, validates contracts, builds the warehouse (which `exit 1`s on any blocking DQ failure), runs the streaming path, and runs the unit + data tests. So a change that breaks an invariant or a contract **fails the build before merge** — the core value of CI for data.

> The workflow lives under `cicd/` (not `.github/workflows/`) on purpose, so it doesn't hijack this monorepo. Copy it to `.github/workflows/` to activate it for a standalone repo.

## 3. Containerization (Docker)
`Dockerfile` builds a pinned, reproducible image (deps cached as a layer). In production MWAA/ECS runs this image per task; the same image runs locally, eliminating "works on my machine."

## 4. Analytics / serving (`analytics.py`)
Materializes the stakeholder KPIs from the charter as `mart.*` views + a `kpis.json` snapshot. Real numbers from a run:

| KPI | Value (sample run) | Stakeholder |
|---|---|---|
| GMV (delivered) | ~$1.31M | Finance |
| Gross margin % | ~25.5% | Finance |
| Avg basket value | ~$72.85 | Finance |
| On-time delivery % | ~91.5% | Operations |
| Avg delivery time | ~31.7 min over ~7.2 km | Operations |
| Stockout rate % | ~8.5% | Supply chain |
| Cold-chain excursions | ~467 (~1.6%) | Compliance |
| Repeat-customer rate % | ~94.8% | Growth |

(Exact values are deterministic for the seeded data and print when you run `python src/analytics.py`.)

## 5. ML feature engineering (`ml_features.py`)
Two leak-free, train-ready feature tables exported to the lake:
- **`feat_eta`** (~18k rows): features known **at dispatch** (distance, vehicle, FC city, day-of-week, basket size) + target `delivery_minutes`. Sanity check: `corr(distance_km, delivery_minutes) = 0.907` — strongly positive, as physics demands. Feeds the customer-facing ETA model.
- **`feat_demand`** (~60k trainable rows): per product x FC x day with `lag_1`, `lag_7`, `roll7_avg`, and a **next-day target** built with window functions. Feeds inventory/demand forecasting.

Both demonstrate **point-in-time correctness** (no future leakage) — the #1 thing that separates a usable feature table from a broken one.

## 6. Scaling & cost (how this grows to real volume)
| Dimension | This demo | At FreshCart scale | The lever |
|---|---|---|---|
| Orders/day | ~900 | millions | Partition gold by `order_date`; cluster/Z-order by FC + product |
| Compute | single DuckDB process | Spark/Snowflake warehouses | scale out; auto-suspend warehouses to control cost |
| Storage format | Parquet files | **Iceberg/Delta** tables | partition pruning + file compaction + time travel |
| Streaming | 1 partition | Kafka topic, many partitions keyed by order_id | partition count = parallelism |
| Cost control | n/a | columnar + partition pruning, lifecycle to Glacier, auto-suspend, spot for batch | scan less, store cold cheap |

Partitioning + file formats are the biggest performance/cost levers: a query for "yesterday's Chicago sales" should scan one partition, not the whole table.

## 7. Reliability patterns baked in
- **Idempotent** transforms (`CREATE OR REPLACE`) -> safe retries.
- **Quarantine, don't drop** -> no silent data loss.
- **Blocking DQ gate** -> bad data never reaches dashboards.
- **Contracts** -> upstream drift caught at the boundary.
- **Freshness SLA + alarm** -> staleness is detected, not discovered by an angry analyst.
- **Backfillable** from immutable bronze -> recover from any logic bug.

Next: how to talk about all of this in an interview — [07-interview-guide.md](07-interview-guide.md).
