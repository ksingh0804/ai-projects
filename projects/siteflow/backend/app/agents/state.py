"""Shared graph state.

What lives here is the current turn: the question, the route, the citations,
the tool result, and whether a person still has to approve. Files live in the
document store. The checkpointer stores this state so a later approval can
resume the same thread. It is not the system of record for the job.
"""

from __future__ import annotations

from typing import TypedDict


class AgentState(TypedDict, total=False):
    messages: list[dict]
    message: str
    project_id: str
    route: str
    route_reason: str
    sources: list[dict]
    tool_result: dict | None
    needs_approval: bool
    recommendation: str | None
    answer: str
    agents_used: list[str]
    approval: dict | None
