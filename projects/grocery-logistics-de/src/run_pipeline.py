"""FreshCart batch ELT: bronze -> silver -> gold, with data quality + quarantine.

Run order (this file does all of it):
  1. BRONZE  : load raw CSV extracts verbatim into the warehouse, add load metadata.
  2. SILVER  : clean, type-cast, deduplicate, enforce keys; bad rows -> quarantine.
  3. GOLD    : build the Kimball star schema (conformed dims + fact tables).
  4. DQ      : run data-quality checks; BLOCKING failures fail the run.
  5. EXPORT  : write gold tables to Parquet (the "lake") + a run-metrics JSON.

Engine: DuckDB (a local stand-in for Snowflake/BigQuery). The SQL here is standard
analytical SQL and ports almost unchanged to those warehouses / to dbt models.

Idempotent: uses CREATE OR REPLACE everywhere, so re-running yields identical output.
"""
from __future__ import annotations

import json
import os
import time
from datetime import datetime, timezone

import duckdb

import common as C
import dq


def log(msg: str):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")


# ---------------------------------------------------------------------------
# 1. BRONZE — raw, append-only copy of every source extract + load metadata.
# ---------------------------------------------------------------------------
def build_bronze(con):
    log("BRONZE: ingesting raw source extracts")
    manifest = json.load(open(os.path.join(C.RAW, "_manifest.json")))
    con.execute("CREATE SCHEMA IF NOT EXISTS bronze")
    for t in manifest["tables"]:
        name = t["table"]
        path = os.path.join(C.RAW, f"{name}.csv")
        # all_varchar=false lets DuckDB infer types; empty strings become NULL.
        con.execute(f"""
            CREATE OR REPLACE TABLE bronze.{name} AS
            SELECT *,
                   now() AS _ingested_at,
                   '{os.path.relpath(path, C.PROJECT_ROOT)}' AS _source_file
            FROM read_csv_auto('{path}', header=true, sample_size=-1)
        """)
    return [t["table"] for t in manifest["tables"]]


# ---------------------------------------------------------------------------
# 2. SILVER — clean / conform / dedup / quarantine.
# ---------------------------------------------------------------------------
def quarantine(con, table, select_sql, reason):
    """Append rejected rows to a quarantine parquet so nothing is lost silently."""
    rel = con.sql(select_sql)
    n = rel.count("*").fetchone()[0]
    if n:
        out = os.path.join(C.QUARANTINE, f"{table}.parquet")
        con.execute(f"""
            COPY (SELECT *, '{reason}' AS _quarantine_reason, now() AS _quarantined_at
                  FROM ({select_sql})) TO '{out}' (FORMAT PARQUET)
        """)
    return n


