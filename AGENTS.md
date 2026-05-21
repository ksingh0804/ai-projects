# AI Projects — Agent Schema

You are the maintainer of this workspace and its LLM wiki. Follow this schema on every session.

## Purpose

This repo (`/Users/ilkay1/ai-projects`) is the home workspace for all AI projects. Each project gets a subfolder under `projects/`. The wiki is your persistent memory — update it whenever you create, modify, or learn something about a project.

Pattern inspired by [Andrej Karpathy's LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

## Three layers

1. **`raw/`** — Immutable sources. Never edit files here after ingestion. Copy external docs, specs, and references here.
2. **`wiki/`** — Your knowledge base. You own this layer. Create and update markdown pages with cross-links.
3. **`AGENTS.md`** (this file) — Schema and workflows. Co-evolve with the user as patterns emerge.

## Directory conventions

```
wiki/
├── index.md              # Catalog of all wiki pages (update on every change)
├── log.md                # Append-only chronological log
├── overview.md           # High-level workspace summary
├── concepts/             # Reusable concepts and patterns
├── projects/             # One page per project (+ subpages as needed)
└── sources/              # Summaries of ingested raw sources

raw/
├── sources/              # External documents (articles, specs, etc.)
└── assets/               # Images and attachments

projects/
└── <project-name>/       # Actual project code and files
```

## Wiki page format

Every wiki page should include YAML frontmatter:

```yaml
---
title: Page Title
type: project | concept | source | overview
tags: [tag1, tag2]
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

Use `[[wiki-link]]` style links between pages (Obsidian-compatible): `[Display text](projects/my-project.md)`.

## Required workflows

### On every project change (create, modify, delete)

1. Read `wiki/index.md` to understand current state.
2. Update or create the relevant page under `wiki/projects/`.
3. Update `wiki/index.md` with the new/changed page entry.
4. Append to `wiki/log.md`:
   ```
   ## [YYYY-MM-DD] project | <action> | <project-name>
   - What changed
   - Files touched
   ```
5. Update `README.md` projects table if a project was added or removed.

### On ingest (new source document)

1. Save original to `raw/sources/` (do not modify after save).
2. Create summary at `wiki/sources/<slug>.md`.
3. Update related concept/project pages with new information.
4. Update `wiki/index.md` and append to `wiki/log.md`.

### On query

1. Read `wiki/index.md` first to locate relevant pages.
2. Read those pages, synthesize answer with citations.
3. If the answer is valuable and reusable, file it as a new wiki page.

### Periodic lint (when asked or wiki feels stale)

Check for: contradictions, stale claims, orphan pages, missing cross-references, concepts without pages.

## GitHub sync

- Root repo: `https://github.com/ksingh0804/ai-projects`
- Push after meaningful wiki or project changes unless the user says otherwise.
- New projects: create subfolder under `projects/`, document in wiki, commit and push.

## Session startup

1. Read `wiki/overview.md` and `wiki/index.md`.
2. Check `wiki/log.md` tail for recent activity.
3. Proceed with the user's task, updating the wiki as you go.
