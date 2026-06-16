"""Business analytics / KPI layer over the gold star schema.

This is the 'serving' step: it answers the stakeholder questions from the charter
(00-overview.md) using nothing but the conformed gold tables. In production these
become BI dashboards (Looker/Tableau/Superset) and metric definitions in a semantic
layer; here we materialize them to KPI views + a kpis.json snapshot.

Every query is a realistic interview-grade analytical SQL question for this domain.
"""
from __future__ import annotations

import json
import os

import duckdb

import common as C


def main():
    C.ensure_dirs()
    con = duckdb.connect(C.WAREHOUSE_DB)
    con.execute("CREATE SCHEMA IF NOT EXISTS mart")
    kpis = {}

    # --- Finance: GMV, margin, basket (DELIVERED revenue only) ---
    con.execute("""
        CREATE OR REPLACE VIEW mart.kpi_finance AS
        SELECT
            round(sum(oi.line_total), 2)  AS gmv,
            round(sum(oi.line_margin), 2) AS gross_margin,
            round(100.0*sum(oi.line_margin)/nullif(sum(oi.line_total),0), 2) AS margin_pct,
            count(DISTINCT oi.order_key)  AS orders,
            round(sum(oi.line_total)/nullif(count(DISTINCT oi.order_key),0), 2) AS avg_basket_value
        FROM gold.fct_order_items oi
        JOIN gold.fct_orders o ON o.order_key = oi.order_key
        WHERE o.status = 'DELIVERED'
    """)
    kpis["finance"] = con.sql("SELECT * FROM mart.kpi_finance").df().to_dict("records")[0]

    # --- Ops: on-time delivery %, avg delivery minutes, by vehicle ---
    con.execute("""
        CREATE OR REPLACE VIEW mart.kpi_delivery AS
        SELECT
            count(*) AS deliveries,
            round(100.0*sum(CASE WHEN is_on_time THEN 1 ELSE 0 END)/count(*), 2) AS on_time_pct,
            round(avg(delivery_minutes), 2) AS avg_delivery_min,
            round(avg(distance_km), 2) AS avg_distance_km
        FROM gold.fct_deliveries
        WHERE delivery_status = 'DELIVERED'
    """)
    kpis["delivery"] = con.sql("SELECT * FROM mart.kpi_delivery").df().to_dict("records")[0]

    # --- Supply chain: stockout rate + cold-chain excursions ---
    con.execute("""
        CREATE OR REPLACE VIEW mart.kpi_inventory AS
        SELECT
            count(*) AS snapshots,
            round(100.0*sum(CASE WHEN available_units <= 0 THEN 1 ELSE 0 END)/count(*), 2) AS stockout_rate_pct,
            sum(CASE WHEN temp_excursion THEN 1 ELSE 0 END) AS temp_excursions,
            round(100.0*sum(CASE WHEN temp_excursion THEN 1 ELSE 0 END)/count(*), 3) AS temp_excursion_pct
        FROM gold.fct_inventory
    """)
    kpis["inventory"] = con.sql("SELECT * FROM mart.kpi_inventory").df().to_dict("records")[0]

    # --- Growth: repeat-customer rate ---
    con.execute("""
        CREATE OR REPLACE VIEW mart.kpi_growth AS
        WITH per_cust AS (
            SELECT customer_key, count(*) AS n_orders
            FROM gold.fct_orders WHERE status='DELIVERED' GROUP BY customer_key
        )
        SELECT count(*) AS customers,
               round(100.0*sum(CASE WHEN n_orders>1 THEN 1 ELSE 0 END)/count(*), 2) AS repeat_rate_pct,
               round(avg(n_orders), 2) AS avg_orders_per_customer
        FROM per_cust
    """)
    kpis["growth"] = con.sql("SELECT * FROM mart.kpi_growth").df().to_dict("records")[0]

    # --- Top categories by GMV (a classic ranking query) ---
    con.execute("""
        CREATE OR REPLACE VIEW mart.top_categories AS
        SELECT dp.category_name,
               round(sum(oi.line_total), 2) AS gmv,
               round(sum(oi.line_margin), 2) AS margin
        FROM gold.fct_order_items oi
        JOIN gold.dim_product dp ON dp.product_key = oi.product_key
        GROUP BY dp.category_name ORDER BY gmv DESC
    """)
    kpis["top_categories"] = con.sql("SELECT * FROM mart.top_categories LIMIT 5").df().to_dict("records")

    # --- Daily GMV trend (time series for a line chart) ---
    con.execute("""
        CREATE OR REPLACE VIEW mart.daily_gmv AS
        SELECT d.full_date,
               round(sum(oi.line_total), 2) AS gmv,
               count(DISTINCT oi.order_key) AS orders
        FROM gold.fct_order_items oi
        JOIN gold.dim_date d ON d.date_key = oi.order_date_key
        GROUP BY d.full_date ORDER BY d.full_date
    """)

    json.dump(kpis, open(os.path.join(C.METRICS, "kpis.json"), "w"), indent=2, default=str)

    print("FreshCart business KPIs (from gold star schema)")
    print("=" * 56)
    f = kpis["finance"]; dlv = kpis["delivery"]; inv = kpis["inventory"]; g = kpis["growth"]
    print(f"  GMV (delivered)        ${f['gmv']:,.2f}")
    print(f"  Gross margin           ${f['gross_margin']:,.2f}  ({f['margin_pct']}%)")
    print(f"  Avg basket value       ${f['avg_basket_value']:,.2f}  over {int(f['orders']):,} orders")
    print(f"  On-time delivery       {dlv['on_time_pct']}%  (avg {dlv['avg_delivery_min']} min, {dlv['avg_distance_km']} km)")
    print(f"  Stockout rate          {inv['stockout_rate_pct']}%  of {int(inv['snapshots']):,} snapshots")
    print(f"  Cold-chain excursions  {int(inv['temp_excursions'])}  ({inv['temp_excursion_pct']}%)")
    print(f"  Repeat-customer rate   {g['repeat_rate_pct']}%  (avg {g['avg_orders_per_customer']} orders/cust)")
    print("  Top categories by GMV:")
    for c in kpis["top_categories"]:
        print(f"     {c['category_name']:<22} ${c['gmv']:,.2f}")
    con.close()
    print("\nOK: KPI views materialized in schema 'mart'; snapshot -> data/_metrics/kpis.json")


if __name__ == "__main__":
    main()
