#!/usr/bin/env python3
"""Render playbook.html to a PDF next to this script."""

from pathlib import Path

from weasyprint import HTML

HERE = Path(__file__).resolve().parent
HTML(filename=str(HERE / "playbook.html")).write_pdf(HERE / "Bay-Area-Junior-Interview-Playbook.pdf")
print(f"wrote {HERE / 'Bay-Area-Junior-Interview-Playbook.pdf'}")
