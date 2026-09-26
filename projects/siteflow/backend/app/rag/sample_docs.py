"""Original short specs for the demo project. Not copied from a vendor manual."""

from __future__ import annotations

from pathlib import Path

from app.pdfutil import build_text_pdf

SAMPLE_PDFS: dict[str, list[str]] = {
    "Division_03_Cast_in_Place_Concrete.pdf": [
        "Division 03 Cast-in-Place Concrete",
        "Section 03 30 00.",
        "Curing: keep cast-in-place concrete wet for 7 days when the daily low stays above 40 F.",
        "Weather limit: do not place concrete when the air temperature is below 40 F or above 95 F.",
        "Strength: do not load the slab until test cylinders reach 75 percent of the specified strength.",
    ],
    "Division_05_Structural_Steel.pdf": [
        "Division 05 Structural Steel",
        "Lead time language: mill lead time for structural steel is 8 to 12 weeks after approved shop drawings.",
        "Mill certs: submit mill test reports for steel shapes before erection.",
        "Bolt spec: field bolts are ASTM F3125 Grade A325 unless the drawings say otherwise.",
    ],
    "RFI-014_Foundation_Pour_Hold.pdf": [
        "RFI-014 Foundation Pour Hold",
        "Status: Open",
        "Question: Can the slab on grade be poured before the vapor barrier submittal is approved?",
        "Response: No. The pour stays on hold.",
        "Blocked activity: slab on grade foundation pour",
        "Reason: open RFI-014 until the vapor barrier submittal is approved.",
    ],
    "Submittal_Log_Excerpt.pdf": [
        "Submittal Log Excerpt",
        "Rebar: submittal SB-12, status approved.",
        "Anchor bolts: submittal SB-18, status pending.",
        "Vapor barrier: submittal SB-21, status revise and resubmit.",
    ],
    "Site_Logistics_Plan.pdf": [
        "Site Logistics Plan",
        "Laydown: structural steel laydown is the north yard.",
        "Deliveries: weekday deliveries are 7:00 to 15:00.",
        "Gate hours: the south gate is open from 6:30 to 16:00.",
    ],
}

MATERIALS_CSV = """sku,description,on_hand,lead_days,unit_cost,annual_demand,order_cost
REBAR-5,Grade 60 number 5 rebar,800,21,4.10,12000,50
STEEL-W,W12x26 structural steel beam,40,56,180.00,400,75
AB-34,Anchor bolt 3/4 inch,120,14,6.50,2000,40
VB-10,Vapor barrier 10 mil roll,30,7,90.00,150,25
"""


def write_sample_pack(directory: Path) -> None:
    directory.mkdir(parents=True, exist_ok=True)
    for filename, lines in SAMPLE_PDFS.items():
        (directory / filename).write_bytes(build_text_pdf([lines]))
    (directory / "materials.csv").write_text(MATERIALS_CSV, encoding="utf-8")