def build_silver(con):
    log("SILVER: cleaning, conforming, deduplicating")
    con.execute("CREATE SCHEMA IF NOT EXISTS silver")
    q = {}

    # --- simple dimensions: dedup on natural key, type-cast ---
    con.execute("""
        CREATE OR REPLACE TABLE silver.suppliers AS
        SELECT DISTINCT ON (supplier_id)
               supplier_id, supplier_name, CAST(lead_time_days AS INT) lead_time_days,
               CAST(reliability_score AS DOUBLE) reliability_score, city, state
        FROM bronze.suppliers WHERE supplier_id IS NOT NULL
        ORDER BY supplier_id
    """)
    con.execute("""
        CREATE OR REPLACE TABLE silver.products AS
        SELECT DISTINCT ON (product_id)
               product_id, product_name, category_code, category_name, temp_zone,
               supplier_id, CAST(unit_cost AS DECIMAL(10,2)) unit_cost,
               CAST(list_price AS DECIMAL(10,2)) list_price,
               CAST(is_weighed AS INT) is_weighed, CAST(shelf_life_days AS INT) shelf_life_days
        FROM bronze.products WHERE product_id IS NOT NULL
        ORDER BY product_id
    """)
    con.execute("""
        CREATE OR REPLACE TABLE silver.fulfillment_centers AS
        SELECT DISTINCT ON (fc_id)
               fc_id, fc_name, city, state, CAST(lat AS DOUBLE) lat, CAST(lon AS DOUBLE) lon,
               CAST(capacity_orders_day AS INT) capacity_orders_day
        FROM bronze.fulfillment_centers WHERE fc_id IS NOT NULL ORDER BY fc_id
    """)
    con.execute("""
        CREATE OR REPLACE TABLE silver.customers AS
        SELECT DISTINCT ON (customer_id)
               customer_id, CAST(signup_date AS DATE) signup_date, city, state,
               loyalty_tier, NULLIF(email,'') email
        FROM bronze.customers WHERE customer_id IS NOT NULL ORDER BY customer_id
    """)
    con.execute("""
        CREATE OR REPLACE TABLE silver.drivers AS
        SELECT DISTINCT ON (driver_id) driver_id, vehicle_type, home_fc
        FROM bronze.drivers WHERE driver_id IS NOT NULL ORDER BY driver_id
    """)

    # --- orders: dedup, quarantine NULL fc and clock-skewed future timestamps ---
    q["orders_null_fc"] = quarantine(con, "orders",
        "SELECT * FROM bronze.orders WHERE fc_id IS NULL", "null_fc_id")
    q["orders_future"] = quarantine(con, "orders",
        "SELECT * FROM bronze.orders WHERE CAST(order_ts AS TIMESTAMP) > now()", "future_timestamp")
    con.execute("""
        CREATE OR REPLACE TABLE silver.orders AS
        SELECT DISTINCT ON (order_id)
               order_id, customer_id, fc_id,
               CAST(order_ts AS TIMESTAMP) order_ts,
               CAST(promised_delivery_ts AS TIMESTAMP) promised_delivery_ts,
               status, channel, CAST(order_total AS DECIMAL(12,2)) order_total,
               CAST(n_items AS INT) n_items
        FROM bronze.orders
        WHERE fc_id IS NOT NULL
          AND CAST(order_ts AS TIMESTAMP) <= now()
        ORDER BY order_id
    """)

    # --- order_items: quarantine non-positive quantity / price ---
    q["items_bad"] = quarantine(con, "order_items",
        "SELECT * FROM bronze.order_items WHERE quantity <= 0 OR unit_price <= 0",
        "non_positive_qty_or_price")
    con.execute("""
        CREATE OR REPLACE TABLE silver.order_items AS
        SELECT order_id, product_id,
               CAST(quantity AS DECIMAL(10,2)) quantity,
               CAST(unit_price AS DECIMAL(10,2)) unit_price,
               CAST(line_total AS DECIMAL(12,2)) line_total
        FROM bronze.order_items
        WHERE quantity > 0 AND unit_price > 0
          AND order_id IN (SELECT order_id FROM silver.orders)
    """)

    # --- deliveries: dedup, type-cast ---
    con.execute("""
        CREATE OR REPLACE TABLE silver.deliveries AS
        SELECT DISTINCT ON (delivery_id)
               delivery_id, order_id, driver_id, vehicle_type,
               CAST(dispatch_ts AS TIMESTAMP) dispatch_ts,
               CAST(delivered_ts AS TIMESTAMP) delivered_ts,
               CAST(distance_km AS DOUBLE) distance_km, delivery_status
        FROM bronze.deliveries WHERE delivery_id IS NOT NULL ORDER BY delivery_id
    """)

    # --- inventory: dedup on (date, fc, product) ---
    con.execute("""
        CREATE OR REPLACE TABLE silver.inventory_snapshots AS
        SELECT DISTINCT ON (snapshot_date, fc_id, product_id)
               CAST(snapshot_date AS DATE) snapshot_date, fc_id, product_id,
               CAST(on_hand_units AS INT) on_hand_units,
               CAST(reserved_units AS INT) reserved_units,
               temp_zone, CAST(temp_reading_c AS DOUBLE) temp_reading_c
        FROM bronze.inventory_snapshots
        WHERE product_id IS NOT NULL AND fc_id IS NOT NULL
        ORDER BY snapshot_date, fc_id, product_id
    """)
    return q


