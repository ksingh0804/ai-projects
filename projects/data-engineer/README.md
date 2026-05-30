# Data Engineer

A realistic, month-long simulation of a **Junior Data Engineer** working at a financial firm.
It models a real job: a manager assigns work, the engineer (you) does the work and files a
**detailed daily report**, and a **Performance Coach agent** reviews the month and explains —
**visually** — how the job was performed and what to improve.

> Role: Junior Data Engineer · Company: **Meridian Asset Management** (fictional, ~$8B AUM)
> Manager: **Sarah Chen** · Coach: **Coach Ada** · Period: **June 1–30, 2026**

## What's in here

| Path | What it is |
|------|------------|
| [`scenario.md`](scenario.md) | The real-world setup: company, team, stack, expectations |
| [`personas/manager.md`](personas/manager.md) | Your manager — assigns work, sets standards, reviews reports |
| [`personas/performance-coach.md`](personas/performance-coach.md) | The coach agent — explains your performance visually |
| [`assignments/`](assignments/) | Weekly assignments handed down by the manager |
| [`logs/daily/`](logs/daily/) | **30 daily reports** (day-01 … day-30) you file to your manager |
| [`pipelines/`](pipelines/) | Real, runnable financial ETL/data-quality code (Python) |
| [`sql/`](sql/) | SQL models and checks used on the job |
| [`data/`](data/) | Sample financial data (synthetic) |
| [`reviews/`](reviews/) | Month-end performance review + **visual dashboard** |
| [`scripts/`](scripts/) | Generators that build the logs, metrics, and dashboard |

## Quick start

```bash
cd projects/data-engineer

# 1) Generate synthetic financial data
python3 data/generate_sample_data.py

# 2) Run the daily pipeline (ingest -> transform -> quality -> metrics)
python3 pipelines/run_pipeline.py

# 3) Build the month's daily reports + metrics + coach dashboard
python3 scripts/build_month.py

# 4) Open the visual performance review
open reviews/performance_dashboard.html
```

No third-party packages required — everything runs on the Python 3 standard library
(`csv`, `sqlite3`, `json`, `statistics`, `datetime`).

## The three roles (how the simulation works)

1. **Manager (Sarah Chen)** — Hands out weekly assignments in `assignments/` and expects a
   daily standup-style report every working day.
2. **Junior Data Engineer (you)** — Executes the work in `pipelines/`/`sql/`, then writes a
   detailed daily report in `logs/daily/` covering: assignment, what was done, evidence
   (code/metrics), blockers, and next steps.
3. **Performance Coach (Coach Ada)** — At month end, reads every report + metric and produces
   a **visual** explanation (`reviews/performance_dashboard.html`) of how the job went, with
   strengths, gaps, and a concrete improvement plan.
