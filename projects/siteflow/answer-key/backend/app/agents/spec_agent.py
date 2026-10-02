"""Cite retrieved snippets. Refuse when the project documents do not contain the fact."""

from __future__ import annotations


REFUSAL = "I cannot find that in the project documents."


def run_spec(state: dict, retrieve_fn=None) -> dict:
    if retrieve_fn is None:
        from app.rag.retriever import retrieve

        retrieve_fn = retrieve

    used = list(state.get("agents_used") or [])
    used.append("spec")
    sources = retrieve_fn(state["project_id"], state["user_text"], k=4)
    if not sources:
        return {
            "agents_used": used,
            "sources": [],
            "needs_approval": False,
            "recommendation": REFUSAL,
            "tool_result": {},
        }

    top = sources[0]
    recommendation = f"From {top['title']} page {top['page']}: {top['snippet']}"
    return {
        "agents_used": used,
        "sources": sources,
        "needs_approval": False,
        "recommendation": recommendation,
        "tool_result": {},
    }
