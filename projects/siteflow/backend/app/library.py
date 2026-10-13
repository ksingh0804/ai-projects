"""In-memory view of each project's chunks and materials table.

The files themselves live in the document store. This object is rebuilt from
those files after every upload. Agents read it during a turn. Two projects
never share a list.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from app.rag.retriever import Chunk


@dataclass
class ProjectRecord:
    chunks: list[Chunk] = field(default_factory=list)
    materials: dict[str, dict] = field(default_factory=dict)


class ProjectLibrary:
    def __init__(self) -> None:
        self._records: dict[str, ProjectRecord] = {}

    def put(self, project_id: str, record: ProjectRecord) -> None:
        self._records[project_id] = record

    def chunks(self, project_id: str) -> list[Chunk]:
        record = self._records.get(project_id)
        if record is None:
            return []
        return list(record.chunks)

    def materials(self, project_id: str) -> dict[str, dict]:
        record = self._records.get(project_id)
        if record is None:
            return {}
        return dict(record.materials)
