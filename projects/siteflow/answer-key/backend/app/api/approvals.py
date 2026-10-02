"""Resume a paused thread after Approve or Reject."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.agents.graph import graph
from app.api.chat import ChatResponse, _config, _response_from_snapshot

router = APIRouter()


class ApprovalRequest(BaseModel):
    approved: bool
    note: str = ""


@router.post("/approvals/{thread_id}", response_model=ChatResponse)
def post_approval(thread_id: str, body: ApprovalRequest):
    config = _config(thread_id)
    snapshot = graph.get_state(config)
    if not snapshot.values:
        raise HTTPException(status_code=404, detail="Unknown thread")

    recommendation = snapshot.values.get("recommendation") or ""
    if body.note:
        recommendation = recommendation + f" Note: {body.note}"

    graph.update_state(config, {"approved": body.approved, "recommendation": recommendation})
    graph.invoke(None, config)
    return _response_from_snapshot(graph.get_state(config))
