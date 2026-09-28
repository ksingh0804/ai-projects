---
title: SiteFlow Agent Platform
type: project
tags: [siteflow, fastapi, langgraph, rag, construction, aws]
created: 2026-09-26
updated: 2026-09-27
---

# SiteFlow Agent Platform

Construction project-controls assistant for one job: spec and RFI questions, EOQ and safety stock, and schedule-risk holds. React talks only to FastAPI. LangGraph routes a supervisor to a spec agent, a materials agent, or a risk agent, and pauses for approval before a buy or a schedule recommendation.

## Path

`projects/siteflow/`

Study plan: [three-day plan](../../projects/siteflow/docs/three-day-plan.md).

Start-to-end PDF (27 steps, explanation after each): [SiteFlow_start_to_end.pdf](../../projects/siteflow/docs/SiteFlow_start_to_end.pdf).

Source guide (immutable): [SiteFlow agent guide](../sources/siteflow-agent-guide.md).

## Decisions

- Local mode is the default. S3, Bedrock, and DynamoDB are interfaces tested with fakes. `USE_AWS=true` refuses to open a real client by accident.
- EOQ and safety stock match [RAG Logistics Agent](rag-logistics-agent.md) formulas. Order cost is taken from the materials CSV only when one SKU matches, and the answer says so. Holding cost is never copied from unit cost.
- Retrieval is BM25 scoped by `project_id`. No embedding model is shipped in this slice.
- Human approval uses LangGraph `interrupt()` and a SQLite checkpointer. Approval records a decision. It does not place an order or create an RFI.
- Practice files are original and fictional (Cedarline Training Hall, `SYNTH-HALL-01`). `data/sample` is what search reads. `data/artifacts` holds the RFI, submittal, issue, cost, and schedule registers in JSON and CSV. Those registers are not an Autodesk export.
- Empty practice tree for filling in by hand: `projects/siteflow-empty/` (includes `siteflow-empty-skeleton.zip`).

## Related

- [RAG Logistics Agent](rag-logistics-agent.md) — Project 2 tools this reuses
