"""EOQ, safety stock, and SKU lookup. Plain functions. No model calls."""

from __future__ import annotations

import csv
import math
from pathlib import Path

from app.paths import siteflow_root


def calculate_eoq(annual_demand: float, order_cost: float, holding_cost: float) -> dict:
    """EOQ = sqrt(2 * D * S / H). All three inputs must be > 0."""
    if annual_demand <= 0 or order_cost <= 0 or holding_cost <= 0:
        return {
            "error": "annual_demand, order_cost, and holding_cost must all be > 0",
        }

    eoq = math.sqrt(2 * annual_demand * order_cost / holding_cost)
    orders_per_year = annual_demand / eoq
    return {
        "eoq": round(eoq, 2),
        "orders_per_year": round(orders_per_year, 2),
        "annual_demand": annual_demand,
        "order_cost": order_cost,
        "holding_cost": holding_cost,
        "formula": "sqrt(2 * D * S / H)",
    }


def safety_stock(demand_std: float, lead_time: float, z_score: float = 1.65) -> dict:
    """safety_stock = z * demand_std * sqrt(lead_time). Periods must match."""
    if demand_std < 0 or lead_time < 0 or z_score <= 0:
        return {
            "error": "demand_std and lead_time must be >= 0; z_score must be > 0",
        }

    units = z_score * demand_std * math.sqrt(lead_time)
    return {
        "safety_stock": round(units, 2),
        "demand_std": demand_std,
        "lead_time": lead_time,
        "z_score": z_score,
        "formula": "z * demand_std * sqrt(lead_time)",
    }


def _default_csv() -> Path:
    return siteflow_root() / "data" / "sample" / "materials.csv"


def lookup_sku(sku: str, csv_path: Path | None = None) -> dict:
    """Return one materials row, plus REORDER when on_hand is below reorder_point."""
    path = csv_path or _default_csv()
    rows: dict[str, dict] = {}
    with path.open(newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            key = row["sku"].strip().upper()
            rows[key] = {
                "description": row["description"],
                "on_hand": int(row["on_hand"]),
                "lead_days": int(row["lead_days"]),
                "unit_cost": float(row["unit_cost"]),
                "annual_demand": float(row["annual_demand"]),
                "reorder_point": int(row["reorder_point"]),
            }

    key = sku.strip().upper()
    if key not in rows:
        return {
            "error": f"SKU '{sku}' not found",
            "known_skus": ", ".join(sorted(rows)),
        }

    record = {"sku": key, **rows[key]}
    below = record["on_hand"] < record["reorder_point"]
    record["below_reorder_point"] = below
    record["status"] = "REORDER" if below else "OK"
    return record
