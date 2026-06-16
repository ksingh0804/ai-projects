"""FreshCart stream processor (the 'consumer' side) — stateful micro-batch.

Consumes `data/streaming/events.jsonl` by ingest_offset (exactly like reading a Kafka
topic partition) and demonstrates the core competencies an interviewer probes for in
a streaming role:

  1. EXACTLY-ONCE EFFECT via idempotent dedup on event_id (input is at-least-once).
  2. EVENT-TIME processing with a WATERMARK (not processing-time) so results are correct
     even when events arrive out of order.
  3. TUMBLING WINDOWS (10-min) for delivered-orders + on-time-rate KPIs.
  4. ALLOWED LATENESS + a LATE side-output (late events are captured, not lost).
  5. STATEFUL per-order tracking -> live ETA from the latest GPS ping (haversine).
  6. ETA ACCURACY: compares predicted ETA at last ping vs actual delivery time.

This is what Spark Structured Streaming / Flink give you natively; we implement it in
plain Python so the mechanics are visible.
"""
from __future__ import annotations

import json
import math
import os
from collections import defaultdict
from datetime import datetime, timedelta

import common as C

WINDOW = timedelta(minutes=10)      # tumbling window size
ALLOWED_LATENESS = timedelta(minutes=10)
MICRO_BATCH = 250                   # events per micro-batch (checkpoint boundary)


def parse_ts(s: str) -> datetime:
    return datetime.strptime(s, "%Y-%m-%d %H:%M:%S")


def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def window_start(ts: datetime) -> datetime:
    epoch = datetime(2026, 6, 8)
    n = int((ts - epoch) / WINDOW)
    return epoch + n * WINDOW


