# RAG Logistics Agent

Local **tool-calling logistics agent** over DeCA-style SOP PDFs plus inventory math tools.

Uses Ollama for chat + embeddings, Chroma for the vector store, and Streamlit for the UI.

## What it does

| Capability | How |
|---|---|
| Policy / SOP Q&A | `search_logistics_docs` — grounded RAG over PDFs in `data/` |
| EOQ | `eoq_calculator` |
| Safety stock | `safety_stock_estimator` |
| SKU lookup | `lookup_sample_inventory` against `data/sample_inventory.csv` |

The agent decides which tool to call. Document answers must come from retrieved context; otherwise it says it does not know.

## Setup

```bash
# Needs Ollama running locally with:
#   ollama pull nomic-embed-text
#   ollama pull <your-chat-model>   # see CHAT_MODEL in rag.py

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Build / refresh the Chroma index from PDFs in data/
python ingest.py

# Streamlit app
streamlit run app.py

# Optional: mock interview coach
streamlit run mock_interview.py
```

`chroma_db/` is generated locally and is gitignored — always run `ingest.py` after cloning.

## Layout

```
rag-logistics-agent/
├── app.py              # Streamlit UI
├── agent.py            # LangChain tool-calling agent
├── rag.py              # Retrieve → prompt → answer
├── ingest.py           # PDF → chunks → Chroma
├── tools.py            # EOQ, safety stock, inventory, doc search
├── data/               # SOP PDFs + sample_inventory.csv
└── docs/               # Interview prep + architecture notes
```

## Interview angle

This is a grounded operations assistant, not a chat toy: tool routing, retrieval grounding, and calculators you can verify by hand. See `docs/interview-prep-guide.md`.
