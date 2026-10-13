"""Original practice documents for one fictional job.

Cedarline Training Hall (SYNTH-HALL-01) is invented for this repo. The
sentences are original. They are not a copy of a customer manual, a stamped
drawing set, or an export from a construction platform.

data/sample is what the demo project uploads: PDFs plus materials.csv.
Every CSV in that folder is checked as a materials table, so registers that
are not SKU tables live in data/artifacts instead.
"""

from __future__ import annotations

from pathlib import Path

from app.pdfutil import build_text_pdf

PROJECT_CODE = "SYNTH-HALL-01"
PROJECT_NAME = "Cedarline Training Hall"
BANNER = (
    "Practice file: Cedarline Training Hall, job SYNTH-HALL-01.",
    "Original text. Not a real project and not a platform export.",
)

# These sentences are the demo contract. Keep them intact on page 1.
_CONCRETE = [
    "Division 03 Cast-in-Place Concrete",
    *BANNER,
    "Section 03 30 00.",
    "Curing: keep cast-in-place concrete wet for 7 days when the daily low stays above 40 F.",
    "Weather limit: do not place concrete when the air temperature is below 40 F or above 95 F.",
    "Strength: do not load the slab until test cylinders reach 75 percent of the specified strength.",
    "Project: Cedarline Training Hall, a one-story practice hall. This section covers the slab and the grade beams only.",
    "Mix: the practice mix is called CH-4000. Design strength is 4000 psi at 28 days. Water added on site is not allowed.",
    "Joints: saw cut control joints the morning after placement, at the spacing on sheet S-101.",
    "Finish: light broom finish on walking surfaces. Do not add a shake-on hardener.",
    "Cylinders: cast one set of three cylinders for every 50 cubic yards, and one set on the last truck of the day.",
    "Hot weather: shade the forms and start curing the same day. The temperature cap above is the placement rule.",
    "Cold weather: if the forecast low is under the temperature floor above, wait. Do not use a different number.",
    "Repair: honeycombing deeper than 1 inch is written up as an issue. It is not patched in secret.",
    "Related file: the vapor-barrier product sheet is Division 07. The open question about placement is RFI-014.",
]

_STEEL = [
    "Division 05 Structural Steel",
    *BANNER,
    "Section 05 12 00.",
    "Lead time language: mill lead time for structural steel is 8 to 12 weeks after approved shop drawings.",
    "Mill certs: submit mill test reports for steel shapes before erection.",
    "Bolt spec: field bolts are ASTM F3125 Grade A325 unless the drawings say otherwise.",
    "Scope: columns, beams, and the roof joists shown on sheets S-201 and S-202 for this practice hall.",
    "Shop drawings: send erection drawings and piece marks before fabrication. The clock for mill time starts at approval, not at the purchase order.",
    "Coatings: shop primer only. Field paint is Section 09 90 00 and is outside this file.",
    "Tolerances: plumb columns within 1 in 500. Shim with steel plates, not with wood.",
    "Connections: shop welds follow the practice weld procedure WPS-CH-1. Field welds are listed on the piece drawing.",
    "Delivery: tag each piece with the piece mark and the heat number that matches the mill report.",
    "Laydown: the north yard, as the site logistics plan describes. Do not unload onto the south drive.",
    "Erection: do not start erection until the mill reports for the shapes on that sequence are in the file.",
]

_RFI = [
    "RFI-014 Foundation Pour Hold",
    *BANNER,
    "Number: RFI-014",
    "Status: Open",
    "Discipline: concrete",
    "Spec section: 03 30 00 and 07 26 00",
    "Location: slab on grade, grids A-D and 1-4",
    "From: project engineer (practice role)",
    "To: architect of record (practice role)",
    "Question: Can the slab on grade be poured before the vapor barrier submittal is approved?",
    "Response: No. The pour stays on hold.",
    "Blocked activity: slab on grade foundation pour",
    "Reason: open RFI-014 until the vapor barrier submittal is approved.",
    "Official response status: answered, and the work stays waiting.",
    "Due: 2026-04-18",
    "Opened: 2026-04-02",
    "Linked submittal: SB-21, vapor barrier, revise and resubmit.",
    "What this file is not: it is not a change order, and it does not authorize a purchase.",
    "Clearing it: a later revision of SB-21 marked approved is what removes this block. A verbal note does not.",
]

_SUBMITTALS = [
    "Submittal Log Excerpt",
    *BANNER,
    "Register for Cedarline Training Hall. Status words are the practice set: approved, pending, submitted, revise and resubmit.",
    "Rebar: submittal SB-12, status approved.",
    "Anchor bolts: submittal SB-18, status pending.",
    "Vapor barrier: submittal SB-21, status revise and resubmit.",
    "Concrete mix CH-4000: submittal SB-07, spec 03 30 00, status approved.",
    "Steel shop drawings: submittal SB-16, spec 05 12 00, status submitted.",
    "Steel mill reports: submittal SB-30, spec 05 12 00, status submitted.",
    "Formwork layout: submittal SB-04, spec 03 11 00, status approved.",
    "Earthwork compaction report: submittal SB-02, spec 31 20 00, status approved.",
    "How to read a row: the number (SB-21) is the register id. The spec section is where the product is specified. The status is the review answer.",
    "SB-21 note: the reviewer asked for the seam tape data sheet and the penetration detail. Those pages were missing.",
    "Use: the assistant should cite this log when the question is about a submittal status. The product rules live in the division files.",
]

