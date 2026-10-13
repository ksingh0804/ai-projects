"""Chat is the only way the UI talks to the graph."""

from __future__ import annotations

from fastapi import APIRouter, Request

from app.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/api")


@router.post("/chat", response_model=ChatResponse)
def chat(body: ChatRequest, request: Request) -> dict:
    return request.app.state.engine.chat(body.project_id, body.thread_id, body.message)
