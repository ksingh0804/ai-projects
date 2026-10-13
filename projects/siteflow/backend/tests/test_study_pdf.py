"""The start-to-end study PDF stays aligned with the step list."""

from __future__ import annotations

import importlib.util
from pathlib import Path

from pypdf import PdfReader

DOCS = Path(__file__).resolve().parents[2] / "docs"
BUILDER = DOCS / "build_step_by_step_pdf.py"


def _builder():
    spec = importlib.util.spec_from_file_location("build_step_by_step_pdf", BUILDER)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def test_study_pdf_explains_every_step(tmp_path):
    module = _builder()
    assert len(module.STEPS) == 27
    written = module.build(tmp_path / "SiteFlow_start_to_end.pdf")
    text = "\n".join(page.extract_text() or "" for page in PdfReader(written).pages)

    for number, step in enumerate(module.STEPS, start=1):
        assert f"Step {number}: {step['title']}" in text
    assert "Step 28:" not in text
    for label in ("Do this.", "Where this sits.", "In depth.", "Tradeoff.", "Check."):
        assert label in text
    assert "After the last step" in text
    assert "547.72" in text
    assert "Steps 6 through 15" in text
    assert "Steps 23 through 27" in text
