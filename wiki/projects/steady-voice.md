---
title: Steady
type: project
tags: [stuttering, speech-therapy, daf, cbt, act, web-app, accessibility]
created: 2026-06-28
updated: 2026-06-28
---

# Steady

A free, private, offline web toolkit for **people who stutter (PWS)**, built from a fresh [research synthesis](../sources/stuttering-research.md). Designed to complement an SLP, not replace one.

## Location

`projects/steady-voice/`

## Why it exists

Research showed the highest-evidence, broadly-useful, hard-to-find-free tools are: **altered auditory feedback**, **rhythmic/syllable-timed pacing**, **guided breathing + technique trainers**, and a **CBT/ACT confidence toolkit**. The existing [Stutter Coach](stutter-coach.md) focuses on speech-to-text scoring/coaching; Steady fills these complementary gaps with a calm, respectful, myth-busting experience.

## What it does

- **Echo (DAF)** — real-time altered auditory feedback via Web Audio: delay (DAF), pitch shift (FAF, pure-Web-Audio "Jungle" shifter), amplification (AAF), masking noise (MAF). Wired-headphone notice.
- **Pacing** — metronome + visual pulse for rhythmic / syllable-timed speech (one of the strongest fluency inducers).
- **Breathing** — guided belly breathing (box, 4-7-8, speech-breath) with an animated orb.
- **Techniques** — trainers for gentle onset, prolonged speech, continuous phonation, light contact, pausing (fluency shaping) + preparatory set, pull-out, cancellation (Van Riper modification), each with steps and tap-to-hear drills.
- **Reading** — paced reading with moving word highlight at adjustable WPM; combine with Echo/metronome.
- **Confidence** — avoidance-reduction (exposure) ladder with SUDS, CBT thought reframing, self-disclosure ("advertising") script builder.
- **Learn** — facts vs myths + links to professional help.
- **Progress** — private streaks, session log, brave-challenge and fears-faced counts (`localStorage`).

## Run locally

```bash
cd projects/steady-voice && ./start.sh
```

Open http://127.0.0.1:8788 in Chrome or Edge. Use **wired headphones** for Echo.

## Design principles

Respectful & accurate (neurological/genetic, not anxiety-caused, no "cure" claims); fluency **and** acceptance; private by default (no network calls); accessible (keyboard, ARIA, large-text toggle, reduced-motion, mobile).

## Files

| File | Purpose |
|------|---------|
| `index.html` | App shell + all views |
| `styles.css` | Calm, accessible UI |
| `content.js` | Techniques, passages, facts, CBT/ACT content, breathing patterns |
| `audio.js` | Web Audio engine (DAF/FAF/MAF/AAF) + metronome + pitch shifter |
| `app.js` | Navigation, state, wiring |
| `serve.py` / `start.sh` | Local dev server (port 8788) |
| `README.md` | Usage |

## Related

- Research: [Stuttering — Research Synthesis](../sources/stuttering-research.md)
- Sibling app: [Stutter Coach](stutter-coach.md) (STT scoring/coaching focus)
