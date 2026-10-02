# Answer key map

Open a file only after that step’s check fails twice. Type the code into `backend/` (the folder you create in Step 2). Do not import from `answer-key/` in the app you demo.

| Step | Read this file |
|------|----------------|
| 3 Math tools | `answer-key/backend/app/paths.py`, `answer-key/backend/app/tools/inventory.py`, `answer-key/backend/tests/test_inventory.py` |
| 5 Health | `answer-key/backend/app/main.py` |
| 6 Upload | `answer-key/backend/app/api/docs.py`, `answer-key/backend/tests/test_api.py` |
| 7 Ingest | `answer-key/backend/app/rag/ingest.py`, `answer-key/backend/app/rag/retriever.py`, `answer-key/backend/tests/test_chunk.py` |
| 8 State | `answer-key/backend/app/agents/state.py` |
| 9 Specialists | `answer-key/backend/app/agents/spec_agent.py`, `materials_agent.py`, `risk_agent.py`, `tests/test_agents.py` |
| 10 Supervisor | `answer-key/backend/app/agents/supervisor.py`, `tests/test_router.py` |
| 11 Graph | `answer-key/backend/app/agents/graph.py` |
| 12 Chat and approval | `answer-key/backend/app/api/chat.py`, `approvals.py` |
| 13 React | `answer-key/frontend/src/` |
| 14 AWS | `answer-key/backend/app/aws/s3.py`, `bedrock.py`, `answer-key/infra/iam-siteflow.json` |
| 15 Eval | `answer-key/eval/questions.json` |

The formulas those files use are in [FORMULAS.md](FORMULAS.md). If a number is wrong, fix the formula before you fix the agent.
