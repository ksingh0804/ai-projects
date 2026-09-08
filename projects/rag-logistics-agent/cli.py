"""CLI for the logistics RAG agent."""

from __future__ import annotations

import argparse
import logging
import sys

from agent import ask_agent
from rag import TOP_K, ask as ask_rag


def configure_cli_logging(verbose: bool) -> None:
    from timing import configure_logging

    level = logging.DEBUG if verbose else logging.INFO
    configure_logging(level=level)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Logistics RAG agent - tools + grounded docs"
    )
    parser.add_argument(
        "question",
        nargs="?",
        help="Question to ask (or omit for REPL)",
    )
    parser.add_argument(
        "--rag-only",
        action="store_true",
        help="Skip the agent; use grounded RetrievalQA-style chain only",
    )
    parser.add_argument(
        "-k",
        type=int,
        default=TOP_K,
        help=f"Top-k chunks for --rag-only (default {TOP_K})",
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Log retrieved chunks and tool calls",
    )
    args = parser.parse_args(argv)

    configure_cli_logging(args.verbose)

    def answer(question: str) -> str:
        if args.rag_only:
            return ask_rag(question, k=args.k)
        return ask_agent(question)

    if args.question:
        print(answer(args.question))
        return 0

    mode = "RAG-only" if args.rag_only else "agent (tools + docs)"
    print(f"Logistics RAG [{mode}] - empty line or Ctrl-D to quit. Use -v for debug logs.")
    while True:
        try:
            question = input("\nQ> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if not question:
            break
        print(f"A> {answer(question)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
