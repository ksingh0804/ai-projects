#!/usr/bin/env python3
"""Generate hard-code tutorial PDFs for prompts, rag, tools, agent, app."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from tutorial_pdf_lib import new_pdf  # noqa: E402

DOCS = Path(__file__).parent


def build_prompts() -> Path:
    pdf = new_pdf("prompts.py")
    out = DOCS / "prompts-py-hardcode-tutorial.pdf"
    pdf.cover(
        "Hard-Coding prompts.py in Python",
        "Line-by-line: grounded system rules, ChatPromptTemplate, and why RAG prompts look like this.",
        "Project: logistics-rag-agent\nFile: prompts.py\nRole: Keep the LLM honest -- answer only from retrieved context",
    )
    pdf.body(
        "This tiny module is the 'contract' between retrieved document chunks and the chat model. "
        "Without a grounded prompt, the model invents logistics policy from general knowledge."
    )

    pdf.add_page()
    pdf.h1("1. Big picture")
    pdf.bullet("GROUNDED_SYSTEM -- rules the model must follow")
    pdf.bullet("GROUNDED_PROMPT -- a ChatPromptTemplate with {context} and {question} slots")
    pdf.bullet("Used by rag.py: fill slots -> send to ChatOllama -> parse string answer")
    pdf.reason(
        "Separating prompts into their own file makes A/B testing wording easy without touching "
        "retrieval or agent code. Product and eng can edit text in one place."
    )

    pdf.h1("2. Build step by step")
    pdf.step(1, "Module docstring + import")
    pdf.code(
        '"""Grounded RAG prompts -- answer only from retrieved context."""\n'
        "\n"
        "from langchain_core.prompts import ChatPromptTemplate"
    )
    pdf.body(
        "ChatPromptTemplate builds a chat-style prompt (system + human messages) "
        "with named variables you fill later via .invoke({'context': ..., 'question': ...})."
    )
    pdf.reason(
        "langchain_core is the stable core API. Prefer it over older langchain.prompts imports."
    )

    pdf.step(2, "Hard-code the system rules as a string constant")
    pdf.code(
        'GROUNDED_SYSTEM = """You are a logistics domain assistant. Answer the user\'s '
        "question using ONLY the provided context from company SOPs and logistics documents.\n"
        "\n"
        "Rules:\n"
        "- Base every factual claim on the context below. Do not use outside knowledge.\n"
        '- If the context is missing, incomplete, or unrelated to the question, reply exactly: I don\'t know\n'
        "- Do not speculate, invent procedures, numbers, or sources.\n"
        '- When you can answer, be concise and cite the document filename when helpful.\n'
        '"""'
    )
    pdf.h3("What each rule buys you")
    pdf.bullet("ONLY context -- blocks Wikipedia-style guessing about 'typical' SOPs")
    pdf.bullet("Exact 'I don't know' -- makes evaluation and UI handling predictable")
    pdf.bullet("No inventing numbers -- critical for logistics (wrong lead time = bad ops)")
    pdf.bullet("Cite filename -- user can verify the source chunk")
    pdf.reason(
        "Grounding is a prompting strategy, not fine-tuning. Tight rules + temperature=0 "
        "(set in rag.py) are the usual way to keep answers close to PDFs."
    )

    pdf.step(3, "Wrap rules + user template in ChatPromptTemplate")
    pdf.code(
        "GROUNDED_PROMPT = ChatPromptTemplate.from_messages(\n"
        "    [\n"
        '        ("system", GROUNDED_SYSTEM),\n'
        "        (\n"
        '            "human",\n'
        '            """Context:\\n'
        "{context}\\n"
        "\\n"
        "Question: {question}\\n"
        "\\n"
        'Answer (or \\"I don\'t know\\" if the context is insufficient):""",\n'
        "        ),\n"
        "    ]\n"
        ")"
    )
    pdf.bullet('("system", ...) -- role message: identity + hard rules')
    pdf.bullet('("human", ...) -- user message with two placeholders: {context}, {question}')
    pdf.bullet("{context} -- filled by rag.py with formatted retrieved chunks")
    pdf.bullet("{question} -- the raw user question string")
    pdf.reason(
        "Putting Context above Question is deliberate: models attend strongly to nearby "
        "instructions; ending with 'Answer...' nudges a direct reply instead of a preamble."
    )
    pdf.reason(
        "from_messages([...]) is preferred over a single giant string because chat models "
        "are trained on role-tagged turns (system vs human)."
    )

    pdf.add_page()
    pdf.h1("3. Full file reference")
    pdf.code(
        '"""Grounded RAG prompts -- answer only from retrieved context."""\n'
        "\n"
        "from langchain_core.prompts import ChatPromptTemplate\n"
        "\n"
        'GROUNDED_SYSTEM = """You are a logistics domain assistant. ..."""\n'
        "\n"
        "GROUNDED_PROMPT = ChatPromptTemplate.from_messages([\n"
        '    ("system", GROUNDED_SYSTEM),\n'
        '    ("human", """Context:\\n{context}\\n\\nQuestion: {question}\\n\\n'
        'Answer (or \\"I don\'t know\\" if the context is insufficient):"""),\n'
        "])"
    )

    pdf.h1("4. How rag.py uses it")
    pdf.code(
        "# inside build_rag_chain:\n"
        "{'context': retriever|format, 'question': RunnablePassthrough()}\n"
        "| GROUNDED_PROMPT\n"
        "| llm\n"
        "| StrOutputParser()"
    )
    pdf.body(
        "The dict before GROUNDED_PROMPT supplies the two template variables. "
        "The prompt object turns them into chat messages; the LLM returns an AIMessage; "
        "StrOutputParser extracts .content as a plain str."
    )

    pdf.h1("5. Practice")
    pdf.bullet("Change the fail phrase to 'Insufficient context.' and see agent/rag behavior change")
    pdf.bullet("Remove 'ONLY the provided context' and ask a question not in the PDFs -- watch hallucination")
    pdf.bullet("Add 'Always quote one short phrase from Context' and re-run ask()")

    pdf.h1("6. Common mistakes")
    pdf.bullet("Forgetting {context} or {question} names -- KeyError or empty fill at invoke time")
    pdf.bullet("Putting facts in the system prompt instead of retrieval -- goes stale vs PDFs")
    pdf.bullet("Vague 'be helpful' system text -- model fills gaps with world knowledge")

    pdf.output(out)
    return out


