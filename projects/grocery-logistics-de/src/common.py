"""Shared paths and config for the FreshCart data platform.

Keeping all filesystem layout in one place mirrors how a real platform centralizes
its storage layout / catalog config (e.g. an `dbt_project.yml` + a storage config),
so every pipeline step agrees on where bronze/silver/gold live.
"""
from __future__ import annotations

import os

# ---------------------------------------------------------------------------
# Directory layout — a local "lakehouse".
#   data/raw          -> source-system extracts (simulating OLTP DB dumps + APIs)
#   data/lake/bronze  -> raw, append-only, schema-on-read (exact copy of source)
#   data/lake/silver  -> cleaned, conformed, deduplicated, typed
#   data/lake/gold    -> business-ready star schema (facts + dimensions)
#   data/streaming    -> simulated real-time event logs (order + GPS events)
#   data/warehouse.duckdb -> the query engine's catalog over gold
# ---------------------------------------------------------------------------
HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(HERE)
DATA = os.path.join(PROJECT_ROOT, "data")

RAW = os.path.join(DATA, "raw")
BRONZE = os.path.join(DATA, "lake", "bronze")
SILVER = os.path.join(DATA, "lake", "silver")
GOLD = os.path.join(DATA, "lake", "gold")
STREAMING = os.path.join(DATA, "streaming")
QUARANTINE = os.path.join(DATA, "lake", "_quarantine")
METRICS = os.path.join(DATA, "_metrics")

WAREHOUSE_DB = os.path.join(DATA, "warehouse.duckdb")

ALL_DIRS = [RAW, BRONZE, SILVER, GOLD, STREAMING, QUARANTINE, METRICS]


def ensure_dirs() -> None:
    for d in ALL_DIRS:
        os.makedirs(d, exist_ok=True)


# Deterministic seed so every run of the demo is reproducible (important for
# data engineering: pipelines must be idempotent and testable).
SEED = 20260608

# Scale knobs. Bump these to stress-test; defaults keep a full run < a few seconds.
N_CUSTOMERS = 4000
N_PRODUCTS = 1200
N_SUPPLIERS = 60
N_FULFILLMENT_CENTERS = 8
N_DRIVERS = 220
N_DAYS = 30           # history window
ORDERS_PER_DAY = 900
