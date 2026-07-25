---
title: Activity Log
type: overview
tags: [log, meta]
created: 2026-05-20
updated: 2026-07-15
---

# Activity Log

Append-only record of wiki and workspace changes.

## [2026-07-15] project | update | steady-voice (v2.0.0 production)

- Shipped 5-day interactive → production plan: guided mission, richer live coach, onboarding/mobile, hardening, PRODUCTION.md.
- Also includes Interview Daily 10, live PERSONAL-PROGRESS sync, and expanded verify suite.
- Removed temp shot helpers; verify green; version.json at 2.0.0.
- Files: `projects/steady-voice/**`, `wiki/projects/steady-voice.md`, `wiki/index.md`, `README.md`

## [2026-07-14] project | enhance | steady-voice (data engineering interview Daily 10)

- Added Interview tab with 10 daily data-engineering Q&A cards from a 30-question bank.
- Answers can be heard or sent into Reading for paced/live-feedback rehearsal.

## [2026-07-13] project | enhance | steady-voice (live progress + real-time feedback)

- PERSONAL-PROGRESS.md live updates via POST /api/progress; Practice aloud with live coach tips and next-time corrections.


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

## [2026-07-24] project | publish | career-launch (GitHub Pages interview site)

- Published **Travis Prep** interactive interview practice site under `docs/career-launch/` for GitHub Pages.
- Features: 10-question mock interview with draft answers, CAC role-play, quick-fire flashcards, questions to ask them.
- Live URL: https://ksingh0804.github.io/ai-projects/career-launch/
- Files: `docs/career-launch/{index.html,styles.css,app.js,README.md}`, `projects/career-launch/README.md`, `wiki/projects/career-launch.md`

## [2026-07-22] project | enhance | career-launch (Travis Library interview prep)

- Added practical interview scenario Q&A for **Technical Information Specialist** at Library Travis AFB (PC triage, printers, CAC/OPSEC, prioritization, behavioral STAR hooks).
- Files: `projects/career-launch/jobs/travis-afb-library-tis-interview.md`, `wiki/projects/career-launch.md`

## [2026-07-22] project | enhance | steady-voice (Describe picture)

- Added **Describe** tab: structured who/where/action/details prompts for offline SVG scenes, model answer reveal, practice in Reading.
- Files: `content.js`, `index.html`, `app.js`, `styles.css`, `scripts/verify-app.mjs`, `wiki/projects/steady-voice.md`

## [2026-07-23] project | add | steady-voice (iOS app shell + iPhone preview)

- Added SwiftUI + WKWebView iOS project at `ios/Steady.xcodeproj` bundling offline `www/` UI.
- Added live iPhone frame preview: `iphone.html`. Sync script: `scripts/sync-ios-www.sh`.
- Mobile CSS: safe-area insets for notch/home indicator.

## [2026-07-23] project | publish | steady-voice (GitHub Pages)

- Added GitHub Actions workflow to deploy Steady as a public website for sharing.
- Pages URL target: https://ksingh0804.github.io/ai-projects/
- Also added iOS shell + Describe tab + iPhone preview in this ship.

## [2026-07-23] project | enhance | steady-voice (coach bar UI)

- Replaced the cramped “Guided session in progress” pill with a clearer bottom coach card: step kicker, progress track, title + tip, Mark done / Continue, and pause (×).
- Files: `index.html`, `styles.css`, `app.js`, synced `docs/` + iOS `www/`.

## [2026-07-23] project | enhance | steady-voice (Describe UI)

- Restyled Describe: scene stage with caption chips, numbered 2×2 prompt cards, fill counter, clearer actions and model grid.
- Files: `index.html`, `styles.css`, `app.js`, synced `docs/` + iOS `www/`.

## [2026-07-24] project | add | steady-voice (Talk conversations)

- Added **Talk** tab: 8 human-like daily-life two-way scenarios using free browser Speech Synthesis (partner) + Speech Recognition (user), with type fallback.
- Version bump 2.1.0. Files: `content.js`, `index.html`, `styles.css`, `app.js`, verify, wiki, docs/iOS sync.
