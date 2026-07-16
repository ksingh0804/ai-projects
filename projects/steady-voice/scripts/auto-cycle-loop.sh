#!/usr/bin/env bash
# Local reminder loop (optional). Prefer Cursor Automation for unattended daily runs.
# Interval: 24 hours.
INTERVAL_SEC=$((24 * 60 * 60))
PROMPT='Run Steady Day improvement cycle for /Users/ilkay1/ai-projects/projects/steady-voice:

1. Read scripts/improvements-queue.json and version.json (completedImprovements, day).
2. Implement the NEXT uncompleted queue item with real interactive UX/code (not just marking done).
3. Day 5 must ship production-ready Steady (PRODUCTION.md, verify green, polish, remove temp helpers).
4. Run: node scripts/verify-app.mjs (fix failures).
5. Run: node scripts/improvement-cycle.mjs --mark-id=<completed-id>
6. Update wiki/projects/steady-voice.md and wiki/log.md.
7. Commit only Steady-related files if asked; otherwise leave ready to commit.'

echo "Steady 5-day auto-cycle armed — every 24h"
while true; do
  sleep "$INTERVAL_SEC"
  echo "AGENT_LOOP_TICK_steady-voice {\"prompt\":\"$PROMPT\"}"
done
