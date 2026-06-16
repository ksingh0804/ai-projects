"""Feature engineering for ML use cases, built on the gold star schema.

Two production-relevant feature tables for FreshCart:
  1. feat_eta      - per delivery: features known AT DISPATCH + target delivery_minutes.
                     Feeds an ETA-prediction model (the "track your order" estimate).
  2. feat_demand   - per product x FC x day: lagged + rolling demand features + the
                     next-day target. Feeds a demand-forecast model (inventory planning).

These show the skills a "DE supporting ML / analytics-engineering" role needs:
  - point-in-time correctness (don't leak the future into features)
  - window functions for lags and rolling aggregates
  - a clean train-ready, leak-free feature table materialized for the ML team / feature store.
"""
from __future__ import annotations

import os

import duckdb

import common as C


def main():
    C.ensure_dirs()
    con = duckdb.connect(C.WAREHOUSE_DB)
    con.execute("CREATE SCHEMA IF NOT EXISTS mart")

    # --- 1. ETA features (only fields known at dispatch -> no leakage) ---
    con.execute("""
        CREATE OR REPLACE TABLE mart.feat_eta AS
        SELECT
            fd.delivery_id,
            fd.distance_km,
            dd.vehicle_type,
            df.city                       AS fc_city,
            dt.day_of_week,
            dt.is_weekend,
            o.n_items,
            o.order_total                 AS basket_value,
            o.channel,
            fd.delivery_minutes           AS target_delivery_minutes
        FROM gold.fct_deliveries fd
        JOIN gold.fct_orders o   ON o.order_id = fd.order_id
        LEFT JOIN gold.dim_driver dd ON dd.driver_key = fd.driver_key
        LEFT JOIN gold.dim_fc df  ON df.fc_key = fd.fc_key
        LEFT JOIN gold.dim_date dt ON dt.date_key = fd.delivery_date_key
        WHERE fd.delivery_status = 'DELIVERED' AND fd.delivery_minutes > 0
    """)

    # --- 2. Demand-forecast features (lags + rolling avg + next-day target) ---
    con.execute("""
        CREATE OR REPLACE TABLE mart.feat_demand AS
        WITH daily AS (
            SELECT oi.product_key, o.fc_key, d.full_date,
                   sum(oi.quantity) AS units
            FROM gold.fct_order_items oi
            JOIN gold.fct_orders o ON o.order_key = oi.order_key
            JOIN gold.dim_date d   ON d.date_key  = oi.order_date_key
            WHERE o.status = 'DELIVERED'
            GROUP BY 1, 2, 3
        )
        SELECT
            product_key, fc_key, full_date, units,
            lag(units, 1) OVER w  AS units_lag_1,
            lag(units, 7) OVER w  AS units_lag_7,
            avg(units) OVER (PARTITION BY product_key, fc_key ORDER BY full_date
                             ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING) AS units_roll7_avg,
            dayofweek(full_date) AS day_of_week,
            lead(units, 1) OVER w AS target_units_next_day
        FROM daily
        WINDOW w AS (PARTITION BY product_key, fc_key ORDER BY full_date)
    """)

    # export feature tables to the lake (where a feature store / ML job would read them)
    for t in ("feat_eta", "feat_demand"):
        con.execute(f"COPY mart.{t} TO '{os.path.join(C.GOLD, t + '.parquet')}' (FORMAT PARQUET)")

    n_eta = con.sql("SELECT count(*) FROM mart.feat_eta").fetchone()[0]
    n_dem = con.sql("SELECT count(*) FROM mart.feat_demand WHERE target_units_next_day IS NOT NULL").fetchone()[0]
    corr = con.sql("SELECT round(corr(distance_km, target_delivery_minutes),3) FROM mart.feat_eta").fetchone()[0]

    print("ML feature tables built")
    print("=" * 48)
    print(f"  mart.feat_eta     : {n_eta:,} rows (target = delivery_minutes)")
    print(f"     sanity: corr(distance_km, delivery_minutes) = {corr}  (should be strongly positive)")
    print(f"  mart.feat_demand  : {n_dem:,} trainable rows (target = next-day units)")
    print("  exported to data/lake/gold/feat_*.parquet")
    con.close()
    print("\nOK: leak-free, train-ready features materialized.")


if __name__ == "__main__":
    main()
