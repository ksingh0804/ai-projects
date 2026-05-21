---
title: VoxForge
type: project
tags: [voice, games, openai, react]
created: 2026-05-20
updated: 2026-05-20
---

# VoxForge — Voice Game Studio

**Path:** [`projects/voxforge/`](../../projects/voxforge/)  
**Tagline:** Forge browser games with your voice.

## Status

Phase 1 complete — voice interface (listen + speak). Game generation logic comes next.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + TypeScript |
| Voice STT/TTS | Browser Web Speech API (free) |
| Chat | Ollama (free local) → built-in fallback → optional OpenAI |
| Games | `projects/voxforge/games/<slug>/` |

## Run locally

```bash
cd projects/voxforge
npm install && npm run dev
```

Optional free smart chat: `ollama pull llama3.2`

→ http://127.0.0.1:5173

## UI

- **Left panel:** VoxForge branding, **Ask me** voice button, game switcher (+ new game)
- **Main stage:** voice orb, transcript, game preview iframe

## Voice flow

1. Click **Ask me** → browser listens (free)
2. Speak → Web Speech transcribes
3. Chat reply (Ollama or fallback)
4. Browser speaks reply aloud (free)

## GitHub deploy (planned)

Static client → GitHub Pages; API needs serverless or separate host.
