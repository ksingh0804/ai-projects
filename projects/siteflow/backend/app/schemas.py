"""HTTP bodies. These are the contract the React app is allowed to depend on."""

from __future__ import annotations

import re

from pydantic import BaseModel, Field, field_validator

from app.config import ID_PATTERN

_ID = re.compile(ID_PATTERN)


def _identifier(value: str) -> str:
    if not _ID.fullmatch(value):
        raise ValueError("id must be 1-64 letters, numbers, underscores, or hyphens")
    return value


class ChatRequest(BaseModel):
    project_id: str
    thread_id: str
    message: str

    @field_validator("project_id", "thread_id")
    @classmethod
    def identifiers(cls, value: str) -> str:
        return _identifier(value)

    @field_validator("message")
    @classmethod
    def message_not_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("message must not be empty")
        if len(cleaned) > 4000:
            raise ValueError("message must be at most 4000 characters")
        return cleaned


class SourceCitation(BaseModel):
    title: str
    page: int | None = None
    snippet: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceCitation] = Field(default_factory=list)
    agents_used: list[str]
    needs_approval: bool
    recommendation: str | None = None
    route: str
    route_reason: str
    status: str
    tool_result: dict | None = None


class ApprovalRequest(BaseModel):
    approved: bool
    note: str = ""

    @field_validator("note")
    @classmethod
    def note_length(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) > 500:
            raise ValueError("note must be at most 500 characters")
        return cleaned


class ErrorBody(BaseModel):
    error: str
    detail: str
