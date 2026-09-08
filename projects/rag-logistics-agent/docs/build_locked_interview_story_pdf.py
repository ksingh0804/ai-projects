#!/usr/bin/env python3
"""Generate locked interview story PDF (60s open, stammer-friendly)."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from tutorial_pdf_lib import TutorialPDF, ascii  # noqa: E402

DOCS = Path(__file__).parent
OUT = DOCS / "locked-interview-story.pdf"


class StoryPDF(TutorialPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(90, 90, 90)
        self.cell(
            0,
            8,
            "Locked Interview Story  |  logistics-rag-agent",
            align="L",
        )
        self.ln(4)
        self.set_draw_color(180, 180, 180)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(6)


def numbered_lines(pdf: TutorialPDF, lines: list[str], breathe: bool = True) -> None:
    for i, line in enumerate(lines, start=1):
        suffix = "  [BREATHE]" if breathe else ""
        pdf.bullet(f"{i}. {line}{suffix}")


def build() -> Path:
    pdf = StoryPDF("Locked Interview Story", format="A4")
    pdf.alias_nb_pages()
    pdf.set_margins(14, 14, 14)
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()

    pdf.cover(
        "Locked Interview Story",
        "Tell me about the project -- 60-second stammer-friendly script",
        "Project: logistics-rag-agent\n"
        "How to use: Speak one numbered line. Stop. Breathe 2 seconds. Next line.\n"
        "If you stick: restart that one line only. Do not apologize -- pause and continue.",
    )

    # ----- LOCKED CHOICES -----
    pdf.h1("Locked choices")
    pdf.bullet("Purpose: DeCA-style work piles alerts, PDFs, and math -- one trusted assistant.")
    pdf.bullet("Why me: Real DoD commissary inventory / supply experience.")
    pdf.bullet("Demo: Phantom flour -- system 48, shelf 0.")
    pdf.bullet("Data: Synthetic DeCA-style docs; real ops pain; same pattern on real SOPs.")
    pdf.bullet("Length: ~60 seconds (8 short lines).")
    pdf.bullet("Outcome: Faster morning decisions. Safer orders. Answers I can cite.")

    pdf.h2("Purpose line (say once if asked why)")
    pdf.body(
        '"I built it because DeCA-style work piles alerts, PDFs, and math at once -- '
        'I wanted one trusted assistant for that morning rush."'
    )

    pdf.h2("Data honesty (if asked about real DeCA data)")
    pdf.body(
        '"The docs are synthetic, DeCA-style. The pain is real from commissary work. '
        'The agent pattern is what I would run on real SOPs."'
    )

    # ----- 60s OPEN -----
    pdf.add_page()
    pdf.h1("60-second open (memorize this)")
    pdf.body("Say each line. [BREATHE] = silent 2-count. Then stop and wait.")
    numbered_lines(
        pdf,
        [
            "I built a logistics ops agent for DeCA-style inventory work.",
            "I worked inventory and supply at a DoD commissary.",
            "I felt that morning alert rush myself.",
            "Alerts, PDFs, and math piled up at once.",
            "So I built one trusted assistant for that rush.",
            "Tools do the numbers. RAG searches the SOPs.",
            "Example: flour looks like 48 in the system -- shelf is empty.",
            "Outcome: faster morning decisions. Safer orders. Answers I can cite.",
        ],
    )
    pdf.ln(2)
    pdf.body('If they want more: "Happy to walk the flour morning next."')

    pdf.h2("Origin arc (5 words)")
    pdf.bullet("Why me -- commissary inventory / supply; felt the morning rush.")
    pdf.bullet("Problem -- alerts + PDFs + math piled up; people guessed.")
    pdf.bullet("Build -- tools for numbers, RAG for SOPs, no invented facts.")
    pdf.bullet("Demo -- phantom flour (system 48, shelf empty).")
    pdf.bullet("Outcome -- faster decisions, safer orders, citable answers.")

    # ----- FLOUR DEMO -----
    pdf.add_page()
    pdf.h1("Follow-up demo -- phantom flour")
    pdf.body("Use only if they ask for a walkthrough.")
    numbered_lines(
        pdf,
        [
            "Morning NIS report: flour Item 10045. System 48. Shelf 0.",
            "That is phantom inventory -- BoH must be fixed.",
            "Nancy asks the agent in English.",
            "Doc search finds planogram, NIS rules, maybe recall.",
            "Tools handle EOQ or safety stock if she asks how much.",
            'Agent does not invent facts. Thin docs -> "I don\'t know."',
            "She corrects BoH and writes a safer next step -- with a cite.",
        ],
        breathe=True,
    )

    pdf.h2("Soft landing phrases")
    pdf.bullet('"One second -- I\'ll restart that line."')
    pdf.bullet('"Short version: ..."')
    pdf.bullet('"The key point is ..."')
    pdf.bullet('"Next beat: ..."')

    # ----- CHEAT SHEET -----
    pdf.add_page()
    pdf.h1("Tech cheat sheet (short answers)")
    rows = [
        ("Stack?", "Python. LangChain agent. Ollama LLM. Chroma. Local embeddings."),
        ("Models?", "Chat: llama3.1:8b. Embed: nomic-embed-text."),
        ("Tools?", "Inventory lookup. EOQ. Safety stock. Doc search."),
        ("EOQ formula?", "Square root of two D S over H."),
        ("Safety stock?", "Z times demand std times square root of lead time."),
        ("Grounding?", 'Answer only from retrieved chunks. Else: "I don\'t know".'),
        ("Ingest?", "PDFs -> chunk -> embed -> Chroma. Safe re-run skips old files."),
        ("Why local?", "Ops data stays local. Cost control. Works offline-ish."),
        (
            "Real DeCA data?",
            "Synthetic DeCA-style docs. Real commissary pain. Same pattern on real SOPs.",
        ),
        ("Why this project?", "Morning rush: alerts + PDFs + math. One trusted assistant."),
    ]
    for ask, say in rows:
        pdf.set_x(pdf.l_margin)
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(30, 70, 110)
        pdf.multi_cell(0, 5.5, ascii(f"If they ask: {ask}"), new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(30, 30, 30)
        pdf.set_x(pdf.l_margin)
        pdf.multi_cell(0, 5.5, ascii(f"  You say: {say}"), new_x="LMARGIN", new_y="NEXT")
        pdf.ln(1)

    pdf.h2("Practice checklist")
    pdf.bullet("Read the 8 open lines out loud once (with breaths).")
    pdf.bullet("Practice the flour walkthrough only as a follow-up.")
    pdf.bullet("Keep follow-up answers under 45 seconds.")
    pdf.bullet("Source markdown: docs/deca-interview-cue-card.md")

    pdf.output(str(OUT))
    return OUT


if __name__ == "__main__":
    path = build()
    print(f"Wrote {path}")
