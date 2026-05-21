# ai-projects

Personal AI project workspace. Each project lives in its own subfolder under `projects/`. This repo is synced to GitHub and maintained with an LLM-powered wiki for navigation and context.

## Structure

```
ai-projects/
├── AGENTS.md          # Wiki schema — how the agent maintains knowledge
├── wiki/              # LLM-maintained knowledge base (read this first)
├── raw/               # Immutable source documents
└── projects/          # Individual project subfolders (each may have its own repo or live here)
```

## Wiki

See [wiki/overview.md](wiki/overview.md) for the knowledge base. The agent updates the wiki whenever projects are created or changed.

## Projects

| Project | Path | Status |
|---------|------|--------|
| [VoxForge](projects/voxforge.md) | `projects/voxforge/` | Voice UI live — game generation next |
