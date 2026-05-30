---
title: Activity Log
type: overview
tags: [log, meta]
created: 2026-05-20
updated: 2026-05-29
---

# Activity Log

Append-only record of wiki and workspace changes.

## [2026-05-20] setup | workspace initialization

- Created `/Users/ilkay1/ai-projects` as home workspace
- Initialized LLM wiki following [Karpathy's LLM Wiki pattern](sources/karpathy-llm-wiki.md)
- Added `AGENTS.md` schema, wiki structure, raw sources
- Synced to GitHub: `ksingh0804/ai-projects`
- Projects folder ready; no projects yet

## [2026-05-20] utility | keep-mac-awake script

- Added `scripts/keep-on.sh` — thin wrapper around `caffeinate -d`
- Documented in [concepts/keep-mac-awake.md](concepts/keep-mac-awake.md)

## [2026-05-20] project | create | voxforge

- Created `projects/voxforge/` — voice game studio (React + Express)
- Voice UI: Ask me button, Whisper STT, TTS reply, multi-game context switcher
- Games stored in `projects/voxforge/games/<slug>/`
- See [projects/voxforge.md](projects/voxforge.md)

## [2026-05-29] project | create | data-engineer

- Created `projects/data-engineer/` — month-long Junior Data Engineer simulation (fictional
  finance firm "Meridian Asset Management")
- Three roles: Manager (Sarah Chen) assigns work + 4 weekly assignments; engineer files 30
  daily reports (`logs/daily/`); Performance Coach (Coach Ada) gives a visual month-end review
- Runnable financial ETL: `data/generate_sample_data.py` + `pipelines/` (ingest → transform →
  data-quality suite → portfolio metrics) on a local SQLite warehouse; lands green 6/6 DQ checks
- `scripts/build_month.py` generates the daily reports + `reviews/metrics.json` +
  `reviews/performance_dashboard.html` (Chart.js): tasks, EOD freshness, DQ trend, runtime
  5.4s→1.0s, skills radar, coach scores
- Verified pipeline runs and dashboard renders (screenshot saved to `reviews/dashboard_preview.png`)
- Files touched: new project tree under `projects/data-engineer/`; wiki page; index/log/README
- See [projects/data-engineer.md](projects/data-engineer.md)
