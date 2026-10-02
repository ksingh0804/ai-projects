---
title: SiteFlow
type: project
tags: [siteflow, langgraph, fastapi, react, interview, construction]
created: 2026-10-02
updated: 2026-10-02
---

# SiteFlow

Mentor course for the SiteFlow Agent Platform capstone. The lesson is the product right now: formulas, function contracts, and an interview script. A worked backend lives in `answer-key/` and is opened only after a step fails twice.

## Path

`projects/siteflow/`

| File | Role |
|------|------|
| [MENTOR.md](../../projects/siteflow/MENTOR.md) | Step-by-step class |
| [FORMULAS.md](../../projects/siteflow/FORMULAS.md) | EOQ, safety stock, reorder point |
| [ANSWER_KEYS.md](../../projects/siteflow/ANSWER_KEYS.md) | Map from a step to the worked file |
| `data/sample/` | Fictional Harbor School Gym Addition documents |
| `answer-key/backend/` | Reference FastAPI + LangGraph app. 17 pytest checks passed on 2026-10-02 |

## Formulas reused from Project 2

```
EOQ = sqrt(2 * D * S / H)
safety_stock = z * demand_std * sqrt(lead_time)
reorder_point = average_demand_per_period * lead_time + safety_stock
```

Worked checks: D=12000, S=50, H=4 → EOQ 547.72. std=20 per day, lead=9 days, z=1.65 → safety stock 99.

## Status

The student writes `projects/siteflow/backend/` and `frontend/` by following the mentor file. Those app folders are not created yet on purpose.

## Related

- [SiteFlow Agent Guide](../sources/siteflow-agent-guide.md) — ingested brief
- [RAG Logistics Agent](rag-logistics-agent.md) — prior tool-calling agent
