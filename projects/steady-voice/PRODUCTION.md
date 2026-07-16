# Steady — Production checklist (Day 5 target)

This file is the Day-5 deliverable checklist. Days 1–4 fill the interactive experience; Day 5 freezes a shippable build.

## Must be green before production send

- [x] Guided session (Home → Start today's session)
- [x] Reading aloud + PERSONAL-PROGRESS.md live updates
- [x] Interview Daily 10 + Practice in Reading + 60s timer
- [x] Echo (DAF) persists across tabs; wired-headphones warning visible
- [x] Onboarding, week streak calendar, mobile bottom nav
- [x] Echo + Pace combo, last-round tip banner, live coach encouragement
- [x] Offline banner + mic error banner
- [x] Disclaimer present (not medical advice / use with SLP)
- [x] `node scripts/verify-app.mjs` → ALL CHECKS PASSED (run before ship)
- [x] `GET /health` returns version **2.0.0**
- [x] No temporary `_shots/` / `shot.mjs` helpers in the release tree
- [x] `version.json` at **2.0.0** with all 5 queue items completed

## Production CSP (static host without Reticle)

```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
img-src 'self' data:; connect-src 'self'; media-src 'self';
worker-src 'none'; object-src 'none'; base-uri 'self'
```

Omit `reticle-dev.js` from the production HTML if you want the stricter policy.

## Run locally (production-like)

```bash
cd projects/steady-voice
python3 serve.py
# open http://127.0.0.1:8788
```

## Suggested host options

- Static host of HTML/CSS/JS **plus** a tiny Node/Python process for `/api/progress` and `/health`, **or**
- Disable file sync and keep browser-only `localStorage` if you cannot run a server.

## Privacy

All progress is local. No third-party analytics. Speech recognition (Chrome) may use the browser's cloud STT — document that for users.
