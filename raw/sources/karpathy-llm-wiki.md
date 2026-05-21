# LLM Wiki

A pattern for building personal knowledge bases using LLMs.

Source: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f  
Author: Andrej Karpathy  
Retrieved: 2026-05-20

---

## The core idea

Most people's experience with LLMs and documents looks like RAG: you upload a collection of files, the LLM retrieves relevant chunks at query time, and generates an answer. This works, but the LLM is rediscovering knowledge from scratch on every question. There's no accumulation.

The idea here is different. Instead of just retrieving from raw documents at query time, the LLM **incrementally builds and maintains a persistent wiki** — a structured, interlinked collection of markdown files that sits between you and the raw sources.

**The wiki is a persistent, compounding artifact.** The cross-references are already there. The contradictions have already been flagged. The synthesis already reflects everything you've read.

You never (or rarely) write the wiki yourself — the LLM writes and maintains all of it. Obsidian is the IDE; the LLM is the programmer; the wiki is the codebase.

## Architecture

Three layers:

1. **Raw sources** — immutable source of truth
2. **The wiki** — LLM-generated markdown files
3. **The schema** — AGENTS.md / CLAUDE.md configuration

## Operations

- **Ingest** — process new sources, update wiki pages, log
- **Query** — search wiki, synthesize with citations, file good answers back
- **Lint** — health-check for contradictions, orphans, stale claims

## Indexing and logging

- **index.md** — content catalog
- **log.md** — append-only chronological record

## Why this works

Humans abandon wikis because maintenance burden grows faster than value. LLMs don't get bored and can touch 15 files in one pass. The human curates sources and asks questions; the LLM does the bookkeeping.

Related to Vannevar Bush's Memex (1945) — private, curated knowledge with associative trails. The LLM solves the maintenance problem Bush couldn't.
