import math

import pytest

from app.tools.inventory import (
    calculate_eoq,
    load_materials_csv,
    lookup_sku,
    safety_stock,
)

CSV = """sku,description,on_hand,lead_days,unit_cost,annual_demand,order_cost
REBAR-5,Grade 60 number 5 rebar,800,21,4.10,12000,50
AB-34,Anchor bolt,120,14,6.50,2000,40
"""


def test_eoq_matches_project2_formula():
    # sqrt(2 * 12000 * 50 / 4) = sqrt(300000)
    result = calculate_eoq(12000, 50, 4)
    assert result["formula"] == "sqrt(2 * D * S / H)"
    assert result["eoq"] == round(math.sqrt(300000), 2)
    assert result["eoq"] == 547.72
    assert result["orders_per_year"] == round(12000 / math.sqrt(300000), 2)


@pytest.mark.parametrize(
    "demand, order_cost, holding",
    [(0, 50, 4), (-1, 50, 4), (12000, 0, 4), (12000, 50, -2)],
)
def test_eoq_rejects_non_positive_inputs(demand, order_cost, holding):
    result = calculate_eoq(demand, order_cost, holding)
    assert "error" in result
    assert "eoq" not in result


def test_safety_stock_matches_project2_formula():
    result = safety_stock(10, 4, 1.65)
    assert result["formula"] == "z * demand_std * sqrt(lead_time)"
    assert result["safety_stock"] == round(1.65 * 10 * math.sqrt(4), 2)
    assert result["safety_stock"] == 33.0


def test_safety_stock_default_z_is_about_95_percent():
    result = safety_stock(10, 4)
    assert result["z_score"] == 1.65
    assert result["safety_stock"] == 33.0


def test_safety_stock_rejects_bad_z():
    assert "error" in safety_stock(10, 4, 0)
    assert "error" in safety_stock(-1, 4, 1.65)


def test_lookup_is_case_insensitive_and_reports_unknown_sku():
    inventory = load_materials_csv(CSV)
    found = lookup_sku(inventory, " rebar-5 ")
    assert found["sku"] == "REBAR-5"
    assert found["on_hand"] == 800
    missing = lookup_sku(inventory, "NOPE")
    assert "not found" in missing["error"]
    assert "REBAR-5" in missing["known_skus"]


def test_csv_requires_columns_and_unique_skus():
    with pytest.raises(ValueError, match="missing columns"):
        load_materials_csv("sku,description\nA,bolt\n")
    with pytest.raises(ValueError, match="duplicate sku"):
        load_materials_csv(
            "sku,description,on_hand,lead_days,unit_cost,annual_demand,order_cost\n"
            "AB-1,bolt,1,1,1,1,1\n"
            "AB-1,bolt,1,1,1,1,1\n"
        )
