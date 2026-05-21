---
title: Workspace Overview
type: overview
tags: [workspace, meta]
created: 2026-05-20
updated: 2026-05-20
---

# AI Projects Workspace

Personal home for AI-assisted projects, synced to GitHub at [ksingh0804/ai-projects](https://github.com/ksingh0804/ai-projects).

## What this is

A monorepo-style workspace where each project lives in `projects/<name>/`. An [LLM wiki](concepts/llm-wiki-pattern.md) tracks context, decisions, and cross-project knowledge so agents can pick up where they left off.

## Current state

- **Created:** 2026-05-20
- **Projects:** 0 (ready for first project)
- **Wiki pages:** See [index.md](index.md)

## Key links

- [LLM Wiki pattern](concepts/llm-wiki-pattern.md) — how this knowledge base works
- [Agent schema](../AGENTS.md) — rules for maintaining the wiki
- [Activity log](log.md) — chronological history

## Conventions

- Projects go in `projects/<kebab-case-name>/`
- Agent updates wiki on every meaningful change
- Raw sources are immutable in `raw/sources/`
