# SiteFlow

Project-controls assistant for one construction job. A project engineer uploads specs, an RFI, and a materials CSV. They ask about the spec, an order quantity, or a hold. A supervisor agent routes the question. High-impact answers wait for Approve or Reject.

This is the reference build for the three-day study plan in [docs/three-day-plan.md](docs/three-day-plan.md). The same path, numbered from the first sentence through the spoken demo, is [docs/SiteFlow_start_to_end.pdf](docs/SiteFlow_start_to_end.pdf). Each step says what to do, then explains where that work sits, why it is built that way, and the tradeoff.

Local mode needs no AWS account and no language model. The math matches Project 2 (`projects/rag-logistics-agent/tools.py`).

## Run

```bash
cd projects/siteflow/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
pytest
uvicorn app.main:app --reload --port 8000
```

The API seeds project `demo` from `data/sample` the first time it starts.

```bash
cd projects/siteflow/frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The dev server proxies `/api` to port 8000.

## Try these three questions

1. What is the lead time language for structural steel?
2. If rebar demand is 12,000 units and holding cost is $4, what EOQ should we use?
3. Which open RFIs block the foundation pour?

Question 2 and question 3 return an approval card. Approving records the decision. It does not place an order.

## Layout

```
backend/app/tools/inventory.py     EOQ, safety stock, SKU table
backend/app/rag/                   chunking, BM25, PDF ingest
backend/app/agents/                supervisor, specialists, LangGraph
backend/app/api/                   documents, chat, approvals
backend/tests/                     pytest for each of those blocks
frontend/src/                      React UI, talks only to FastAPI
eval/questions.json                12 gold questions
infra/iam-siteflow.json            least-privilege S3 policy
```