_LOGISTICS = [
    "Site Logistics Plan",
    *BANNER,
    "Sheet C-010, practice logistics. Not a surveyed site plan.",
    "Laydown: structural steel laydown is the north yard.",
    "Deliveries: weekday deliveries are 7:00 to 15:00.",
    "Gate hours: the south gate is open from 6:30 to 16:00.",
    "Gates: the south gate is the only vehicle entrance. The north gate is emergency egress and stays locked.",
    "Crane: the mobile crane pads sit on the east drive. Do not stage trucks under the swing.",
    "Trailers: the field office is the west trailer. The review table for submittals is in that trailer.",
    "Waste: one dumpster at the southwest corner. Cover it at the end of the day.",
    "Pedestrians: the public sidewalk on Practice Yard stays open. Do not store material on it.",
    "Concrete trucks: when a placement is allowed, they queue on the east drive and wash out in the lined pit.",
    "Radios: channel 2 is the site channel for this practice job.",
]

_INDEX = [
    "Cedarline Training Hall Document Index",
    *BANNER,
    "Job SYNTH-HALL-01. One-story practice hall. Owner: Cedarline Practice Authority. Address: 100 Practice Yard, Millford.",
    "These files were written for the SiteFlow demo. They are synthetic. Do not treat them as a bid set or as a record set.",
    "Searchable PDFs in this folder:",
    "Division 01 general requirements. How RFIs and submittals are numbered on this job.",
    "Division 03 cast-in-place concrete. Placement, curing, and the temperature rule.",
    "Division 05 structural steel. Mill time, mill reports, and field bolts.",
    "Division 07 vapor barrier. The product sheet linked from submittal SB-21.",
    "Division 31 earthwork. Excavation and compaction for this pad.",
    "RFI-014. The open question about the slab.",
    "Submittal log excerpt. The register of SB numbers and review status.",
    "Site logistics plan. Gates, hours, and the north laydown.",
    "Daily report 2026-04-14. What the crew did that day.",
    "OAC minutes 12. The practice coordination meeting.",
    "Issue ISS-008. A quality note at the north edge.",
    "materials.csv. SKU table used for order quantity and stock lookups.",
    "Structured twins of this set (not uploaded as the SKU table) are in data/artifacts: RFI register, submittal register, issues, cost, and schedule.",
]

_DIVISION_01 = [
    "Division 01 General Requirements",
    *BANNER,
    "Section 01 33 00 Submittal Procedures, practice language for this job only.",
    "Number submittals SB-01, SB-02, and so on. Do not reuse a number after a rejection. Send a new revision on the same number.",
    "A revise-and-resubmit mark means the package is not accepted. Replace the missing pages and send the revision.",
    "Section 01 26 00, request for information. Number them RFI-001 and up. One question per number.",
    "An answered RFI that says work is waiting stays in force until the linked submittal is accepted. Closing the RFI in a spreadsheet without that acceptance is not enough.",
    "Roles on this practice job: project engineer asks, architect of record answers, superintendent does not rewrite the answer in the field.",
    "Files: keep the PDF of the RFI next to the register row. The row is the index. The PDF is the text a search can quote.",
    "Cost and schedule files in the artifact folder are planning copies. They do not move money and they do not move dates by themselves.",
]

_VAPOR = [
    "Division 07 Vapor Barrier",
    *BANNER,
    "Section 07 26 00. Underslab vapor barrier for the practice hall.",
    "Product: 10 mil polyolefin sheet. The materials table lists it as SKU VB-10.",
    "Laps: 6 inches minimum. Tape seams with the tape named in submittal SB-21.",
    "Penetrations: boot and tape every pipe. A cut sheet without a boot is not finished.",
    "Submittal SB-21 is revise and resubmit. The missing pages are the seam tape data sheet and the penetration detail.",
    "Until SB-21 is accepted, this product sheet is information only. It is not an approval to place the slab.",
    "Protection: do not drive equipment on the sheet. Patch cuts before any later work covers them.",
    "Related concrete rules are in Division 03. Related review status is in the submittal log.",
]

_EARTH = [
    "Division 31 Earthwork",
    *BANNER,
    "Section 31 20 00. Excavation and fill under the practice hall pad.",
    "Strip topsoil and stockpile it on the west of the pad, inside the fence.",
    "Excavate to the elevations on sheet C-101. Those elevations are practice numbers for this file, not a survey.",
    "Compact structural fill to 95 percent of the laboratory maximum density, tested every 500 square feet per lift.",
    "Lift thickness: 8 inches loose, 6 inches after compaction.",
    "Proof roll the subgrade with a loaded truck before the vapor barrier sheet goes down. Soft spots are removed and replaced.",
    "Submittal SB-02 is the compaction report. Its status on the log is approved.",
    "Utilities: the practice water line enters at grid A. Hand dig within 2 feet of that line.",
]

