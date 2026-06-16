"""Pipeline tests — the safety net that makes a pipeline trustworthy.

Two kinds of tests, both expected in a real DE codebase:
  1. UNIT-ish: pure logic (e.g. haversine distance, window assignment).
  2. DATA tests: invariants on the built warehouse (keys unique, no orphans,
     measures internally consistent, KPIs in plausible ranges).

Run after building the warehouse:
    python src/run_pipeline.py
    python -m unittest discover -s tests        # or: python tests/test_pipeline.py
"""
from __future__ import annotations

import math
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))
import common as C  # noqa: E402

try:
    import duckdb
    _HAS_DB = os.path.exists(C.WAREHOUSE_DB)
except Exception:
    _HAS_DB = False


def q(con, sql):
    return con.sql(sql).fetchone()[0]


@unittest.skipUnless(_HAS_DB, "warehouse.duckdb not built; run src/run_pipeline.py first")
class TestGoldInvariants(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.con = duckdb.connect(C.WAREHOUSE_DB, read_only=True)

    @classmethod
    def tearDownClass(cls):
        cls.con.close()

    def test_order_key_unique(self):
        dupes = q(self.con, """SELECT count(*) FROM (
            SELECT order_key FROM gold.fct_orders GROUP BY order_key HAVING count(*)>1)""")
        self.assertEqual(dupes, 0)

    def test_no_orphan_customer(self):
        orphans = q(self.con, """SELECT count(*) FROM gold.fct_orders o
            LEFT JOIN gold.dim_customer c USING (customer_key)
            WHERE c.customer_key IS NULL""")
        self.assertEqual(orphans, 0)

    def test_no_orphan_product_in_items(self):
        orphans = q(self.con, """SELECT count(*) FROM gold.fct_order_items oi
            LEFT JOIN gold.dim_product p USING (product_key)
            WHERE p.product_key IS NULL""")
        self.assertEqual(orphans, 0)

    def test_quantities_positive(self):
        bad = q(self.con, "SELECT count(*) FROM gold.fct_order_items WHERE quantity <= 0 OR unit_price <= 0")
        self.assertEqual(bad, 0, "silver should have quarantined non-positive qty/price")

    def test_line_total_consistency(self):
        # line_total should equal quantity * unit_price within rounding tolerance
        bad = q(self.con, """SELECT count(*) FROM gold.fct_order_items
            WHERE abs(line_total - quantity*unit_price) > 0.01""")
        self.assertEqual(bad, 0)

    def test_dim_date_contiguous(self):
        gaps = q(self.con, """
            WITH x AS (SELECT full_date,
                              lead(full_date) OVER (ORDER BY full_date) AS nxt FROM gold.dim_date)
            SELECT count(*) FROM x WHERE nxt IS NOT NULL AND date_diff('day', full_date, nxt) <> 1""")
        self.assertEqual(gaps, 0)

    def test_on_time_rate_in_range(self):
        pct = q(self.con, """SELECT 100.0*sum(CASE WHEN is_on_time THEN 1 ELSE 0 END)/count(*)
            FROM gold.fct_deliveries WHERE delivery_status='DELIVERED'""")
        self.assertTrue(0 <= pct <= 100)

    def test_available_units_formula(self):
        bad = q(self.con, """SELECT count(*) FROM gold.fct_inventory
            WHERE available_units <> on_hand_units - reserved_units""")
        self.assertEqual(bad, 0)


class TestPureLogic(unittest.TestCase):
    def test_haversine_zero(self):
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))
        from stream_processor import haversine_km
        self.assertAlmostEqual(haversine_km(41.88, -87.63, 41.88, -87.63), 0.0, places=6)

    def test_haversine_known_distance(self):
        from stream_processor import haversine_km
        # ~ Chicago to New York is ~1145 km; allow generous tolerance
        d = haversine_km(41.88, -87.63, 40.71, -74.00)
        self.assertTrue(1100 < d < 1200, f"got {d}")


if __name__ == "__main__":
    unittest.main(verbosity=2)
