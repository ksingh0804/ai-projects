"""Synthetic source-system data generator for FreshCart (online grocery + last-mile delivery).

This simulates the *extracts* a data engineer actually receives in industry:
  - a relational Orders/OMS database (orders, order_items)
  - a Product/Catalog service (products, categories, suppliers)
  - an Inventory/WMS system (daily on-hand snapshots per fulfillment center)
  - a Logistics/Dispatch system (deliveries, drivers)
  - a Customer/CRM system (customers)

Real source data is *messy*, so we deliberately inject the same defects a real
pipeline must survive (and which the silver layer + DQ checks will catch):
  - duplicate rows (at-least-once delivery from upstream CDC)
  - NULLs in required-ish fields
  - negative / zero quantities and prices (bad upstream input)
  - orphan foreign keys (referential drift between microservices)
  - out-of-range temperature readings on cold-chain items
  - late / future-dated timestamps (clock skew)

Output: CSV files under data/raw/ plus a small _manifest.json describing the run.
Everything is deterministic (seeded) so runs are reproducible and testable.
"""
from __future__ import annotations

import csv
import json
import os
import random
from datetime import datetime, timedelta

import common as C

random.seed(C.SEED)

CATEGORIES = [
    ("PROD", "Produce", "chilled"),
    ("DAIR", "Dairy & Eggs", "chilled"),
    ("MEAT", "Meat & Seafood", "chilled"),
    ("FROZ", "Frozen", "frozen"),
    ("BAKE", "Bakery", "ambient"),
    ("PANT", "Pantry", "ambient"),
    ("BEVG", "Beverages", "ambient"),
    ("SNAC", "Snacks", "ambient"),
    ("HOUS", "Household", "ambient"),
    ("BABY", "Baby & Personal Care", "ambient"),
]

CITIES = [
    ("Chicago", "IL", 41.88, -87.63),
    ("New York", "NY", 40.71, -74.00),
    ("Los Angeles", "CA", 34.05, -118.24),
    ("Houston", "TX", 29.76, -95.37),
    ("Phoenix", "AZ", 33.45, -112.07),
    ("Seattle", "WA", 47.61, -122.33),
    ("Atlanta", "GA", 33.75, -84.39),
    ("Denver", "CO", 39.74, -104.99),
]

ORDER_STATUSES = ["DELIVERED", "DELIVERED", "DELIVERED", "DELIVERED", "CANCELLED", "RETURNED"]
CHANNELS = ["app_ios", "app_android", "web", "web", "app_ios"]


def _w(path: str, header: list[str], rows: list[list]) -> None:
    with open(path, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)


def gen_suppliers() -> list[dict]:
    rows = []
    for i in range(1, C.N_SUPPLIERS + 1):
        city = random.choice(CITIES)
        rows.append({
            "supplier_id": f"SUP{i:04d}",
            "supplier_name": f"{random.choice(['Sunrise','Harvest','Lakeside','Summit','Coastal','Prairie'])} "
                             f"{random.choice(['Farms','Foods','Distributors','Trading','Provisions'])}",
            "lead_time_days": random.choice([1, 2, 2, 3, 5, 7]),
            "reliability_score": round(random.uniform(0.82, 0.995), 3),
            "city": city[0],
            "state": city[1],
        })
    return rows


def gen_products(suppliers: list[dict]) -> list[dict]:
    rows = []
    for i in range(1, C.N_PRODUCTS + 1):
        cat_code, cat_name, temp = random.choice(CATEGORIES)
        unit_cost = round(random.uniform(0.4, 18.0), 2)
        margin = random.uniform(0.18, 0.55)
        price = round(unit_cost * (1 + margin), 2)
        rows.append({
            "product_id": f"P{i:06d}",
            "product_name": f"{cat_name.split()[0]} Item {i}",
            "category_code": cat_code,
            "category_name": cat_name,
            "temp_zone": temp,           # ambient | chilled | frozen  (cold-chain matters!)
            "supplier_id": random.choice(suppliers)["supplier_id"],
            "unit_cost": unit_cost,
            "list_price": price,
            "is_weighed": 1 if cat_code in ("PROD", "MEAT") else 0,
            "shelf_life_days": {"frozen": 365, "chilled": 14, "ambient": 270}[temp],
        })
    # Inject a few orphan supplier references (microservice drift).
    for r in random.sample(rows, 6):
        r["supplier_id"] = "SUP9999"  # does not exist
    return rows


