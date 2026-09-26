"""Runtime settings. Defaults run the whole app with no AWS account and no LLM."""

from __future__ import annotations

from pathlib import Path

from pydantic import BaseModel, Field

BACKEND_ROOT = Path(__file__).resolve().parents[1]
SITEFLOW_ROOT = Path(__file__).resolve().parents[2]

ID_PATTERN = r"^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$"
ALLOWED_SUFFIXES = (".pdf", ".csv", ".txt")
MAX_UPLOAD_BYTES = 10 * 1024 * 1024


class Settings(BaseModel):
    mode: str = "local"
    use_aws: bool = False
    data_dir: Path = Field(default_factory=lambda: SITEFLOW_ROOT / "data" / "runtime")
    sample_dir: Path = Field(default_factory=lambda: SITEFLOW_ROOT / "data" / "sample")
    checkpoint_path: Path | None = None
    max_upload_bytes: int = MAX_UPLOAD_BYTES
    allowed_suffixes: tuple[str, ...] = ALLOWED_SUFFIXES
    chunk_size: int = 800
    chunk_overlap: int = 120
    top_k: int = 4
    seed_demo: bool = False
    aws_region: str = "us-west-2"
    s3_bucket: str = ""
    bedrock_model_id: str = "anthropic.claude-3-haiku-20240307-v1:0"
    ollama_model: str = "llama3.1:8b"
    ollama_base_url: str = "http://127.0.0.1:11434"

    def sqlite_path(self) -> Path:
        if self.checkpoint_path is not None:
            return self.checkpoint_path
        return self.data_dir / "checkpoints.sqlite"
