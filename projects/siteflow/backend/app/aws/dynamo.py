"""Shape of a DynamoDB checkpoint item.

Local mode stores this same idea in SQLite through LangGraph's SqliteSaver.
DynamoDB is the AWS version: partition key thread_id, payload is the
serialized graph state, ttl is optional so abandoned approvals expire.

This module does not call AWS. Turning it on means writing these items with
boto3, which is a later swap behind the checkpointer interface.
"""

from __future__ import annotations


def thread_checkpoint_item(
    thread_id: str,
    payload: dict,
    *,
    ttl_epoch: int | None = None,
) -> dict:
    if not thread_id:
        raise ValueError("thread_id is required")
    if not isinstance(payload, dict):
        raise ValueError("payload must be a dict")
    item: dict = {"thread_id": thread_id, "payload": payload}
    if ttl_epoch is not None:
        if ttl_epoch <= 0:
            raise ValueError("ttl_epoch must be > 0")
        item["ttl"] = ttl_epoch
    return item