def gen_fulfillment_centers() -> list[dict]:
    rows = []
    for i in range(1, C.N_FULFILLMENT_CENTERS + 1):
        city = CITIES[(i - 1) % len(CITIES)]
        rows.append({
            "fc_id": f"FC{i:03d}",
            "fc_name": f"{city[0]} Dark Store {i}",
            "city": city[0],
            "state": city[1],
            "lat": city[2],
            "lon": city[3],
            "capacity_orders_day": random.choice([1200, 1800, 2400, 3000]),
        })
    return rows


def gen_customers() -> list[dict]:
    rows = []
    for i in range(1, C.N_CUSTOMERS + 1):
        city = random.choice(CITIES)
        signup = datetime(2024, 1, 1) + timedelta(days=random.randint(0, 800))
        rows.append({
            "customer_id": f"C{i:07d}",
            "signup_date": signup.strftime("%Y-%m-%d"),
            "city": city[0],
            "state": city[1],
            "loyalty_tier": random.choice(["none", "none", "silver", "gold", "plus"]),
            "email": f"user{i}@example.com" if random.random() > 0.03 else "",  # some NULL emails
        })
    return rows


def gen_orders_and_lines(customers, products, fcs):
    orders, lines = [], []
    start = datetime(2026, 5, 9, 6, 0, 0)
    oid = 0
    for day in range(C.N_DAYS):
        day0 = start + timedelta(days=day)
        for _ in range(C.ORDERS_PER_DAY):
            oid += 1
            cust = random.choice(customers)
            fc = random.choice(fcs)
            # order placed during waking hours, demand peaks evening
            hour = random.choices(range(6, 23), weights=[2,3,4,5,5,6,7,6,5,6,7,9,11,12,10,7,4])[0]
            order_ts = day0.replace(hour=hour, minute=random.randint(0, 59), second=random.randint(0, 59))
            status = random.choice(ORDER_STATUSES)
            promised = order_ts + timedelta(minutes=random.choice([60, 90, 120, 120, 180]))
            n_items = random.choices([1,2,3,4,5,6,8,12], weights=[5,8,12,12,10,8,5,3])[0]
            order_total = 0.0
            chosen = random.sample(products, min(n_items, len(products)))
            for p in chosen:
                qty = random.choices([1,1,1,2,2,3,4], weights=[40,20,15,12,6,4,3])[0]
                # weighed items get fractional quantities
                if p["is_weighed"]:
                    qty = round(random.uniform(0.3, 2.5), 2)
                unit_price = p["list_price"]
                # occasional promo discount
                if random.random() < 0.12:
                    unit_price = round(unit_price * random.choice([0.8, 0.85, 0.9]), 2)
                line_total = round(qty * unit_price, 2)
                order_total += line_total
                lines.append({
                    "order_id": f"O{oid:08d}",
                    "product_id": p["product_id"],
                    "quantity": qty,
                    "unit_price": unit_price,
                    "line_total": line_total,
                })
            orders.append({
                "order_id": f"O{oid:08d}",
                "customer_id": cust["customer_id"],
                "fc_id": fc["fc_id"],
                "order_ts": order_ts.strftime("%Y-%m-%d %H:%M:%S"),
                "promised_delivery_ts": promised.strftime("%Y-%m-%d %H:%M:%S"),
                "status": status,
                "channel": random.choice(CHANNELS),
                "order_total": round(order_total, 2),
                "n_items": n_items,
            })
    # --- inject defects ---
    # duplicate ~0.5% of orders (CDC at-least-once)
    for o in random.sample(orders, max(1, len(orders) // 200)):
        orders.append(dict(o))
    # negative quantity / zero price on a few lines
    for ln in random.sample(lines, 25):
        ln["quantity"] = -abs(ln["quantity"]) if random.random() < 0.5 else 0
    for ln in random.sample(lines, 15):
        ln["unit_price"] = 0
    # NULL fc on a few orders
    for o in random.sample(orders, 12):
        o["fc_id"] = ""
    # future-dated (clock skew) on a couple
    for o in random.sample(orders, 5):
        o["order_ts"] = (datetime(2027, 1, 1)).strftime("%Y-%m-%d %H:%M:%S")
    return orders, lines


def gen_deliveries(orders, fcs):
    drivers = [{"driver_id": f"D{i:05d}",
                "vehicle_type": random.choice(["bike", "car", "car", "van", "scooter"]),
                "home_fc": random.choice(fcs)["fc_id"]} for i in range(1, C.N_DRIVERS + 1)]
    deliveries = []
    for o in orders:
        if o["status"] not in ("DELIVERED", "RETURNED"):
            continue
        if o["fc_id"] == "":
            continue
        try:
            ots = datetime.strptime(o["order_ts"], "%Y-%m-%d %H:%M:%S")
        except ValueError:
            continue
        if ots.year == 2027:  # skip the skew rows for deliveries
            continue
        drv = random.choice(drivers)
        dispatch = ots + timedelta(minutes=random.randint(8, 40))
        distance = round(random.uniform(0.6, 14.0), 2)
        # delivery time ~ distance + traffic noise
        travel = distance * random.uniform(2.2, 4.5) + random.uniform(3, 12)
        delivered = dispatch + timedelta(minutes=travel)
        deliveries.append({
            "delivery_id": "DL" + o["order_id"][1:],
            "order_id": o["order_id"],
            "driver_id": drv["driver_id"],
            "vehicle_type": drv["vehicle_type"],
            "dispatch_ts": dispatch.strftime("%Y-%m-%d %H:%M:%S"),
            "delivered_ts": delivered.strftime("%Y-%m-%d %H:%M:%S"),
            "distance_km": distance,
            "delivery_status": "DELIVERED" if o["status"] == "DELIVERED" else "RETURNED_TO_STORE",
        })
    return drivers, deliveries


def gen_inventory(products, fcs):
    rows = []
    start = datetime(2026, 5, 9).date()
    # snapshot every product x fc x day would be huge; sample a realistic subset
    sample_products = random.sample(products, min(400, len(products)))
    for day in range(C.N_DAYS):
        d = start + timedelta(days=day)
        for fc in fcs:
            for p in random.sample(sample_products, 120):
                on_hand = max(0, int(random.gauss(80, 45)))
                reserved = min(on_hand, max(0, int(random.gauss(15, 12))))
                # cold-chain temperature reading; inject out-of-range defects
                if p["temp_zone"] == "frozen":
                    temp_c = round(random.gauss(-18, 1.5), 1)
                elif p["temp_zone"] == "chilled":
                    temp_c = round(random.gauss(3.5, 1.2), 1)
                else:
                    temp_c = round(random.gauss(20, 2), 1)
                if random.random() < 0.01:
                    temp_c += random.choice([15, 20, -25])  # excursion / sensor fault
                rows.append({
                    "snapshot_date": d.strftime("%Y-%m-%d"),
                    "fc_id": fc["fc_id"],
                    "product_id": p["product_id"],
                    "on_hand_units": on_hand,
                    "reserved_units": reserved,
                    "temp_zone": p["temp_zone"],
                    "temp_reading_c": temp_c,
                })
    return rows


def main():
    C.ensure_dirs()
    suppliers = gen_suppliers()
    products = gen_products(suppliers)
    fcs = gen_fulfillment_centers()
    customers = gen_customers()
    orders, lines = gen_orders_and_lines(customers, products, fcs)
    drivers, deliveries = gen_deliveries(orders, fcs)
    inventory = gen_inventory(products, fcs)

    def dump(name, rows):
        path = os.path.join(C.RAW, f"{name}.csv")
        header = list(rows[0].keys())
        _w(path, header, [[r[h] for h in header] for r in rows])
        return {"table": name, "rows": len(rows), "path": os.path.relpath(path, C.PROJECT_ROOT)}

    manifest = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "seed": C.SEED,
        "tables": [
            dump("suppliers", suppliers),
            dump("products", products),
            dump("fulfillment_centers", fcs),
            dump("customers", customers),
            dump("orders", orders),
            dump("order_items", lines),
            dump("drivers", drivers),
            dump("deliveries", deliveries),
            dump("inventory_snapshots", inventory),
        ],
    }
    with open(os.path.join(C.RAW, "_manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)

    print("Generated source extracts in data/raw/:")
    for t in manifest["tables"]:
        print(f"  {t['table']:<22} {t['rows']:>8,} rows")
    print(f"\nTotal source rows: {sum(t['rows'] for t in manifest['tables']):,}")


if __name__ == "__main__":
    main()
