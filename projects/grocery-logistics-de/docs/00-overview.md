# FreshCart Data Platform — Project Charter & Overview

> An end-to-end, **runnable** data engineering project in the **grocery + last-mile logistics** domain, built to be portfolio-grade and to mirror how real companies (Instacart, Amazon Fresh, Walmart, Gopuff, DoorDash, Getir) run their data platforms.

## 1. The business (why this domain is great for a DE portfolio)

**FreshCart** is a fictional online-grocery + last-mile delivery company. You order groceries in an app; items are picked at a nearby **dark store / fulfillment center (FC)**, then a **driver** delivers within a **promised time window**.

Grocery + logistics is an *ideal* portfolio domain because it forces you to handle every hard thing a data engineer is hired to do:

| Hard problem | Where it shows up at FreshCart | Real company analog |
|---|---|---|
| High-volume **transactional** data | orders, order_items | Instacart order DB |
| **Streaming / real-time** events | driver GPS pings, order-status events | DoorDash live ETA |
| **Slowly changing** reference data | product price/cost changes, customer tier changes | Walmart item master |
| **Cold-chain / IoT** sensor data | freezer/fridge temperature readings | Amazon Fresh compliance |
| **Geospatial** logistics | distance, routes, on-time delivery | Uber/Gopuff routing |
| **Data quality at scale** | dupes, orphans, negatives, clock skew | every real CDC pipeline |
| **Perishable inventory** | on-hand, reserved, spoilage risk | grocery WMS |

## 2. What we are building (one sentence)

A **medallion lakehouse** (bronze -> silver -> gold) that ingests batch source extracts and a real-time event stream, conforms them into a **dimensional star schema**, guards them with **data-quality contracts**, serves **analytics + ML features**, and is wrapped in **orchestration, tests, CI/CD, and infra-as-code** — exactly the layers a hiring manager wants to see.

## 3. Stakeholders & the questions they ask (drives the data model)

| Stakeholder | Decision they need data for | KPI we must serve |
|---|---|---|
| Operations | Are we hitting promised delivery windows? | **On-time delivery %**, avg delivery minutes |
| Supply chain | Will we stock out of milk in Chicago tomorrow? | Days-of-supply, stockout rate |
| Finance | What's our contribution margin per order? | GMV, basket size, margin |
| Growth/Marketing | Which customers are churning? | Repeat rate, cohort retention |
| Compliance | Did any cold-chain item break temperature? | Temperature-excursion events |

Every gold-layer table below exists to answer one of these.

## 4. Source systems (what a DE actually receives)

The generator (`src/generate_data.py`) simulates extracts from FreshCart's microservices:

| Source system | Tables | Cadence in real life |
|---|---|---|
| OMS (Order Mgmt) | `orders`, `order_items` | CDC stream / hourly batch |
| Catalog service | `products`, `suppliers` | daily snapshot |
| WMS (Warehouse) | `inventory_snapshots` | daily snapshot + events |
| Dispatch/Logistics | `deliveries`, `drivers` | CDC stream |
| CRM | `customers` | daily snapshot |
| Telemetry | `data/streaming/*.jsonl` (Iteration 3) | real-time stream |

Real source data is **messy**, so the generator injects the exact defects production pipelines must survive: duplicate rows (at-least-once CDC), NULLs, negative/zero quantities, orphan foreign keys, temperature excursions, and clock-skewed timestamps. The silver layer + DQ checks (Iteration 2 & 4) are what catch them.

## 5. The 5 build iterations (this project's roadmap)

1. **Foundation** — charter, architecture, star-schema design, runnable data generator. *(this iteration)*
2. **Batch ELT** — bronze ingest -> silver clean/conform -> gold dimensional models, with quarantine.
3. **Streaming** — real-time order + GPS events, live ETA & inventory via micro-batch (maps to Kafka + Flink).
4. **Orchestration + data quality + observability** — a dependency-aware DAG, data contracts, tests, freshness SLAs, lineage, run metrics.
5. **Productionize** — IaC (Terraform), CI/CD (GitHub Actions), Docker, analytics/KPIs, ML feature examples, scaling & cost, and an **interview talking-points guide**.

## 6. How to run

```bash
cd projects/grocery-logistics-de
pip install -r requirements.txt
python src/generate_data.py        # 1. create source extracts (~200k rows)
python src/run_pipeline.py         # 2. bronze->silver->gold + DQ (Iteration 2)
# Iteration 3+: python src/stream_simulator.py / python src/orchestrate.py
```

See [01-architecture.md](01-architecture.md) for the system design and [02-data-model.md](02-data-model.md) for the schema.
