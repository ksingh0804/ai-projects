#!/usr/bin/env bash
# Run one 4-hour improvement cycle (verify → fix → improve → bump version → log).
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/improvement-cycle.mjs "$@"
