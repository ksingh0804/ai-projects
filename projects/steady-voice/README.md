# Steady — a free toolkit for people who stutter

**Speak on your terms.** Steady is a free, private web app that bundles useful, *evidence-based* tools for people who stutter (PWS). No accounts, no paid APIs — everything runs in your browser.

> Steady is **not** medical advice and does not replace a speech-language pathologist (SLP).

## Try it online

Public site (GitHub Pages): **https://ksingh0804.github.io/ai-projects/**

iPhone-framed preview: **https://ksingh0804.github.io/ai-projects/iphone.html**

Open in **Chrome** or **Safari**. Allow the microphone if you try Echo or Practice aloud. Wired headphones recommended for Echo.

## Quick start (local)

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
| **Reading** | Paced reading + **Practice aloud** with live speech tips, score, and next-time corrections. Daily 50 topics + custom text. | Daily practice + transfer |
| **Interview** | **Daily 10** data-engineering interview questions and speakable answers; any answer can be sent into Reading practice. | Career prep + speech carryover |
| **Talk** | Two-way daily-life conversations (coffee, pharmacy, checkout…). Partner uses free browser TTS; you reply with mic or type. | Carryover / real-world speaking |
| **Describe** | Structured picture description (who / where / action / details) then practice in Reading. | Narrative speech practice |
| **Confidence** | CBT/ACT tools: an avoidance-reduction (exposure) ladder, thought reframing, and a self-disclosure ("advertising") script builder. | CBT/ACT for social anxiety & avoidance |
| **Learn** | Facts vs myths and pointers to professional help. | Public-health facts |
| **Progress** | Streaks, activity log, and **live PERSONAL-PROGRESS.md** with trend + next-time focus (rewritten after every check-in). | Consistency + carry-over corrections |

## Personal progress (live file)

Every reading-aloud round and check-in:

1. Posts to `POST /api/progress` on the local server
2. Rewrites **`PERSONAL-PROGRESS.md`** (human-readable) and `data/personal-progress.json`
3. Shows **Next-time focus** tips on the Progress tab

Open the Progress tab or read `projects/steady-voice/PERSONAL-PROGRESS.md` while you practice — it updates in real time.

## Design principles

- **Respectful & accurate**: stuttering is neurological/genetic, not caused by anxiety or any personal failing. No "cure" promises.
- **Fluency *and* acceptance**: both speaking-skill tools and emotional/avoidance tools.
- **Private by default**: no network calls; data stays on your device.
- **Accessible**: keyboard navigation (`G`, `1`–`0`), ARIA labels, large-text toggle, reduced-motion support, mobile bottom nav.

## Production (v2.0.0)

See [`PRODUCTION.md`](PRODUCTION.md) for the deploy checklist. Improvement history: [`IMPROVEMENT-LOG.md`](IMPROVEMENT-LOG.md).

```bash
node scripts/verify-app.mjs   # server must be on :8788
```

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
