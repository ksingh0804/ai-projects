"""Bedrock is the AWS implementation of ChatModel.

The request builder and response parser are pure functions so they can be
tested with no AWS account. BedrockChatModel.invoke is the method the rest
of the app calls. It is the same method OllamaChatModel has.
"""

from app.agents.llm import BedrockChatModel, claude_messages_body, parse_claude_response

__all__ = ["BedrockChatModel", "claude_messages_body", "parse_claude_response"]
