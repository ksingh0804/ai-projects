---
title: Stutter Coach
type: project
tags: [stuttering, speech-therapy, voice, web-app, accessibility]
created: 2026-06-14
updated: 2026-06-23
---

# Stutter Coach

Free browser app for **stuttering voice practice** with instant feedback. Built for interactive coaching without paid APIs.

## Location

`projects/stutter-coach/`

## What it does

- Uses the browser **Web Speech API** (free) for speech-to-text
- **Single bundled script** (`app.bundle.js`) — no ES module imports; works reliably in Chrome via `./start.sh`
- **Text-to-speech** reads prompts aloud
- **4-hour improvement pulse** — new micro-task every 4 hours (6/day), different daily mission Mon–Sun, adaptive difficulty from recent scores
- Five exercise modes plus **two-way Small Talk** with TTS coach, STT replies, feedback loop, and repeating rounds
- **Kosta's 7-day weekly plan** (30 min/day) with sidebar day tracker and **Weekly Performance** dashboard
- **4-hour improvement log** tracks pulse completions and adaptations
- **Real-time live coach** — analyzes speech while you talk (pace, repetitions, fillers, word progress, instant tips)
- Local progress history (`localStorage`)

## Run locally

```bash
cd projects/stutter-coach && ./start.sh
```

Open http://127.0.0.1:8787 in Chrome or Edge.

## Plans

- [`weekly-plan.md`](../../projects/stutter-coach/weekly-plan.md) — 30 min/day structured sessions
- [`IMPROVEMENT-LOG.md`](../../projects/stutter-coach/IMPROVEMENT-LOG.md) — 4-hour cycle rules and backlog

## Files

| File | Purpose |
|------|---------|
| `index.html` | App shell |
| `styles.css` | Calm UI + weekly/performance/pulse panels |
| `app.js` | Speech recognition, analysis, exercises, pulse UI |
| `conversation.js` | Small Talk scenarios and turn analysis |
| `weekly-plan.js` | 7-day plan data + week evaluation |
| `improvement-cycle.js` | 4-hour pulses, daily missions, adaptation |
| `weekly-plan.md` | Human-readable plan for Kosta |
| `IMPROVEMENT-LOG.md` | Improvement cycle log |
| `README.md` | Usage |
