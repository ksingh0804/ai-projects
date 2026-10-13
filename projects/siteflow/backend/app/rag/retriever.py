"""BM25 lexical retrieval scoped to one project.

Construction questions are full of exact tokens: RFI-014, Division 03, SKU
codes, ASTM numbers. BM25 ranks documents that share those tokens. It does
not know that "slab on grade" and "foundation pour" are related unless both
phrases are in the text. Embeddings learn that kind of paraphrase, and they
need a model. The retriever interface is a function, so a Chroma or
OpenSearch index can replace this later without changing the agents.
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass

_TOKEN = re.compile(r"[a-z0-9]+")

# Query words that show up in almost every spec. They must not be enough to
# cite a document. "the steel" should rank steel, not every page that says "the".
_STOPWORDS = frozenset(
    {
        "a",
        "an",
        "and",
        "are",
        "about",
        "after",
        "before",
        "can",
        "do",
        "does",
        "for",
        "from",
        "how",
        "in",
        "is",
        "me",
        "of",
        "on",
        "or",
        "out",
        "that",
        "the",
        "this",
        "to",
        "was",
        "we",
        "were",
        "what",
        "when",
        "where",
        "which",
        "with",
    }
)


@dataclass(frozen=True)
class Chunk:
    text: str
    title: str
    page: int
    project_id: str
    source_name: str


@dataclass(frozen=True)
class ScoredChunk:
    chunk: Chunk
    score: float


def tokenize(text: str) -> list[str]:
    return _TOKEN.findall(text.lower())


def search_chunks(
    chunks: list[Chunk],
    query: str,
    *,
    project_id: str,
    k: int = 4,
    k1: float = 1.5,
    b: float = 0.75,
) -> list[ScoredChunk]:
    """Return up to k chunks in this project with a positive BM25 score.

    idf = ln(1 + (N - df + 0.5) / (df + 0.5))
    score(term) = idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * dl / avgdl))
    """
    if k <= 0:
        raise ValueError("k must be > 0")

    pool = [chunk for chunk in chunks if chunk.project_id == project_id]
    query_terms = [term for term in tokenize(query) if term not in _STOPWORDS]
    if not pool or not query_terms:
        return []

    tokenized = [tokenize(chunk.text) for chunk in pool]
    lengths = [len(tokens) for tokens in tokenized]
    average = sum(lengths) / len(lengths)
    if average == 0:
        return []

    document_frequency: dict[str, int] = {}
    for tokens in tokenized:
        for term in set(tokens):
            document_frequency[term] = document_frequency.get(term, 0) + 1

    total = len(pool)
    scored: list[ScoredChunk] = []
    for chunk, tokens, length in zip(pool, tokenized, lengths):
        term_frequency: dict[str, int] = {}
        for term in tokens:
            term_frequency[term] = term_frequency.get(term, 0) + 1
        score = 0.0
        for term in query_terms:
            tf = term_frequency.get(term, 0)
            if tf == 0:
                continue
            df = document_frequency[term]
            idf = math.log(1 + (total - df + 0.5) / (df + 0.5))
            denominator = tf + k1 * (1 - b + b * length / average)
            score += idf * (tf * (k1 + 1)) / denominator
        if score > 0:
            scored.append(ScoredChunk(chunk=chunk, score=score))

    scored.sort(key=lambda item: (-item.score, item.chunk.source_name, item.chunk.page))
    return scored[:k]
