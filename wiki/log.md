---
title: Activity Log
type: overview
tags: [log, meta]
created: 2026-05-20
updated: 2026-05-20
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