# ---------------------------------------------------------------------------
# 3. GOLD — Kimball star schema with surrogate keys + business measures.
# ---------------------------------------------------------------------------
def build_gold(con):
    log("GOLD: building dimensional star schema")
    con.execute("CREATE SCHEMA IF NOT EXISTS gold")

    # dim_date spanning all event dates
    con.execute("""
        CREATE OR REPLACE TABLE gold.dim_date AS
        WITH bounds AS (
            SELECT min(d) lo, max(d) hi FROM (
                SELECT CAST(order_ts AS DATE) d FROM silver.orders
                UNION ALL SELECT snapshot_date FROM silver.inventory_snapshots
                UNION ALL SELECT CAST(delivered_ts AS DATE) FROM silver.deliveries
            )
        ), days AS (
            SELECT unnest(generate_series(lo, hi, INTERVAL 1 DAY))::DATE AS full_date FROM bounds
        )
        SELECT CAST(strftime(full_date, '%Y%m%d') AS INT) AS date_key,
               full_date,
               dayofweek(full_date) AS day_of_week,
               (dayofweek(full_date) IN (0,6)) AS is_weekend,
               month(full_date) AS month, year(full_date) AS year
        FROM days
    """)

    con.execute("""
        CREATE OR REPLACE TABLE gold.dim_customer AS
        SELECT row_number() OVER (ORDER BY customer_id) AS customer_key,
               customer_id, loyalty_tier, city, state, signup_date
        FROM silver.customers
    """)
    con.execute("""
        CREATE OR REPLACE TABLE gold.dim_product AS
        SELECT row_number() OVER (ORDER BY p.product_id) AS product_key,
               p.product_id, p.product_name, p.category_code, p.category_name,
               p.temp_zone, p.unit_cost, p.list_price, p.is_weighed, p.shelf_life_days,
               p.supplier_id, COALESCE(s.supplier_name, 'UNKNOWN_SUPPLIER') supplier_name
        FROM silver.products p
        LEFT JOIN silver.suppliers s USING (supplier_id)
    """)
    con.execute("""
        CREATE OR REPLACE TABLE gold.dim_fc AS
        SELECT row_number() OVER (ORDER BY fc_id) AS fc_key,
               fc_id, fc_name, city, state, lat, lon, capacity_orders_day
        FROM silver.fulfillment_centers
    """)
    con.execute("""
        CREATE OR REPLACE TABLE gold.dim_driver AS
        SELECT row_number() OVER (ORDER BY driver_id) AS driver_key,
               driver_id, vehicle_type, home_fc
        FROM silver.drivers
    """)

    # fct_orders
    con.execute("""
        CREATE OR REPLACE TABLE gold.fct_orders AS
        SELECT row_number() OVER (ORDER BY o.order_id) AS order_key,
               o.order_id, dc.customer_key, df.fc_key,
               CAST(strftime(o.order_ts, '%Y%m%d') AS INT) AS order_date_key,
               o.order_ts, o.status, o.channel, o.order_total, o.n_items
        FROM silver.orders o
        LEFT JOIN gold.dim_customer dc USING (customer_id)
        LEFT JOIN gold.dim_fc df USING (fc_id)
    """)

    # fct_order_items (grain: one product line) with contribution margin
    con.execute("""
        CREATE OR REPLACE TABLE gold.fct_order_items AS
        SELECT row_number() OVER (ORDER BY oi.order_id, oi.product_id) AS order_item_key,
               fo.order_key, dp.product_key, fo.order_date_key,
               oi.quantity, oi.unit_price, oi.line_total,
               CAST(oi.line_total - oi.quantity * dp.unit_cost AS DECIMAL(12,2)) AS line_margin
        FROM silver.order_items oi
        JOIN gold.fct_orders fo USING (order_id)
        LEFT JOIN gold.dim_product dp USING (product_id)
    """)

    # fct_deliveries with delivery_minutes + on-time flag
    con.execute("""
        CREATE OR REPLACE TABLE gold.fct_deliveries AS
        SELECT row_number() OVER (ORDER BY d.delivery_id) AS delivery_key,
               d.delivery_id, d.order_id, dd.driver_key, df.fc_key,
               CAST(strftime(d.delivered_ts, '%Y%m%d') AS INT) AS delivery_date_key,
               d.distance_km,
               CAST(date_diff('second', d.dispatch_ts, d.delivered_ts)/60.0 AS DECIMAL(10,2)) AS delivery_minutes,
               (d.delivered_ts <= o.promised_delivery_ts) AS is_on_time,
               d.delivery_status
        FROM silver.deliveries d
        JOIN silver.orders o USING (order_id)
        LEFT JOIN gold.dim_driver dd USING (driver_id)
        LEFT JOIN gold.dim_fc df ON df.fc_id = o.fc_id
    """)

    # fct_inventory (periodic snapshot) with availability + temp-excursion flag
    con.execute("""
        CREATE OR REPLACE TABLE gold.fct_inventory AS
        SELECT row_number() OVER (ORDER BY i.snapshot_date, i.fc_id, i.product_id) AS inventory_key,
               dp.product_key, df.fc_key,
               CAST(strftime(i.snapshot_date, '%Y%m%d') AS INT) AS snapshot_date_key,
               i.on_hand_units, i.reserved_units,
               (i.on_hand_units - i.reserved_units) AS available_units,
               i.temp_reading_c,
               CASE
                 WHEN i.temp_zone='frozen'  AND i.temp_reading_c > -12 THEN TRUE
                 WHEN i.temp_zone='chilled' AND (i.temp_reading_c < 0 OR i.temp_reading_c > 6) THEN TRUE
                 WHEN i.temp_zone='ambient' AND (i.temp_reading_c < 10 OR i.temp_reading_c > 27) THEN TRUE
                 ELSE FALSE END AS temp_excursion
        FROM silver.inventory_snapshots i
        LEFT JOIN gold.dim_product dp USING (product_id)
        LEFT JOIN gold.dim_fc df USING (fc_id)
    """)


