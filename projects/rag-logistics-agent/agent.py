"""Tool-calling logistics agent: docs vs calculators vs inventory lookup."""

from __future__ import annotations

import logging
import time
from typing import Any

from langchain.agents import create_agent
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.messages import AIMessage, BaseMessage, ToolMessage
from langchain_ollama import ChatOllama

from rag import CHAT_MODEL
from timing import timed
from tools import get_tools

logger = logging.getLogger("logistics_rag")

AGENT_SYSTEM_PROMPT = """You are a logistics operations agent.

Decide which tool to use:
- eoq_calculator — Economic Order Quantity math (demand, order cost, holding cost)
- safety_stock_estimator — safety/buffer stock from demand std, lead time, z-score
- lookup_sample_inventory — mock SKU on-hand / reorder data from the sample table
- search_logistics_docs — policies and procedures from ingested PDF/SOP documents

Rules:
- Prefer tools for calculations and SKU lookups; do not invent numbers.
- For document/policy questions, call search_logistics_docs and answer ONLY from that context.
- If document context is insufficient, say exactly: I don't know
- If a SKU is missing, say so and list known SKUs from the tool result.
- Be concise. Show the key result and brief reasoning.
"""

_agent_cache: dict[tuple[str, float], Any] = {}


class AgentStepTimer(BaseCallbackHandler):
    """Log START/END timing for each LLM and tool step inside agent.invoke."""

    def __init__(self) -> None:
        self._llm_started: dict[str, float] = {}
        self._tool_started: dict[str, float] = {}
        self.llm_steps = 0
        self.tool_steps = 0

    def on_chat_model_start(self, serialized, messages, *, run_id, **kwargs) -> None:
        self.llm_steps += 1
        label = f"llm_step_{self.llm_steps}"
        self._llm_started[str(run_id)] = time.perf_counter()
        logger.info("START - %s", label)

    def on_llm_end(self, response, *, run_id, **kwargs) -> None:
        started = self._llm_started.pop(str(run_id), None)
        step = self.llm_steps - len(self._llm_started)
        label = f"llm_step_{step}"
        if started is None:
            logger.info("END   - %s", label)
            return
        logger.info("END   - %s (%.3fs)", label, time.perf_counter() - started)

    def on_llm_error(self, error, *, run_id, **kwargs) -> None:
        started = self._llm_started.pop(str(run_id), None)
        step = self.llm_steps
        label = f"llm_step_{step}"
        if started is None:
            logger.info("END   - %s ERROR: %s", label, error)
            return
        logger.info(
            "END   - %s (%.3fs) ERROR: %s",
            label,
            time.perf_counter() - started,
            error,
        )

    def on_tool_start(self, serialized, input_str, *, run_id, **kwargs) -> None:
        self.tool_steps += 1
        name = (serialized or {}).get("name") or kwargs.get("name") or "tool"
        label = f"tool:{name}"
        self._tool_started[str(run_id)] = time.perf_counter()
        logger.info("START - %s", label)

    def on_tool_end(self, output, *, run_id, **kwargs) -> None:
        started = self._tool_started.pop(str(run_id), None)
        # Name is not always available here; keep generic if missing.
        label = "tool"
        if started is None:
            logger.info("END   - %s", label)
            return
        logger.info("END   - %s (%.3fs)", label, time.perf_counter() - started)

    def on_tool_error(self, error, *, run_id, **kwargs) -> None:
        started = self._tool_started.pop(str(run_id), None)
        label = "tool"
        if started is None:
            logger.info("END   - %s ERROR: %s", label, error)
            return
        logger.info(
            "END   - %s (%.3fs) ERROR: %s",
            label,
            time.perf_counter() - started,
            error,
        )


def build_agent(
    *,
    model: str = CHAT_MODEL,
    temperature: float = 0.0,
):
    """Create a tool-calling agent (LangChain create_agent / graph)."""
    cache_key = (model, temperature)
    if cache_key in _agent_cache:
        logger.info("build_agent cache hit (%s)", model)
        return _agent_cache[cache_key]

    with timed("build_agent"):
        llm = ChatOllama(model=model, temperature=temperature)
        tools = get_tools()
        agent = create_agent(
            llm,
            tools=tools,
            system_prompt=AGENT_SYSTEM_PROMPT,
        )
        _agent_cache[cache_key] = agent
        return agent


def _final_text(messages: list[BaseMessage]) -> str:
    for msg in reversed(messages):
        if isinstance(msg, AIMessage) and msg.content and not msg.tool_calls:
            if isinstance(msg.content, str):
                return msg.content
            return str(msg.content)
    return ""


def _extract_tool_trace(messages: list[BaseMessage]) -> list[dict[str, Any]]:
    tool_calls: list[dict[str, Any]] = []
    pending: dict[str, dict[str, Any]] = {}

    for msg in messages:
        if isinstance(msg, AIMessage) and msg.tool_calls:
            for call in msg.tool_calls:
                entry = {
                    "id": call.get("id"),
                    "name": call.get("name"),
                    "args": call.get("args"),
                    "result": None,
                }
                tool_calls.append(entry)
                if call.get("id"):
                    pending[call["id"]] = entry
        elif isinstance(msg, ToolMessage):
            entry = pending.get(msg.tool_call_id) if msg.tool_call_id else None
            if entry is None and tool_calls:
                entry = tool_calls[-1]
            if entry is not None:
                entry["result"] = str(msg.content)

    return tool_calls


def _log_agent_messages(messages: list[BaseMessage]) -> None:
    ai_count = sum(1 for m in messages if isinstance(m, AIMessage))
    tool_count = sum(1 for m in messages if isinstance(m, ToolMessage))
    logger.info(
        "agent finished: %s messages (%s AI, %s tool results)",
        len(messages),
        ai_count,
        tool_count,
    )
    for msg in messages:
        name = type(msg).__name__
        if name == "AIMessage" and getattr(msg, "tool_calls", None):
            for call in msg.tool_calls:
                logger.info("tool call: %s(%s)", call.get("name"), call.get("args"))
        elif name == "ToolMessage":
            preview = str(msg.content)
            if len(preview) > 300:
                preview = preview[:300] + "…"
            logger.info("tool result: %s", preview)


def ask_agent_with_trace(question: str, *, model: str = CHAT_MODEL) -> dict[str, Any]:
    """Run one agent turn and return the answer plus tool-call trace."""
    with timed("ask_agent_with_trace"):
        agent = build_agent(model=model)
        logger.info("agent question: %s", question)
        step_timer = AgentStepTimer()
        with timed("agent.invoke"):
            result: dict[str, Any] = agent.invoke(
                {"messages": [{"role": "user", "content": question}]},
                config={"callbacks": [step_timer]},
            )
        logger.info(
            "agent.invoke summary: %s LLM step(s), %s tool step(s)",
            step_timer.llm_steps,
            step_timer.tool_steps,
        )
        messages = result.get("messages", [])
        _log_agent_messages(messages)
        with timed("extract_answer_and_trace"):
            return {
                "answer": _final_text(messages),
                "tool_calls": _extract_tool_trace(messages),
            }


def ask_agent(question: str, *, model: str = CHAT_MODEL) -> str:
    """Run one agent turn; LLM chooses tools vs document search."""
    return ask_agent_with_trace(question, model=model)["answer"]
