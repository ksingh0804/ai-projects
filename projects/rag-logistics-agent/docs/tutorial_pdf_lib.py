#!/usr/bin/env python3
"""Shared helpers for hard-code tutorial PDFs."""

from __future__ import annotations

from fpdf import FPDF


def ascii(text: str) -> str:
    return (
        text.replace("\u2192", "->")
        .replace("\u2014", "--")
        .replace("\u2013", "-")
        .replace("\u2018", "'")
        .replace("\u2019", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u2022", "-")
        .replace("\u2026", "...")
        .encode("latin-1", "replace")
        .decode("latin-1")
    )


class TutorialPDF(FPDF):
    def __init__(self, filename_label: str, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.filename_label = filename_label

    def header(self):
        if self.page_no() == 1:
            return
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(90, 90, 90)
        self.cell(
            0,
            8,
            f"{self.filename_label} Hard-Code Tutorial  |  logistics-rag-agent",
            align="L",
        )
        self.ln(4)
        self.set_draw_color(180, 180, 180)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(6)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def h1(self, text: str):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(20, 40, 70)
        self.multi_cell(0, 10, ascii(text), new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def h2(self, text: str):
        self.ln(3)
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(30, 70, 110)
        self.multi_cell(0, 8, ascii(text), new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def h3(self, text: str):
        self.ln(2)
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(40, 90, 60)
        self.multi_cell(0, 7, ascii(text), new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body(self, text: str):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 5.5, ascii(text), new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def bullet(self, text: str):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 5.5, ascii(f"- {text}"), new_x="LMARGIN", new_y="NEXT")
        self.ln(0.5)

    def reason(self, text: str):
        self.set_x(self.l_margin)
        self.set_fill_color(240, 248, 255)
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(40, 80, 120)
        self.cell(0, 6, "WHY", fill=True, new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 9)
        self.set_text_color(40, 40, 40)
        self.set_x(self.l_margin)
        self.multi_cell(0, 5, ascii(text), fill=True, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def code(self, text: str):
        self.set_x(self.l_margin)
        self.set_font("Courier", "", 8)
        self.set_fill_color(245, 245, 245)
        self.set_text_color(20, 20, 20)
        for line in text.splitlines() or [""]:
            self.set_x(self.l_margin)
            safe = ascii(line.replace("\t", "    "))
            while True:
                chunk, safe = safe[:95], safe[95:]
                self.set_x(self.l_margin)
                self.multi_cell(
                    0,
                    4.2,
                    chunk if chunk else " ",
                    fill=True,
                    new_x="LMARGIN",
                    new_y="NEXT",
                )
                if not safe:
                    break
        self.ln(2)

    def step(self, num: int, title: str):
        self.ln(2)
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(120, 50, 20)
        self.multi_cell(
            0, 7, ascii(f"Step {num}: {title}"), new_x="LMARGIN", new_y="NEXT"
        )
        self.ln(1)

    def cover(self, title: str, subtitle: str, meta: str):
        self.set_font("Helvetica", "B", 22)
        self.set_text_color(20, 40, 70)
        self.ln(16)
        self.multi_cell(0, 12, ascii(title), new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 13)
        self.set_text_color(60, 60, 60)
        self.multi_cell(0, 7, ascii(subtitle), new_x="LMARGIN", new_y="NEXT")
        self.ln(4)
        self.set_font("Helvetica", "I", 10)
        self.multi_cell(0, 6, ascii(meta), new_x="LMARGIN", new_y="NEXT")
        self.ln(4)


def new_pdf(filename_label: str) -> TutorialPDF:
    pdf = TutorialPDF(filename_label, format="A4")
    pdf.alias_nb_pages()
    pdf.set_margins(14, 14, 14)
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()
    return pdf
