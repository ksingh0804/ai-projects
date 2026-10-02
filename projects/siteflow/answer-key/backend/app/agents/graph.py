"""Supervisor graph. Pauses before human_review when spend or the schedule would change."""

from __future__ import annotations

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph

from app.agents.materials_agent import run_materials
from app.agents.risk_agent import run_risk
from app.agents.spec_agent import run_spec
from app.agents.state import AgentState
from app.agents.supervisor import choose_route

CHAT_REFUSAL = (
    "I answer project documents, material quantities, and schedule risk for this job."
)


def supervisor_node(state: AgentState) -> dict:
    used = list(state.get("agents_used") or [])
    used.append("supervisor")
    return {"route": choose_route(state.get("user_text") or ""), "agents_used": used}


def spec_node(state: AgentState) -> dict:
    return run_spec(state)


def materials_node(state: AgentState) -> dict:
    return run_materials(state)


def risk_node(state: AgentState) -> dict:
    return run_risk(state)


def chat_node(state: AgentState) -> dict:
    used = list(state.get("agents_used") or [])
    used.append("chat")
    return {
        "agents_used": used,
        "needs_approval": False,
        "sources": [],
        "recommendation": CHAT_REFUSAL,
        "tool_result": {},
    }


def human_review(state: AgentState) -> dict:
    """Pause point. The node itself does not call a model."""
    return {}


def respond(state: AgentState) -> dict:
    text = state.get("recommendation") or ""
    if state.get("approved") is True:
        text = text + " Approved by the project engineer."
    elif state.get("approved") is False:
        text = text + " Rejected. No action taken."
    return {"recommendation": text}


def needs_human(state: AgentState) -> str:
    if state.get("needs_approval") and state.get("approved") is None:
        return "human_review"
    return "respond"


def build_graph():
    builder = StateGraph(AgentState)
    builder.add_node("supervisor", supervisor_node)
    builder.add_node("spec", spec_node)
    builder.add_node("materials", materials_node)
    builder.add_node("risk", risk_node)
    builder.add_node("chat", chat_node)
    builder.add_node("human_review", human_review)
    builder.add_node("respond", respond)

    builder.add_edge(START, "supervisor")
    builder.add_conditional_edges(
        "supervisor",
        lambda state: state["route"],
        {"spec": "spec", "materials": "materials", "risk": "risk", "chat": "chat"},
    )
    for node in ("spec", "materials", "risk", "chat"):
        builder.add_conditional_edges(
            node,
            needs_human,
            {"human_review": "human_review", "respond": "respond"},
        )
    builder.add_edge("human_review", "respond")
    builder.add_edge("respond", END)

    return builder.compile(
        checkpointer=MemorySaver(),
        interrupt_before=["human_review"],
    )


graph = build_graph()
