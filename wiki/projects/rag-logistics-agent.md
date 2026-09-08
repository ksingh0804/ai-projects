---
title: RAG Logistics Agent
type: project
tags: [rag, langchain, ollama, logistics, chroma, streamlit, tool-calling]
created: 2026-09-08
updated: 2026-09-08
---

# RAG Logistics Agent

Local **tool-calling logistics agent**: grounded SOP search over DeCA-style PDFs, plus EOQ, safety stock, and sample inventory lookup. Streamlit UI; Ollama for chat and embeddings; Chroma for vectors.

## Path

`projects/rag-logistics-agent/`

Source folder was Desktop `logistics-rag-agent` (copied in without `rag-env` / `chroma_db`).

## Architecture

1. `ingest.py` — PDF → chunk → `nomic-embed-text` → Chroma (`chroma_db/`, gitignored)
2. `rag.py` — retrieve top-k → grounded prompt → answer
3. `agent.py` — LangChain tool router over doc search + calculators + SKU lookup
4. `app.py` — Streamlit chat + inventory table

## Interview story

Tool routing + grounding (“I don’t know” when context is thin) + verifiable inventory math. See `docs/interview-prep-guide.md` and the locked interview story PDFs under `docs/`.

## Related

- [loan-defaulter](loan-defaulter.md) — credit-risk ML portfolio piece
- [grocery-logistics-de](grocery-logistics-de.md) — FreshCart data-engineering logistics project (if present on branch)
- Brunel logistics source: [brunel-supply-chain-logistics](../sources/brunel-supply-chain-logistics.md)
