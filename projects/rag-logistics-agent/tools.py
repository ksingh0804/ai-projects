"""Logistics calculation and lookup tools for the agent."""

from __future__ import annotations

import csv
import logging
import math
from pathlib import Path

from langchain.tools import tool

from timing import timed

logger = logging.getLogger("logistics_rag")

INVENTORY_CSV = Path(__file__).parent / "data" / "sample_inventory.csv"

# Fallback if CSV is missing
_SAMPLE_INVENTORY: dict[str, dict] = {
    "SKU-1001": {
        "description": "Cold-chain yogurt case",
        "on_hand": 420,
        "reorder_point": 150,
        "lead_time_days": 5,
        "unit_cost": 12.50,
    },
    "SKU-1002": {
        "description": "Dry pasta carton",
        "on_hand": 80,
        "reorder_point": 200,
        "lead_time_days": 10,
        "unit_cost": 4.25,
    },
}


def _load_inventory() -> dict[str, dict]:
    if not INVENTORY_CSV.exists():
        return {k: dict(v) for k, v in _SAMPLE_INVENTORY.items()}

    rows: dict[str, dict] = {}
    with INVENTORY_CSV.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            sku = row["sku"].strip().upper()
            rows[sku] = {
                "description": row["description"],
                "on_hand": int(row["on_hand"]),
                "reorder_point": int(row["reorder_point"]),
                "lead_time_days": int(row["lead_time_days"]),
                "unit_cost": float(row["unit_cost"]),
            }
    return rows


@tool
def eoq_calculator(annual_demand: float, order_cost: float, holding_cost: float) -> dict:
    """Calculate classic Economic Order Quantity (EOQ).

    Use when the user asks for EOQ, optimal order quantity, or how much to order
    given annual demand (D), fixed order/setup cost (S), and holding cost per unit per year (H).

    Formula: EOQ = sqrt(2 * D * S / H)
    """
    with timed("eoq_calculator"):
        if annual_demand <= 0 or order_cost <= 0 or holding_cost <= 0:
            return {
                "error": "annual_demand, order_cost, and holding_cost must all be > 0",
            }

        eoq = math.sqrt(2 * annual_demand * order_cost / holding_cost)
        orders_per_year = annual_demand / eoq
        result = {
            "eoq": round(eoq, 2),
            "orders_per_year": round(orders_per_year, 2),
            "annual_demand": annual_demand,
            "order_cost": order_cost,
            "holding_cost": holding_cost,
            "formula": "sqrt(2 * D * S / H)",
        }
        logger.debug("eoq_calculator → %s", result)
        return result


@tool
def safety_stock_estimator(
    demand_std: float,
    lead_time: float,
    z_score: float = 1.65,
) -> dict:
    """Estimate basic safety stock under demand uncertainty.

    Use when the user asks for safety stock, buffer stock, or service-level inventory
    given demand standard deviation (per period), lead time (in the same periods),
    and a z-score (e.g. 1.65 ≈ 95% cycle service level, 2.33 ≈ 99%).

    Formula: safety_stock = z * demand_std * sqrt(lead_time)
    """
    with timed("safety_stock_estimator"):
        if demand_std < 0 or lead_time < 0 or z_score <= 0:
            return {
                "error": "demand_std and lead_time must be >= 0; z_score must be > 0",
            }

        safety_stock = z_score * demand_std * math.sqrt(lead_time)
        result = {
            "safety_stock": round(safety_stock, 2),
            "demand_std": demand_std,
            "lead_time": lead_time,
            "z_score": z_score,
            "formula": "z * demand_std * sqrt(lead_time)",
        }
        logger.debug("safety_stock_estimator → %s", result)
        return result


@tool
def lookup_sample_inventory(sku: str) -> dict:
    """Look up a mock inventory record by SKU from the sample inventory table.

    Use when the user asks for on-hand qty, reorder point, lead time, or unit cost
    for a SKU like SKU-1001. Returns an error if the SKU is not in the sample file.
    """
    with timed("lookup_sample_inventory"):
        inventory = _load_inventory()
        key = sku.strip().upper()
        if key not in inventory:
            known = ", ".join(sorted(inventory))
            result = {
                "error": f"SKU '{sku}' not found",
                "known_skus": known,
            }
            logger.debug("lookup_sample_inventory miss → %s", result)
            return result

        record = {"sku": key, **inventory[key]}
        below_rop = record["on_hand"] < record["reorder_point"]
        record["below_reorder_point"] = below_rop
        record["status"] = "REORDER" if below_rop else "OK"
        logger.debug("lookup_sample_inventory → %s", record)
        return record


@tool
def search_logistics_docs(query: str) -> str:
    """Search ingested logistics SOPs and PDF documents for grounded context.

    Use for policy, SOP steps, cold chain rules, carrier procedures, forecasting
    methods described in documents, or any question that should be answered from
    company docs — not for numeric EOQ/safety-stock math or SKU table lookups.
    """
    from rag import TOP_K, format_docs, get_vectorstore, log_retrieved_chunks

    with timed("search_logistics_docs"):
        vectorstore = get_vectorstore()
        with timed("chroma_similarity_search"):
            retriever = vectorstore.as_retriever(search_kwargs={"k": TOP_K})
            docs = log_retrieved_chunks(retriever.invoke(query))
        with timed("format_docs"):
            return format_docs(docs)


def get_tools() -> list:
    """All tools available to the logistics agent."""
    return [
        eoq_calculator,
        safety_stock_estimator,
        lookup_sample_inventory,
        search_logistics_docs,
    ]