def main():
    C.ensure_dirs()
    state_dir = os.path.join(C.STREAMING, "_state")
    os.makedirs(state_dir, exist_ok=True)

    src = os.path.join(C.STREAMING, "events.jsonl")
    if not os.path.exists(src):
        raise SystemExit("No events. Run: python src/stream_simulator.py first.")

    events = [json.loads(line) for line in open(src)]
    events.sort(key=lambda e: e["ingest_offset"])  # consume in topic order

    seen = set()                       # event_id dedup -> exactly-once effect
    orders = {}                        # order_id -> live state
    windows = defaultdict(lambda: {"delivered": 0, "on_time": 0})
    closed_windows = set()
    late_events = []
    eta_errors = []
    watermark = None
    stats = {"consumed": 0, "duplicates": 0, "late": 0, "micro_batches": 0}

    def process(ev):
        nonlocal watermark
        eid = ev["event_id"]
        if eid in seen:                # idempotent dedup
            stats["duplicates"] += 1
            return
        seen.add(eid)
        stats["consumed"] += 1

        et = parse_ts(ev["event_time"])
        watermark = et - ALLOWED_LATENESS if watermark is None else max(watermark, et - ALLOWED_LATENESS)
        key, typ, pl = ev["key"], ev["event_type"], ev["payload"]
        st = orders.setdefault(key, {"order_id": key, "status": None, "eta_min": None,
                                     "dest": None, "last_speed": None, "predicted_eta_ts": None})

        if typ == "order_placed":
            st["status"] = "PLACED"; st["promised_ts"] = pl.get("promised_ts")
        elif typ == "picking_started":
            st["status"] = "PICKING"
        elif typ == "dispatched":
            st["status"] = "EN_ROUTE"; st["dest"] = (pl["dest_lat"], pl["dest_lon"])
        elif typ == "gps_ping":
            st["status"] = "EN_ROUTE"
            rem = haversine_km(pl["lat"], pl["lon"], pl["dest_lat"], pl["dest_lon"])
            speed = max(pl["speed_kmh"], 6.0)
            eta_min = rem / speed * 60.0
            st["eta_min"] = round(eta_min, 1)
            st["last_speed"] = pl["speed_kmh"]
            st["predicted_eta_ts"] = et + timedelta(minutes=eta_min)
        elif typ == "delivered":
            st["status"] = "DELIVERED"
            st["delivered_ts"] = pl["delivered_ts"]
            # ETA accuracy: predicted arrival (from last ping) vs actual delivered time
            if st.get("predicted_eta_ts"):
                err = abs((parse_ts(pl["delivered_ts"]) - st["predicted_eta_ts"]).total_seconds()) / 60.0
                eta_errors.append(err)
            # window assignment on EVENT TIME with watermark/lateness handling
            ws = window_start(et)
            on_time = parse_ts(pl["delivered_ts"]) <= parse_ts(pl["promised_ts"])
            if ws in closed_windows or (ws + WINDOW) <= watermark:
                stats["late"] += 1
                late_events.append({"order_id": key, "event_time": ev["event_time"],
                                    "window_start": ws.strftime("%Y-%m-%d %H:%M:%S"),
                                    "reason": "arrived_after_watermark"})
            else:
                windows[ws]["delivered"] += 1
                if on_time:
                    windows[ws]["on_time"] += 1

        # close any windows the watermark has passed (tumbling window firing)
        for ws in list(windows.keys()):
            if (ws + WINDOW) <= watermark:
                closed_windows.add(ws)

    # consume in micro-batches (each batch = a checkpoint in Spark/Flink terms)
    for i in range(0, len(events), MICRO_BATCH):
        batch = events[i:i + MICRO_BATCH]
        for ev in batch:
            process(ev)
        stats["micro_batches"] += 1

    # --- write real-time serving views ---
    # 1. live ETA snapshot for any order still en route (what the "track your order" screen reads)
    live = [{"order_id": s["order_id"], "status": s["status"], "eta_min": s["eta_min"]}
            for s in orders.values() if s["status"] == "EN_ROUTE"]
    json.dump(live, open(os.path.join(state_dir, "live_eta.json"), "w"), indent=2)

    # 2. windowed KPI metrics
    win_rows = []
    for ws in sorted(windows):
        d = windows[ws]
        win_rows.append({"window_start": ws.strftime("%Y-%m-%d %H:%M:%S"),
                         "delivered": d["delivered"], "on_time": d["on_time"],
                         "on_time_rate": round(d["on_time"] / d["delivered"], 3) if d["delivered"] else None,
                         "closed": ws in closed_windows})
    json.dump(win_rows, open(os.path.join(state_dir, "window_metrics.json"), "w"), indent=2)

    # 3. late side-output
    with open(os.path.join(state_dir, "late_events.jsonl"), "w") as f:
        for le in late_events:
            f.write(json.dumps(le) + "\n")

    # --- summary ---
    total_delivered = sum(w["delivered"] for w in windows.values())
    total_on_time = sum(w["on_time"] for w in windows.values())
    print("=" * 60)
    print("FreshCart stream processor — run summary")
    print("=" * 60)
    print(f"  micro-batches processed : {stats['micro_batches']}")
    print(f"  events consumed         : {stats['consumed']:,}")
    print(f"  duplicates deduped      : {stats['duplicates']} (exactly-once effect)")
    print(f"  orders tracked          : {len(orders):,}")
    print(f"  windows (tumbling 10m)  : {len(windows)} ({len(closed_windows)} closed by watermark)")
    print(f"  delivered (windowed)    : {total_delivered:,}")
    print(f"  on-time rate            : {round(total_on_time/total_delivered,3) if total_delivered else 'n/a'}")
    print(f"  LATE events (side-out)  : {stats['late']}  -> _state/late_events.jsonl")
    if eta_errors:
        print(f"  ETA accuracy (MAE)      : {round(sum(eta_errors)/len(eta_errors),2)} min "
              f"over {len(eta_errors)} deliveries")
    print(f"  live ETA snapshot       : {len(live)} orders still en route -> _state/live_eta.json")
    print("\nOK: real-time views written to data/streaming/_state/")


if __name__ == "__main__":
    main()