def build_rag() -> Path:
    pdf = new_pdf("rag.py")
    out = DOCS / "rag-py-hardcode-tutorial.pdf"
    pdf.cover(
        "Hard-Coding rag.py in Python",
        "Retrieve top-k chunks, format them, ground the prompt, and return a string answer.",
        "Project: logistics-rag-agent\nFile: rag.py\nPipeline: question -> Chroma -> prompt -> Ollama chat -> str",
    )
    pdf.body(
        "rag.py is the Retrieval-Augmented Generation path WITHOUT tools. "
        "It always searches documents, stuffs chunks into GROUNDED_PROMPT, and asks the LLM."
    )

    pdf.add_page()
    pdf.h1("1. Big picture")
    pdf.code(
        "question\n"
        "   |\n"
        "   +--> retriever (top-k similar chunks from chroma_db)\n"
        "   |         |\n"
        "   |         v\n"
        "   |    log_retrieved_chunks -> format_docs -> {context}\n"
        "   |\n"
        "   +--> {question} (passthrough)\n"
        "   |\n"
        "   v\n"
        "GROUNDED_PROMPT -> ChatOllama -> StrOutputParser -> answer str"
    )
    pdf.reason(
        "This is LCEL (LangChain Expression Language): pipe objects with |. "
        "Each stage is a Runnable you can test alone."
    )

    pdf.h1("2. Build step by step")
    pdf.step(1, "Imports and shared logger name")
    pdf.code(
        "from __future__ import annotations\n"
        "\n"
        "import logging\n"
        "from pathlib import Path\n"
        "from typing import Any\n"
        "\n"
        "from langchain_core.documents import Document\n"
        "from langchain_core.output_parsers import StrOutputParser\n"
        "from langchain_core.runnables import Runnable, RunnableLambda, RunnablePassthrough\n"
        "from langchain_ollama import ChatOllama, OllamaEmbeddings\n"
        "from langchain_chroma import Chroma\n"
        "\n"
        "from prompts import GROUNDED_PROMPT\n"
        "\n"
        'logger = logging.getLogger("logistics_rag")'
    )
    pdf.bullet("from __future__ import annotations -- postpones evaluation of type hints (cleaner forward refs)")
    pdf.bullet("RunnableLambda -- wrap a plain Python function so it can sit in a | pipeline")
    pdf.bullet("RunnablePassthrough -- copy the input question into the 'question' field unchanged")
    pdf.bullet('Same logger name "logistics_rag" as tools/agent -- one -v flag controls all debug logs')
    pdf.reason(
        "Reusing get_vectorstore settings here (and in ingest) keeps query embeddings in the SAME "
        "vector space as ingested chunks. Mismatched EMBED_MODEL => empty/meaningless search."
    )

    pdf.step(2, "Hard-code Chroma + model constants")
    pdf.code(
        'CHROMA_DIR = Path(__file__).parent / "chroma_db"\n'
        'COLLECTION = "logistics_docs"\n'
        'EMBED_MODEL = "nomic-embed-text"\n'
        'CHAT_MODEL = "llama3.1:8b"\n'
        "TOP_K = 4"
    )
    pdf.bullet("CHROMA_DIR / COLLECTION / EMBED_MODEL -- must match ingest.py")
    pdf.bullet("CHAT_MODEL -- local Ollama chat model for generation")
    pdf.bullet("TOP_K = 4 -- retrieve 4 nearest chunks (tune: too few miss facts, too many add noise)")
    pdf.reason(
        "TOP_K is a retrieval hyperparameter, not magic. Start around 3-8 for SOP PDFs."
    )

    pdf.step(3, "Open the existing vector store")
    pdf.code(
        "def get_vectorstore() -> Chroma:\n"
        "    return Chroma(\n"
        "        persist_directory=str(CHROMA_DIR),\n"
        "        embedding_function=OllamaEmbeddings(model=EMBED_MODEL),\n"
        "        collection_name=COLLECTION,\n"
        "    )"
    )
    pdf.body(
        "Same helper pattern as ingest.py, but rag.py only READS. "
        "It does not add documents."
    )

    pdf.add_page()
    pdf.step(4, "Format Document list into prompt-ready text")
    pdf.code(
        "def format_docs(docs: list[Document]) -> str:\n"
        "    if not docs:\n"
        '        return "(No relevant context retrieved.)"\n'
        "\n"
        "    parts: list[str] = []\n"
        "    for i, doc in enumerate(docs, start=1):\n"
        '        name = doc.metadata.get("filename") or Path(\n'
        '            doc.metadata.get("source", "unknown")\n'
        "        ).name\n"
        '        page = doc.metadata.get("page")\n'
        '        page_note = f", page {page}" if page is not None else ""\n'
        '        parts.append(f"[{i}] ({name}{page_note})\\n{doc.page_content.strip()}")\n'
        '    return "\\n\\n".join(parts)'
    )
    pdf.bullet("Empty list => explicit placeholder so the model sees 'no context' clearly")
    pdf.bullet("filename fallback to Path(source).name -- works even if filename meta missing")
    pdf.bullet("Numbered [1], [2] blocks -- easier for the model (and you) to cite")
    pdf.reason(
        "The LLM never sees raw Document objects. format_docs is the bridge from retrieval "
        "objects to the {context} string slot in prompts.py."
    )

    pdf.step(5, "Log chunks for debugging, then pass through")
    pdf.code(
        "def log_retrieved_chunks(docs: list[Document]) -> list[Document]:\n"
        '    """Log retrieved chunks for debugging, then pass them through."""\n'
        "    ...\n"
        "    return docs  # IMPORTANT: same list continues down the pipe"
    )
    pdf.body(
        "Side-effect function: prints previews at DEBUG level when you run app.py -v. "
        "It MUST return docs unchanged so the next stage still receives the list."
    )
    pdf.reason(
        "When answers look wrong, the bug is often retrieval (wrong chunks), not the LLM. "
        "Logging chunks first saves hours."
    )

    pdf.step(6, "Build the LCEL chain")
    pdf.code(
        "def build_rag_chain(\n"
        "    *,\n"
        "    k: int = TOP_K,\n"
        "    model: str = CHAT_MODEL,\n"
        "    temperature: float = 0.0,\n"
        ") -> Runnable[Any, str]:\n"
        "    vectorstore = get_vectorstore()\n"
        '    retriever = vectorstore.as_retriever(search_kwargs={"k": k})\n'
        "    llm = ChatOllama(model=model, temperature=temperature)\n"
        "\n"
        "    return (\n"
        "        {\n"
        '            "context": (\n'
        "                retriever\n"
        "                | RunnableLambda(log_retrieved_chunks)\n"
        "                | RunnableLambda(format_docs)\n"
        "            ),\n"
        '            "question": RunnablePassthrough(),\n'
        "        }\n"
        "        | GROUNDED_PROMPT\n"
        "        | llm\n"
        "        | StrOutputParser()\n"
        "    )"
    )
    pdf.h3("Signature details")
    pdf.bullet("* -- forces k/model/temperature to be keyword-only (build_rag_chain(k=5))")
    pdf.bullet("temperature=0.0 -- more deterministic, less creative invention")
    pdf.bullet("Return type Runnable[Any, str] -- invoke with a question str, get answer str")
    pdf.h3("Dict branch meaning")
    pdf.bullet("Left side keys become prompt variables")
    pdf.bullet("retriever runs on the input question automatically")
    pdf.bullet("RunnablePassthrough copies the same input into 'question'")
    pdf.reason(
        "as_retriever(search_kwargs={'k': k}) turns Chroma into a LangChain Retriever "
        "with a stable .invoke(query) -> list[Document] interface."
    )

    pdf.step(7, "One-shot convenience wrapper")
    pdf.code(
        "def ask(question: str, *, k: int = TOP_K) -> str:\n"
        '    """Run one grounded Q&A turn."""\n'
        "    chain = build_rag_chain(k=k)\n"
        "    return chain.invoke(question)"
    )
    pdf.reason(
        "app.py and tests call ask() without caring about LCEL plumbing. "
        "Rebuilds the chain each call (simple; fine for a CLI demo)."
    )

    pdf.add_page()
    pdf.h1("3. Practice")
    pdf.bullet("Run ask('What is the cold chain rule?') after ingest")
    pdf.bullet("Set TOP_K=1 vs 8 and compare answer quality")
    pdf.bullet("Enable -v in app.py and read logged chunk previews")

    pdf.h1("4. Common failures")
    pdf.bullet("Empty/irrelevant answers -- chroma_db missing or wrong EMBED_MODEL")
    pdf.bullet("Ollama errors -- pull llama3.1:8b and nomic-embed-text")
    pdf.bullet("Hallucinations -- prompt rules too weak or temperature > 0")

    pdf.output(out)
    return out


