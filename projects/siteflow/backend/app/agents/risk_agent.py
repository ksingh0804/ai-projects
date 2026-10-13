"""Risk agent: rules over retrieved hold and weather language.

The level is not a model opinion. It is a rule on lines we put in the
documents, such as "Blocked activity: ...". If that line is absent, the
agent says it does not see a hold. It does not infer one from general
knowledge about foundation pours.
"""

from __future__ import annotations

from dataclasses import dataclass

from app.agents.llm import ChatModel
from app.agents.spec_agent import citations, maybe_paraphrase
from app.rag.retriever import Chunk, search_chunks


@dataclass(frozen=True)
class RiskAssessment:
    level: str
    blocked_activities: list[str]
    needs_approval: bool
    answer: str
    recommendation: str | None


def assess_risk(hits: list) -> RiskAssessment:
    if not hits:
        return RiskAssessment(
            level="unknown",
            blocked_activities=[],
            needs_approval=False,
            answer=(
                "I cannot find hold, weather, or RFI language in this project's documents, "
                "so I will not invent a schedule risk."
            ),
            recommendation=None,
        )

    blocked: list[str] = []
    blob_parts: list[str] = []
    for hit in hits:
        for line in hit.chunk.text.splitlines():
            blob_parts.append(line)
            if line.lower().startswith("blocked activity:"):
                activity = line.split(":", 1)[1].strip()
                if activity and activity not in blocked:
                    blocked.append(activity)
    blob = "\n".join(blob_parts).lower()

    if blocked or "on hold" in blob:
        level = "high"
    elif "weather limit" in blob:
        level = "medium"
    else:
        level = "low"

    weather_note = (
        " The documents also include a weather limit that can stop placement."
        if "weather limit" in blob
        else ""
    )
    if level == "high" and blocked:
        listed = "; ".join(blocked)
        return RiskAssessment(
            level=level,
            blocked_activities=blocked,
            needs_approval=True,
            answer=f"Risk level: high. Blocked activity: {listed}.{weather_note}",
            recommendation=f"Keep this work on hold: {listed}.",
        )
    if level == "high":
        return RiskAssessment(
            level=level,
            blocked_activities=[],
            needs_approval=True,
            answer="Risk level: high. The retrieved text puts work on hold." + weather_note,
            recommendation="Do not proceed until the hold in the cited document is cleared.",
        )
    if level == "medium":
        return RiskAssessment(
            level=level,
            blocked_activities=[],
            needs_approval=True,
            answer="Risk level: medium. The documents include a weather limit that can stop placement.",
            recommendation="Check the weather limit in the cited spec before placing concrete.",
        )
    return RiskAssessment(
        level=level,
        blocked_activities=[],
        needs_approval=False,
        answer="Risk level: low. I do not see a hold or weather limit in the retrieved excerpts.",
        recommendation=None,
    )


def risk_update(state: dict, chunks: list[Chunk], model: ChatModel | None, *, k: int = 4) -> dict:
    # Search the user's words first. Only if that finds nothing, add the hold
    # vocabulary. Always adding those words would drag the open RFI into a
    # question that was only about weather.
    query = state.get("message") or ""
    hits = search_chunks(chunks, query, project_id=state["project_id"], k=k)
    if not hits:
        hits = search_chunks(
            chunks,
            f"{query} hold RFI blocked weather delay",
            project_id=state["project_id"],
            k=k,
        )
    assessment = assess_risk(hits)
    tool_result = {
        "risk_level": assessment.level,
        "blocked_activities": assessment.blocked_activities,
    }
    return {
        "answer": maybe_paraphrase(assessment.answer, model),
        "recommendation": assessment.recommendation,
        "needs_approval": assessment.needs_approval,
        "sources": citations(hits),
        "tool_result": tool_result,
        "agents_used": list(state.get("agents_used") or []) + ["risk"],
    }
