from app.tools.inventory import calculate_eoq, lookup_sku, safety_stock


def test_eoq_worked_example():
    result = calculate_eoq(12000, 50, 4)
    assert result["eoq"] == 547.72


def test_eoq_rejects_zero():
    assert "error" in calculate_eoq(0, 50, 4)


def test_safety_stock_worked_example():
    result = safety_stock(20, 9, 1.65)
    assert result["safety_stock"] == 99


def test_lookup_rebar_needs_reorder():
    result = lookup_sku("sku-rebar")
    assert result["on_hand"] == 40
    assert result["status"] == "REORDER"
