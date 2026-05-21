---
title: LLM Wiki Pattern
type: concept
tags: [llm, wiki, knowledge-base, karpathy]
created: 2026-05-20
updated: 2026-05-20
---

# LLM Wiki Pattern

Source: [Andrej Karpathy's gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) — see [full summary](../sources/karpathy-llm-wiki.md).

## Core idea

Instead of RAG (retrieve chunks on every query), the LLM **incrementally builds and maintains a persistent wiki** — interlinked markdown files that compound over time.

| RAG | LLM Wiki |
|-----|----------|
| Rediscover knowledge each query | Knowledge compiled once, kept current |
| No accumulation | Cross-references, contradictions flagged upfront |
| Chat history is ephemeral | Wiki is a durable artifact |

## Three layers

1. **Raw sources** — immutable inputs in `raw/`
2. **Wiki** — LLM-generated markdown in `wiki/`
3. **Schema** — `AGENTS.md` defines structure and workflows

## Operations

- **Ingest** — add source → summarize → update entity/concept pages → log
- **Query** — read index → read relevant pages → answer with citations → optionally file answer back
- **Lint** — check contradictions, orphans, stale claims, missing links

## Special files

- `wiki/index.md` — content catalog (read first on queries)
- `wiki/log.md` — chronological append-only history

## Why we use it here

This workspace will accumulate many projects. The wiki lets any agent session quickly understand what exists, what changed, and where to find things — without re-scanning entire codebases.

Related: [workspace overview](../overview.md), [agent schema](../../AGENTS.md)