_DAILY = [
    "Daily Report 2026-04-14",
    *BANNER,
    "Project: Cedarline Training Hall. Report by: superintendent (practice role).",
    "Weather on site: clear, 61 F at 07:00. This report does not set a placement limit. Division 03 does.",
    "Crew: 12 people. No injuries. No visitors who needed an escort past the trailer.",
    "Work today: fine grading along the north edge of the pad. No concrete was placed.",
    "Deliveries: none. The south gate was staffed from 6:30 to 16:00.",
    "Equipment: one loader, one roller. Both parked in the east drive overnight.",
    "Open paper: RFI-014 is still open. Read that file before scheduling slab placement.",
    "Tomorrow: continue fine grade. Do not call a concrete pump from this report.",
]

_MINUTES = [
    "OAC Meeting Minutes 12",
    *BANNER,
    "Date: 2026-04-09. Place: west trailer. Practice coordination meeting, not a public hearing.",
    "Present by role: owner representative, architect of record, project engineer, superintendent.",
    "Steel shop drawings SB-16 are submitted and not yet returned.",
    "Vapor barrier SB-21 was returned revise and resubmit. The project engineer will send the tape data and the penetration detail.",
    "Anchor bolt submittal SB-18 is still pending. No field bolts are set from an unreviewed sketch.",
    "Earthwork compaction SB-02 is approved. Fine grade continues.",
    "Next meeting: 2026-04-21, same trailer, 09:00.",
    "These minutes do not change the schedule file and do not approve a purchase.",
]

_ISSUE = [
    "Issue ISS-008 North Slab Edge",
    *BANNER,
    "Number: ISS-008",
    "Status: Open",
    "Type: Quality",
    "Location: north edge of the existing equipment pad, about 2 feet long.",
    "Description: the edge is spalled. The superintendent photographed it and left the area uncovered.",
    "Requested action: the architect reviews the photo and says whether a patch is enough.",
    "This issue is a quality note. It does not set the placement rule for the new hall slab. That rule is in the concrete section and in RFI-014.",
    "Opened: 2026-04-11. Assigned to: architect of record (practice role).",
    "Root cause: unknown until the review. Do not invent one in the daily report.",
]

SAMPLE_PDFS: dict[str, list[str]] = {
    "00_Cedarline_Training_Hall_Index.pdf": _INDEX,
    "Division_01_General_Requirements.pdf": _DIVISION_01,
    "Division_03_Cast_in_Place_Concrete.pdf": _CONCRETE,
    "Division_05_Structural_Steel.pdf": _STEEL,
    "Division_07_Vapor_Barrier.pdf": _VAPOR,
    "Division_31_Earthwork.pdf": _EARTH,
    "RFI-014_Foundation_Pour_Hold.pdf": _RFI,
    "Submittal_Log_Excerpt.pdf": _SUBMITTALS,
    "Site_Logistics_Plan.pdf": _LOGISTICS,
    "Daily_Report_2026-04-14.pdf": _DAILY,
    "OAC_Minutes_12.pdf": _MINUTES,
    "Issue_ISS-008_North_Slab_Edge.pdf": _ISSUE,
}

MATERIALS_CSV = """sku,description,on_hand,lead_days,unit_cost,annual_demand,order_cost
REBAR-5,Grade 60 number 5 rebar,800,21,4.10,12000,50
STEEL-W,W12x26 structural steel beam,40,56,180.00,400,75
AB-34,Anchor bolt 3/4 inch,120,14,6.50,2000,40
VB-10,Vapor barrier 10 mil roll,30,7,90.00,150,25
FW-44,Formwork plywood sheet,200,10,28.00,900,35
WM-06,Welded wire mesh panel,60,12,18.50,700,30
DB-08,Dowel basket assembly,40,18,22.00,300,45
WS-02,Waterstop extrusion,15,9,11.75,250,20
"""


def _wrap(line: str, width: int = 92) -> list[str]:
    if len(line) <= width:
        return [line]
    rows: list[str] = []
    current = ""
    for word in line.split():
        trial = word if not current else f"{current} {word}"
        if len(trial) <= width:
            current = trial
            continue
        if current:
            rows.append(current)
        current = word
    if current:
        rows.append(current)
    return rows or [""]


def paginate(lines: list[str], per_page: int = 38) -> list[list[str]]:
    """Split wrapped lines into pages the sample PDF writer can draw."""
    flat: list[str] = []
    for line in lines:
        flat.extend(_wrap(line))
    if not flat:
        return [[""]]
    return [flat[start : start + per_page] for start in range(0, len(flat), per_page)]


def write_sample_pack(directory: Path) -> None:
    directory.mkdir(parents=True, exist_ok=True)
    for filename, lines in SAMPLE_PDFS.items():
        (directory / filename).write_bytes(build_text_pdf(paginate(lines)))
    (directory / "materials.csv").write_text(MATERIALS_CSV, encoding="utf-8")