# ---------------------------------------------------------------------------
# 4. DATA QUALITY — gate the run.
# ---------------------------------------------------------------------------
def run_dq(con) -> dq.DQReport:
    log("DQ: running data-quality checks")
    r = dq.DQReport()
    # silver integrity
    r.add(dq.unique(con, "silver.orders", "order_id"))
    r.add(dq.unique(con, "silver.inventory_snapshots", "(snapshot_date, fc_id, product_id)"))
    r.add(dq.not_null(con, "silver.orders", "fc_id"))
    r.add(dq.non_negative(con, "silver.order_items", "quantity"))
    r.add(dq.non_negative(con, "silver.order_items", "unit_price"))
    r.add(dq.relationship(con, "silver.order_items", "order_id", "silver.orders", "order_id"))
    r.add(dq.not_null(con, "silver.customers", "email", severity="WARN", max_null_rate=0.10))
    # gold integrity (the numbers analysts will trust)
    r.add(dq.unique(con, "gold.fct_orders", "order_key"))
    r.add(dq.not_null(con, "gold.fct_orders", "customer_key"))
    r.add(dq.not_null(con, "gold.fct_order_items", "product_key"))
    r.add(dq.row_count_min(con, "gold.fct_order_items", 10000))
    r.add(dq.accepted_values(con, "gold.fct_orders", "status",
                             ["DELIVERED", "CANCELLED", "RETURNED"]))
    return r


# ---------------------------------------------------------------------------
# 5. EXPORT — write gold to Parquet lake + run metrics.
# ---------------------------------------------------------------------------
def export_gold(con):
    log("EXPORT: writing gold tables to Parquet lake")
    gold_tables = [t[0] for t in con.sql(
        "SELECT table_name FROM information_schema.tables WHERE table_schema='gold'").fetchall()]
    for t in gold_tables:
        out = os.path.join(C.GOLD, f"{t}.parquet")
        con.execute(f"COPY gold.{t} TO '{out}' (FORMAT PARQUET)")
    return gold_tables


def main():
    t0 = time.time()
    C.ensure_dirs()
    # fresh quarantine each run (idempotent demo)
    for f in os.listdir(C.QUARANTINE):
        os.remove(os.path.join(C.QUARANTINE, f))

    con = duckdb.connect(C.WAREHOUSE_DB)
    build_bronze(con)
    quar = build_silver(con)
    build_gold(con)
    report = run_dq(con)
    gold_tables = export_gold(con)

    # row counts for the run report
    counts = {}
    for sch in ("bronze", "silver", "gold"):
        for (tbl,) in con.sql(
            f"SELECT table_name FROM information_schema.tables WHERE table_schema='{sch}'").fetchall():
            counts[f"{sch}.{tbl}"] = con.sql(f"SELECT count(*) FROM {sch}.{tbl}").fetchone()[0]

    metrics = {
        "run_at": datetime.now(timezone.utc).isoformat(),
        "elapsed_seconds": round(time.time() - t0, 3),
        "row_counts": counts,
        "quarantined": quar,
        "quarantined_total": sum(quar.values()),
        "dq_summary": report.summary(),
        "dq_results": [r.to_dict() for r in report.results],
        "gold_tables": gold_tables,
    }
    with open(os.path.join(C.METRICS, "last_run.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    # console summary
    print("\n" + "=" * 64)
    print("FreshCart batch ELT — run summary")
    print("=" * 64)
    for k in sorted(counts):
        print(f"  {k:<34} {counts[k]:>10,}")
    s = report.summary()
    print(f"\n  quarantined rows : {metrics['quarantined_total']:,}  ({quar})")
    print(f"  DQ checks        : {s['passed']}/{s['total']} passed, "
          f"{s['blocking_failed']} blocking failures, {s['warnings']} warnings")
    for r in report.results:
        if not r.passed:
            flag = "BLOCK" if r.severity == "BLOCKING" else "warn "
            print(f"    [{flag}] {r.table}.{r.name}: {r.detail}")
    print(f"  elapsed          : {metrics['elapsed_seconds']}s")
    con.close()

    if report.blocking_failures:
        print("\nFAILED: blocking data-quality checks. Gold is NOT certified.")
        raise SystemExit(1)
    print("\nOK: all blocking checks passed. Gold star schema is certified for serving.")


if __name__ == "__main__":
    main()
