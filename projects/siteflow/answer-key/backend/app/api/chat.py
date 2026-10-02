"""POST /api/chat. One question in, answer plus citations out."""

from __future__ import annotations

import logging
import time
import uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.agents.graph import graph
from app.agents.state import fresh_state

router = APIRouter()
logger = logging.getLogger("siteflow")


class ChatRequest(BaseModel):
    project_id: str
    thread_id: str
    message: str = Field(min_length=1)


class Source(BaseModel):
    title: str
    page: int
    snippet: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[Source]
    agents_used: list[str]
    needs_approval: bool
    recommendation: str


def _config(thread_id: str) -> dict:
    return {"configurable": {"thread_id": thread_id}}


def _response_from_snapshot(snapshot) -> ChatResponse:
    values = snapshot.values or {}
    waiting = "human_review" in (snapshot.next or ())
    recommendation = values.get("recommendation") or ""
    answer = recommendation
    if waiting:
        answer = recommendation + " This needs approval before anyone acts on it."
    sources = [
        Source(
            title=item.get("title") or "document",
            page=int(item.get("page") or 1),
            snippet=item.get("snippet") or "",
        )
        for item in values.get("sources") or []
    ]
    return ChatResponse(
        answer=answer,
        sources=sources,
        agents_used=list(values.get("agents_used") or []),
        needs_approval=waiting,
        recommendation=recommendation,
    )


@router.post("/chat", response_model=ChatResponse)
def post_chat(body: ChatRequest):
    started = time.perf_counter()
    request_id = uuid.uuid4().hex[:8]
    config = _config(body.thread_id)
    try:
        existing = graph.get_state(config)
        if existing.values and "human_review" in (existing.next or ()):
            raise HTTPException(
                status_code=409,
                detail="Approve or reject the current recommendation before asking a new question.",
            )
        graph.invoke(fresh_state(body.project_id, body.message), config)
        snapshot = graph.get_state(config)
        latency_ms = round((time.perf_counter() - started) * 1000, 1)
        logger.info(
            "request_id=%s project_id=%s route=%s latency_ms=%s",
            request_id,
            body.project_id,
            (snapshot.values or {}).get("route"),
            latency_ms,
        )
        return _response_from_snapshot(snapshot)
    except HTTPException:
        raise
    except Exception:
        logger.exception("request_id=%s chat failed", request_id)
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again.")
