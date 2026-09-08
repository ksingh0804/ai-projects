"""Shared timing helpers for START / END unit logs."""

from __future__ import annotations

import logging
import time
from contextlib import contextmanager
from typing import Iterator

logger = logging.getLogger("logistics_rag")


@contextmanager
def timed(unit: str) -> Iterator[None]:
    """Log START / END for a named unit and report elapsed seconds."""
    logger.info("START - %s", unit)
    started = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - started
        logger.info("END   - %s (%.3fs)", unit, elapsed)


def configure_logging(level: int = logging.INFO) -> None:
    """Configure logistics_rag logging once (safe to call from Streamlit)."""
    root = logging.getLogger("logistics_rag")
    if root.handlers:
        root.setLevel(level)
        return

    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter(
            "%(asctime)s %(levelname)s [%(name)s] %(message)s",
            datefmt="%H:%M:%S",
        )
    )
    root.addHandler(handler)
    root.setLevel(level)
    root.propagate = False
