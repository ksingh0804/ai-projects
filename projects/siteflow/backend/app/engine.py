"""Use cases the HTTP routes call.

Routes stay thin: read the request, call the engine, return JSON.
The engine checks files, rebuilds the index, and runs the graph.
"""

from __future__ import annotations

import logging
import sqlite3
import time
from contextvars import ContextVar
from pathlib import Path

from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.types import Command

from app.agents.graph import compile_graph
from app.config import Settings
from app.errors import (
    ApprovalPending,
    EmptyUpload,
    FileTooLarge,
    InvalidDocument,
    NotAwaitingApproval,
    ThreadProjectMismatch,
    UnknownThread,
)
from app.library import ProjectLibrary, ProjectRecord
from app.rag.ingest import extract_pages, pages_to_chunks, title_from_pages
from app.rag.retriever import Chunk
from app.storage.local import (
    LocalDocumentStore,
    StoredFile,
    check_identifier,
    safe_filename,
)
from app.tools.inventory import load_materials_csv

logger = logging.getLogger("siteflow")
request_id_var: ContextVar[str] = ContextVar("siteflow_request_id", default="-")


def open_checkpointer(path: Path) -> tuple[sqlite3.Connection, SqliteSaver]:
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(str(path), check_same_thread=False)
    return connection, SqliteSaver(connection)


def index_project(store, project_id: str, settings: Settings) -> ProjectRecord:
    files = store.list_files(project_id)
    materials_file = choose_materials_file(files)
    chunks: list[Chunk] = []
    for stored in files:
        if stored.filename.lower().endswith(".csv"):
            continue
        data = store.read(project_id, stored.filename)
        pages = extract_pages(stored.filename, data)
        title = title_from_pages(pages, stored.filename)
        chunks.extend(
            pages_to_chunks(
                pages,
                title=title,
                project_id=project_id,
                source_name=stored.filename,
                chunk_size=settings.chunk_size,
                chunk_overlap=settings.chunk_overlap,
            )
        )
    materials: dict[str, dict] = {}
    if materials_file is not None:
        raw = store.read(project_id, materials_file.filename)
        try:
            materials = load_materials_csv(raw.decode("utf-8-sig"))
        except UnicodeDecodeError as exc:
            raise InvalidDocument("CSV files must be UTF-8.") from exc
        except ValueError as exc:
            raise InvalidDocument(str(exc)) from exc
    return ProjectRecord(chunks=chunks, materials=materials)


def choose_materials_file(files: list[StoredFile]) -> StoredFile | None:
    """One table per project. materials.csv wins. Otherwise the newest CSV."""
    csv_files = [item for item in files if item.filename.lower().endswith(".csv")]
    named = [item for item in csv_files if item.filename.lower() == "materials.csv"]
    if named:
        return named[0]
    if not csv_files:
        return None
    return max(csv_files, key=lambda item: (item.modified, item.filename))


def public_result(result: dict) -> dict:
    interrupted = bool(result.get("__interrupt__"))
    agents = list(result.get("agents_used") or [])
    if interrupted and "human_review" not in agents:
        agents.append("human_review")
    if interrupted:
        status = "awaiting_approval"
        needs_approval = True
    elif result.get("approval"):
        status = "resolved"
        needs_approval = False
    else:
        status = "complete"
        needs_approval = False
    return {
        "answer": result.get("answer") or "",
        "sources": result.get("sources") or [],
        "agents_used": agents,
        "needs_approval": needs_approval,
        "recommendation": result.get("recommendation"),
        "route": result.get("route") or "",
        "route_reason": result.get("route_reason") or "",
        "status": status,
        "tool_result": result.get("tool_result"),
    }


