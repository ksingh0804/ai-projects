"""Simulate FreshCart's real-time event stream (the 'producer' side).

In production these events land on a Kafka / Kinesis / Pub-Sub topic. Here we write
them to a newline-delimited JSON log (`data/streaming/events.jsonl`) which the
processor (`stream_processor.py`) consumes by offset, exactly like a Kafka consumer.

Two event kinds, both keyed by order_id (the partition key in Kafka):
  - ORDER lifecycle: order_placed -> picking -> dispatched -> en_route -> delivered
  - DRIVER GPS ping: lat/lon/speed while en_route

We deliberately model the hard parts of streaming so the processor can show how to
handle them:
  - event_time != ingest order  (network/buffer delay -> out-of-order arrival)
  - LATE events  (arrive after their window's watermark)
  - DUPLICATE delivery (at-least-once) -> same event_id twice
Each record has: event_id, key (order_id), event_type, event_time, ingest_offset, payload.
"""
from __future__ import annotations

import json
import math
import os
import random
from datetime import datetime, timedelta

import common as C

random.seed(C.SEED + 1)

# A single FC and a delivery region around it (one city for a clean demo).
FC = {"fc_id": "FC001", "lat": 41.88, "lon": -87.63}
N_DELIVERIES = 320
SIM_START = datetime(2026, 6, 8, 17, 0, 0)   # an evening dinner rush
WINDOW_MINUTES = 60


def _haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _dest_near_fc():
    # random destination within ~8km of the FC
    dlat = random.uniform(-0.06, 0.06)
    dlon = random.uniform(-0.08, 0.08)
    return FC["lat"] + dlat, FC["lon"] + dlon


def main():
    C.ensure_dirs()
    events = []  # (event_time, event_dict) before we assign ingest offsets

    eid = 0
    for i in range(1, N_DELIVERIES + 1):
        order_id = f"RT{i:06d}"
        driver_id = f"D{random.randint(1, C.N_DRIVERS):05d}"
        placed = SIM_START + timedelta(seconds=random.randint(0, WINDOW_MINUTES * 60))
        dest_lat, dest_lon = _dest_near_fc()
        total_km = _haversine_km(FC["lat"], FC["lon"], dest_lat, dest_lon)
        promised = placed + timedelta(minutes=random.choice([45, 60, 60, 90]))

        def add(etype, etime, payload):
            nonlocal eid
            eid += 1
            events.append((etime, {
                "event_id": f"E{eid:08d}",
                "key": order_id,
                "event_type": etype,
                "event_time": etime.strftime("%Y-%m-%d %H:%M:%S"),
                "payload": payload,
            }))

        add("order_placed", placed, {"fc_id": FC["fc_id"], "promised_ts": promised.strftime("%Y-%m-%d %H:%M:%S")})
        pick = placed + timedelta(minutes=random.uniform(2, 8))
        add("picking_started", pick, {"fc_id": FC["fc_id"]})
        dispatch = pick + timedelta(minutes=random.uniform(4, 12))
        add("dispatched", dispatch, {"driver_id": driver_id, "dest_lat": round(dest_lat, 5),
                                      "dest_lon": round(dest_lon, 5), "total_km": round(total_km, 2)})

        # GPS pings approaching destination
        n_pings = random.randint(4, 9)
        for k in range(1, n_pings + 1):
            frac = k / (n_pings + 1)
            cur_lat = FC["lat"] + (dest_lat - FC["lat"]) * frac
            cur_lon = FC["lon"] + (dest_lon - FC["lon"]) * frac
            speed = random.uniform(12, 38)  # km/h, urban
            ping_ts = dispatch + timedelta(minutes=frac * total_km / max(speed, 8) * 60 + random.uniform(0, 1))
            add("gps_ping", ping_ts, {"driver_id": driver_id, "lat": round(cur_lat, 5),
                                      "lon": round(cur_lon, 5), "speed_kmh": round(speed, 1),
                                      "dest_lat": round(dest_lat, 5), "dest_lon": round(dest_lon, 5)})

        delivered = dispatch + timedelta(minutes=total_km / random.uniform(14, 26) * 60 + random.uniform(2, 6))
        add("delivered", delivered, {"driver_id": driver_id,
                                     "delivered_ts": delivered.strftime("%Y-%m-%d %H:%M:%S"),
                                     "promised_ts": promised.strftime("%Y-%m-%d %H:%M:%S")})

    # --- assign ingest order = event_time + jitter (so stream is mostly-but-not-fully ordered) ---
    jittered = []
    for etime, ev in events:
        arrival = etime + timedelta(seconds=random.gauss(20, 25))  # buffering/network delay
        jittered.append((arrival, ev))

    # inject genuinely LATE events: a few delivered events arrive very late
    late = random.sample([j for j in jittered if j[1]["event_type"] == "delivered"], 6)
    for arrival, ev in late:
        jittered.remove((arrival, ev))
        jittered.append((arrival + timedelta(minutes=20), ev))  # > allowed lateness

    jittered.sort(key=lambda x: x[0])

    # inject DUPLICATES (at-least-once): repeat 8 delivered events at the same offset
    out_rows = []
    for offset, (arrival, ev) in enumerate(jittered):
        ev = dict(ev)
        ev["ingest_offset"] = offset
        out_rows.append(ev)
    for ev in random.sample([e for e in out_rows if e["event_type"] == "delivered"], 8):
        dup = dict(ev)
        out_rows.append(dup)  # same event_id -> processor must dedup

    path = os.path.join(C.STREAMING, "events.jsonl")
    with open(path, "w") as f:
        for ev in out_rows:
            f.write(json.dumps(ev) + "\n")

    by_type = {}
    for ev in out_rows:
        by_type[ev["event_type"]] = by_type.get(ev["event_type"], 0) + 1
    print(f"Wrote {len(out_rows):,} events for {N_DELIVERIES} deliveries -> {os.path.relpath(path, C.PROJECT_ROOT)}")
    for t, n in sorted(by_type.items()):
        print(f"  {t:<16} {n:>6,}")
    print("  (includes injected out-of-order, late, and duplicate events)")


if __name__ == "__main__":
    main()
