# Steady — a free toolkit for people who stutter

**Speak on your terms.** Steady is a free, private, offline web app that bundles the most useful, *evidence-based* tools for people who stutter (PWS). No accounts, no paid APIs, nothing uploaded — everything runs in your browser and saves only to your device.

It was designed from a [research synthesis](../../wiki/sources/stuttering-research.md) of the stuttering literature (therapy approaches, rhythm/pacing, altered auditory feedback, and the psychology of avoidance).

> Steady is **not** medical advice and does not replace a speech-language pathologist (SLP). It works best alongside one.

## Quick start

```bash
cd projects/steady-voice
./start.sh
```

Then open **http://127.0.0.1:8788** in Chrome or Edge.

- Use that exact URL (the mic is blocked on `file://`).
- For the **Echo (DAF)** tool, **use wired headphones** — otherwise you'll get feedback squeal, and Bluetooth adds unreliable lag.

Manual server: `python3 serve.py`

## What's inside (and why)

| Tool | What it does | Grounded in |
|------|--------------|-------------|
| **Echo (DAF)** | Real-time altered auditory feedback — delay (DAF), pitch shift (FAF), amplification (AAF), and masking (MAF). Helps ~1 in 3 slow down and unblock. | Altered auditory feedback research |
| **Pacing** | Metronome + visual pulse for rhythmic / syllable-timed speech — one of the strongest fluency inducers (choral/rhythm effect). | Metronome & choral-speech studies |
| **Breathing** | Guided belly-breathing (box, 4-7-8, speech-breath) to steady airflow and reduce tension. | Fluency shaping |
| **Techniques** | Trainers for gentle onset, prolonged/stretched speech, continuous phonation, light contact, pausing — plus modification: preparatory set, pull-out, cancellation. Each with steps and tap-to-hear drills. | Fluency shaping + Van Riper modification |
| **Reading** | Paced reading with a moving word highlight at adjustable WPM; pair it with Echo or the metronome. | Daily practice + transfer |
| **Confidence** | CBT/ACT tools: an avoidance-reduction (exposure) ladder, thought reframing, and a self-disclosure ("advertising") script builder. | CBT/ACT for social anxiety & avoidance |
| **Learn** | Facts vs myths and pointers to professional help. | Public-health facts |
| **Progress** | Private streaks, session log, brave-challenge and fears-faced counts (localStorage). | Consistency > duration |

## Design principles

- **Respectful & accurate**: stuttering is neurological/genetic, not caused by anxiety or any personal failing. No "cure" promises.
- **Fluency *and* acceptance**: both speaking-skill tools and emotional/avoidance tools.
- **Private by default**: no network calls; data stays on your device.
- **Accessible**: keyboard navigation, ARIA labels, large-text toggle, reduced-motion support, mobile layout.

## Tech

- Vanilla HTML/CSS/JS — no build step.
- **Web Audio API** for the DAF/FAF/MAF/AAF engine (`audio.js`) and metronome; a pure-Web-Audio "Jungle" pitch shifter powers FAF.
- **SpeechSynthesis** for "hear it" drills.
- `localStorage` for private progress.

## Files

| File | Purpose |
|------|---------|
| `index.html` | App shell and all views |
| `styles.css` | Calm, accessible UI |
| `content.js` | Techniques, passages, facts, CBT/ACT content, breathing patterns |
| `audio.js` | Web Audio engine (DAF/FAF/MAF/AAF) + metronome + pitch shifter |
| `app.js` | Navigation, state, and wiring for every tool |
| `serve.py` / `start.sh` | Local dev server (port 8788) |

## Browser support

| Browser | DAF / Audio | TTS |
|---------|-------------|-----|
| Chrome  | ✅ Best | ✅ |
| Edge    | ✅ Good | ✅ |
| Safari  | ⚠️ Works, some quirks | ✅ |
| Firefox | ✅ Audio works | ✅ |
