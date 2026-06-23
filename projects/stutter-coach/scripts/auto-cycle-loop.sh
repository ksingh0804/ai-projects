#!/usr/bin/env bash
# Background loop: wake agent every 4 hours to run the Stutter Coach improvement cycle.
INTERVAL_SEC=$((4 * 60 * 60))
PROMPT='Run Stutter Coach 4-hour maintenance: cd /Users/ilkay1/ai-projects/projects/stutter-coach && node scripts/improvement-cycle.mjs. If verify fails, fix broken code, apply next item from scripts/improvements-queue.json not yet in version.json completedImprovements, rebuild bundle (npx esbuild), restart server, append IMPROVEMENT-LOG.md.'

echo "Stutter Coach auto-cycle armed — every 4h"
echo "First tick in 4 hours ($(date -v+4H 2>/dev/null || date -d '+4 hours' 2>/dev/null || echo '4h from now'))"

while true; do
  sleep "$INTERVAL_SEC"
  echo "AGENT_LOOP_TICK_stutter-coach {\"prompt\":\"$PROMPT\"}"
done
