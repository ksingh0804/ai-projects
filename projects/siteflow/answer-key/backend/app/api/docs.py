"""Upload and list project files. The browser never writes to disk or S3 itself."""

from __future__ import annotations

import os
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.paths import siteflow_root

router = APIRouter()

ALLOWED = {".pdf", ".csv", ".txt"}
MAX_BYTES = 10 * 1024 * 1024


def project_dir(project_id: str) -> Path:
    if not project_id or any(token in project_id for token in ("/", "\\", "..")):
        raise HTTPException(status_code=400, detail="Invalid project id")
    folder = siteflow_root() / "data" / "projects" / project_id / "docs"
    folder.mkdir(parents=True, exist_ok=True)
    return folder


def save_upload(project_id: str, upload: UploadFile) -> dict:
    name = Path(upload.filename or "").name
    suffix = Path(name).suffix.lower()
    if suffix not in ALLOWED:
        raise HTTPException(status_code=400, detail="Only pdf, csv, and txt files are allowed")

    data = upload.file.read()
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="File is empty")
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File is larger than 10 MB")

    if os.getenv("USE_AWS", "false").lower() == "true":
        from io import BytesIO

        from app.aws.s3 import upload_fileobj

        key = f"projects/{project_id}/docs/{name}"
        upload_fileobj(BytesIO(data), key)
    else:
        (project_dir(project_id) / name).write_bytes(data)

    return {"filename": name, "bytes": len(data), "project_id": project_id}


def list_documents(project_id: str) -> dict:
    folder = project_dir(project_id)
    documents = [
        {"filename": path.name, "bytes": path.stat().st_size}
        for path in sorted(folder.iterdir())
        if path.is_file()
    ]
    return {"project_id": project_id, "documents": documents}


@router.post("/projects/{project_id}/documents")
def post_document(project_id: str, file: UploadFile = File(...)):
    return save_upload(project_id, file)


@router.get("/projects/{project_id}/documents")
def get_documents(project_id: str):
    return list_documents(project_id)
