"""Envelope for one turn of the graph. Files and vectors live elsewhere."""

from typing import TypedDict


class AgentState(TypedDict, total=False):
    messages: list
    user_text: str
    route: str
    sources: list
    tool_result: dict
    needs_approval: bool
    recommendation: str
    project_id: str
    agents_used: list
    approved: bool | None


def fresh_state(project_id: str, user_text: str) -> AgentState:
    return {
        "messages": [{"role": "user", "content": user_text}],
        "user_text": user_text,
        "route": "",
        "sources": [],
        "tool_result": {},
        "needs_approval": False,
        "recommendation": "",
        "project_id": project_id,
        "agents_used": [],
        "approved": None,
    }
