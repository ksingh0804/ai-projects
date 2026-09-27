"""The committed practice files match the generator and agree with each other."""

from __future__ import annotations

import json
from pathlib import Path

from pypdf import PdfReader

from app.config import SITEFLOW_ROOT
from app.rag.artifacts import NOTICE, write_artifact_pack
from app.rag.sample_docs import MATERIALS_CSV, SAMPLE_PDFS, write_sample_pack
from app.tools.inventory import load_materials_csv

SAMPLE = SITEFLOW_ROOT / "data" / "sample"
ARTIFACTS = SITEFLOW_ROOT / "data" / "artifacts"

PAGE_ONE_PHRASES = {
    "Division_05_Structural_Steel.pdf": "8 to 12 weeks",
    "Division_03_Cast_in_Place_Concrete.pdf": "Weather limit: do not place concrete",
    "RFI-014_Foundation_Pour_Hold.pdf": "Blocked activity: slab on grade foundation pour",
    "Submittal_Log_Excerpt.pdf": "Vapor barrier: submittal SB-21, status revise and resubmit.",
}


def _pdf_text(path: Path) -> str:
    return "\n".join(page.extract_text() or "" for page in PdfReader(path).pages)


def test_sample_pack_keeps_the_demo_sentences(tmp_path):
    write_sample_pack(tmp_path)
    for filename, phrase in PAGE_ONE_PHRASES.items():
        pages = PdfReader(tmp_path / filename).pages
        assert phrase in (pages[0].extract_text() or "")
    rows = load_materials_csv(MATERIALS_CSV)
    assert rows["REBAR-5"]["annual_demand"] == 12000
    assert rows["REBAR-5"]["order_cost"] == 50
    assert rows["AB-34"]["annual_demand"] == 2000
    assert rows["AB-34"]["order_cost"] == 40
    assert {path.name for path in tmp_path.glob("*.csv")} == {"materials.csv"}
    assert {path.name for path in tmp_path.glob("*.pdf")} == set(SAMPLE_PDFS)


def test_artifact_registers_match_the_pdfs(tmp_path):
    write_sample_pack(tmp_path / "sample")
    write_artifact_pack(tmp_path / "artifacts")
    folder = tmp_path / "artifacts"
    rfi_pdf = _pdf_text(tmp_path / "sample" / "RFI-014_Foundation_Pour_Hold.pdf")
    rfis = json.loads((folder / "rfis.json").read_text())
    row = next(item for item in rfis["rfis"] if item["customIdentifier"] == "RFI-014")
    assert row["status"] == "open"
    assert row["blockedActivity"] in rfi_pdf
    assert row["officialResponse"] in rfi_pdf
    assert all(item["blockedActivity"] == "" for item in rfis["rfis"] if item["customIdentifier"] != "RFI-014")

    submittals = json.loads((folder / "submittals.json").read_text())
    vapor = next(item for item in submittals["submittals"] if item["identifier"] == "SB-21")
    assert vapor["response"] == "revise and resubmit"
    log_pdf = _pdf_text(tmp_path / "sample" / "Submittal_Log_Excerpt.pdf")
    assert "SB-21" in log_pdf and "revise and resubmit" in log_pdf

    for name in ("project.json", "rfis.json", "submittals.json", "issues.json", "cost_items.json", "schedule.json", "documents.json"):
        payload = json.loads((folder / name).read_text())
        assert payload["artifact"]["kind"] == "synthetic"
        assert payload["artifact"]["notice"] == NOTICE
        assert "export" in payload["artifact"]["notice"]

    schedule = json.loads((folder / "schedule.json").read_text())
    pour = next(item for item in schedule["activities"] if item["activityId"] == "A1040")
    assert "RFI-014" in pour["constraint"]
    assert "SB-21" in pour["constraint"]

    listed = {item["fileName"] for item in json.loads((folder / "documents.json").read_text())["documents"]}
    assert listed == set(SAMPLE_PDFS) | {"materials.csv"}
    for stem in ("rfis", "submittals", "issues", "cost_items", "schedule"):
        assert (folder / f"{stem}.csv").is_file()
        assert (folder / f"{stem}.json").is_file()


def test_committed_files_match_the_generator(tmp_path):
    write_sample_pack(tmp_path / "sample")
    write_artifact_pack(tmp_path / "artifacts")
    for generated in (tmp_path / "sample").iterdir():
        committed = SAMPLE / generated.name
        assert committed.is_file(), generated.name
        assert committed.read_bytes() == generated.read_bytes()
    for generated in (tmp_path / "artifacts").iterdir():
        committed = ARTIFACTS / generated.name
        assert committed.is_file(), generated.name
        assert committed.read_bytes() == generated.read_bytes()
    extra_sample = {path.name for path in SAMPLE.iterdir() if path.is_file()} - {
        path.name for path in (tmp_path / "sample").iterdir()
    }
    assert extra_sample == set()
