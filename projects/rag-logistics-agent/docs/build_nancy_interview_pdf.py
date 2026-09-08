#!/usr/bin/env python3
"""Generate Nancy DeCA scenario + mock interview Q&A PDF (stammer-friendly)."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from tutorial_pdf_lib import TutorialPDF, ascii  # noqa: E402

DOCS = Path(__file__).parent
OUT = DOCS / "nancy-mock-interview-qa.pdf"


class InterviewPDF(TutorialPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(90, 90, 90)
        self.cell(
            0,
            8,
            "Nancy Day + Mock Interview Q&A  |  logistics-rag-agent",
            align="L",
        )
        self.ln(4)
        self.set_draw_color(180, 180, 180)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(6)


def qa(pdf: TutorialPDF, num: int, question: str, lines: list[str]) -> None:
    """One interview question with short spoken answer lines."""
    pdf.ln(2)
    pdf.set_x(pdf.l_margin)
    pdf.set_fill_color(230, 240, 250)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(20, 50, 90)
    pdf.multi_cell(
        0,
        6,
        ascii(f"Q{num}. {question}"),
        fill=True,
        new_x="LMARGIN",
        new_y="NEXT",
    )
    pdf.ln(1)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(0, 100, 70)
    pdf.set_x(pdf.l_margin)
    pdf.cell(0, 5, "SAY (short beats -- pause between lines):", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(30, 30, 30)
    for i, line in enumerate(lines, start=1):
        pdf.set_x(pdf.l_margin)
        pdf.multi_cell(
            0,
            5.5,
            ascii(f"  {i}. {line}"),
            new_x="LMARGIN",
            new_y="NEXT",
        )
    pdf.ln(1)
    pdf.set_draw_color(200, 200, 200)
    y = pdf.get_y()
    pdf.line(pdf.l_margin, y, 200, y)
    pdf.ln(3)


def build() -> Path:
    pdf = InterviewPDF("Nancy + Mock Interview", format="A4")
    pdf.alias_nb_pages()
    pdf.set_margins(14, 14, 14)
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()

    pdf.cover(
        "Nancy's Day + Mock Interview Q&A",
        "DeCA logistics RAG agent -- stammer-friendly speaking guide",
        "Project: logistics-rag-agent\nPersona: Nancy (inventory & replenishment lead)\n"
        "How to use: Speak one numbered line. Stop. Breathe 2 seconds. Next line.",
    )

    pdf.h1("How to use this PDF")
    pdf.bullet("Speak ONE short line at a time.")
    pdf.bullet("After each line: silent breath for 2 seconds.")
    pdf.bullet("If you stick on a word: restart THAT one line only.")
    pdf.bullet("Do not apologize for stuttering. Pause and continue.")
    pdf.bullet("Aim for under 45 seconds per interview answer.")

    # ----- PART 1: NANCY STORY -----
    pdf.add_page()
    pdf.h1("Part 1 -- Nancy at DeCA (the story)")

    pdf.h2("Who is Nancy?")
    pdf.body(
        "Nancy is an inventory and replenishment lead on a morning shift. "
        "She supports Defense Commissary Agency (DeCA) supply ops -- "
        "keeping commissary shelves stocked for military families."
    )

    pdf.h2("The problem (what broke)")
    pdf.bullet("A sanitizer / essentials surge (or cold-chain delay) hit.")
    pdf.bullet("WMS sent many below-reorder alerts at once.")
    pdf.bullet("Example: SKU-2002 hand sanitizer -- on-hand 15, reorder point 60.")
    pdf.bullet("Nancy hunted SOP PDFs, ran EOQ/safety-stock by hand, checked SKUs elsewhere.")
    pdf.bullet("Slow answers led to rushed emergency POs and answers that were not audit-ready.")

    pdf.h2("Why this project was built")
    pdf.bullet("One plain-English assistant for ops.")
    pdf.bullet("Lookup SKU facts -- no guessing.")
    pdf.bullet("Calculate EOQ and safety stock with real formulas.")
    pdf.bullet("Search ingested DeCA SOP PDFs -- answer only from docs.")
    pdf.bullet("If docs are thin: say exactly \"I don't know\".")

    pdf.h2("How the agent helps Nancy in one morning")
    pdf.bullet("Alert: SKU-2002 below reorder -> inventory lookup tool.")
    pdf.bullet("How much to order? -> EOQ calculator.")
    pdf.bullet("Need a buffer? -> safety stock estimator.")
    pdf.bullet("Cold-chain / policy question? -> search logistics docs (RAG).")
    pdf.bullet("Nancy writes a purchase order with numbers + SOP citation.")

    pdf.h2("Final outcome for the supply chain")
    pdf.bullet("Faster triage -> PO loop on alert mornings.")
    pdf.bullet("Math that is correct and explainable.")
    pdf.bullet("Policy answers that are grounded and citable.")
    pdf.bullet("Fewer stockouts and fewer panic / expedite orders.")
    pdf.bullet("Decisions that are auditable for leadership and compliance.")

    pdf.h2("One-sentence pitch (say once, then stop)")
    pdf.body(
        '"Nancy gets a stockout-risk alert, asks in English, and gets lookup numbers, '
        'EOQ or safety-stock math, or SOP-grounded policy -- then she writes a PO '
        'without inventing facts."'
    )

    pdf.h2("90-second open (speak script)")
    for i, line in enumerate(
        [
            "I built a logistics ops agent for DeCA-style inventory work.",
            "The problem was speed and trust.",
            "Alerts came in. SOPs were in PDFs. Math was manual.",
            "People guessed. Orders got rushed.",
            "So I built an agent with four tools.",
            "Lookup for SKUs. EOQ. Safety stock. And doc search.",
            "Numbers come from tools. Policy comes from ingested SOPs.",
            'If the docs are thin, it says: I don\'t know.',
            "Outcome: faster POs, fewer stockouts, cleaner audit trail.",
            "Happy to walk through a Nancy morning next.",
        ],
        start=1,
    ):
        pdf.bullet(f"{i}. {line}  [BREATHE]")

    pdf.h2("Soft landing phrases")
    pdf.bullet('"One second -- I\'ll restart that line."')
    pdf.bullet('"Short version: ..."')
    pdf.bullet('"The key point is ..."')
    pdf.bullet('"Next beat: ..."')

    # ----- PART 2: MOCK INTERVIEW -----
    pdf.add_page()
    pdf.h1("Part 2 -- Mock interview Q&A")
    pdf.body(
        "Interviewer asks one question. You answer with 2-4 short lines. "
        "Then wait. Use [BREATHE] between lines when practicing out loud."
    )

    qa(
        pdf,
        1,
        "Tell me about a real problem at DeCA that led you to build this.",
        [
            "Stockout alerts piled up on mornings like Nancy's.",
            "People hunted SOP PDFs and guessed the math.",
            "That caused rushed emergency orders and weak audit trails.",
            "I built one agent for lookup, EOQ, safety stock, and grounded docs.",
        ],
    )

    qa(
        pdf,
        2,
        "Walk me through Nancy's day with your agent.",
        [
            "Morning alert: sanitizer SKU-2002 is below reorder.",
            "She asks in English. The agent picks the inventory lookup.",
            "Then EOQ or safety stock for order size and buffer.",
            "Policy questions go to ingested SOPs. She writes the PO.",
        ],
    )

    qa(
        pdf,
        3,
        "What does the agent actually do under the hood?",
        [
            "It is a local tool-calling agent on top of an LLM.",
            "Four tools: inventory lookup, EOQ, safety stock, doc search.",
            "Doc search uses RAG over Chroma with DeCA SOP chunks.",
            "Temperature is zero. No invented numbers or policy.",
        ],
    )

    qa(
        pdf,
        4,
        "How do you keep answers trustworthy?",
        [
            "Math comes only from calculator tools.",
            "SKU facts come from the inventory table.",
            "Policy comes only from retrieved SOP chunks.",
            'If context is weak, the model must say: I don\'t know.',
        ],
    )

    qa(
        pdf,
        5,
        "What is EOQ, and when does Nancy use it?",
        [
            "EOQ is economic order quantity -- how much to order.",
            "Formula: square root of two D S over H.",
            "Nancy uses it after a reorder alert to size the PO.",
            "The agent calls eoq_calculator instead of guessing.",
        ],
    )

    qa(
        pdf,
        6,
        "What about safety stock?",
        [
            "Safety stock is buffer for demand and lead-time risk.",
            "Formula: z times demand std times square root of lead time.",
            "Nancy asks when she needs a service-level buffer.",
            "Again: a tool computes it -- the LLM does not invent it.",
        ],
    )

    qa(
        pdf,
        7,
        "How does document RAG work in your project?",
        [
            "ingest.py loads PDFs, chunks them, embeds, stores in Chroma.",
            "At query time we retrieve top-k chunks.",
            "A grounded prompt forces answers only from that context.",
            "Re-ingest is safe -- already-stored files are skipped.",
        ],
    )

    qa(
        pdf,
        8,
        "What stack did you choose, and why local?",
        [
            "Python, LangChain agent, Ollama, Chroma, nomic embeddings.",
            "Chat model: llama3.1 8b. Embed: nomic-embed-text.",
            "Local keeps ops data closer and controls cost.",
            "It also makes demos and offline-style work easier.",
        ],
    )

    qa(
        pdf,
        9,
        "How did this help the supply chain in the end?",
        [
            "Faster decisions from alert to purchase order.",
            "Fewer stockouts and fewer expedite / panic orders.",
            "Math is explainable. Policy is citable.",
            "Leadership gets an auditable trail instead of tribal memory.",
        ],
    )

    qa(
        pdf,
        10,
        "What would you improve next?",
        [
            "Connect live WMS inventory instead of sample CSV.",
            "Add evaluation for grounded answers and tool routing.",
            "Richer SOP coverage and better citation UI.",
            "Optional approval step before a PO is suggested.",
        ],
    )

    qa(
        pdf,
        11,
        "Give me your elevator pitch in under 20 seconds.",
        [
            "I built a DeCA-style logistics agent for people like Nancy.",
            "It looks up stock, runs EOQ and safety stock, and searches SOPs.",
            "She gets fast, grounded answers -- then writes a clean PO.",
        ],
    )

    qa(
        pdf,
        12,
        "What was hardest, and what did you learn?",
        [
            "Hardest: stopping the model from inventing policy or numbers.",
            "Fix: tools for math, grounded RAG for docs, strict prompts.",
            "I learned ops trust matters more than a flashy answer.",
            "Short, correct, citable beats long and clever.",
        ],
    )

    # ----- PART 3: TECH CHEAT SHEET -----
    pdf.add_page()
    pdf.h1("Part 3 -- Tech cheat sheet")
    pdf.h2("Quick answers")
    rows = [
        ("Stack?", "Python. LangChain agent. Ollama LLM. Chroma. Local embeddings."),
        ("Models?", "Chat: llama3.1:8b. Embed: nomic-embed-text."),
        ("Tools?", "Inventory lookup. EOQ. Safety stock. Doc search."),
        ("EOQ formula?", "sqrt(2 * D * S / H)"),
        ("Safety stock?", "z * demand_std * sqrt(lead_time)"),
        ("Grounding?", 'Answer only from retrieved chunks. Else: "I don\'t know".'),
        ("Ingest?", "PDFs -> chunk -> embed -> Chroma. Safe re-run skips old files."),
        ("Why local?", "Ops data stays local. Cost control. Works offline-ish."),
        ("Key files?", "app.py, agent.py, tools.py, rag.py, prompts.py, ingest.py"),
        ("Demo SKU?", "SKU-2002 hand sanitizer -- on-hand 15, ROP 60, REORDER"),
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

    pdf.h2("Origin arc (4 words)")
    pdf.bullet("Problem -- alerts + PDFs + guessed math")
    pdf.bullet("Why me -- one place for lookup, math, SOPs")
    pdf.bullet("Build -- local agent, tools + RAG, no invented facts")
    pdf.bullet("Outcome -- faster POs, fewer stockouts, audit trail")

    pdf.h2("Practice checklist")
    pdf.bullet("Read Part 1 out loud once (with breaths).")
    pdf.bullet("Answer Q1, Q2, Q9, Q11 without looking -- then check.")
    pdf.bullet("Open docs/nancy-interview-speaking-beats.mmd while rehearsing.")
    pdf.bullet("Keep each answer under 45 seconds.")

    pdf.output(str(OUT))
    return OUT


if __name__ == "__main__":
    path = build()
    print(f"Wrote {path}")
