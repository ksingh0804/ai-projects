"""Structured registers that match the Cedarline practice PDFs.

Field names follow the public shape of construction-platform records
(RFI number, status, official response, spec section, cost code, activity id).
The values are original. This folder is not an export, and the demo search
does not read it. Search reads the PDFs and materials.csv in data/sample.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path

from app.rag.sample_docs import PROJECT_CODE, PROJECT_NAME

NOTICE = (
    "Original practice data for the SiteFlow demo. Not a real construction job, "
    "not a copy of a customer file, and not an export from any construction platform."
)


def artifact_banner() -> dict[str, str]:
    return {
        "kind": "synthetic",
        "projectCode": PROJECT_CODE,
        "projectName": PROJECT_NAME,
        "notice": NOTICE,
    }


RFIS: list[dict[str, str]] = [
    {
        "id": "00000000-0000-4000-8000-000000000014",
        "customIdentifier": "RFI-014",
        "title": "Foundation pour hold",
        "status": "open",
        "discipline": "concrete",
        "specSection": "03 30 00",
        "locationDescription": "slab on grade, grids A-D and 1-4",
        "question": "Can the slab on grade be poured before the vapor barrier submittal is approved?",
        "officialResponse": "No. The pour stays on hold.",
        "officialResponseStatus": "answered",
        "blockedActivity": "slab on grade foundation pour",
        "reason": "open RFI-014 until the vapor barrier submittal is approved.",
        "linkedSubmittal": "SB-21",
        "createdAt": "2026-04-02",
        "dueDate": "2026-04-18",
        "assignedTo": "architect of record (practice role)",
        "createdBy": "project engineer (practice role)",
    },
    {
        "id": "00000000-0000-4000-8000-000000000009",
        "customIdentifier": "RFI-009",
        "title": "Rebar chair height at the north edge",
        "status": "closed",
        "discipline": "concrete",
        "specSection": "03 20 00",
        "locationDescription": "north edge of the pad",
        "question": "What chair height keeps the top bar at 2 inches of cover at the north edge?",
        "officialResponse": "Use 4 inch chairs at that edge, matching approved submittal SB-12.",
        "officialResponseStatus": "answered",
        "blockedActivity": "",
        "reason": "",
        "linkedSubmittal": "SB-12",
        "createdAt": "2026-03-18",
        "dueDate": "2026-03-25",
        "assignedTo": "architect of record (practice role)",
        "createdBy": "project engineer (practice role)",
    },
    {
        "id": "00000000-0000-4000-8000-000000000021",
        "customIdentifier": "RFI-021",
        "title": "Clip angle weld at column C4",
        "status": "open",
        "discipline": "structural",
        "specSection": "05 12 00",
        "locationDescription": "column C4, roof",
        "question": "Is the clip angle weld at column C4 a 3/16 inch fillet on both sides?",
        "officialResponse": "",
        "officialResponseStatus": "pending",
        "blockedActivity": "",
        "reason": "",
        "linkedSubmittal": "SB-16",
        "createdAt": "2026-04-08",
        "dueDate": "2026-04-22",
        "assignedTo": "structural reviewer (practice role)",
        "createdBy": "project engineer (practice role)",
    },
]

SUBMITTALS: list[dict[str, str]] = [
    {
        "id": "00000000-0000-4000-8000-000000000112",
        "identifier": "SB-12",
        "specIdentifier": "03 20 00",
        "title": "Rebar shop drawings",
        "type": "shop drawing",
        "status": "closed",
        "response": "approved",
        "dueDate": "2026-03-12",
        "ballInCourt": "project engineer (practice role)",
    },
    {
        "id": "00000000-0000-4000-8000-000000000118",
        "identifier": "SB-18",
        "specIdentifier": "05 12 00",
        "title": "Anchor bolts",
        "type": "product data",
        "status": "open",
        "response": "pending",
        "dueDate": "2026-04-20",
        "ballInCourt": "architect of record (practice role)",
    },
    {
        "id": "00000000-0000-4000-8000-000000000121",
        "identifier": "SB-21",
        "specIdentifier": "07 26 00",
        "title": "Vapor barrier",
        "type": "product data",
        "status": "open",
        "response": "revise and resubmit",
        "dueDate": "2026-04-16",
        "ballInCourt": "project engineer (practice role)",
        "reviewerNote": "Send the seam tape data sheet and the penetration detail.",
    },
    {
        "id": "00000000-0000-4000-8000-000000000107",
        "identifier": "SB-07",
        "specIdentifier": "03 30 00",
        "title": "Concrete mix CH-4000",
        "type": "mix design",
        "status": "closed",
        "response": "approved",
        "dueDate": "2026-03-06",
        "ballInCourt": "project engineer (practice role)",
    },
    {
        "id": "00000000-0000-4000-8000-000000000116",
        "identifier": "SB-16",
        "specIdentifier": "05 12 00",
        "title": "Steel shop drawings",
        "type": "shop drawing",
        "status": "open",
        "response": "submitted",
        "dueDate": "2026-04-24",
        "ballInCourt": "structural reviewer (practice role)",
    },
    {
        "id": "00000000-0000-4000-8000-000000000130",
        "identifier": "SB-30",
        "specIdentifier": "05 12 00",
        "title": "Steel mill reports",
        "type": "test report",
        "status": "open",
        "response": "submitted",
        "dueDate": "2026-04-24",
        "ballInCourt": "structural reviewer (practice role)",
    },
    {
        "id": "00000000-0000-4000-8000-000000000104",
        "identifier": "SB-04",
        "specIdentifier": "03 11 00",
        "title": "Formwork layout",
        "type": "shop drawing",
        "status": "closed",
        "response": "approved",
        "dueDate": "2026-03-02",
        "ballInCourt": "project engineer (practice role)",
    },
    {
        "id": "00000000-0000-4000-8000-000000000102",
        "identifier": "SB-02",
        "specIdentifier": "31 20 00",
        "title": "Earthwork compaction report",
        "type": "test report",
        "status": "closed",
        "response": "approved",
        "dueDate": "2026-04-01",
        "ballInCourt": "project engineer (practice role)",
    },
]

ISSUES: list[dict[str, str]] = [
    {
        "id": "00000000-0000-4000-8000-000000000008",
        "identifier": "ISS-008",
        "title": "North slab edge spall",
        "status": "open",
        "issueType": "Quality",
        "locationDetails": "north edge of the existing equipment pad",
        "description": "A spall about 2 feet long. Left uncovered for review. This note does not authorize slab placement.",
        "rootCause": "",
        "assignedTo": "architect of record (practice role)",
        "openedAt": "2026-04-11",
        "dueDate": "2026-04-18",
    },
    {
        "id": "00000000-0000-4000-8000-000000000003",
        "identifier": "ISS-003",
        "title": "South gate sign missing",
        "status": "closed",
        "issueType": "Safety",
        "locationDetails": "south gate",
        "description": "The practice gate sign was missing for one morning and was replaced the same day.",
        "rootCause": "sign removed during a delivery",
        "assignedTo": "superintendent (practice role)",
        "openedAt": "2026-03-30",
        "dueDate": "2026-03-30",
    },
]

COST_ITEMS: list[dict[str, str]] = [
    {
        "code": "03 30 00",
        "name": "Cast-in-place concrete",
        "originalBudget": "186000.00",
        "approvedChanges": "0.00",
        "projectedCost": "186000.00",
        "currency": "USD",
    },
    {
        "code": "05 12 00",
        "name": "Structural steel",
        "originalBudget": "240000.00",
        "approvedChanges": "0.00",
        "projectedCost": "240000.00",
        "currency": "USD",
    },
    {
        "code": "07 26 00",
        "name": "Vapor barrier",
        "originalBudget": "14500.00",
        "approvedChanges": "0.00",
        "projectedCost": "14500.00",
        "currency": "USD",
    },
    {
        "code": "31 20 00",
        "name": "Earthwork",
        "originalBudget": "62000.00",
        "approvedChanges": "0.00",
        "projectedCost": "62000.00",
        "currency": "USD",
    },
]

SCHEDULE: list[dict[str, str]] = [
    {
        "activityId": "A1000",
        "name": "Mobilize and install the south gate",
        "wbs": "1.1",
        "plannedStart": "2026-03-16",
        "plannedFinish": "2026-03-20",
        "status": "finished",
        "constraint": "",
    },
    {
        "activityId": "A1020",
        "name": "Excavate and compact the pad",
        "wbs": "1.2",
        "plannedStart": "2026-03-23",
        "plannedFinish": "2026-04-10",
        "status": "finished",
        "constraint": "",
    },
    {
        "activityId": "A1040",
        "name": "Slab on grade foundation pour",
        "wbs": "1.3",
        "plannedStart": "2026-04-20",
        "plannedFinish": "2026-04-22",
        "status": "not started",
        "constraint": "Waiting on RFI-014 and submittal SB-21.",
    },
    {
        "activityId": "A1100",
        "name": "Structural steel erection",
        "wbs": "1.4",
        "plannedStart": "2026-06-15",
        "plannedFinish": "2026-07-10",
        "status": "not started",
        "constraint": "Mill time in Division 05 starts after shop drawings are approved.",
    },
]

DOCUMENTS: list[dict[str, str]] = [
    {"fileName": "00_Cedarline_Training_Hall_Index.pdf", "title": "Document index", "specSection": ""},
    {"fileName": "Division_01_General_Requirements.pdf", "title": "General requirements", "specSection": "01 33 00"},
    {"fileName": "Division_03_Cast_in_Place_Concrete.pdf", "title": "Cast-in-place concrete", "specSection": "03 30 00"},
    {"fileName": "Division_05_Structural_Steel.pdf", "title": "Structural steel", "specSection": "05 12 00"},
    {"fileName": "Division_07_Vapor_Barrier.pdf", "title": "Vapor barrier", "specSection": "07 26 00"},
    {"fileName": "Division_31_Earthwork.pdf", "title": "Earthwork", "specSection": "31 20 00"},
    {"fileName": "RFI-014_Foundation_Pour_Hold.pdf", "title": "RFI-014 Foundation pour hold", "specSection": "03 30 00"},
    {"fileName": "Submittal_Log_Excerpt.pdf", "title": "Submittal log excerpt", "specSection": ""},
    {"fileName": "Site_Logistics_Plan.pdf", "title": "Site logistics plan", "specSection": ""},
    {"fileName": "Daily_Report_2026-04-14.pdf", "title": "Daily report 2026-04-14", "specSection": ""},
    {"fileName": "OAC_Minutes_12.pdf", "title": "OAC meeting minutes 12", "specSection": ""},
    {"fileName": "Issue_ISS-008_North_Slab_Edge.pdf", "title": "Issue ISS-008", "specSection": ""},
    {"fileName": "materials.csv", "title": "Materials SKU table", "specSection": ""},
]


def _dump(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def _write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    fieldnames: list[str] = []
    for row in rows:
        for key in row:
            if key not in fieldnames:
                fieldnames.append(key)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator="\n", extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({key: row.get(key, "") for key in fieldnames})


def write_artifact_pack(directory: Path) -> None:
    directory.mkdir(parents=True, exist_ok=True)
    banner = artifact_banner()
    _dump(
        directory / "project.json",
        {
            "artifact": banner,
            "project": {
                "code": PROJECT_CODE,
                "name": PROJECT_NAME,
                "description": "One-story practice hall used only as SiteFlow sample data.",
                "address": "100 Practice Yard, Millford",
                "owner": "Cedarline Practice Authority",
                "phase": "foundations and structure",
                "currency": "USD",
                "searchFolder": "data/sample",
                "registerFolder": "data/artifacts",
            },
        },
    )
    _dump(directory / "rfis.json", {"artifact": banner, "rfis": RFIS})
    _dump(directory / "submittals.json", {"artifact": banner, "submittals": SUBMITTALS})
    _dump(directory / "issues.json", {"artifact": banner, "issues": ISSUES})
    _dump(directory / "cost_items.json", {"artifact": banner, "costItems": COST_ITEMS})
    _dump(directory / "schedule.json", {"artifact": banner, "activities": SCHEDULE})
    _dump(directory / "documents.json", {"artifact": banner, "documents": DOCUMENTS})
    _write_csv(directory / "rfis.csv", RFIS)
    _write_csv(directory / "submittals.csv", SUBMITTALS)
    _write_csv(directory / "issues.csv", ISSUES)
    _write_csv(directory / "cost_items.csv", COST_ITEMS)
    _write_csv(directory / "schedule.csv", SCHEDULE)
