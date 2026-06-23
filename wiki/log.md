---
title: Activity Log
type: overview
tags: [log, meta]
created: 2026-05-20
updated: 2026-06-23
---

# Activity Log

Append-only record of wiki and workspace changes.

## [2026-05-20] setup | workspace initialization

- Created `/Users/ilkay1/ai-projects` as home workspace
- Initialized LLM wiki following [Karpathy's LLM Wiki pattern](sources/karpathy-llm-wiki.md)
- Added `AGENTS.md` schema, wiki structure, raw sources
- Synced to GitHub: `ksingh0804/ai-projects`
- Projects folder ready; no projects yet

## [2026-06-15] project | add | grocery-logistics-de (30-day AWS curriculum)

- Added `docs/08-30-day-aws-curriculum.md`: day-by-day learning path from charter through SageMaker ML deployment on AWS (~1–2 hr/day, 30 days).
- Updated wiki page with curriculum cross-link.
- Files touched: `projects/grocery-logistics-de/docs/08-30-day-aws-curriculum.md`, `wiki/projects/grocery-logistics-de.md`, `wiki/log.md`

## [2026-06-23] project | add | stutter-coach

- Added **Stutter Coach** — free browser voice-practice app (Web Speech API, no API keys).
- Exercises: Live Coach, Small Talk, Introduction, Gentle Onset, Slow Reading, Hard Consonants, custom challenge words.
- Real-time live coaching, 7-day weekly plan, 4-hour pulse system, bundled `app.bundle.js`.
- Automated 4-hour verify/fix/improve cycle (`scripts/`), `/health` endpoint, `version.json` v1.7.0, pulse streak counter.
- Files: `projects/stutter-coach/**`, `wiki/projects/stutter-coach.md`, `wiki/index.md`, `README.md`
