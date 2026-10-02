"""One chat function. Ollama locally, Bedrock when USE_AWS is on, empty string if neither is up."""

from __future__ import annotations

import json
import os


def complete(system: str, user: str) -> str:
    if os.getenv("USE_AWS", "false").lower() == "true":
        return _bedrock(system, user)
    return _ollama(system, user)


def _ollama(system: str, user: str) -> str:
    try:
        from langchain_ollama import ChatOllama

        model = ChatOllama(model=os.getenv("OLLAMA_MODEL", "llama3.1:8b"))
        result = model.invoke(
            [
                ("system", system),
                ("human", user),
            ]
        )
        return getattr(result, "content", str(result))
    except Exception:
        return ""


def _bedrock(system: str, user: str) -> str:
    import boto3

    client = boto3.client("bedrock-runtime", region_name=os.getenv("AWS_REGION", "us-west-2"))
    body = json.dumps(
        {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 400,
            "system": system,
            "messages": [{"role": "user", "content": user}],
        }
    )
    response = client.invoke_model(
        modelId=os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0"),
        body=body,
    )
    payload = json.loads(response["body"].read())
    return payload["content"][0]["text"]
