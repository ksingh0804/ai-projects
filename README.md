# Kaustubh Singh — ai-projects

This is the workshop. Newest work lives in `projects/`. An interactive guide explains the whole GitHub — this repo and the standalone ones — in about a minute.

**[Open ARCHIVIST](https://ksingh0804.github.io/ai-projects/guide/)** · [Profile](https://github.com/ksingh0804) · [singhkaustubh85@gmail.com](mailto:singhkaustubh85@gmail.com)

| Open this | What it is |
|-----------|------------|
| [Steady](https://ksingh0804.github.io/ai-projects/) | Live, private, in-browser speech toolkit. Source: `projects/steady-voice/` |
| [Loan Defaulter](https://github.com/ksingh0804/Loan-Defaulter) | Home Credit default risk. A copy also lives in `projects/loan-defaulter/` |
| [RAG Logistics Agent](projects/rag-logistics-agent/) | Local tool-calling agent over SOP documents |
| [Stutter Coach](projects/stutter-coach/) | Browser voice practice with live feedback |
| [Greenleaf Market](https://github.com/ksingh0804/greenleaf-market) | Grocery demo: Next.js 14, FastAPI, SQLite, JWT |

[Travis Prep](https://ksingh0804.github.io/ai-projects/career-launch/) is a live interview-practice page for a library IT role. It sits next to Steady on this site.

The profile README source for `github.com/ksingh0804` is in [`profile/README.md`](profile/README.md).

## Workspace

Each project lives in its own subfolder under `projects/`. This repo is synced to GitHub and maintained with an LLM-powered wiki for navigation and context.

## Structure

```
ai-projects/
├── AGENTS.md          # Wiki schema — how the agent maintains knowledge
├── docs/              # GitHub Pages: Steady at /, ARCHIVIST at /guide/
├── profile/           # README source for the ksingh0804 profile repository
├── wiki/              # LLM-maintained knowledge base (read this first)
├── raw/               # Immutable source documents
└── projects/          # Individual project subfolders (each may have its own repo or live here)
```

## Wiki

See [wiki/overview.md](wiki/overview.md) for the knowledge base. The agent updates the wiki whenever projects are created or changed.

## Projects

| Project | Path | Status |
|---------|------|--------|
| ARCHIVIST | `docs/guide/` | Interactive guide to the GitHub account. Live with GitHub Pages at `/guide/` |
| Stutter Coach | `projects/stutter-coach/` | Free browser voice-practice app — Web Speech API, live coaching, Small Talk + drills, 7-day plan, 4-hour auto-improvement cycle (v1.7.0) |
| Steady | `projects/steady-voice/` | **v2.0.0** free stuttering toolkit — guided session, Echo (DAF), pacing, Daily 50 reading + live coach, Interview Daily 10, CBT/ACT, mobile nav (port 8788). Public site is the Pages root. |
| Loan Defaulter | `projects/loan-defaulter/` | Home Credit PD analysis — imbalanced classification, EXT_SOURCE features, KS/Gini/PR-AUC, cost-weighted threshold. Also published as [Loan-Defaulter](https://github.com/ksingh0804/Loan-Defaulter). |
| RAG Logistics Agent | `projects/rag-logistics-agent/` | Ollama + Chroma tool-calling agent over logistics SOP PDFs (EOQ, safety stock, inventory, grounded Q&A) |
| Daily Python | `projects/daily-python/` | 55 stdlib mini scripts, one per filled August–September 2026 contribution day, each under 30 lines |
