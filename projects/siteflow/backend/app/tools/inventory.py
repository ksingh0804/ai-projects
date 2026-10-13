"""Inventory math reused from Project 2 (rag-logistics-agent/tools.py).

Same formulas, plain functions instead of LangChain @tool wrappers.
A tool is a function with a name and checked inputs. The wrapper can come later.
"""

from __future__ import annotations

import csv
import io
import math

REQUIRED_COLUMNS = (
    "sku",
    "description",
    "on_hand",
    "lead_days",
    "unit_cost",
    "annual_demand",
    "order_cost",
)


def calculate_eoq(annual_demand: float, order_cost: float, holding_cost: float) -> dict:
    """Classic economic order quantity.

    EOQ = sqrt(2 * D * S / H)
    D annual demand, S order cost per order, H holding cost per unit per year.
    Demand during the year is assumed steady. S and H must be real costs, not guesses.
    """
    if annual_demand <= 0 or order_cost <= 0 or holding_cost <= 0:
        return {
            "error": "annual_demand, order_cost, and holding_cost must all be > 0",
        }

    eoq = math.sqrt(2 * annual_demand * order_cost / holding_cost)
    return {
        "eoq": round(eoq, 2),
        "orders_per_year": round(annual_demand / eoq, 2),
        "annual_demand": annual_demand,
        "order_cost": order_cost,
        "holding_cost": holding_cost,
        "formula": "sqrt(2 * D * S / H)",
    }


def safety_stock(demand_std: float, lead_time: float, z_score: float = 1.65) -> dict:
    """Safety stock when demand varies and lead time is treated as fixed.

    safety_stock = z * demand_std * sqrt(lead_time)

    demand_std is the standard deviation of demand per period.
    lead_time is the number of those same periods.
    z 1.65 is about a 95 percent cycle service level. This formula does not
    cover uncertain lead time. If lead time also varies, this number is low.
    """
    if demand_std < 0 or lead_time < 0 or z_score <= 0:
        return {
            "error": "demand_std and lead_time must be >= 0; z_score must be > 0",
        }

    quantity = z_score * demand_std * math.sqrt(lead_time)
    return {
        "safety_stock": round(quantity, 2),
        "demand_std": demand_std,
        "lead_time": lead_time,
        "z_score": z_score,
        "formula": "z * demand_std * sqrt(lead_time)",
    }


def lookup_sku(inventory: dict[str, dict], sku: str) -> dict:
    """Return one materials row. Missing SKUs are an error, not a made-up row."""
    key = sku.strip().upper()
    if key not in inventory:
        known = ", ".join(sorted(inventory))
        return {"error": f"SKU '{sku}' not found", "known_skus": known}

    row = inventory[key]
    return {"sku": key, **{field: row[field] for field in row if field != "sku"}}


def load_materials_csv(text: str) -> dict[str, dict]:
    """Parse the project materials table. Rejects a bad file instead of skipping rows."""
    reader = csv.DictReader(io.StringIO(text.lstrip("\ufeff")))
    if not reader.fieldnames:
        raise ValueError("materials csv has no header")

    fields = [name.strip() for name in reader.fieldnames]
    missing = [column for column in REQUIRED_COLUMNS if column not in fields]
    if missing:
        raise ValueError("materials csv missing columns: " + ", ".join(missing))

    rows: dict[str, dict] = {}
    for line_no, raw in enumerate(reader, start=2):
        sku = (raw.get("sku") or "").strip().upper()
        if not sku:
            raise ValueError(f"line {line_no}: sku is empty")
        if sku in rows:
            raise ValueError(f"line {line_no}: duplicate sku {sku}")
        try:
            rows[sku] = {
                "sku": sku,
                "description": (raw.get("description") or "").strip(),
                "on_hand": int((raw.get("on_hand") or "").strip()),
                "lead_days": int((raw.get("lead_days") or "").strip()),
                "unit_cost": float((raw.get("unit_cost") or "").strip()),
                "annual_demand": float((raw.get("annual_demand") or "").strip()),
                "order_cost": float((raw.get("order_cost") or "").strip()),
            }
        except ValueError as exc:
            raise ValueError(f"line {line_no}: {exc}") from exc
    return rows
