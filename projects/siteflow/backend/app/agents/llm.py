"""One chat interface, three writers.

TemplateChatModel quotes the draft the tools already computed. It is the
default because it costs nothing and cannot invent a new number.

OllamaChatModel and BedrockChatModel implement the same invoke(messages)
method. The graph may ask one of them to rephrase a draft. If the rephrase
adds a number that was not in the draft, the draft is kept.
"""

from __future__ import annotations

import json
from typing import Protocol

import httpx


class ChatModel(Protocol):
    def invoke(self, messages: list[dict]) -> str: ...


class TemplateChatModel:
    """Returns the draft unchanged. Useful when no model is installed."""

    def invoke(self, messages: list[dict]) -> str:
        for message in reversed(messages):
            if message.get("role") == "user":
                return str(message.get("content") or "")
        return ""


class OllamaChatModel:
    def __init__(
        self,
        model: str,
        base_url: str = "http://127.0.0.1:11434",
        client: httpx.Client | None = None,
    ) -> None:
        self.model = model
        self.base_url = base_url.rstrip("/")
        self._client = client

    def invoke(self, messages: list[dict]) -> str:
        http = self._client or httpx.Client(timeout=60)
        close = self._client is None
        try:
            response = http.post(
                f"{self.base_url}/api/chat",
                json={"model": self.model, "messages": messages, "stream": False},
            )
            response.raise_for_status()
            content = response.json()["message"]["content"]
        finally:
            if close:
                http.close()
        return str(content)


def claude_messages_body(messages: list[dict], *, max_tokens: int = 512) -> dict:
    """Body for Anthropic Claude on Amazon Bedrock's Messages API.

    anthropic_version is the Bedrock contract string, not the model id.
    System text is a top-level field. User and assistant turns go in messages.
    """
    if max_tokens <= 0:
        raise ValueError("max_tokens must be > 0")

    system_parts: list[str] = []
    conversation: list[dict] = []
    for message in messages:
        role = message["role"]
        content = str(message["content"])
        if role == "system":
            system_parts.append(content)
        elif role in {"user", "assistant"}:
            conversation.append(
                {"role": role, "content": [{"type": "text", "text": content}]}
            )
        else:
            raise ValueError(f"unsupported role {role}")
    if not conversation:
        raise ValueError("at least one user or assistant message is required")

    body: dict = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": max_tokens,
        "messages": conversation,
    }
    if system_parts:
        body["system"] = "\n".join(system_parts)
    return body


def parse_claude_response(payload: dict) -> str:
    parts: list[str] = []
    for block in payload.get("content") or []:
        if isinstance(block, dict) and block.get("type") == "text":
            parts.append(str(block.get("text") or ""))
    text = "".join(parts).strip()
    if not text:
        raise ValueError("bedrock response had no text")
    return text


class BedrockChatModel:
    def __init__(self, client: object, model_id: str) -> None:
        self._client = client
        self.model_id = model_id

    def invoke(self, messages: list[dict]) -> str:
        body = claude_messages_body(messages)
        response = self._client.invoke_model(  # type: ignore[attr-defined]
            modelId=self.model_id,
            body=json.dumps(body),
            accept="application/json",
            contentType="application/json",
        )
        raw = response["body"].read()
        payload = json.loads(raw)
        return parse_claude_response(payload)
