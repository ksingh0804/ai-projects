"""Document upload and list. The browser never receives a storage path it can escape."""

from __future__ import annotations

from fastapi import APIRouter, File, Request, UploadFile

from app.errors import FileTooLarge

router = APIRouter(prefix="/api")


@router.post("/projects/{project_id}/documents")
async def upload_document(
    project_id: str,
    request: Request,
    file: UploadFile = File(...),
) -> dict:
    engine = request.app.state.engine
    data = await _read_limited(file, engine.settings.max_upload_bytes)
    filename = file.filename or "upload"
    return engine.upload(project_id, filename, data)


@router.get("/projects/{project_id}/documents")
def list_documents(project_id: str, request: Request) -> dict:
    return request.app.state.engine.list_documents(project_id)


async def _read_limited(upload: UploadFile, limit: int) -> bytes:
    pieces: list[bytes] = []
    total = 0
    while True:
        piece = await upload.read(64 * 1024)
        if not piece:
            break
        total += len(piece)
        if total > limit:
            raise FileTooLarge(f"Files must be {limit} bytes or smaller.")
        pieces.append(piece)
    return b"".join(pieces)
