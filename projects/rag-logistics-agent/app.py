"""Streamlit UI for the logistics RAG agent."""

from __future__ import annotations

import csv
from pathlib import Path
from typing import Any

import streamlit as st

from agent import ask_agent_with_trace
from rag import CHAT_MODEL, CHROMA_DIR, COLLECTION, EMBED_MODEL, TOP_K, ask_with_context, get_vectorstore
from timing import configure_logging, timed
from tools import INVENTORY_CSV

configure_logging()

ROOT = Path(__file__).parent
DATA_DIR = ROOT / "data"

EXAMPLE_QUESTIONS = [
    "Look up SKU-1002 — are we below reorder point?",
    "Calculate EOQ for 12,000 units/year, $50 order cost, $2 holding cost per unit.",
    "Estimate safety stock with demand std 20, lead time 5 days, z-score 1.65.",
    "What are the cold chain handling requirements in DeCA SOP-07?",
    "What steps are required when receiving damaged merchandise?",
]

TOOL_CATALOG = [
    ("eoq_calculator", "EOQ math from demand, order cost, holding cost"),
    ("safety_stock_estimator", "Buffer stock from demand std, lead time, z-score"),
    ("lookup_sample_inventory", "Mock SKU on-hand / reorder lookup"),
    ("search_logistics_docs", "Grounded search over ingested SOP PDFs"),
]


def load_inventory_rows() -> list[dict[str, Any]]:
    if not INVENTORY_CSV.exists():
        return []
    with INVENTORY_CSV.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


@st.cache_data(show_spinner=False)
def project_stats() -> dict[str, int]:
    pdf_count = len(list(DATA_DIR.rglob("*.pdf")))
    chunk_count = 0
    if CHROMA_DIR.exists():
        try:
            chunk_count = get_vectorstore()._collection.count()
        except Exception:
            chunk_count = 0
    return {"pdfs": pdf_count, "chunks": chunk_count}


