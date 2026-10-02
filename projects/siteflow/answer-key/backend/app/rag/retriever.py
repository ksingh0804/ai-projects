"""Similarity search filtered by project_id. Empty list means the spec agent refuses."""

from __future__ import annotations

import os

from app.paths import siteflow_root


def _collection():
    import chromadb
    from chromadb.utils.embedding_functions import OllamaEmbeddingFunction

    path = siteflow_root() / "backend" / "chroma_db"
    path.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(path))
    embed = OllamaEmbeddingFunction(
        url=os.getenv("OLLAMA_URL", "http://127.0.0.1:11434"),
        model_name=os.getenv("EMBED_MODEL", "nomic-embed-text"),
    )
    return client.get_or_create_collection(name="siteflow", embedding_function=embed)


def retrieve(project_id: str, query: str, k: int = 4) -> list[dict]:
    try:
        collection = _collection()
    except Exception:
        return []

    if collection.count() == 0:
        return []

    result = collection.query(
        query_texts=[query],
        n_results=k,
        where={"project_id": project_id},
    )
    documents = (result.get("documents") or [[]])[0]
    metadatas = (result.get("metadatas") or [[]])[0]
    distances = (result.get("distances") or [[]])[0]
    sources = []
    for text, meta, distance in zip(documents, metadatas, distances or []):
        meta = meta or {}
        sources.append(
            {
                "title": meta.get("title") or meta.get("filename") or "document",
                "page": int(meta.get("page") or 1),
                "snippet": (text or "")[:400],
                "score": distance,
            }
        )
    return sources
