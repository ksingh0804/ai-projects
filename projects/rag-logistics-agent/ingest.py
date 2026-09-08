"""Ingest PDFs from data/ into Chroma. Safe to re-run — skips already-stored files."""

from __future__ import annotations

from pathlib import Path

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader

DATA_DIR = Path(__file__).parent / "data"
CHROMA_DIR = Path(__file__).parent / "chroma_db"
COLLECTION = "logistics_docs"
EMBED_MODEL = "nomic-embed-text"
CHUNK_SIZE = 680
CHUNK_OVERLAP = 100




def discover_pdfs(root: Path) -> list[Path]:
    if not root.exists() or not root.is_dir():
        return []
    return sorted(p for p in root.rglob("*.pdf") if p.is_file())


def load_pdf(path: Path) -> list[Document]:
    """Load one PDF into LangChain Documents (one per page)."""
    source = str(path.resolve())
    reader = PdfReader(source)
    return [
        Document(
            page_content=page.extract_text() or "",
            metadata={"source": source, "filename": path.name, "page": page_number},
        )
        for page_number, page in enumerate(reader.pages)
    ]


def load_pdf_documents(data_dir: Path | str) -> list[Document]:
    """Load all PDFs under data_dir, skipping unreadable files."""
    root = Path(data_dir).resolve()
    pdf_files = discover_pdfs(root)
    if not pdf_files:
        print(f"[INFO] No PDF files found in: {root}")
        return []

    print(f"[INFO] Loading {len(pdf_files)} PDF file(s) from {root}")
    documents: list[Document] = []
    for pdf_file in pdf_files:
        print(f"[INFO] Loading: {pdf_file.name}")
        try:
            documents.extend(load_pdf(pdf_file))
        except Exception as exc:
            print(f"[WARN] Skipped unreadable PDF ({pdf_file.name}): {exc}")

    print(f"[INFO] Total loaded documents: {len(documents)}")
    return documents


def get_vectorstore() -> Chroma:
    return Chroma(
        persist_directory=str(CHROMA_DIR),
        embedding_function=OllamaEmbeddings(model=EMBED_MODEL),
        collection_name=COLLECTION,
    )


def already_ingested_sources(vectorstore: Chroma) -> set[str]:
    """Absolute source paths already present in Chroma."""
    data = vectorstore.get(include=["metadatas"])
    return {
        meta["source"]
        for meta in data.get("metadatas") or []
        if meta and meta.get("source")
    }


def select_new_pdfs(pdf_paths: list[Path], known_sources: set[str]) -> list[Path]:
    """Keep only PDF paths that are not already stored in Chroma."""
    return [
        path
        for path in pdf_paths
        if str(path.resolve()) not in known_sources and str(path) not in known_sources
    ]

def make_splitter(
    chunk_size = CHUNK_SIZE,
    chunk_overlap = CHUNK_OVERLAP,
    separators = None,
    ):
    kwargs = {"chunk_size": chunk_size, "chunk_overlap": chunk_overlap}
    if separators is not None:
        kwargs["separators"] = separators
    return RecursiveCharacterTextSplitter(**kwargs)


def main():
    pdf_paths = discover_pdfs(DATA_DIR)
    if not pdf_paths:
        print(f"No PDFs found in {DATA_DIR}")
        return

    print(f"Found {len(pdf_paths)} PDF(s) in {DATA_DIR}")
    for index, path in enumerate(pdf_paths, start=1):
        print(f"  {index}. {path.name}")

    vectorstore = get_vectorstore()
    known = already_ingested_sources(vectorstore)
    new_paths = [
        path
        for path in pdf_paths
        if str(path.resolve()) not in known and str(path) not in known
    ]

    if not new_paths:
        print("Nothing new to ingest — all PDFs already in Chroma.")
        return

    skipped = len(pdf_paths) - len(new_paths)
    print(f"\nIngesting {len(new_paths)} new PDF(s); skipping {skipped} already stored.")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )

    total_chunks = 0
    for path in new_paths:
        
        pages = load_pdf(path)   
        chunks = splitter.split_documents(pages)
        if not chunks:
            print(f"  skip (empty): {path.name}")
            continue

        vectorstore.add_documents(chunks)
        total_chunks += len(chunks)
        print(f"  + {path.name}: {len(pages)} pages → {len(chunks)} chunks")

    print(f"\nDone. Added {total_chunks} chunks → {CHROMA_DIR}")


if __name__ == "__main__":
    main()