def build_tools() -> Path:
    pdf = new_pdf("tools.py")
    out = DOCS / "tools-py-hardcode-tutorial.pdf"
    pdf.cover(
        "Hard-Coding tools.py in Python",
        "EOQ, safety stock, SKU lookup, and doc search -- each wrapped as a LangChain @tool.",
        "Project: logistics-rag-agent\nFile: tools.py\nRole: Give the agent real actions instead of guessing numbers",
    )
    pdf.body(
        "Tools are Python functions the LLM can call. Docstrings matter: the model reads them "
        "to decide WHEN to call each tool and WHICH arguments to pass."
    )

    pdf.add_page()
    pdf.h1("1. Big picture")
    pdf.bullet("eoq_calculator -- classic inventory math")
    pdf.bullet("safety_stock_estimator -- buffer stock under uncertainty")
    pdf.bullet("lookup_sample_inventory -- CSV (or hardcoded fallback) SKU table")
    pdf.bullet("search_logistics_docs -- RAG retrieval packaged as a tool")
    pdf.bullet("get_tools() -- list handed to agent.py")
    pdf.reason(
        "Calculators belong in tools, not in free-form LLM arithmetic. "
        "The model chooses the tool; Python does the math correctly."
    )

    pdf.h1("2. Build step by step")
    pdf.step(1, "Imports and inventory path")
    pdf.code(
        "from __future__ import annotations\n"
        "\n"
        "import csv\n"
        "import logging\n"
        "import math\n"
        "from pathlib import Path\n"
        "\n"
        "from langchain.tools import tool\n"
        "\n"
        'logger = logging.getLogger("logistics_rag")\n'
        "\n"
        'INVENTORY_CSV = Path(__file__).parent / "data" / "sample_inventory.csv"'
    )
    pdf.bullet("@tool decorator -- turns a function into a LangChain Tool (name, schema, description)")
    pdf.bullet("csv + Path -- read sample inventory without a database")
    pdf.reason(
        "The function docstring becomes the tool description the LLM sees. "
        "Write 'Use when...' guidance in the docstring on purpose."
    )

    pdf.step(2, "Hardcoded fallback inventory")
    pdf.code(
        "_SAMPLE_INVENTORY: dict[str, dict] = {\n"
        '    "SKU-1001": {"description": "...", "on_hand": 420, ...},\n'
        '    "SKU-1002": {...},\n'
        "}"
    )
    pdf.body(
        "Leading underscore means 'internal'. If the CSV is missing, demos still work."
    )
    pdf.reason(
        "Demo resilience: workshops and CI should not fail just because someone forgot the CSV."
    )

    pdf.step(3, "Load CSV into a dict keyed by SKU")
    pdf.code(
        "def _load_inventory() -> dict[str, dict]:\n"
        "    if not INVENTORY_CSV.exists():\n"
        "        return {k: dict(v) for k, v in _SAMPLE_INVENTORY.items()}\n"
        "\n"
        "    rows: dict[str, dict] = {}\n"
        '    with INVENTORY_CSV.open(newline="", encoding="utf-8") as f:\n'
        "        for row in csv.DictReader(f):\n"
        '            sku = row["sku"].strip().upper()\n'
        "            rows[sku] = {\n"
        '                "description": row["description"],\n'
        '                "on_hand": int(row["on_hand"]),\n'
        '                "reorder_point": int(row["reorder_point"]),\n'
        '                "lead_time_days": int(row["lead_time_days"]),\n'
        '                "unit_cost": float(row["unit_cost"]),\n'
        "            }\n"
        "    return rows"
    )
    pdf.bullet("newline='' -- required csv module contract on all platforms")
    pdf.bullet(".strip().upper() -- normalize SKU keys so 'sku-1001' still matches")
    pdf.bullet("int()/float() -- CSV cells are strings until you cast them")
    pdf.bullet("dict(v) copy on fallback -- avoid accidental mutation of the module constant")
    pdf.reason(
        "Casting at load time fails fast on bad CSV data instead of blowing up later inside a tool call."
    )

    pdf.add_page()
    pdf.step(4, "EOQ tool")
    pdf.code(
        "@tool\n"
        "def eoq_calculator(annual_demand: float, order_cost: float, holding_cost: float) -> dict:\n"
        '    """Calculate classic Economic Order Quantity (EOQ).\n'
        "    ...\n"
        "    Formula: EOQ = sqrt(2 * D * S / H)\n"
        '    """\n'
        "    if annual_demand <= 0 or order_cost <= 0 or holding_cost <= 0:\n"
        '        return {"error": "annual_demand, order_cost, and holding_cost must all be > 0"}\n'
        "\n"
        "    eoq = math.sqrt(2 * annual_demand * order_cost / holding_cost)\n"
        "    orders_per_year = annual_demand / eoq\n"
        "    return {\n"
        '        "eoq": round(eoq, 2),\n'
        '        "orders_per_year": round(orders_per_year, 2),\n'
        "        ...\n"
        '        "formula": "sqrt(2 * D * S / H)",\n'
        "    }"
    )
    pdf.bullet("@tool reads type hints to build an args schema for the LLM")
    pdf.bullet("Validate > 0 before sqrt -- avoids ZeroDivision / domain errors")
    pdf.bullet("Return dict (not just a float) -- richer context for the agent's final wording")
    pdf.bullet("Include formula string -- transparency for the user")
    pdf.reason(
        "Returning {'error': ...} instead of raising lets the agent narrate the problem "
        "instead of crashing the whole turn."
    )

    pdf.step(5, "Safety stock tool")
    pdf.code(
        "@tool\n"
        "def safety_stock_estimator(\n"
        "    demand_std: float,\n"
        "    lead_time: float,\n"
        "    z_score: float = 1.65,\n"
        ") -> dict:\n"
        "    ...\n"
        "    safety_stock = z_score * demand_std * math.sqrt(lead_time)"
    )
    pdf.bullet("Default z_score=1.65 -- common approx for ~95% cycle service level")
    pdf.bullet("demand_std and lead_time must use the SAME time unit (days with daily std, etc.)")
    pdf.reason(
        "Defaults in the signature teach the model a sensible value when the user omits z."
    )

    pdf.step(6, "SKU lookup tool")
    pdf.code(
        "@tool\n"
        "def lookup_sample_inventory(sku: str) -> dict:\n"
        "    inventory = _load_inventory()\n"
        "    key = sku.strip().upper()\n"
        "    if key not in inventory:\n"
        "        return {\"error\": ..., \"known_skus\": known}\n"
        "    record = {\"sku\": key, **inventory[key]}\n"
        '    record["below_reorder_point"] = record["on_hand"] < record["reorder_point"]\n'
        '    record["status"] = "REORDER" if below_rop else "OK"\n'
        "    return record"
    )
    pdf.bullet("On miss, return known_skus -- agent can tell the user what exists")
    pdf.bullet("Derived fields (below_reorder_point, status) -- business logic in Python, not LLM")
    pdf.reason(
        "Never ask the LLM to 'remember' inventory. Look it up. That is the whole point of tools."
    )

    pdf.add_page()
    pdf.step(7, "Doc search as a tool (lazy import)")
    pdf.code(
        "@tool\n"
        "def search_logistics_docs(query: str) -> str:\n"
        '    """Search ingested logistics SOPs..."""\n'
        "    from rag import TOP_K, format_docs, get_vectorstore, log_retrieved_chunks\n"
        "\n"
        '    retriever = get_vectorstore().as_retriever(search_kwargs={"k": TOP_K})\n'
        "    docs = log_retrieved_chunks(retriever.invoke(query))\n"
        "    return format_docs(docs)"
    )
    pdf.bullet("Import inside the function -- avoids circular imports (rag <-> tools) at module load")
    pdf.bullet("Returns formatted string -- same shape the grounded RAG path uses")
    pdf.bullet("Docstring tells the agent NOT to use this for EOQ/SKU math")
    pdf.reason(
        "Routing policy lives in tool descriptions + agent system prompt. "
        "Clear boundaries reduce wrong-tool calls."
    )

    pdf.step(8, "Export the tool list")
    pdf.code(
        "def get_tools() -> list:\n"
        '    """All tools available to the logistics agent."""\n'
        "    return [\n"
        "        eoq_calculator,\n"
        "        safety_stock_estimator,\n"
        "        lookup_sample_inventory,\n"
        "        search_logistics_docs,\n"
        "    ]"
    )
    pdf.reason(
        "One factory function means agent.py does not hardcode imports of each tool. "
        "Add a tool here and the agent picks it up."
    )

    pdf.h1("3. Practice")
    pdf.bullet("Call eoq_calculator.invoke({'annual_demand': 1000, 'order_cost': 50, 'holding_cost': 2})")
    pdf.bullet("Lookup SKU-1002 -- confirm status REORDER")
    pdf.bullet("Ask the agent an EOQ question and verify -v shows a tool call, not pure guessing")

    pdf.h1("4. Common failures")
    pdf.bullet("LLM ignores tool -- weak docstring / system prompt; tighten 'Use when...' text")
    pdf.bullet("CSV parse error -- check header names match row['sku'] etc.")
    pdf.bullet("Circular import -- keep rag import inside search_logistics_docs")

    pdf.output(out)
    return out


