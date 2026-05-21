---
title: Karpathy LLM Wiki (source summary)
type: source
tags: [karpathy, llm-wiki, source]
created: 2026-05-20
updated: 2026-05-20
source: raw/sources/karpathy-llm-wiki.md
---

# Karpathy LLM Wiki — Source Summary

**Author:** Andrej Karpathy  
**URL:** https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f  
**Local copy:** [raw/sources/karpathy-llm-wiki.md](../../raw/sources/karpathy-llm-wiki.md)

## One-line summary

A pattern where LLMs maintain a persistent, interlinked markdown wiki instead of relying on per-query RAG retrieval.

## Key takeaways

1. **Compounding artifact** — knowledge is compiled once and updated incrementally, not re-derived every question.
2. **Human curates, LLM maintains** — user sources and asks questions; agent summarizes, cross-references, and files.
3. **Three layers** — raw sources (immutable), wiki (LLM-owned), schema (AGENTS.md / CLAUDE.md).
4. **Three operations** — ingest, query, lint.
5. **Index + log** — `index.md` for navigation, `log.md` for timeline.
6. **Git-native** — wiki is markdown in git; version history comes free.

## Applied here

We instantiated this pattern for the `ai-projects` workspace. See [LLM Wiki pattern](../concepts/llm-wiki-pattern.md) and [AGENTS.md](../../AGENTS.md).
