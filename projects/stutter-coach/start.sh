#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
echo "Building app.bundle.js…"
npx --yes esbuild app.js --bundle --format=iife --outfile=app.bundle.js
echo "Starting server at http://127.0.0.1:8787"
python3 serve.py
