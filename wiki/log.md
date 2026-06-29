---
title: Activity Log
type: overview
tags: [log, meta]
created: 2026-05-20
updated: 2026-06-28
---

# Activity Log

Append-only record of wiki and workspace changes.

## [2026-06-28] project | enhance | steady-voice (more reading content)

- Expanded the Reading section from 4 to 17 passages, tagged by level: Easy, Onsets (easy-onset/vowel), Real life (coffee, phone, intro, small talk, interview), Harder (consonant clusters, numbers, addresses), and two longer Story passages for stamina/phrasing.
- Passage dropdown now shows the level tag (e.g. "Real life · Answering the phone").
- Files: `projects/steady-voice/content.js`, `projects/steady-voice/app.js`.

## [2026-06-28] project | add | steady-voice (Steady)

- Did a fresh web-research pass on stuttering and captured it in `wiki/sources/stuttering-research.md` (facts/epidemiology, fluency shaping vs. Van Riper modification, rhythm/choral/metronome, DAF/FAF/MAF/AAF, CBT/ACT & avoidance reduction, practice principles, app-market gaps).
- Built new **Steady** app filling the highest-evidence gaps vs. Stutter Coach: real-time altered auditory feedback (Web Audio DAF + pure-Web-Audio "Jungle" FAF pitch shifter + AAF + MAF), rhythmic pacing metronome with visual pulse, guided breathing, fluency-shaping + modification technique trainers, paced reading, and a CBT/ACT confidence toolkit (exposure ladder, thought reframe, self-disclosure builder). Private localStorage progress; accessible; respectful/no-cure tone.
- Verified: JS/PY syntax checks pass; dev server (port 8788) serves all assets 200 with localhost→127.0.0.1 redirect; all app.js element IDs exist in index.html.
- Files: `projects/steady-voice/{index.html,styles.css,content.js,audio.js,app.js,serve.py,start.sh,favicon.svg,README.md}`, `wiki/sources/stuttering-research.md`, `wiki/projects/steady-voice.md`, `wiki/index.md`, `README.md`.

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