def init_session_state() -> None:
    defaults = {
        "messages": [],
        "mode": "Agent (tools + docs)",
        "show_trace": True,
        "top_k": TOP_K,
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


def render_trace(trace: dict[str, Any]) -> None:
    tool_calls = trace.get("tool_calls") or []
    chunks = trace.get("chunks") or []

    if tool_calls:
        st.markdown("**Agent tool trace**")
        for index, call in enumerate(tool_calls, start=1):
            with st.expander(f"{index}. `{call.get('name')}`", expanded=index == 1):
                st.markdown("**Arguments**")
                st.json(call.get("args") or {})
                if call.get("result"):
                    st.markdown("**Result**")
                    st.code(str(call["result"]))

    if chunks:
        st.markdown("**Retrieved document chunks**")
        for index, chunk in enumerate(chunks, start=1):
            page = chunk.get("page")
            page_note = f" · page {page}" if page is not None else ""
            with st.expander(f"{index}. {chunk.get('filename')}{page_note}", expanded=index == 1):
                st.markdown(chunk.get("content", ""))


def run_question(question: str) -> dict[str, Any]:
    mode = st.session_state.mode
    with timed(f"run_question [{mode}]"):
        if mode == "RAG only (docs)":
            result = ask_with_context(question, k=st.session_state.top_k)
            return {
                "answer": result["answer"],
                "trace": {"chunks": result["chunks"]},
            }

        result = ask_agent_with_trace(question)
        return {
            "answer": result["answer"],
            "trace": {"tool_calls": result["tool_calls"]},
        }


def render_sidebar(stats: dict[str, int]) -> None:
    with st.sidebar:
        st.title("Logistics RAG")
        st.caption("DeCA-style ops assistant — tools, inventory, and grounded SOP search.")

        st.markdown("### Mode")
        st.session_state.mode = st.radio(
            "How should questions be handled?",
            ["Agent (tools + docs)", "RAG only (docs)"],
            index=0 if st.session_state.mode.startswith("Agent") else 1,
            label_visibility="collapsed",
        )
        st.session_state.show_trace = st.toggle("Show tool / retrieval trace", value=st.session_state.show_trace)
        if st.session_state.mode == "RAG only (docs)":
            st.session_state.top_k = st.slider("Top-k chunks", min_value=1, max_value=8, value=st.session_state.top_k)

        st.divider()
        st.markdown("### Project snapshot")
        col_a, col_b = st.columns(2)
        col_a.metric("PDFs in data/", stats["pdfs"])
        col_b.metric("Chroma chunks", stats["chunks"])

        st.markdown(
            f"""
            **Models**
            - Chat: `{CHAT_MODEL}`
            - Embeddings: `{EMBED_MODEL}`
            - Collection: `{COLLECTION}`
            """
        )

        st.divider()
        st.markdown("### Agent tools")
        for name, description in TOOL_CATALOG:
            st.markdown(f"- **`{name}`** — {description}")

        inventory = load_inventory_rows()
        if inventory:
            st.divider()
            st.markdown("### Sample inventory")
            st.dataframe(inventory, width="stretch", hide_index=True)

        st.divider()
        st.markdown("### Try a scenario")
        for question in EXAMPLE_QUESTIONS:
            if st.button(question, width="stretch", key=f"example::{question}"):
                st.session_state.pending_question = question


def render_architecture() -> None:
    st.markdown(
        """
        ```mermaid
        flowchart LR
            U[User question] --> A[Streamlit UI]
            A --> M{Mode}
            M -->|Agent| G[LangChain agent]
            M -->|RAG only| R[Retrieval chain]
            G --> T1[EOQ calculator]
            G --> T2[Safety stock]
            G --> T3[Inventory lookup]
            G --> T4[Doc search]
            T4 --> C[(Chroma DB)]
            R --> C
            G --> L[Ollama LLM]
            R --> L
        ```
        """
    )


def main() -> None:
    st.set_page_config(
        page_title="Logistics RAG Agent",
        page_icon="📦",
        layout="wide",
        initial_sidebar_state="expanded",
    )
    init_session_state()
    stats = project_stats()

    render_sidebar(stats)

    st.title("📦 Logistics RAG Agent")
    st.markdown(
        "Ask about **inventory**, run **EOQ / safety-stock math**, or search **DeCA SOP PDFs** — "
        "the agent routes each question to the right tool."
    )

    tab_chat, tab_overview = st.tabs(["Chat", "Architecture"])

    with tab_overview:
        st.subheader("How it works")
        render_architecture()
        st.markdown(
            """
            1. **Ingest** — PDFs in `data/` are chunked and embedded into Chroma (`ingest.py`).
            2. **Agent** — The LLM picks calculators, inventory lookup, or document search (`agent.py`).
            3. **Grounded answers** — Policy questions use retrieved SOP context only (`rag.py`).
            """
        )
        st.info("Run the CLI with `python cli.py` for terminal use.")

    with tab_chat:
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])
                if message.get("trace") and st.session_state.show_trace:
                    render_trace(message["trace"])

        pending = st.session_state.pop("pending_question", None)
        prompt = st.chat_input("Ask about inventory, EOQ, safety stock, or SOP procedures…")
        question = pending or prompt

        if question:
            st.session_state.messages.append({"role": "user", "content": question})
            with st.chat_message("user"):
                st.markdown(question)

            with st.chat_message("assistant"):
                with st.spinner("Thinking…"):
                    try:
                        result = run_question(question)
                    except Exception as exc:
                        st.error(f"Request failed: {exc}")
                        st.session_state.messages.pop()
                        st.stop()

                st.markdown(result["answer"])
                trace = result.get("trace")
                if trace and st.session_state.show_trace:
                    render_trace(trace)

            st.session_state.messages.append(
                {
                    "role": "assistant",
                    "content": result["answer"],
                    "trace": result.get("trace"),
                }
            )

        if st.session_state.messages:
            if st.button("Clear chat"):
                st.session_state.messages = []
                st.rerun()


if __name__ == "__main__":
    main()
