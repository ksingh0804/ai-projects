# Steady for iPhone

Native iOS shell (SwiftUI + `WKWebView`) that runs the Steady web toolkit offline on device.

## Requirements

- macOS with **full Xcode** (App Store) — Command Line Tools alone cannot build iOS apps
- An Apple ID (free) for Simulator / personal device signing

## Open & run

```bash
cd projects/steady-voice
./scripts/sync-ios-www.sh          # refresh bundled web UI after edits
open ios/Steady.xcodeproj
```

In Xcode:

1. Select the **Steady** target → **Signing & Capabilities** → choose your Team
2. Pick an **iPhone 15 / 16 Simulator** (or a plugged-in iPhone)
3. Press **Run** (▶)

## What’s inside

| Piece | Role |
|--------|------|
| `Steady/ContentView.swift` | `WKWebView` loads bundled `www/index.html` |
| `Steady/www/` | Offline copy of the Steady UI (no Reticle) |
| `Info.plist` | Microphone + speech-recognition usage strings for Echo / Practice aloud |

Progress stays on-device (`localStorage`). The desktop `/api/progress` file sync is web-server only.

## iPhone preview without Xcode

With the Steady server running:

[http://127.0.0.1:8788/iphone.html](http://127.0.0.1:8788/iphone.html)

That’s an interactive iPhone frame around the live app (same mobile layout the native shell uses).
