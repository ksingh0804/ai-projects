"""Spec agent: answer only from retrieved chunks.

If the index has no matching text, the answer is a refusal. The model is not
asked to fill the gap from general construction knowledge. A citation the
user can open is the product. A fluent paragraph with no source is not.
"""

from __future__ import annotations

import re

from app.agents.llm import ChatModel
from app.rag.retriever import Chunk, search_chunks

REFUSAL = (
    "I cannot find that in this project's documents, so I will not answer "
    "from general construction knowledge."
)

_NUMBER = re.compile(r"\d+(?:,\d{3})*(?:\.\d+)?")


def clip(text: str, limit: int = 320) -> str:
    cleaned = " ".join(text.split())
    if len(cleaned) <= limit:
        return cleaned
    return cleaned[: limit - 1].rstrip() + "…"


def citations(hits: list) -> list[dict]:
    sources: list[dict] = []
    for hit in hits:
        chunk = hit.chunk
        sources.append(
            {
                "title": chunk.title,
                "page": chunk.page,
                "snippet": clip(chunk.text),
            }
        )
    return sources


def compose_spec_answer(hits: list) -> str:
    if not hits:
        return REFUSAL
    lines = ["From this project's documents:"]
    for source in citations(hits):
        lines.append(f"- {source['title']}, page {source['page']}: {source['snippet']}")
    lines.append("This answer uses only those excerpts.")
    return "\n".join(lines)


def unsupported_numbers(candidate: str, source: str) -> list[str]:
    """Numbers in the candidate that never appear in the source text."""
    allowed = {number.replace(",", "") for number in _NUMBER.findall(source)}
    bad: list[str] = []
    for number in _NUMBER.findall(candidate):
        if number.replace(",", "") not in allowed:
            bad.append(number)
    return bad


def paraphrase_is_faithful(candidate: str, draft: str) -> bool:
    if not candidate.strip():
        return False
    if unsupported_numbers(candidate, draft):
        return False
    draft_words = set(re.findall(r"[a-z]{5,}", draft.lower()))
    candidate_words = set(re.findall(r"[a-z]{5,}", candidate.lower()))
    if not draft_words:
        return False
    overlap = draft_words & candidate_words
    return len(overlap) >= min(3, len(draft_words))


def maybe_paraphrase(draft: str, model: ChatModel | None) -> str:
    """Ask a model to rephrase. Keep the draft if the rephrase is unfaithful."""
    if model is None:
        return draft
    messages = [
        {
            "role": "system",
            "content": (
                "Rewrite the draft in one short paragraph for a project engineer. "
                "Use only facts and numbers already in the draft. Do not add any number."
            ),
        },
        {"role": "user", "content": draft},
    ]
    try:
        candidate = model.invoke(messages)
    except Exception:
        return draft
    if paraphrase_is_faithful(candidate, draft):
        return candidate.strip()
    return draft


def spec_update(state: dict, chunks: list[Chunk], model: ChatModel | None, *, k: int = 4) -> dict:
    hits = search_chunks(chunks, state.get("message") or "", project_id=state["project_id"], k=k)
    draft = compose_spec_answer(hits)
    return {
        "sources": citations(hits),
        "answer": maybe_paraphrase(draft, model),
        "needs_approval": False,
        "recommendation": None,
        "tool_result": None,
        "agents_used": list(state.get("agents_used") or []) + ["spec_rag"],
    }
