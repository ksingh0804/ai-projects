# Stutter Coach

Free, browser-based voice practice for stuttering — instant feedback using the **Web Speech API** (no API keys, no account).

## Quick start (Chrome)

```bash
cd projects/stutter-coach
./start.sh
```

This starts the server and opens **Google Chrome** at:

**http://127.0.0.1:8787**

Use that exact URL every time. Chrome treats `localhost` and `127.0.0.1` as different sites, so mic permissions do not carry over if you switch.

### If Chrome still fails

1. **Do not** open `index.html` directly (`file://` blocks the microphone).
2. Allow mic: Chrome address bar → lock icon → **Site settings** → **Microphone** → **Allow**.
3. macOS: **System Settings → Privacy & Security → Microphone → Google Chrome** enabled.
4. Stay on **`http://127.0.0.1:8787`** (not another port).
5. Chrome speech needs **internet** (audio is transcribed via Google's service).

Manual server:

```bash
python3 serve.py
```

## Small Talk mode (two-way)

1. Select **Small Talk** in the sidebar
2. Tap **Start round** — the coach speaks first (TTS)
3. Tap the **mic** and respond naturally
4. Get instant feedback in the chat + score card
5. Coach acknowledges and asks the next question — loop repeats
6. End of round: summary + **Another round** (gets slightly harder)

Toggle **Auto-continue after feedback** to keep the conversation flowing hands-free.

## 4-hour improvement pulse + daily missions

The app **improves practice every 4 hours** with a new micro-task, and **each day of the week has a different focus**:

| Day | Mission |
|-----|---------|
| Mon | Foundation — calm starts |
| Tue | Consonants — P, B, T, K |
| Wed | Pace — slow reading |
| Thu | Recovery — low pressure |
| Fri | Power — hardest sounds |
| Sat | Integration — real-life mix |
| Sun | Review — evaluate & celebrate |

**6 pulses per day** (every 4 hours): Dawn, Morning, Afternoon, Evening, etc.

1. Check the **Daily mission** banner and **4-hour pulse** sidebar
2. Tap **Do this pulse** (~5 min) — task adapts to your recent scores
3. Complete it → logged in **4-hour improvement log**
4. Still do the **30-min daily plan** when you have time

See [`IMPROVEMENT-LOG.md`](IMPROVEMENT-LOG.md) for the improvement cycle backlog.

## Kosta's 7-day weekly plan (30 min/day)

A structured week mixing Small Talk, drills, breathing, and a light rest day. Full minute-by-minute schedule: [`weekly-plan.md`](weekly-plan.md).

| Day | Focus |
|-----|--------|
| Mon | Foundation — breathing, gentle onset, first small talk |
| Tue | Hard consonants + meeting intro |
| Wed | Slow reading + longer conversation |
| Thu | **Light day** — low pressure, acceptance |
| Fri | Power drills — plosives + mixed |
| Sat | Integration — reading + real-world phrases |
| Sun | Review + weekly evaluation |

### Track progress in the app

1. **Kosta's week** (sidebar) — 7-day checklist; check off each day after your 30-minute session.
2. **Today's plan** — minute-by-minute schedule for the current day.
3. **Weekly performance** (below practice history) — auto-generated from `localStorage`:
   - Scorecard: sessions, avg score, avg tension, days checked
   - Best / toughest day, tension trend
   - Daily score bar chart + tension line chart
   - End-of-week evaluation summary

1. Pick an exercise (Introduction, Gentle Onset, Slow Reading, Hard Consonants, or your custom words).
2. Read the prompt on screen — optional TTS reads it aloud.
3. **Tap the mic**, speak the phrase, **tap again** when done.
4. Get instant feedback:
   - Fluency score (0–100)
   - Word-match accuracy
   - Detected repetitions, prolongations, fillers
   - Actionable tips (gentle onset, slow pace, chunking)
5. Rate your tension (1–10) and move to the next prompt.
6. Progress is saved locally in your browser.

## Exercises

| Exercise | Focus |
|----------|--------|
| Introduction | Baseline name + opener |
| Gentle Onset | Ease into first sounds |
| Slow Reading | Half-speed phrases with pauses |
| Hard Consonants | P, B, T, K triggers |
| Your Words | Custom challenge words you add |

## Tips

- Use **localhost** — mic access is blocked on `file://` in most browsers.
- Speak clearly; the app compares your speech to the target phrase.
- Practice daily like Hrithik Roshan: short, consistent sessions beat long rare ones.
- Pair this with a speech-language pathologist for best results.

## Tech

- Web Speech API (`SpeechRecognition` + `SpeechSynthesis`)
- Vanilla HTML/CSS/JS — no build step
- `localStorage` for history, settings, and weekly plan checkoffs
- `weekly-plan.js` — plan data + week evaluation from session history

## Browser support

| Browser | Speech recognition |
|---------|-------------------|
| Chrome | ✅ Best |
| Edge | ✅ Good |
| Safari | ⚠️ Limited |
| Firefox | ❌ Not supported |
