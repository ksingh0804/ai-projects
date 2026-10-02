"""Ordered keyword router. Math wins, then schedule risk, then documents."""

from __future__ import annotations

MATERIALS = (
    "eoq",
    "safety stock",
    "sku",
    "holding cost",
    "order cost",
    "annual demand",
    "on hand",
    "on-hand",
)
RISK = (
    "risk",
    "delay",
    "weather",
    "pour",
    "blocked",
    "block",
    "hold",
)
SPEC = (
    "spec",
    "rfi",
    "division",
    "submittal",
    "curing",
    "concrete",
    "steel",
    "bolt",
    "vapor",
    "lead time",
)


def choose_route(message: str) -> str:
    text = message.lower()
    if any(word in text for word in MATERIALS):
        return "materials"
    if any(word in text for word in RISK):
        return "risk"
    if any(word in text for word in SPEC):
        return "spec"
    return "chat"
