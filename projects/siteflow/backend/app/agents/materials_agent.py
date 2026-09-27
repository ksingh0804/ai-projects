"""Materials agent: parse a question, call one tool, write one recommendation.

Missing inputs stay missing. Order cost is filled from the materials table
only when exactly one SKU matches, and the answer says so. Holding cost is
never copied from unit cost. Those are different numbers.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

from app.agents.llm import ChatModel
from app.agents.spec_agent import maybe_paraphrase
from app.tools.inventory import calculate_eoq, lookup_sku, safety_stock

_NUMBER = r"(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)"
_STOPWORDS = {
    "grade",
    "number",
    "inch",
    "roll",
    "beam",
    "structural",
    "with",
    "from",
    "that",
    "this",
    "unit",
    "units",
}


@dataclass
class MaterialsOutcome:
    answer: str
    recommendation: str | None
    needs_approval: bool
    tool_result: dict
    assumptions: list[str] = field(default_factory=list)


def _to_float(token: str) -> float:
    return float(token.replace(",", ""))


def _find_number(text: str, pattern: str) -> float | None:
    match = re.search(pattern, text, flags=re.IGNORECASE)
    if not match:
        return None
    return _to_float(match.group(1))


def extract_sku(message: str) -> str | None:
    labeled = re.search(r"\bSKU[\s-]+([A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)\b", message, re.I)
    if labeled:
        return labeled.group(1).upper()
    bare = re.search(r"\b([A-Z]{2,}-\d+)\b", message)
    if bare:
        return bare.group(1).upper()
    return None


def matching_rows(message: str, inventory: dict[str, dict]) -> list[dict]:
    sku = extract_sku(message)
    if sku and sku in inventory:
        return [inventory[sku]]

    text = message.lower()
    hits: list[dict] = []
    for row in inventory.values():
        if row["sku"].lower() in text:
            hits.append(row)
            continue
        for token in _description_tokens(row["description"]):
            if re.search(rf"\b{re.escape(token)}\b", text):
                hits.append(row)
                break
    return hits


def _description_tokens(description: str) -> list[str]:
    tokens = re.findall(r"[a-z0-9]+", description.lower())
    return [token for token in tokens if len(token) > 3 and token not in _STOPWORDS]


def _intent(message: str, demand: float | None, holding: float | None, std: float | None) -> str:
    text = message.lower()
    if re.search(r"\beoq\b|economic order", text) or (demand is not None and holding is not None):
        return "eoq"
    if re.search(r"safety stock|standard deviation|demand std", text) or std is not None:
        return "safety_stock"
    return "lookup"


def answer_materials(message: str, inventory: dict[str, dict]) -> MaterialsOutcome:
    text = message.strip()
    demand = _find_number(text, rf"(?:annual demand|demand)\s*(?:is|of|=)?\s*{_NUMBER}")
    order_cost = _find_number(text, rf"order cost\s*(?:is|of|=)?\s*\$?{_NUMBER}")
    holding = _find_number(text, rf"holding cost\s*(?:is|of|=)?\s*\$?{_NUMBER}")
    std = _find_number(text, rf"(?:demand std|standard deviation|std)\s*(?:is|of|=)?\s*{_NUMBER}")
    lead = _find_number(text, rf"lead time\s*(?:is|of|=)?\s*{_NUMBER}")
    z_score = _find_number(text, rf"\bz(?:\s*score)?\s*(?:is|of|=)?\s*{_NUMBER}")
    intent = _intent(text, demand, holding, std)
    rows = matching_rows(text, inventory)

    if intent == "eoq":
        return _eoq(demand, order_cost, holding, rows)
    if intent == "safety_stock":
        return _safety(std, lead, z_score, rows)
    return _lookup(text, rows, inventory)


def _eoq(
    demand: float | None,
    order_cost: float | None,
    holding: float | None,
    rows: list[dict],
) -> MaterialsOutcome:
    assumptions: list[str] = []
    if (demand is None or order_cost is None) and len(rows) > 1:
        names = ", ".join(row["sku"] for row in rows)
        return MaterialsOutcome(
            answer=(
                "More than one SKU matches that question "
                f"({names}). Name the SKU so I do not mix their order costs."
            ),
            recommendation=None,
            needs_approval=False,
            tool_result={"error": "ambiguous_sku", "skus": [row["sku"] for row in rows]},
        )
    if len(rows) == 1:
        row = rows[0]
        if demand is None:
            demand = float(row["annual_demand"])
            assumptions.append(
                f"annual demand {demand:g} taken from {row['sku']} in the materials table"
            )
        if order_cost is None:
            order_cost = float(row["order_cost"])
            assumptions.append(
                f"order cost {order_cost:g} taken from {row['sku']} in the materials table "
                "because the question did not include it"
            )

    missing: list[str] = []
    if demand is None:
        missing.append("annual demand (D)")
    if order_cost is None:
        missing.append("order cost (S)")
    if holding is None:
        missing.append("holding cost (H)")
    if missing:
        return MaterialsOutcome(
            answer=(
                "I will not guess the missing "
                + ", ".join(missing)
                + ". EOQ is sqrt(2 * D * S / H). Send those values, or name one SKU "
                "that has demand and order cost in the materials table. "
                "Holding cost is not the unit cost."
            ),
            recommendation=None,
            needs_approval=False,
            tool_result={"error": "missing_inputs", "missing": missing},
        )

    result = calculate_eoq(demand, order_cost, holding)  # type: ignore[arg-type]
    if "error" in result:
        return MaterialsOutcome(
            answer=result["error"],
            recommendation=None,
            needs_approval=False,
            tool_result=result,
        )

    assumption_text = " " + " ".join(sentence[0].upper() + sentence[1:] + "." for sentence in assumptions) if assumptions else ""
    paragraph = (
        f"EOQ is {result['eoq']} units, about {result['orders_per_year']} orders per year. "
        f"Formula sqrt(2 * D * S / H) with D={demand:g}, S={order_cost:g}, H={holding:g}."
        f"{assumption_text} "
        "This changes a purchase quantity, so a person should approve it before anyone buys material."
    )
    result["assumptions"] = assumptions
    return MaterialsOutcome(paragraph, paragraph, True, result, assumptions)


def _safety(
    std: float | None,
    lead: float | None,
    z_score: float | None,
    rows: list[dict],
) -> MaterialsOutcome:
    assumptions: list[str] = []
    if lead is None and len(rows) == 1:
        lead = float(rows[0]["lead_days"])
        assumptions.append(
            f"lead time {lead:g} days taken from {rows[0]['sku']} in the materials table"
        )
    if z_score is None and std is not None and lead is not None:
        z_score = 1.65
        assumptions.append(
            "z 1.65 is the default, about a 95 percent cycle service level, "
            "because the question did not give a z-score"
        )

    missing: list[str] = []
    if std is None:
        missing.append("demand standard deviation")
    if lead is None:
        missing.append("lead time")
    if z_score is None:
        missing.append("z-score")
    if missing:
        return MaterialsOutcome(
            answer=(
                "I will not guess the missing "
                + ", ".join(missing)
                + ". Safety stock is z * demand_std * sqrt(lead_time). "
                "The materials table has no demand standard deviation column."
            ),
            recommendation=None,
            needs_approval=False,
            tool_result={"error": "missing_inputs", "missing": missing},
        )

    result = safety_stock(std, lead, z_score)  # type: ignore[arg-type]
    if "error" in result:
        return MaterialsOutcome(
            answer=result["error"],
            recommendation=None,
            needs_approval=False,
            tool_result=result,
        )
    assumption_text = " " + " ".join(sentence[0].upper() + sentence[1:] + "." for sentence in assumptions) if assumptions else ""
    paragraph = (
        f"Safety stock is {result['safety_stock']} units. "
        f"Formula z * demand_std * sqrt(lead_time) with z={z_score:g}, "
        f"demand_std={std:g}, lead_time={lead:g}."
        f"{assumption_text} "
        "This changes buffer stock, so a person should approve it before anyone buys material."
    )
    result["assumptions"] = assumptions
    return MaterialsOutcome(paragraph, paragraph, True, result, assumptions)


def _lookup(message: str, rows: list[dict], inventory: dict[str, dict]) -> MaterialsOutcome:
    sku = extract_sku(message)
    if sku and sku not in inventory and not rows:
        result = lookup_sku(inventory, sku)
        return MaterialsOutcome(
            answer=result["error"] + (f" Known SKUs: {result['known_skus']}." if result.get("known_skus") else ""),
            recommendation=None,
            needs_approval=False,
            tool_result=result,
        )
    if len(rows) != 1:
        if not rows:
            known = ", ".join(sorted(inventory)) or "none uploaded"
            return MaterialsOutcome(
                answer=f"I could not match a SKU in that question. Known SKUs: {known}.",
                recommendation=None,
                needs_approval=False,
                tool_result={"error": "sku_not_found", "known_skus": known},
            )
        names = ", ".join(row["sku"] for row in rows)
        return MaterialsOutcome(
            answer=f"More than one SKU matches ({names}). Ask again with one SKU.",
            recommendation=None,
            needs_approval=False,
            tool_result={"error": "ambiguous_sku", "skus": [row["sku"] for row in rows]},
        )

    result = lookup_sku(inventory, rows[0]["sku"])
    paragraph = (
        f"{result['sku']}: {result['description']}. "
        f"On hand {result['on_hand']}. Lead time {result['lead_days']} days. "
        f"Unit cost ${result['unit_cost']:.2f}. Annual demand {result['annual_demand']:g}. "
        f"Order cost ${result['order_cost']:.2f}. This is a lookup, not an order."
    )
    return MaterialsOutcome(paragraph, None, False, result, [])


def materials_update(state: dict, inventory: dict[str, dict], model: ChatModel | None) -> dict:
    outcome = answer_materials(state.get("message") or "", inventory)
    return {
        "answer": maybe_paraphrase(outcome.answer, model),
        "recommendation": outcome.recommendation,
        "needs_approval": outcome.needs_approval,
        "tool_result": outcome.tool_result,
        "sources": [],
        "agents_used": list(state.get("agents_used") or []) + ["materials"],
    }
