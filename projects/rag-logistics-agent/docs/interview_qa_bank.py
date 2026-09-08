"""Structured interview Q&A for the logistics RAG agent project."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class InterviewQuestion:
    id: str
    category: str
    question: str
    short_answer: str  # stammer-friendly, speak in 2-4 beats
    deep_answer: str  # follow-up / technical depth
    tip: str  # what interviewer is probing


CATEGORIES = [
    "Opening & motivation",
    "Architecture & stack",
    "RAG & grounding",
    "Agent & tools",
    "Ingest & data",
    "Performance & ops",
    "Tradeoffs & production",
    "Behavioral & domain",
    "Coding / TDD style",
]

QUESTIONS: list[InterviewQuestion] = [
    InterviewQuestion(
        id="open-1",
        category="Opening & motivation",
        question="Tell me about this project in 60 seconds.",
        short_answer=(
            "I built a logistics ops agent for DeCA-style inventory work. "
            "Alerts, PDFs, and math pile up in the morning rush. "
            "One assistant: tools for numbers, RAG for SOPs, no invented facts. "
            "Example: phantom flour — system says 48, shelf is empty — agent helps the next safe step."
        ),
        deep_answer=(
            "Stack: Python, LangChain agent, Ollama locally, Chroma for vectors. "
            "Four tools: inventory lookup, EOQ, safety stock, doc search. "
            "Docs are synthetic DeCA-style SOPs; the pain is real from commissary work. "
            "Outcome: faster triage, citeable policy answers, safer order math."
        ),
        tip="Lead with problem → solution → one concrete demo beat. Save stack for follow-up.",
    ),
    InterviewQuestion(
        id="open-2",
        category="Opening & motivation",
        question="Why did you build this?",
        short_answer=(
            "I worked inventory and supply at a DoD commissary. "
            "I felt the morning alert rush — NIS reports, SOP PDFs, EOQ math all at once. "
            "People hunted documents and guessed. I wanted one trusted assistant for that rush."
        ),
        deep_answer=(
            "DeCA-style ops needs three things at once: factual SKU state, "
            "formula-backed order math, and policy steps from SOPs. "
            "Spreadsheets and manual PDF search don't scale at cutoff time. "
            "The agent pattern routes each question to the right capability."
        ),
        tip="Personal + operational pain beats 'I wanted to learn LangChain'.",
    ),
    InterviewQuestion(
        id="open-3",
        category="Opening & motivation",
        question="Is this real DeCA data?",
        short_answer=(
            "The PDFs are synthetic, DeCA-style SOPs. "
            "The workflow pain is real from commissary work. "
            "The architecture is what I'd run on real SOPs and inventory feeds."
        ),
        deep_answer=(
            "Sample inventory is a CSV mock; documents mirror real SOP categories "
            "(receiving, cold chain, NIS, fulfillment). "
            "I'd swap the CSV for an ERP API and point ingest at governed doc storage in production."
        ),
        tip="Be honest early — interviewers respect data hygiene.",
    ),
    InterviewQuestion(
        id="arch-1",
        category="Architecture & stack",
        question="Walk me through the system architecture.",
        short_answer=(
            "User asks via Streamlit or CLI. "
            "Agent mode: LLM picks tools — calculators, inventory lookup, or doc search. "
            "RAG-only mode: retrieve top-k chunks from Chroma, grounded prompt, answer. "
            "Ingest is separate: PDFs → chunk → embed → Chroma."
        ),
        deep_answer=(
            "Modules: ingest.py, rag.py, agent.py, tools.py, app.py. "
            "LangChain create_agent for tool routing; LCEL chain for pure RAG. "
            "Ollama hosts llama3.1:8b (chat) and nomic-embed-text (embeddings). "
            "Chroma persists under chroma_db/ collection logistics_docs."
        ),
        tip="Draw three boxes: UI → agent/RAG → Chroma + tools.",
    ),
    InterviewQuestion(
        id="arch-2",
        category="Architecture & stack",
        question="Why local Ollama instead of OpenAI?",
        short_answer=(
            "Ops data stays on machine — no external API for SOP text. "
            "Predictable cost, works offline-ish, good for a portfolio demo. "
            "Tradeoff: slower on CPU; I'd use GPU or a hosted model in production if latency matters."
        ),
        deep_answer=(
            "Embeddings and chat both go through Ollama. "
            "For enterprise DeCA you'd add auth, audit logs, and possibly air-gapped deploy. "
            "The code path is the same — swap ChatOllama for another provider via LangChain."
        ),
        tip="Show you understand latency vs privacy tradeoff.",
    ),
    InterviewQuestion(
        id="arch-3",
        category="Architecture & stack",
        question="What's the difference between agent mode and RAG-only mode?",
        short_answer=(
            "RAG-only always retrieves docs then answers from context — good for pure policy Q&A. "
            "Agent mode lets the LLM choose: math tools, SKU lookup, or doc search. "
            "Agent is better for mixed questions like 'SKU-1002 plus cold chain rules'."
        ),
        deep_answer=(
            "CLI exposes --rag-only; Streamlit has a mode toggle. "
            "Agent uses search_logistics_docs tool internally for policies. "
            "RAG-only skips tool routing — fewer LLM round-trips, but no EOQ/inventory."
        ),
        tip="Mention when you'd pick each in production.",
    ),
    InterviewQuestion(
        id="rag-1",
        category="RAG & grounding",
        question="How does your RAG pipeline work?",
        short_answer=(
            "Question → embed → Chroma similarity search top-k → format chunks with filename and page → "
            "grounded system prompt → LLM answer. "
            "If context is thin, reply exactly: I don't know."
        ),
        deep_answer=(
            "retrieve_docs uses k=4 by default. format_docs builds numbered blocks for the prompt. "
            "GROUNDED_PROMPT in prompts.py enforces context-only answers. "
            "ask_with_context returns chunks for UI traceability."
        ),
        tip="Say top-k, metadata citation, and refusal rule.",
    ),
    InterviewQuestion(
        id="rag-2",
        category="RAG & grounding",
        question="How do you reduce hallucinations?",
        short_answer=(
            "System prompt: answer ONLY from retrieved context. "
            "Explicit refusal string: I don't know. "
            "Temperature 0. Show retrieved chunks in the UI so users can verify."
        ),
        deep_answer=(
            "Numeric questions go to tools — LLM doesn't invent EOQ or on-hand qty. "
            "Doc questions must call search_logistics_docs first. "
            "Future: reranker, confidence threshold, require citation token in answer."
        ),
        tip="Separate 'math hallucination' from 'policy hallucination'.",
    ),
    InterviewQuestion(
        id="rag-3",
        category="RAG & grounding",
        question="Why chunk size 680 and overlap 100?",
        short_answer=(
            "Balance: big enough for a full SOP step, small enough for precise retrieval. "
            "Overlap keeps sentences split across boundaries from losing meaning. "
            "I'd tune with eval questions on real SOPs."
        ),
        deep_answer=(
            "RecursiveCharacterTextSplitter splits on paragraphs/sentences when possible. "
            "680 chars ≈ one procedure block in many PDFs. "
            "100 overlap ≈ 15% — common starting point; measure recall@k on labeled Q&A."
        ),
        tip="Show you know chunking is empirical, not magic.",
    ),
    InterviewQuestion(
        id="agent-1",
        category="Agent & tools",
        question="What tools does the agent have and when does it use each?",
        short_answer=(
            "eoq_calculator — order quantity math. "
            "safety_stock_estimator — buffer stock from demand std and lead time. "
            "lookup_sample_inventory — SKU on-hand and reorder status. "
            "search_logistics_docs — grounded SOP search. "
            "System prompt tells the LLM which to pick."
        ),
        deep_answer=(
            "Tools return structured dicts for traceability. "
            "search_logistics_docs wraps the same retriever as RAG. "
            "Agent graph: user message → LLM may emit tool_calls → tool results → final answer."
        ),
        tip="Give one example question per tool.",
    ),
    InterviewQuestion(
        id="agent-2",
        category="Agent & tools",
        question="State the EOQ and safety stock formulas you implemented.",
        short_answer=(
            "EOQ: square root of two times D times S over H — demand, order cost, holding cost. "
            "Safety stock: z times demand standard deviation times square root of lead time."
        ),
        deep_answer=(
            "EOQ assumes constant demand and fixed ordering cost — classic Wilson model. "
            "Safety stock tool uses a basic normal approximation; z=1.65 ≈ 95% service level. "
            "Tools validate inputs and return error dicts instead of throwing."
        ),
        tip="Say what each variable means in ops language.",
    ),
    InterviewQuestion(
        id="agent-3",
        category="Agent & tools",
        question="How does tool routing work under the hood?",
        short_answer=(
            "LangChain create_agent with ChatOllama and @tool-decorated functions. "
            "LLM sees tool schemas in the prompt, may return tool_calls, runtime executes them, "
            "results go back as ToolMessages, then a second LLM pass writes the answer."
        ),
        deep_answer=(
            "ask_agent_with_trace captures tool name, args, and results for the Streamlit trace panel. "
            "AgentStepTimer logs llm_step_N vs tool timings — tools are milliseconds, LLM is the bottleneck."
        ),
        tip="Mention two LLM passes for a typical tool-using answer.",
    ),
    InterviewQuestion(
        id="ingest-1",
        category="Ingest & data",
        question="How does PDF ingest work?",
        short_answer=(
            "Discover PDFs under data/, skip files already in Chroma by source path, "
            "load pages with pypdf, split with RecursiveCharacterTextSplitter, "
            "embed with nomic-embed-text, add to Chroma. Safe to re-run."
        ),
        deep_answer=(
            "load_pdf produces one Document per page with source, filename, page metadata. "
            "already_ingested_sources reads metadatas from the collection. "
            "Corrupt PDFs are skipped with a warning, not a full abort."
        ),
        tip="Emphasize idempotency — important for ops pipelines.",
    ),
    InterviewQuestion(
        id="ingest-2",
        category="Ingest & data",
        question="Why pypdf instead of langchain-community PyPDFLoader?",
        short_answer=(
            "langchain-community is sunset and logs deprecation warnings. "
            "pypdf plus langchain_core Document is the same outcome with fewer dependencies. "
            "One page per Document, metadata we control."
        ),
        deep_answer=(
            "Standalone integration packages are the LangChain direction. "
            "For production I'd evaluate pymupdf or unstructured if layout/tables matter."
        ),
        tip="Shows dependency hygiene and migration awareness.",
    ),
    InterviewQuestion(
        id="perf-1",
        category="Performance & ops",
        question="The app feels slow — what did you find?",
        short_answer=(
            "Almost all time is Ollama LLM on CPU — not Chroma or tools. "
            "A typical agent question: llm_step_1 picks a tool, tool runs in milliseconds, "
            "llm_step_2 writes the answer. agent.invoke was 60–180 seconds locally."
        ),
        deep_answer=(
            "Added START/END timing per unit and per llm_step. "
            "size_vram=0 on Ollama — model runs on CPU ~4–5 tok/s. "
            "Mitigations: smaller model (llama3.2), GPU, cache agent, narrower prompts."
        ),
        tip="Demonstrate you profiled before optimizing.",
    ),
    InterviewQuestion(
        id="perf-2",
        category="Performance & ops",
        question="What observability do you have?",
        short_answer=(
            "Structured logs: START/END with seconds per unit. "
            "Streamlit shows tool trace and retrieved chunks. "
            "CLI -v for debug chunk previews."
        ),
        deep_answer=(
            "timing.timed context manager; AgentStepTimer callback on invoke. "
            "Production would add request IDs, export to Datadog, track retrieval scores."
        ),
        tip="Connect logs to the phantom-flour debug story.",
    ),
    InterviewQuestion(
        id="trade-1",
        category="Tradeoffs & production",
        question="What would you change for production?",
        short_answer=(
            "Real inventory API with auth, governed doc store, eval set for RAG quality, "
            "hosted or GPU inference, user roles, audit trail of tool calls and citations."
        ),
        deep_answer=(
            "Add reranking, hybrid search, chunk versioning on SOP updates, "
            "human-in-the-loop for PO recommendations, rate limits, secret management, CI tests on tools."
        ),
        tip="Pick 3 concrete items, not a laundry list.",
    ),
    InterviewQuestion(
        id="trade-2",
        category="Tradeoffs & production",
        question="Biggest limitation of this design?",
        short_answer=(
            "Local LLM latency and no formal eval harness yet. "
            "Retrieval can miss the right SOP chunk — then we correctly say I don't know, "
            "but Nancy still needs an answer. "
            "Agent can pick the wrong tool on ambiguous questions."
        ),
        deep_answer=(
            "No reranker; single embedding model; no feedback loop from users. "
            "Multi-step workflows (open ticket + adjust BoH) are out of scope. "
            "Would add routing classifier or few-shot examples for tool choice."
        ),
        tip="Honest limitation + mitigation beats pretending it's perfect.",
    ),
    InterviewQuestion(
        id="behav-1",
        category="Behavioral & domain",
        question="Walk me through the phantom flour scenario.",
        short_answer=(
            "NIS report: Gold Medal Flour, system BoH 48, shelf count 0 — phantom inventory. "
            "Nancy asks the agent in English. "
            "Doc search pulls planogram, NIS, maybe recall rules. "
            "Tools handle reorder math if needed. She fixes BoH with a citeable next step."
        ),
        deep_answer=(
            "Demonstrates three capabilities in one morning: variance triage, policy lookup, "
            "optional EOQ/safety stock. Grounding prevents inventing recall status. "
            "Aligns with DeCA SOP categories in data/."
        ),
        tip="Use Nancy's name — makes it memorable.",
    ),
    InterviewQuestion(
        id="behav-2",
        category="Behavioral & domain",
        question="How would you explain this to a non-technical store manager?",
        short_answer=(
            "It's like a shift lead who knows the SOP binder and the inventory screen. "
            "You ask in plain English. "
            "It shows its work — which document or calculation it used. "
            "If it's not sure, it says so instead of guessing."
        ),
        deep_answer=(
            "Map features to her day: lookup = 'what's on hand', EOQ = 'how much to order', "
            "doc search = 'what's the procedure'. UI trace builds trust."
        ),
        tip="No jargon: RAG → 'searches the SOP binder'.",
    ),
    InterviewQuestion(
        id="code-1",
        category="Coding / TDD style",
        question="How would you test the inventory lookup tool?",
        short_answer=(
            "TDD: first test happy path SKU-1002 → REORDER because 80 < 200. "
            "Then test normalization — lowercase and spaces. "
            "Then miss → error dict with known_skus, not an exception. "
            "Pure function + dict in, dict out — no LLM in unit tests."
        ),
        deep_answer=(
            "Mock CSV with tmp_path in pytest. "
            "Assert below_reorder_point and status fields. "
            "Agent integration test would mock ChatOllama; unit tests stay fast."
        ),
        tip="Say 'I'd write the failing test first' even in a verbal interview.",
    ),
    InterviewQuestion(
        id="code-2",
        category="Coding / TDD style",
        question="How would you test grounded RAG refuses to hallucinate?",
        short_answer=(
            "Unit test format_docs empty → sentinel string. "
            "Test should_refuse when context is empty or unrelated to question tokens. "
            "Assert exact output: I don't know. "
            "Don't need a live LLM to test the gate logic."
        ),
        deep_answer=(
            "Golden-file tests for retrieval on labeled SOP questions. "
            "Integration test with mocked LLM returning a fixed string. "
            "Measure citation overlap between answer and retrieved chunks."
        ),
        tip="Separate pure logic tests from LLM integration tests.",
    ),
]

OPENERS = [q for q in QUESTIONS if q.category == "Opening & motivation"]
TECH = [q for q in QUESTIONS if q.category not in ("Opening & motivation", "Behavioral & domain")]
