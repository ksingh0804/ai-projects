---
title: Data Engineer
type: project
tags: [project, data-engineering, finance, simulation, etl, data-quality]
created: 2026-05-29
updated: 2026-05-29
---

# Data Engineer

A month-long **simulation** of a Junior Data Engineer at a financial firm (fictional
**Meridian Asset Management**, ~$8B AUM). Models the real job loop: a **manager** assigns work,
the engineer files a **detailed daily report**, and a **Performance Coach agent** reviews the
month with a **visual dashboard**.

- **Path:** `projects/data-engineer/`
- **Period simulated:** June 1–30, 2026 (22 working days)
- **Stack:** Python 3 stdlib only (csv, sqlite3, json) + Chart.js (CDN) for the dashboard

## The three roles

| Role | Who | Responsibility | File |
|------|-----|----------------|------|
| Manager | Sarah Chen | Assigns weekly work, expects daily reports | [personas/manager.md](../../projects/data-engineer/personas/manager.md) |
| Junior Data Engineer | (me) | Does the work, files daily reports | [logs/daily/](../../projects/data-engineer/logs/daily/) |
| Performance Coach | Coach Ada | Visual month-end performance review | [personas/performance-coach.md](../../projects/data-engineer/personas/performance-coach.md) |

## What's real (runnable) vs. simulated

- **Runnable:** `data/generate_sample_data.py` → `pipelines/run_pipeline.py` (ingest →
  transform → data-quality → metrics) writing to a local SQLite warehouse. The DQ suite
  catches injected issues and quarantines bad rows; pipeline lands green (6/6 checks).
- **Simulated:** the 30 daily reports and month metrics, authored in `scripts/build_month.py`
  and rendered to `logs/daily/*.md` + `reviews/performance_dashboard.html`.

## Month story (what the dashboard shows)

- 22/22 tasks shipped; **90.9% EOD on-time** (2 early SLA breaches, none after Week 2).
- **8** data-quality issues caught before reaching PM-facing tables.
- Pipeline runtime **5.4s → 1.0s** (≈5×) after Week-4 set-based SQL + indexing.
- **Superpower:** communication (cleanest reports, blockers raised before noon).
- **Biggest lever:** test-first data quality (2 bugs caught by hand-checks cost the only breaches).

## How to run

```bash
cd projects/data-engineer
python3 data/generate_sample_data.py
python3 pipelines/run_pipeline.py
python3 scripts/build_month.py
open reviews/performance_dashboard.html
```

## Key files

- [README.md](../../projects/data-engineer/README.md) · [scenario.md](../../projects/data-engineer/scenario.md)
- [scripts/build_month.py](../../projects/data-engineer/scripts/build_month.py) — month plan + report/dashboard generator
- [reviews/coach_notes.md](../../projects/data-engineer/reviews/coach_notes.md) — written coaching narrative
- [reviews/performance_dashboard.html](../../projects/data-engineer/reviews/performance_dashboard.html) — the visual review
