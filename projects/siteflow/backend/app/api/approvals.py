"""Record a human yes or no and resume the paused graph."""

from __future__ import annotations

from fastapi import APIRouter, Request

from app.schemas import ApprovalRequest, ChatResponse

router = APIRouter(prefix="/api")


@router.post("/approvals/{thread_id}", response_model=ChatResponse)
def approve(thread_id: str, body: ApprovalRequest, request: Request) -> dict:
    return request.app.state.engine.approve(thread_id, body.approved, body.note)