def build_agent() -> Path:
    pdf = new_pdf("agent.py")
    out = DOCS / "agent-py-hardcode-tutorial.pdf"
    pdf.cover(
        "Hard-Coding agent.py in Python",
        "A tool-calling agent that routes between calculators, inventory, and document search.",
        "Project: logistics-rag-agent\nFile: agent.py\nRole: LLM decides which tool; Python executes it",
    )
    pdf.body(
        "Unlike rag.py (always retrieve docs), the agent chooses: math tool, SKU lookup, "
        "or search_logistics_docs -- then answers from tool results."
    )

    pdf.add_page()
    pdf.h1("1. Big picture")
    pdf.code(
        "user question\n"
        "   |\n"
        "   v\n"
        "create_agent(llm, tools, system_prompt)\n"
        "   |\n"
        "   +-- maybe tool_calls (EOQ / safety / SKU / docs)\n"
        "   |         |\n"
        "   |         v\n"
        "   |    ToolMessage results\n"
        "   |\n"
        "   v\n"
        "final AIMessage content (no tool_calls) -> return as answer"
    )
    pdf.reason(
        "Agent = policy (system prompt) + tools + chat model loop. "
        "Your job is to constrain the policy and extract the final text cleanly."
    )

    pdf.h1("2. Build step by step")
    pdf.step(1, "Imports")
    pdf.code(
        "from langchain.agents import create_agent\n"
        "from langchain_core.messages import AIMessage, BaseMessage\n"
        "from langchain_ollama import ChatOllama\n"
        "\n"
        "from rag import CHAT_MODEL\n"
        "from tools import get_tools"
    )
    pdf.bullet("create_agent -- modern LangChain helper that builds a tool-calling graph")
    pdf.bullet("CHAT_MODEL imported from rag -- one place to change the default model name")
    pdf.reason(
        "Sharing CHAT_MODEL avoids agent answering with llama-X while rag uses llama-Y by accident."
    )

    pdf.step(2, "Hard-code the agent system prompt")
    pdf.code(
        'AGENT_SYSTEM_PROMPT = """You are a logistics operations agent.\n'
        "\n"
        "Decide which tool to use:\n"
        "- eoq_calculator -- ...\n"
        "- safety_stock_estimator -- ...\n"
        "- lookup_sample_inventory -- ...\n"
        "- search_logistics_docs -- ...\n"
        "\n"
        "Rules:\n"
        "- Prefer tools for calculations and SKU lookups; do not invent numbers.\n"
        "- For document/policy questions, call search_logistics_docs and answer ONLY from that context.\n"
        "- If document context is insufficient, say exactly: I don't know\n"
        "- ...\n"
        '"""'
    )
    pdf.bullet("Lists tools by name -- reinforces routing beyond tool docstrings alone")
    pdf.bullet("Mirrors grounded 'I don't know' policy for doc questions")
    pdf.reason(
        "System prompt is the agent's constitution. Duplicate key rules here even if tools "
        "already document themselves -- models need redundant reminders under tool pressure."
    )

    pdf.step(3, "build_agent factory")
    pdf.code(
        "def build_agent(* , model: str = CHAT_MODEL, temperature: float = 0.0):\n"
        "    llm = ChatOllama(model=model, temperature=temperature)\n"
        "    tools = get_tools()\n"
        "    return create_agent(\n"
        "        llm,\n"
        "        tools=tools,\n"
        "        system_prompt=AGENT_SYSTEM_PROMPT,\n"
        "    )"
    )
    pdf.bullet("temperature=0 -- more reliable tool choice and less creative math")
    pdf.bullet("get_tools() at build time -- fresh list of decorated tool objects")
    pdf.reason(
        "Factory pattern: tests can build_agent(model='tiny') without editing globals."
    )

    pdf.add_page()
    pdf.step(4, "Extract the final assistant text")
    pdf.code(
        "def _final_text(messages: list[BaseMessage]) -> str:\n"
        "    for msg in reversed(messages):\n"
        "        if isinstance(msg, AIMessage) and msg.content and not msg.tool_calls:\n"
        "            if isinstance(msg.content, str):\n"
        "                return msg.content\n"
        "            return str(msg.content)\n"
        '    return ""'
    )
    pdf.bullet("Walk reversed -- the last complete assistant message is usually the answer")
    pdf.bullet("Skip AIMessages that still have tool_calls -- those are mid-plan, not final")
    pdf.bullet("Handle non-str content via str(...) -- some models return structured content blocks")
    pdf.reason(
        "agent.invoke returns a full message transcript, not a single string. "
        "Without _final_text, app.py would print an ugly dict."
    )

    pdf.step(5, "ask_agent: one turn")
    pdf.code(
        "def ask_agent(question: str, *, model: str = CHAT_MODEL) -> str:\n"
        "    agent = build_agent(model=model)\n"
        '    logger.debug("agent question: %s", question)\n'
        "    result = agent.invoke(\n"
        '        {"messages": [{"role": "user", "content": question}]}\n'
        "    )\n"
        '    messages = result.get("messages", [])\n'
        "    # debug-log tool calls and ToolMessage previews...\n"
        "    return _final_text(messages)"
    )
    pdf.bullet("Input format -- LangChain agent graph expects a messages list")
    pdf.bullet("Debug loop -- with -v you see which tool fired and a short result preview")
    pdf.bullet("Rebuild agent each call -- simple CLI; production might cache the graph")
    pdf.reason(
        "Logging tool calls is how you prove the agent used EOQ instead of inventing 183.7."
    )

    pdf.h1("3. Practice")
    pdf.bullet("Ask: 'EOQ for D=12000, S=100, H=2' -- expect eoq_calculator")
    pdf.bullet("Ask: 'Is SKU-1002 below reorder?' -- expect lookup_sample_inventory")
    pdf.bullet("Ask a policy question from your PDFs -- expect search_logistics_docs")
    pdf.bullet("Ask something absent from docs -- expect 'I don't know'")

    pdf.h1("4. Common failures")
    pdf.bullet("Empty answer -- _final_text found no final AIMessage; inspect result['messages']")
    pdf.bullet("Wrong tool -- strengthen AGENT_SYSTEM_PROMPT and tool docstrings")
    pdf.bullet("create_agent import errors -- LangChain version mismatch; check installed package docs")

    pdf.output(out)
    return out


