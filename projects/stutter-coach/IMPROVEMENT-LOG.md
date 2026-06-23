# Stutter Coach — Improvement Log

Auto-improvement cycle: **new task every 4 hours**, **different focus every day**.

## Automated 4-hour maintenance

| Script | Purpose |
|--------|---------|
| `scripts/verify-app.mjs` | Smoke tests (files, bundle, `/health`, key UI markers) |
| `scripts/improvement-cycle.mjs` | Verify → auto-fix → bump version → log |
| `scripts/run-cycle.sh` | Run one cycle manually |
| `scripts/auto-cycle-loop.sh` | Background 4-hour agent wake loop |
| `version.json` | Version, iteration, completed improvements, last cycle status |

Manual run:

```bash
cd projects/stutter-coach && ./scripts/run-cycle.sh
```

## Cycle rules

| Layer | Cadence | What changes |
|-------|---------|--------------|
| **4-hour pulse** | 6× per day | Micro-task (~3–10 min): breath, drill, chat, affirmation |
| **Daily mission** | 7 unique days | Monday foundation → Sunday review |
| **Adaptive engine** | Every pulse | Easier if recent avg &lt; 50; harder if avg ≥ 75 |
| **Weekly plan** | 30 min/day | Full structured session (unchanged) |

## Iteration 1 — 2026-06-14

- Added `improvement-cycle.js` — 42 unique day×slot tasks
- Sidebar **4-hour pulse** panel with slot grid + countdown
- **Daily mission** banner at top of practice area
- **Improvement log** in Weekly Performance section
- Pulse completion tracked in `localStorage` (`pulseProgress`)
- Auto-starts Small Talk rounds for conversation pulses

## Next improvements (backlog)

- [ ] Browser notification when new 4-hour slot opens (with permission)
- [ ] Export weekly + pulse report as PDF/text
- [x] Streak counter for consecutive days with 3+ pulses
- [ ] Personalize mission text with user name from settings

## Cycle 1 — 2026-06-23 04:29

- **Version:** 1.6.1 → 1.6.1
- **Status:** ✅ pass
- **Checks:** 26/26 passed
- **Auto-fixes:** none
- **Improvement applied:** Health check endpoint (health-endpoint)
- **Notes:** App verified; version bumped.

### Also shipped this cycle (v1.7.0)

- **Version badge** — footer shows `v1.7.0 · cycle N` and last auto-check time
- **Pulse streak** — sidebar tracks consecutive days with 3+ completed pulses
- **Automation scripts** — `verify-app.mjs`, `improvement-cycle.mjs`, 4-hour loop

