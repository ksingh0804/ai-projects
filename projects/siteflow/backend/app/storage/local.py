"""Project files on disk: data/runtime/projects/{id}/docs/{filename}."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

from app.config import ID_PATTERN
from app.errors import InvalidIdentifier, UnsupportedFileType

_CONTENT_TYPES = {
    ".pdf": "application/pdf",
    ".csv": "text/csv",
    ".txt": "text/plain",
}


@dataclass(frozen=True)
class StoredFile:
    project_id: str
    filename: str
    size: int
    content_type: str
    modified: float


def check_identifier(value: str) -> None:
    if not re.fullmatch(ID_PATTERN, value or ""):
        raise InvalidIdentifier(
            "Use 1-64 characters: letters, numbers, underscore, or hyphen."
        )


def safe_filename(name: str, allowed_suffixes: tuple[str, ...]) -> str:
    base = Path(name).name.replace("\x00", "")
    base = re.sub(r"\s+", "_", base)
    base = re.sub(r"[^A-Za-z0-9._-]", "", base).strip("._")
    if not base:
        raise UnsupportedFileType("The file name is not usable.")
    if not base.lower().endswith(allowed_suffixes):
        raise UnsupportedFileType("Upload a PDF, CSV, or text file.")
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,127}", base):
        raise UnsupportedFileType("Use a simpler file name.")
    return base


class LocalDocumentStore:
    def __init__(self, root: Path) -> None:
        self.root = root

    def save(self, project_id: str, filename: str, data: bytes) -> StoredFile:
        check_identifier(project_id)
        path = self._path(project_id, filename)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        return self._describe(project_id, path)

    def read(self, project_id: str, filename: str) -> bytes:
        path = self._path(project_id, filename)
        if not path.is_file():
            raise FileNotFoundError(filename)
        return path.read_bytes()

    def delete(self, project_id: str, filename: str) -> None:
        path = self._path(project_id, filename)
        if path.is_file():
            path.unlink()

    def list_files(self, project_id: str) -> list[StoredFile]:
        check_identifier(project_id)
        folder = self.root / "projects" / project_id / "docs"
        if not folder.is_dir():
            return []
        files = [self._describe(project_id, path) for path in folder.iterdir() if path.is_file()]
        return sorted(files, key=lambda item: item.filename)

    def list_projects(self) -> list[str]:
        folder = self.root / "projects"
        if not folder.is_dir():
            return []
        return sorted(path.name for path in folder.iterdir() if path.is_dir())

    def _path(self, project_id: str, filename: str) -> Path:
        return self.root / "projects" / project_id / "docs" / filename

    def _describe(self, project_id: str, path: Path) -> StoredFile:
        suffix = path.suffix.lower()
        return StoredFile(
            project_id=project_id,
            filename=path.name,
            size=path.stat().st_size,
            content_type=_CONTENT_TYPES.get(suffix, "application/octet-stream"),
            modified=path.stat().st_mtime,
        )
