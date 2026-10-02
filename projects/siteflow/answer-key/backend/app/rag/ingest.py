"""Load project text, split it, and store chunks for one project_id."""

from __future__ import annotations

from pathlib import Path

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader

from app.paths import siteflow_root

CHUNK_SIZE = 680
CHUNK_OVERLAP = 100


def load_text_file(path: Path, project_id: str) -> list[Document]:
    suffix = path.suffix.lower()
    if suffix == ".txt":
        text = path.read_text(encoding="utf-8")
        if not text.strip():
            return []
        return [
            Document(
                page_content=text,
                metadata={
                    "project_id": project_id,
                    "filename": path.name,
                    "title": path.name,
                    "page": 1,
                },
            )
        ]

    if suffix == ".pdf":
        reader = PdfReader(str(path))
        documents = []
        for index, page in enumerate(reader.pages, start=1):
            text = page.extract_text() or ""
            if not text.strip():
                continue
            documents.append(
                Document(
                    page_content=text,
                    metadata={
                        "project_id": project_id,
                        "filename": path.name,
                        "title": path.name,
                        "page": index,
                    },
                )
            )
        return documents

    return []


def chunk_documents(documents: list[Document]) -> list[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )
    return splitter.split_documents(documents)


def project_docs_dir(project_id: str) -> Path:
    return siteflow_root() / "data" / "projects" / project_id / "docs"
