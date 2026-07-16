#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/verify-app.mjs
node scripts/improvement-cycle.mjs "$@"
