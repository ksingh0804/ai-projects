from pathlib import Path
from ingest import discover_pdfs, load_pdf_documents, select_new_pdfs, make_splitter
from langchain_core.documents import Document

def test_discover_pdfs_no_pdf(tmp_path):
    (tmp_path / "notes.txt").write_text("Hello")
    (tmp_path / "image.png").write_bytes(b"not-a-pdf")
    (tmp_path / "sop").mkdir()
    (tmp_path / "sop" / "readme.md").write_text("# doc")


    result = discover_pdfs(tmp_path)
    assert result == []

def test_discover_pdfs_missing_folder(tmp_path):
    result = discover_pdfs(tmp_path / "does_not_exist")
    assert result == []


def test_select_new_pdfs_skips_already_known_source(tmp_path):
    known_pdf = tmp_path / "sop.pdf"
    new_pdf = tmp_path / "shipment.pdf"
    known_pdf.write_bytes(b"%PDF-1.4")
    new_pdf.write_bytes(b"%PDF-1.4")

    on_disk = discover_pdfs(tmp_path)
    known_sources = {str(known_pdf.resolve())}

    result = select_new_pdfs(on_disk, known_sources)

    assert result == [new_pdf]
    assert known_pdf not in result
    assert len(result) == 1



def test_load_pdf_documents_skips_corrupt_pdf_and_continues(
    tmp_path: Path, monkeypatch
) -> None:
    corrupt = tmp_path / "corrupt.pdf"
    good = tmp_path / "good.pdf"
    corrupt.write_bytes(b"this is not a pdf")
    good.write_bytes(b"%PDF-1.4")

    def fake_load_pdf(path: Path):
        if path.name == "corrupt.pdf":
            raise ValueError("Invalid PDF header")
        return [
            Document(
                page_content="shipment ready",
                metadata={"source": str(path.resolve()), "filename": path.name, "page": 0},
            )
        ]

    monkeypatch.setattr("ingest.load_pdf", fake_load_pdf)

    result = load_pdf_documents(tmp_path)

    assert len(result) == 1
    assert result[0].metadata["filename"] == "good.pdf"


def test_chunk_windows_on_tiny_string():
    splitter = make_splitter(chunk_size=4, chunk_overlap=2, separators=[""])
    text = "abcdefghij"

    chunks = splitter.split_text(text)

    assert chunks == ["abcd", "cdef", "efgh", "ghij"]    

def test_tiny_string_stays_one_chunk_with_real_settings():
    splitter = make_splitter()  # 680 / 100
    assert splitter.split_text("PO-4417 qty 12") == ["PO-4417 qty 12"]