class Engine:
    def __init__(self, settings: Settings, store, library: ProjectLibrary, graph, connection) -> None:
        self.settings = settings
        self.store = store
        self.library = library
        self.graph = graph
        self._connection = connection

    def close(self) -> None:
        self._connection.close()

    def upload(self, project_id: str, filename: str, data: bytes) -> dict:
        check_identifier(project_id)
        safe = safe_filename(filename, self.settings.allowed_suffixes)
        if not data:
            raise EmptyUpload("The file is empty.")
        if len(data) > self.settings.max_upload_bytes:
            raise FileTooLarge(
                f"Files must be {self.settings.max_upload_bytes} bytes or smaller."
            )
        self._validate_bytes(safe, data)
        self.store.save(project_id, safe, data)
        try:
            record = index_project(self.store, project_id, self.settings)
        except Exception:
            self.store.delete(project_id, safe)
            raise
        self.library.put(project_id, record)
        return {
            "project_id": project_id,
            "filename": safe,
            "size": len(data),
            "chunks": len(record.chunks),
        }

    def list_documents(self, project_id: str) -> dict:
        check_identifier(project_id)
        documents = [
            {
                "filename": item.filename,
                "size": item.size,
                "content_type": item.content_type,
            }
            for item in self.store.list_files(project_id)
        ]
        return {"project_id": project_id, "documents": documents}

    def chat(self, project_id: str, thread_id: str, message: str) -> dict:
        check_identifier(project_id)
        check_identifier(thread_id)
        config = {"configurable": {"thread_id": thread_id}}
        snapshot = self.graph.get_state(config)
        if snapshot.next:
            raise ApprovalPending(
                "Approve or reject the current recommendation before asking another question."
            )
        values = snapshot.values or {}
        if values.get("project_id") and values["project_id"] != project_id:
            raise ThreadProjectMismatch("This thread already belongs to a different project.")

        history = list(values.get("messages") or [])
        history.append({"role": "user", "content": message})
        started = time.perf_counter()
        result = self.graph.invoke(
            {
                "project_id": project_id,
                "message": message,
                "messages": history,
                "agents_used": [],
            },
            config,
        )
        public = public_result(result)
        elapsed_ms = (time.perf_counter() - started) * 1000
        logger.info(
            "request_id=%s project_id=%s route=%s latency_ms=%.1f",
            request_id_var.get(),
            project_id,
            public["route"],
            elapsed_ms,
        )
        return public

    def approve(self, thread_id: str, approved: bool, note: str) -> dict:
        check_identifier(thread_id)
        config = {"configurable": {"thread_id": thread_id}}
        snapshot = self.graph.get_state(config)
        values = snapshot.values or {}
        if not values and not snapshot.next:
            raise UnknownThread("No conversation exists for that thread.")
        if "human_review" not in (snapshot.next or ()):
            raise NotAwaitingApproval("This thread is not waiting for approval.")
        result = self.graph.invoke(
            Command(resume={"approved": approved, "note": note}),
            config,
        )
        return public_result(result)

    def _validate_bytes(self, filename: str, data: bytes) -> None:
        lower = filename.lower()
        if lower.endswith(".csv"):
            try:
                load_materials_csv(data.decode("utf-8-sig"))
            except UnicodeDecodeError as exc:
                raise InvalidDocument("CSV files must be UTF-8.") from exc
            except ValueError as exc:
                raise InvalidDocument(str(exc)) from exc
            return
        extract_pages(filename, data)


def build_engine(settings: Settings, store=None, model=None) -> Engine:
    if settings.use_aws:
        raise RuntimeError(
            "USE_AWS is not wired in this process. Keep USE_AWS=false until the "
            "S3DocumentStore is passed in explicitly. The S3 methods are tested "
            "with a fake client so keys are never required to run the app."
        )
    if store is None:
        settings.data_dir.mkdir(parents=True, exist_ok=True)
        store = LocalDocumentStore(settings.data_dir)
    library = ProjectLibrary()
    for project_id in store.list_projects():
        library.put(project_id, index_project(store, project_id, settings))
    connection, checkpointer = open_checkpointer(settings.sqlite_path())
    graph = compile_graph(library, checkpointer, k=settings.top_k, model=model)
    return Engine(settings, store, library, graph, connection)
