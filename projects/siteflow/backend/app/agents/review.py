"""Human decision text. The graph pauses before this runs.

Approval does not place a purchase order and does not edit a schedule.
It records that a person saw the recommendation and said yes or no.
If they never answer, the thread stays paused and nothing is written to a
system of record, because this app does not have a write tool.
"""

from __future__ import annotations

CHAT_ANSWER = (
    "I can help with three things on this job: specification and RFI questions, "
    "materials math (EOQ, safety stock, SKU lookup), and schedule risk from hold or weather language. "
    "I will not answer from general knowledge outside those project documents and tools."
)


def apply_human_decision(state: dict, decision: dict) -> dict:
    if not isinstance(decision, dict) or "approved" not in decision:
        raise ValueError("approval resume value must include approved")
    approved = bool(decision.get("approved"))
    note = str(decision.get("note") or "").strip()
    word = "approved" if approved else "rejected"
    extra = f"Decision: {word}."
    if note:
        extra += f" Note: {note}."
    extra += " SiteFlow does not place orders or change the schedule; a person does that."
    answer = (state.get("answer") or "").rstrip() + "\n\n" + extra
    agents = list(state.get("agents_used") or [])
    if "human_review" not in agents:
        agents.append("human_review")
    return {
        "answer": answer,
        "approval": {"approved": approved, "note": note},
        "needs_approval": False,
        "agents_used": agents,
    }


def respond_update(state: dict) -> dict:
    agents = list(state.get("agents_used") or [])
    if "respond" not in agents:
        agents.append("respond")
    updates: dict = {"agents_used": agents}
    if state.get("route") == "chat":
        updates["answer"] = CHAT_ANSWER
        updates["needs_approval"] = False
        updates["recommendation"] = None
        updates["sources"] = []
        updates["tool_result"] = None
    return updates
