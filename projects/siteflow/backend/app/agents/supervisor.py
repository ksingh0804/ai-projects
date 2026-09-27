"""Keyword cascade that picks spec, materials, risk, or chat.

A cascade is a fixed order of rules. The first rule that matches wins.
That is easier to test and to explain than an LLM classifier, which can
change its mind between two runs of the same question.

Failure mode if this is wrong:
- materials chosen for a spec question: a number comes back with no citation
- spec chosen for an EOQ question: the tool never runs, and the answer is
  "not in the documents" even though the math does not live in the PDF
- chat chosen for a real question: the user gets a refusal instead of a wrong fact

A wrong refusal is safer than a wrong number. Rules that do not match fall
through to chat on purpose.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

_MATERIALS = (
    ("eoq", r"\beoq\b"),
    ("economic order", r"economic order"),
    ("safety stock", r"safety stock"),
    ("holding cost", r"holding cost"),
    ("order cost", r"order cost"),
    ("annual demand", r"annual demand"),
    ("on hand", r"on[- ]hand"),
    ("reorder", r"\breorder\b"),
    ("sku", r"\bskus?\b"),
)

_RISK = (
    ("delay", r"\bdelays?\b"),
    ("risk", r"\brisks?\b"),
    ("weather", r"\bweather\b"),
    ("blocked", r"\bblocked\b"),
    ("block", r"\bblocks?\b"),
    ("hold", r"\bholds?\b"),
    ("pour", r"\bpour(?:s|ing)?\b"),
)

_SPEC = (
    ("lead time language", r"lead time language"),
    ("specification", r"\bspecifications?\b"),
    ("spec", r"\bspecs?\b"),
    ("rfi", r"\brfis?\b"),
    ("submittal", r"\bsubmittals?\b"),
    ("division", r"\bdivision\b"),
    ("curing", r"\bcuring\b"),
    ("mill cert", r"mill certs?"),
    ("vapor barrier", r"vapor barrier"),
    ("drawing", r"\bdrawings?\b"),
    ("cast-in-place", r"cast-in-place"),
    ("structural steel", r"structural steel"),
)

_DOCUMENT_ASK = (
    "what does the spec",
    "according to the spec",
    "according to the document",
    "lead time language",
    "in the spec",
)

_SCHEDULE = ("block", "blocked", "hold", "delay", "weather", "risk")


@dataclass(frozen=True)
class RouteDecision:
    route: str
    reason: str


def route_message(message: str) -> RouteDecision:
    text = " ".join(message.lower().split())
    if not text:
        return RouteDecision("chat", "empty message")

    asks_for_document = any(phrase in text for phrase in _DOCUMENT_ASK)
    material_hit = _first(text, _MATERIALS)
    risk_hit = _first(text, _RISK)
    spec_hit = _first(text, _SPEC)
    schedule = any(re.search(rf"\b{word}s?\b", text) for word in _SCHEDULE)

    # A formula request is unambiguous, unless they are asking what the spec says.
    if material_hit and not asks_for_document:
        return RouteDecision("materials", f"matched materials term '{material_hit}'")

    # "Which RFI blocks the pour?" contains both a document word and a schedule word.
    # Schedule impact wins, because the risk agent is the one that lists blocked work.
    if risk_hit and (spec_hit is None or schedule):
        return RouteDecision("risk", f"matched risk term '{risk_hit}'")

    if spec_hit or asks_for_document:
        name = spec_hit or "document question"
        return RouteDecision("spec", f"matched spec term '{name}'")

    return RouteDecision("chat", "no spec, materials, or risk terms")


def _first(text: str, patterns: tuple[tuple[str, str], ...]) -> str | None:
    for label, pattern in patterns:
        if re.search(pattern, text):
            return label
    return None


def score_routes(questions: list[dict]) -> dict:
    """Routing accuracy on a gold set. This does not score answer faithfulness."""
    rows: list[dict] = []
    correct = 0
    for item in questions:
        decision = route_message(item["question"])
        ok = decision.route == item["expected_route"]
        correct += int(ok)
        rows.append(
            {
                "id": item.get("id"),
                "expected_route": item["expected_route"],
                "actual_route": decision.route,
                "reason": decision.reason,
                "correct": ok,
            }
        )
    total = len(questions)
    return {
        "correct": correct,
        "total": total,
        "accuracy": (correct / total) if total else 0.0,
        "rows": rows,
    }


def supervisor_update(state: dict) -> dict:
    decision = route_message(state.get("message") or "")
    return {
        "route": decision.route,
        "route_reason": decision.reason,
        "agents_used": ["supervisor"],
        "sources": [],
        "tool_result": None,
        "needs_approval": False,
        "recommendation": None,
        "answer": "",
        "approval": None,
    }
