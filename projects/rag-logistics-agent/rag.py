"""LCEL RAG chain: retrieve top-k → log chunks → grounded prompt → answer."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import Runnable, RunnableLambda, RunnablePassthrough
from langchain_ollama import ChatOllama, OllamaEmbeddings

from prompts import GROUNDED_PROMPT
from timing import timed

logger = logging.getLogger("logistics_rag")

CHROMA_DIR = Path(__file__).parent / "chroma_db"
COLLECTION = "logistics_docs"
EMBED_MODEL = "nomic-embed-text"
CHAT_MODEL = "llama3.1:8b"
TOP_K = 4


def get_vectorstore() -> Chroma:
    with timed("get_vectorstore"):
        return Chroma(
            persist_directory=str(CHROMA_DIR),
            embedding_function=OllamaEmbeddings(model=EMBED_MODEL),
            collection_name=COLLECTION,
        )


def format_docs(docs: list[Document]) -> str:
    if not docs:
        return "(No relevant context retrieved.)"

    parts: list[str] = []
    for i, doc in enumerate(docs, start=1):
        name = doc.metadata.get("filename") or Path(
            doc.metadata.get("source", "unknown")
        ).name
        page = doc.metadata.get("page")
        page_note = f", page {page}" if page is not None else ""
        parts.append(f"[{i}] ({name}{page_note})\n{doc.page_content.strip()}")
    return "\n\n".join(parts)


def log_retrieved_chunks(docs: list[Document]) -> list[Document]:
    """Log retrieved chunks for debugging, then pass them through."""
    if not docs:
        logger.debug("Retrieved 0 chunks")
        return docs

    logger.debug("Retrieved %s chunk(s):", len(docs))
    for i, doc in enumerate(docs, start=1):
        name = doc.metadata.get("filename") or Path(
            doc.metadata.get("source", "unknown")
        ).name
        page = doc.metadata.get("page")
        preview = doc.page_content.replace("\n", " ").strip()
        if len(preview) > 200:
            preview = preview[:200] + "…"
        logger.debug(
            "  [%s] %s (page=%s) score/meta=%s | %s",
            i,
            name,
            page,
            {k: v for k, v in doc.metadata.items() if k not in {"filename"}},
            preview,
        )
    return docs


def retrieve_docs(question: str, *, k: int = TOP_K) -> list[Document]:
    with timed("retrieve_docs"):
        vectorstore = get_vectorstore()
        with timed("chroma_similarity_search"):
            retriever = vectorstore.as_retriever(search_kwargs={"k": k})
            docs = retriever.invoke(question)
        return log_retrieved_chunks(docs)


def generate_grounded_answer(question: str, context: str) -> str:
    with timed("llm_generate_answer"):
        llm = ChatOllama(model=CHAT_MODEL, temperature=0.0)
        return (GROUNDED_PROMPT | llm | StrOutputParser()).invoke(
            {"context": context, "question": question}
        )


def build_rag_chain(
    *,
    k: int = TOP_K,
    model: str = CHAT_MODEL,
    temperature: float = 0.0,
) -> Runnable[Any, str]:
    """Retrieve top-k → stuff into grounded prompt → generate answer."""
    vectorstore = get_vectorstore()
    retriever = vectorstore.as_retriever(search_kwargs={"k": k})
    llm = ChatOllama(model=model, temperature=temperature)

    return (
        {
            "context": (
                retriever
                | RunnableLambda(log_retrieved_chunks)
                | RunnableLambda(format_docs)
            ),
            "question": RunnablePassthrough(),
        }
        | GROUNDED_PROMPT
        | llm
        | StrOutputParser()
    )


def _chunk_summaries(docs: list[Document]) -> list[dict[str, Any]]:
    return [
        {
            "filename": doc.metadata.get("filename")
            or Path(doc.metadata.get("source", "unknown")).name,
            "page": doc.metadata.get("page"),
            "content": doc.page_content.strip(),
        }
        for doc in docs
    ]


def ask_with_context(question: str, *, k: int = TOP_K) -> dict[str, Any]:
    """Run grounded Q&A and return retrieved chunks alongside the answer."""
    with timed("ask_with_context"):
        docs = retrieve_docs(question, k=k)
        with timed("format_docs"):
            context = format_docs(docs)
        answer = generate_grounded_answer(question, context)
        return {"answer": answer, "chunks": _chunk_summaries(docs)}


def ask(question: str, *, k: int = TOP_K) -> str:
    """Run one grounded Q&A turn."""
    return ask_with_context(question, k=k)["answer"]
