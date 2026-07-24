---
title: Steady
type: project
tags: [stuttering, speech-therapy, daf, cbt, act, web-app, accessibility]
created: 2026-06-28
updated: 2026-07-23
---

# Steady

A free, private, offline web toolkit for **people who stutter (PWS)**, built from a fresh [research synthesis](../sources/stuttering-research.md). Designed to complement an SLP, not replace one.

## Location

`projects/steady-voice/`

## Why it exists

Research showed the highest-evidence, broadly-useful, hard-to-find-free tools are: **altered auditory feedback**, **rhythmic/syllable-timed pacing**, **guided breathing + technique trainers**, and a **CBT/ACT confidence toolkit**. The existing [Stutter Coach](stutter-coach.md) focuses on speech-to-text scoring/coaching; Steady fills these complementary gaps with a calm, respectful, myth-busting experience.

## What it does

- **Guided session** — Home walkthrough (breathe → technique → reading → interview → check-in) with a card-style coach bar (step label, tip, progress, Mark done / Continue, pause); press `G` to start.
- **Echo (DAF)** — real-time altered auditory feedback via Web Audio: delay (DAF), pitch shift (FAF, pure-Web-Audio "Jungle" shifter), amplification (AAF), masking noise (MAF). Wired-headphone notice. **Echo + Pace** one-click combo from Reading.
- **Pacing** — metronome + visual pulse for rhythmic / syllable-timed speech (one of the strongest fluency inducers).
- **Breathing** — guided belly breathing (box, 4-7-8, speech-breath) with an animated orb.
- **Techniques** — trainers for gentle onset, prolonged speech, continuous phonation, light contact, pausing (fluency shaping) + preparatory set, pull-out, cancellation (Van Riper modification), each with steps and tap-to-hear drills.
- **Reading** — paced reading with moving word highlight; **Practice aloud** with live STT coach tips, mid-session encouragement, score, and next-time corrections; last-round tip banner; Daily 50 topics + custom text.
- **Interview** — **Daily 10** data-engineering interview Q&A; try-first then reveal; 60s practice timer; answers into Reading for paced/live-feedback rehearsal.
- **Describe** — structured picture description (who / where / action / details) with a staged picture card, numbered prompt grid, fill counter, and model answer — then practice again in Reading.
- **Confidence** — avoidance-reduction (exposure) ladder with SUDS, CBT thought reframing, self-disclosure ("advertising") script builder.
- **Learn** — facts vs myths + links to professional help.
- **Progress** — streaks + week calendar, activity log (`localStorage`) and **live `PERSONAL-PROGRESS.md`** via `/api/progress`.
- **Production (v2.0.0)** — onboarding, mobile bottom nav, offline/error banners, CSP, `PRODUCTION.md` deploy checklist, verify suite.

## Run locally

```bash
cd projects/steady-voice && ./start.sh
```

Open http://127.0.0.1:8788 in Chrome or Edge. Use **wired headphones** for Echo.

Ship checklist: `PRODUCTION.md`. Verify: `node scripts/verify-app.mjs`.

## iOS app

SwiftUI + WKWebView shell at `projects/steady-voice/ios/Steady.xcodeproj` (bundles offline `www/`). Live iPhone frame preview: `http://127.0.0.1:8788/iphone.html`. See `ios/README.md` (needs full Xcode to build Simulator).

## Design principles

Respectful & accurate (neurological/genetic, not anxiety-caused, no "cure" claims); fluency **and** acceptance; private by default; accessible (keyboard, ARIA, large-text, reduced-motion, mobile).

## 5-day improvement plan

Queue: `scripts/improvements-queue.json`. Cycle marker: `scripts/improvement-cycle.mjs`. All five days completed → **v2.0.0**.

| File | Purpose |
|------|---------|
| `index.html` | App shell + all views |
| `styles.css` | Calm, accessible UI |
| `content.js` | Techniques, passages, facts, CBT/ACT content, breathing patterns |
| `audio.js` | Web Audio engine (DAF/FAF/MAF/AAF) + metronome + pitch shifter |
| `progress-tracker.js` | Speech analysis, live tips, next-time corrections, markdown formatter |
| `PERSONAL-PROGRESS.md` | Live personal improvement file (rewritten after each check-in) |
| `app.js` | Navigation, state, wiring |
| `serve.py` / `start.sh` | Local server (port 8788) + `/health` + `POST/GET /api/progress` |
| `PRODUCTION.md` | Production deploy checklist |
| `version.json` / `IMPROVEMENT-LOG.md` | Version + cycle history |
| `scripts/` | verify + improvement cycle |
| `reticle-dev.js` / `.reticle.json` | [Reticle](https://reticle.sh) dev SDK for agent UI verification |
| `README.md` | Usage |

## Related

- Research: [Stuttering — Research Synthesis](../sources/stuttering-research.md)
- Sibling app: [Stutter Coach](stutter-coach.md) (STT scoring/coaching focus)
