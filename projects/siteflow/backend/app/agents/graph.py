"""LangGraph runner.

The nodes are plain functions in the other agent modules. This file only
decides the edges: supervisor, one specialist, then either pause for a human
or respond. Pausing uses LangGraph interrupt(), which needs a checkpointer.
On resume the human_review node runs again from the top, receives the
decision, and then goes to respond.
"""

from __future__ import annotations

from langgraph.graph import END, START, StateGraph
from langgraph.types import interrupt

from app.agents.materials_agent import materials_update
from app.agents.review import apply_human_decision, respond_update
from app.agents.risk_agent import risk_update
from app.agents.spec_agent import spec_update
from app.agents.state import AgentState
from app.agents.supervisor import supervisor_update
from app.library import ProjectLibrary


def compile_graph(library: ProjectLibrary, checkpointer, *, k: int = 4, model=None):
    def supervisor(state: AgentState) -> dict:
        return supervisor_update(state)

    def spec_rag(state: AgentState) -> dict:
        return spec_update(state, library.chunks(state["project_id"]), model, k=k)

    def materials(state: AgentState) -> dict:
        return materials_update(state, library.materials(state["project_id"]), model)

    def risk(state: AgentState) -> dict:
        return risk_update(state, library.chunks(state["project_id"]), model, k=k)

    def human_review(state: AgentState) -> dict:
        decision = interrupt(
            {
                "recommendation": state.get("recommendation"),
                "route": state.get("route"),
            }
        )
        return apply_human_decision(state, decision)

    def respond(state: AgentState) -> dict:
        return respond_update(state)

    def choose_specialist(state: AgentState) -> str:
        route = state.get("route")
        if route in {"spec", "materials", "risk"}:
            return route
        return "chat"

    def after_specialist(state: AgentState) -> str:
        if state.get("needs_approval"):
            return "human_review"
        return "respond"

    builder = StateGraph(AgentState)
    builder.add_node("supervisor", supervisor)
    builder.add_node("spec_rag", spec_rag)
    builder.add_node("materials", materials)
    builder.add_node("risk", risk)
    builder.add_node("human_review", human_review)
    builder.add_node("respond", respond)
    builder.add_edge(START, "supervisor")
    builder.add_conditional_edges(
        "supervisor",
        choose_specialist,
        {
            "spec": "spec_rag",
            "materials": "materials",
            "risk": "risk",
            "chat": "respond",
        },
    )
    for node in ("spec_rag", "materials", "risk"):
        builder.add_conditional_edges(
            node,
            after_specialist,
            {"human_review": "human_review", "respond": "respond"},
        )
    builder.add_edge("human_review", "respond")
    builder.add_edge("respond", END)
    return builder.compile(checkpointer=checkpointer)
