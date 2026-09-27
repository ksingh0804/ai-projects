---
title: ARCHIVIST — GitHub guide
type: project
tags: [github, portfolio, guide]
created: 2026-09-27
updated: 2026-09-27
---

# ARCHIVIST

An interactive guide to [github.com/ksingh0804](https://github.com/ksingh0804). It is for an interviewer who has about a minute: who the account belongs to, which three things to open, how the repositories fit together, and which two repos are scratch space.

## Where it lives

| Piece | Path |
|-------|------|
| Page | `docs/guide/` (GitHub Pages serves `docs/` from `master`) |
| Live URL, after this merges | https://ksingh0804.github.io/ai-projects/guide/ |
| Command engine | `docs/guide/engine.js` |
| Tests | `scripts/test-archivist.mjs` |
| Profile README source | `profile/README.md` |

The profile visitors see is the README of `ksingh0804/ksingh0804`. Push access from this workspace is limited to `ai-projects`, so `profile/README.md` is the file to publish into that special repo.

## What a visitor can do

- Press **Start the briefing** or Enter. Four chapters, one card at a time. The second chapter lights Steady, Loan Defaulter, and the logistics agent on the map.
- Click the map: Steady, Loan Defaulter, the logistics agent, Greenleaf, Stutter Coach, Travis Prep, studies, scratch. Opening one replaces the card and puts the link first.
- Type `help`, `open <id>`, `map`, `repos`, `live`, `skills`, `contact`, `pin`, plus `ls` / `cd` / `cat`.
- Turn voice on. It stays off until asked.
- Deep link with `?cmd=open%20steady`.

## What it refuses to claim

FreshCart / `grocery-logistics-de` is a wiki design record. The code is not in the tree, so the guide does not send people there. The stack list is limited to tools in the public code.

## Related

- [Steady](steady-voice.md)
- [Loan Defaulter](loan-defaulter.md)
- [RAG Logistics Agent](rag-logistics-agent.md)
- [Stutter Coach](stutter-coach.md)
