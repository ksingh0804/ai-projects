#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
echo "Starting Steady at http://127.0.0.1:8788"
python3 serve.py
