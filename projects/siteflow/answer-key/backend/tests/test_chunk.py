from langchain_core.documents import Document

from app.rag.ingest import chunk_documents


def test_chunks_overlap():
    document = Document(
        page_content=("Harbor School Gym concrete specification. " * 80),
        metadata={"title": "division-03.txt", "page": 1, "project_id": "demo"},
    )
    chunks = chunk_documents([document])
    assert len(chunks) > 1
    tail = chunks[0].page_content[-40:]
    assert tail in chunks[1].page_content
