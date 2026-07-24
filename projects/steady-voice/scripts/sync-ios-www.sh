#!/usr/bin/env bash
# Copy Steady web assets into the iOS app bundle folder.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WWW="$ROOT/ios/Steady/www"
mkdir -p "$WWW"
cp "$ROOT/index.html" "$ROOT/styles.css" "$ROOT/content.js" "$ROOT/audio.js" \
   "$ROOT/progress-tracker.js" "$ROOT/app.js" "$ROOT/favicon.svg" "$ROOT/version.json" "$WWW/"
python3 - <<PY
from pathlib import Path
p = Path("$WWW/index.html")
html = p.read_text()
html = html.replace('<script type="module" src="reticle-dev.js?v=6"></script>\\n', "")
html = html.replace('<script type="module" src="reticle-dev.js?v=5"></script>\\n', "")
if "viewport-fit=cover" not in html:
    html = html.replace(
        'content="width=device-width, initial-scale=1.0"',
        'content="width=device-width, initial-scale=1.0, viewport-fit=cover"',
    )
p.write_text(html)
print("Synced iOS www →", p.parent)
PY
