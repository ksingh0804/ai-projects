"""Recursive character chunking, the same idea as LangChain's splitter.

Specifications are already split by headings, paragraphs, and sentences.
We cut on those boundaries first. We only slide a character window when a
single piece is still longer than the chunk and has no separator left.
That keeps "RFI-014" and section numbers intact more often than a semantic
splitter, which needs an embedding model and can glue unrelated "shall" clauses.
"""

from __future__ import annotations


def recursive_split(
    text: str,
    chunk_size: int = 800,
    chunk_overlap: int = 120,
    separators: tuple[str, ...] | None = None,
) -> list[str]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    if chunk_overlap < 0 or chunk_overlap >= chunk_size:
        raise ValueError("chunk_overlap must be >= 0 and smaller than chunk_size")
    if separators is None:
        separators = ("\n\n", "\n", ". ", " ", "")

    units = _split_units(text, chunk_size, chunk_overlap, separators)
    return _merge_units(units, chunk_size, chunk_overlap)


def _split_units(
    text: str,
    chunk_size: int,
    chunk_overlap: int,
    separators: tuple[str, ...],
) -> list[str]:
    if text == "":
        return []
    if len(text) <= chunk_size:
        return [text]
    if not separators:
        return _windows(text, chunk_size, chunk_overlap)

    separator = separators[0]
    rest = separators[1:]
    if separator == "":
        return _windows(text, chunk_size, chunk_overlap)
    if separator not in text:
        return _split_units(text, chunk_size, chunk_overlap, rest)

    parts = text.split(separator)
    units: list[str] = []
    for index, part in enumerate(parts):
        piece = part if index == len(parts) - 1 else part + separator
        if piece == "":
            continue
        if len(piece) <= chunk_size:
            units.append(piece)
        else:
            units.extend(_split_units(piece, chunk_size, chunk_overlap, rest))
    return units


def _windows(text: str, chunk_size: int, chunk_overlap: int) -> list[str]:
    step = chunk_size - chunk_overlap
    chunks: list[str] = []
    start = 0
    while start < len(text):
        chunks.append(text[start : start + chunk_size])
        if start + chunk_size >= len(text):
            break
        start += step
    return chunks


def _merge_units(units: list[str], chunk_size: int, chunk_overlap: int) -> list[str]:
    merged: list[str] = []
    current = ""
    for unit in units:
        if current == "":
            current = unit
            continue
        if len(current) + len(unit) <= chunk_size:
            current += unit
            continue
        merged.append(current)
        if chunk_overlap:
            candidate = current[-chunk_overlap:] + unit
            current = candidate if len(candidate) <= chunk_size else unit
        else:
            current = unit
    if current:
        merged.append(current)
    return [piece for piece in merged if piece.strip()]
