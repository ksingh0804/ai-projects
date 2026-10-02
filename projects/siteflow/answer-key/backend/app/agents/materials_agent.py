"""Call tested math. The model is not allowed to do the arithmetic."""

from __future__ import annotations

import re

from app.tools.inventory import calculate_eoq, lookup_sku, safety_stock


def _labeled(text: str, labels: list[str]) -> float | None:
    for label in labels:
        pattern = rf"(?i)(?:^|[\s,]){re.escape(label)}\s*=\s*([0-9]+(?:\.[0-9]+)?)"
        match = re.search(pattern, " " + text)
        if match:
            return float(match.group(1))
    return None


def _sku(text: str) -> str | None:
    match = re.search(r"SKU-[A-Z0-9]+", text.upper())
    return match.group(0) if match else None


def run_materials(state: dict) -> dict:
    text = state["user_text"]
    lower = text.lower()
    used = list(state.get("agents_used") or [])
    used.append("materials")

    sku = _sku(text)
    if sku and "eoq" not in lower and "safety stock" not in lower:
        result = lookup_sku(sku)
        if "error" in result:
            recommendation = result["error"]
        else:
            recommendation = (
                f"{result['sku']} ({result['description']}) has {result['on_hand']} on hand, "
                f"lead time {result['lead_days']} days, annual demand {result['annual_demand']}. "
                f"Status: {result['status']}."
            )
        return {
            "agents_used": used,
            "tool_result": result,
            "sources": [],
            "needs_approval": False,
            "recommendation": recommendation,
        }

    if "eoq" in lower:
        demand = _labeled(text, ["D", "annual_demand", "demand"])
        order_cost = _labeled(text, ["S", "order_cost"])
        holding = _labeled(text, ["H", "holding_cost", "holding"])
        if demand is None or order_cost is None or holding is None:
            return {
                "agents_used": used,
                "tool_result": {
                    "error": "Need D, S, and H. Example: EOQ D=12000 S=50 H=4",
                },
                "sources": [],
                "needs_approval": False,
                "recommendation": (
                    "I need the annual demand (D), the order cost (S), and the holding cost (H). "
                    "I will not guess the order cost."
                ),
            }
        result = calculate_eoq(demand, order_cost, holding)
        if "error" in result:
            return {
                "agents_used": used,
                "tool_result": result,
                "sources": [],
                "needs_approval": False,
                "recommendation": result["error"],
            }
        recommendation = (
            f"EOQ is {result['eoq']} units using sqrt(2 * D * S / H) "
            f"with D={demand}, S={order_cost}, H={holding}. "
            f"That is about {result['orders_per_year']} orders per year. "
            "This quantity changes spend, so a person needs to approve it before anyone orders."
        )
        return {
            "agents_used": used,
            "tool_result": result,
            "sources": [],
            "needs_approval": True,
            "recommendation": recommendation,
        }

    if "safety stock" in lower:
        std = _labeled(text, ["std", "demand_std"])
        lead = _labeled(text, ["lead", "lt", "lead_time"])
        z_score = _labeled(text, ["z", "z_score"])
        if z_score is None:
            z_score = 1.65
        if std is None or lead is None:
            return {
                "agents_used": used,
                "tool_result": {"error": "Need std and lead. Example: safety stock std=20 lead=9 z=1.65"},
                "sources": [],
                "needs_approval": False,
                "recommendation": "I need demand standard deviation (std) and lead time (lead) in the same period.",
            }
        result = safety_stock(std, lead, z_score)
        recommendation = (
            f"Safety stock is {result['safety_stock']} units using z * demand_std * sqrt(lead_time) "
            f"with std={std}, lead={lead}, z={z_score}. "
            "Buying this buffer changes spend, so a person needs to approve it."
        )
        return {
            "agents_used": used,
            "tool_result": result,
            "sources": [],
            "needs_approval": True,
            "recommendation": recommendation,
        }

    return {
        "agents_used": used,
        "tool_result": {},
        "sources": [],
        "needs_approval": False,
        "recommendation": "Ask for an EOQ (D, S, H), a safety stock (std, lead), or a SKU such as SKU-REBAR.",
    }
