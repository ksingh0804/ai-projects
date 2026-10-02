"""Schedule risk from retrieved hold and weather language, plus a rule you can point at."""

from __future__ import annotations


def run_risk(state: dict, retrieve_fn=None) -> dict:
    if retrieve_fn is None:
        from app.rag.retriever import retrieve

        retrieve_fn = retrieve

    used = list(state.get("agents_used") or [])
    used.append("risk")
    sources = retrieve_fn(state["project_id"], state["user_text"], k=4)
    blob = " ".join(item.get("snippet", "") for item in sources).lower()
    title = sources[0]["title"] if sources else "the project documents"

    open_rfi = ("rfi-014" in blob) or ("open" in blob and "rfi" in blob)
    blocks_work = any(word in blob for word in ("block", "hold", "pour"))
    if open_rfi and blocks_work:
        level = "high"
        blocked = ["foundation pour", "slab on grade"]
        needs = True
    elif "below 40" in blob or "rain" in blob:
        level = "medium"
        blocked = ["concrete pour"]
        needs = True
    else:
        level = "low"
        blocked = []
        needs = False

    activities = ", ".join(blocked) if blocked else "none"
    rfi_name = "RFI-014" if "rfi-014" in blob else "the open RFI"
    if level == "high":
        lead = f"Risk level is high. {rfi_name} blocks the foundation pour and the slab on grade."
    else:
        lead = f"Risk level is {level}. Blocked activities: {activities}."
    recommendation = f"{lead} This reading comes from {title}."
    if needs:
        recommendation += " This would move the schedule, so a person needs to approve it before the field acts."

    return {
        "agents_used": used,
        "sources": sources,
        "needs_approval": needs,
        "recommendation": recommendation,
        "tool_result": {"risk_level": level, "blocked_activities": blocked},
    }