def build_app() -> Path:
    pdf = new_pdf("app.py")
    out = DOCS / "app-py-hardcode-tutorial.pdf"
    pdf.cover(
        "Hard-Coding app.py in Python",
        "The CLI entrypoint: argparse, logging, one-shot questions, and a REPL loop.",
        "Project: logistics-rag-agent\nFile: app.py\nRole: Human interface over agent.py and rag.py",
    )
    pdf.body(
        "app.py does not implement RAG or tools. It parses flags, configures logs, "
        "and calls ask_agent or ask_rag."
    )

    pdf.add_page()
    pdf.h1("1. Big picture")
    pdf.code(
        "python app.py \"What is EOQ for ...?\"\n"
        "python app.py --rag-only -k 6 \"Cold chain rule?\"\n"
        "python app.py -v\n"
        "   then type questions at Q> until empty line / Ctrl-D"
    )
    pdf.reason(
        "Separating CLI from library code (agent/rag/tools) keeps business logic importable "
        "without starting argparse."
    )

    pdf.h1("2. Build step by step")
    pdf.step(1, "Imports")
    pdf.code(
        "from __future__ import annotations\n"
        "\n"
        "import argparse\n"
        "import logging\n"
        "import sys\n"
        "\n"
        "from agent import ask_agent\n"
        "from rag import TOP_K, ask as ask_rag"
    )
    pdf.bullet("ask as ask_rag -- rename so it does not clash with a local name 'ask'")
    pdf.bullet("TOP_K -- reuse default for --rag-only -k help text and default value")
    pdf.reason(
        "Importing callables (ask_agent, ask_rag) keeps app.py thin: no Chroma setup here."
    )

    pdf.step(2, "configure_logging")
    pdf.code(
        "def configure_logging(verbose: bool) -> None:\n"
        "    level = logging.DEBUG if verbose else logging.INFO\n"
        "    logging.basicConfig(\n"
        "        level=level,\n"
        '        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",\n'
        '        datefmt="%H:%M:%S",\n'
        "    )\n"
        '    logging.getLogger("logistics_rag").setLevel(\n'
        "        logging.DEBUG if verbose else logging.INFO\n"
        "    )"
    )
    pdf.bullet("basicConfig -- root logging setup once at process start")
    pdf.bullet("Explicit logistics_rag level -- ensures -v shows rag/tools/agent debug lines")
    pdf.reason(
        "Libraries log to 'logistics_rag'. Turning only root to INFO may still hide DEBUG "
        "unless that named logger is raised too -- hence the second setLevel."
    )

    pdf.step(3, "main(argv) signature")
    pdf.code(
        "def main(argv: list[str] | None = None) -> int:\n"
        "    parser = argparse.ArgumentParser(...)\n"
        "    ..."
    )
    pdf.bullet("argv=None -- production uses sys.argv; tests pass a fake list")
    pdf.bullet("-> int -- process exit code (0 success)")
    pdf.reason(
        "Testable CLI: main(['--rag-only', 'hello']) without subprocess."
    )

    pdf.add_page()
    pdf.step(4, "Define CLI arguments")
    pdf.code(
        'parser.add_argument("question", nargs="?", help="... or omit for REPL")\n'
        'parser.add_argument("--rag-only", action="store_true", help="...")\n'
        'parser.add_argument("-k", type=int, default=TOP_K, help="...")\n'
        'parser.add_argument("-v", "--verbose", action="store_true", help="...")\n'
        "args = parser.parse_args(argv)"
    )
    pdf.bullet("nargs='?' -- positional question is optional")
    pdf.bullet("action='store_true' -- flag present => True, else False")
    pdf.bullet("parse_args(argv) -- when argv is None, reads real command line")
    pdf.reason(
        "--rag-only is a teaching/debug switch: bypass tool routing and force pure grounded RAG."
    )

    pdf.step(5, "Choose answer backend")
    pdf.code(
        "    configure_logging(args.verbose)\n"
        "\n"
        "    def answer(question: str) -> str:\n"
        "        if args.rag_only:\n"
        "            return ask_rag(question, k=args.k)\n"
        "        return ask_agent(question)"
    )
    pdf.body(
        "Nested function closes over args. One place for one-shot and REPL to call."
    )
    pdf.reason(
        "Closure beats repeating if args.rag_only in two places (DRY, fewer bugs)."
    )

    pdf.step(6, "One-shot mode")
    pdf.code(
        "    if args.question:\n"
        "        print(answer(args.question))\n"
        "        return 0"
    )
    pdf.reason(
        "Scripts and demos prefer: python app.py 'question' && echo success. "
        "Exit 0 signals OK to shells."
    )

    pdf.step(7, "REPL mode")
    pdf.code(
        '    print(f"Logistics RAG [{mode}] -- empty line or Ctrl-D to quit...")\n'
        "    while True:\n"
        "        try:\n"
        '            question = input("\\nQ> ").strip()\n'
        "        except (EOFError, KeyboardInterrupt):\n"
        "            print()\n"
        "            break\n"
        "        if not question:\n"
        "            break\n"
        '        print(f"A> {answer(question)}")\n'
        "    return 0"
    )
    pdf.bullet("EOFError -- Ctrl-D (Unix) / Ctrl-Z Enter (Windows)")
    pdf.bullet("KeyboardInterrupt -- Ctrl-C; still exit cleanly with code 0")
    pdf.bullet("Empty string after strip -- polite quit without error")
    pdf.reason(
        "Catching both EOF and KeyboardInterrupt avoids ugly stack traces when a human exits."
    )

    pdf.step(8, "Script entrypoint")
    pdf.code(
        'if __name__ == "__main__":\n'
        "    sys.exit(main())"
    )
    pdf.bullet("sys.exit(main()) -- forward the int return as the process status")
    pdf.reason(
        "Using raise SystemExit(main()) is equivalent; sys.exit is the common CLI style."
    )

    pdf.add_page()
    pdf.h1("3. Full mental model of the repo")
    pdf.code(
        "ingest.py  -> build chroma_db from PDFs\n"
        "prompts.py -> grounded prompt text\n"
        "rag.py     -> retrieve + prompt + chat (no tools)\n"
        "tools.py   -> EOQ / safety / SKU / doc-search tools\n"
        "agent.py   -> LLM picks tools, returns final text\n"
        "app.py     -> CLI over agent (default) or rag (--rag-only)"
    )

    pdf.h1("4. Practice")
    pdf.bullet("python app.py -v \"EOQ with demand 5000 order cost 40 holding 1.5\"")
    pdf.bullet("python app.py --rag-only \"Summarize the SOP step for returns\"")
    pdf.bullet("python app.py  # then ask two questions interactively")

    pdf.h1("5. Common failures")
    pdf.bullet("ModuleNotFoundError -- run from project root with rag-env activated")
    pdf.bullet("No debug logs -- forgot -v")
    pdf.bullet("Agent vs RAG confusion -- check whether --rag-only is set")

    pdf.output(out)
    return out


def main() -> None:
    paths = [
        build_prompts(),
        build_rag(),
        build_tools(),
        build_agent(),
        build_app(),
    ]
    for p in paths:
        print(f"Wrote {p}")


if __name__ == "__main__":
    main()
