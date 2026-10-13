import pytest

from app.rag.chunking import recursive_split
from app.rag.ingest import pages_to_chunks
from app.rag.retriever import Chunk, search_chunks


def test_character_window_matches_the_project2_example():
    chunks = recursive_split("abcdefghij", chunk_size=4, chunk_overlap=2, separators=("",))
    assert chunks == ["abcd", "cdef", "efgh", "ghij"]


def test_short_spec_line_stays_one_chunk():
    assert recursive_split("PO-4417 qty 12") == ["PO-4417 qty 12"]


def test_paragraphs_split_before_the_middle_of_a_word():
    text = "AAAA\n\nBBBB"
    chunks = recursive_split(text, chunk_size=6, chunk_overlap=0)
    assert chunks == ["AAAA\n\n", "BBBB"]
    assert all("AAAABB" not in chunk for chunk in chunks)


def test_overlap_is_prefixed_to_the_next_chunk():
    chunks = recursive_split("1234\n\nAB", chunk_size=6, chunk_overlap=2)
    assert chunks[0] == "1234\n\n"
    assert chunks[1].startswith(chunks[0][-2:])


def test_overlap_must_be_smaller_than_the_chunk():
    with pytest.raises(ValueError):
        recursive_split("hello", chunk_size=4, chunk_overlap=4)


def test_pages_are_numbered_from_one():
    chunks = pages_to_chunks(
        ["first page", "second page"],
        title="Division 03",
        project_id="demo",
        source_name="div03.pdf",
        chunk_size=800,
        chunk_overlap=120,
    )
    assert [chunk.page for chunk in chunks] == [1, 2]
    assert chunks[0].title == "Division 03"


def test_bm25_ranks_the_document_that_shares_the_query_terms():
    chunks = [
        Chunk("structural steel lead time", "Steel", 1, "demo", "steel.pdf"),
        Chunk("gate hours south gate", "Logistics", 1, "demo", "site.pdf"),
    ]
    hits = search_chunks(chunks, "structural steel", project_id="demo", k=4)
    assert [hit.chunk.source_name for hit in hits] == ["steel.pdf"]


def test_bm25_does_not_return_another_projects_chunks():
    chunks = [
        Chunk("structural steel lead time", "Steel", 1, "job-a", "steel.pdf"),
        Chunk("structural steel lead time", "Steel", 1, "job-b", "steel.pdf"),
    ]
    hits = search_chunks(chunks, "structural steel", project_id="job-a", k=4)
    assert len(hits) == 1
    assert hits[0].chunk.project_id == "job-a"


def test_stopwords_alone_do_not_cite_every_document():
    chunks = [
        Chunk("the gate is open", "Logistics", 1, "demo", "site.pdf"),
        Chunk("the structural steel laydown", "Steel", 1, "demo", "steel.pdf"),
    ]
    assert search_chunks(chunks, "where is the", project_id="demo", k=4) == []
    hits = search_chunks(chunks, "where is the steel", project_id="demo", k=4)
    assert [hit.chunk.source_name for hit in hits] == ["steel.pdf"]


def test_bm25_empty_query_and_k_limit():
    chunks = [
        Chunk("alpha steel", "A", 1, "demo", "a.pdf"),
        Chunk("beta steel", "B", 1, "demo", "b.pdf"),
    ]
    assert search_chunks(chunks, "   ", project_id="demo", k=4) == []
    hits = search_chunks(chunks, "steel", project_id="demo", k=1)
    assert len(hits) == 1
    with pytest.raises(ValueError):
        search_chunks(chunks, "steel", project_id="demo", k=0)
