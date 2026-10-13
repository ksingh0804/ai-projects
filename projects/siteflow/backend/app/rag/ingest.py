"""Turn an uploaded PDF or text file into citation-ready chunks."""

from __future__ import annotations

import io

from pypdf import PdfReader
from pypdf.errors import PdfReadError

from app.errors import InvalidDocument
from app.rag.chunking import recursive_split
from app.rag.retriever import Chunk


def extract_pages(filename: str, data: bytes) -> list[str]:
    """Return one string per page. Page numbers shown to users start at 1."""
    suffix = filename.lower().rsplit(".", 1)[-1]
    if suffix == "txt":
        try:
            text = data.decode("utf-8-sig")
        except UnicodeDecodeError as exc:
            raise InvalidDocument("Text files must be UTF-8.") from exc
        if not text.strip():
            raise InvalidDocument("The text file is empty.")
        return [text]
    if suffix != "pdf":
        raise InvalidDocument("Only PDF and text files are indexed for search.")

    try:
        reader = PdfReader(io.BytesIO(data))
        pages = [page.extract_text() or "" for page in reader.pages]
    except (PdfReadError, ValueError) as exc:
        raise InvalidDocument("That PDF could not be read.") from exc

    if not any(page.strip() for page in pages):
        raise InvalidDocument(
            "No text could be read from that PDF. Scanned drawings need OCR, "
            "which this project does not pretend to do."
        )
    return pages


def title_from_pages(pages: list[str], filename: str) -> str:
    for page in pages:
        for line in page.splitlines():
            cleaned = " ".join(line.split())
            if cleaned:
                return cleaned[:80]
    return filename.rsplit(".", 1)[0].replace("_", " ")


def pages_to_chunks(
    pages: list[str],
    *,
    title: str,
    project_id: str,
    source_name: str,
    chunk_size: int,
    chunk_overlap: int,
) -> list[Chunk]:
    chunks: list[Chunk] = []
    for page_number, text in enumerate(pages, start=1):
        for piece in recursive_split(text, chunk_size, chunk_overlap):
            chunks.append(
                Chunk(
                    text=piece,
                    title=title,
                    page=page_number,
                    project_id=project_id,
                    source_name=source_name,
                )
            )
    if not chunks:
        raise InvalidDocument("The document produced no searchable text.")
    return chunks
