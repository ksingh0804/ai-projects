#!/usr/bin/env python3
"""Generate a step-by-step PDF tutorial for ingest.py."""

from pathlib import Path

from fpdf import FPDF

OUT = Path(__file__).parent / "ingest-py-hardcode-tutorial.pdf"


def ascii(text: str) -> str:
    return (
        text.replace("\u2192", "->")
        .replace("\u2014", "--")
        .replace("\u2013", "-")
        .replace("\u2018", "'")
        .replace("\u2019", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u2022", "-")
        .encode("latin-1", "replace")
        .decode("latin-1")
    )


class TutorialPDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(90, 90, 90)
        self.cell(0, 8, "ingest.py Hard-Code Tutorial  |  logistics-rag-agent", align="L")
        self.ln(4)
        self.set_draw_color(180, 180, 180)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(6)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def h1(self, text: str):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(20, 40, 70)
        self.multi_cell(0, 10, ascii(text), new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def h2(self, text: str):
        self.ln(3)
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(30, 70, 110)
        self.multi_cell(0, 8, ascii(text), new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def h3(self, text: str):
        self.ln(2)
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(40, 90, 60)
        self.multi_cell(0, 7, ascii(text), new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body(self, text: str):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 5.5, ascii(text), new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def bullet(self, text: str):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 5.5, ascii(f"- {text}"), new_x="LMARGIN", new_y="NEXT")
        self.ln(0.5)

    def reason(self, text: str):
        self.set_x(self.l_margin)
        self.set_fill_color(240, 248, 255)
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(40, 80, 120)
        self.cell(0, 6, "WHY", fill=True, new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 9)
        self.set_text_color(40, 40, 40)
        self.set_x(self.l_margin)
        self.multi_cell(0, 5, ascii(text), fill=True, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def code(self, text: str):
        self.set_x(self.l_margin)
        self.set_font("Courier", "", 8)
        self.set_fill_color(245, 245, 245)
        self.set_text_color(20, 20, 20)
        for line in text.splitlines() or [""]:
            self.set_x(self.l_margin)
            safe = ascii(line.replace("\t", "    "))
            if len(safe) > 95:
                while safe:
                    chunk, safe = safe[:95], safe[95:]
                    self.set_x(self.l_margin)
                    self.multi_cell(0, 4.2, chunk, fill=True, new_x="LMARGIN", new_y="NEXT")
            else:
                self.multi_cell(
                    0, 4.2, safe if safe else " ", fill=True, new_x="LMARGIN", new_y="NEXT"
                )
        self.ln(2)

    def step(self, num: int, title: str):
        self.ln(2)
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(120, 50, 20)
        self.multi_cell(0, 7, ascii(f"Step {num}: {title}"), new_x="LMARGIN", new_y="NEXT")
        self.ln(1)


def build() -> Path:
    pdf = TutorialPDF(format="A4")
    pdf.alias_nb_pages()
    pdf.set_margins(14, 14, 14)
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()

    # --- Cover ---
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(20, 40, 70)
    pdf.ln(20)
    pdf.multi_cell(0, 12, "Hard-Coding ingest.py in Python", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 13)
    pdf.set_text_color(60, 60, 60)
    pdf.multi_cell(
        0,
        7,
        ascii(
            "A line-by-line tutorial: what every part does, why it exists, "
            "and how to write it yourself from scratch."
        ),
        new_x="LMARGIN",
        new_y="NEXT",
    )
    pdf.ln(4)
    pdf.set_font("Helvetica", "I", 10)
    pdf.multi_cell(
        0,
        6,
        ascii(
            "Project: logistics-rag-agent\n"
            "File: ingest.py\n"
            "Pipeline: PDF files -> text chunks -> embeddings -> Chroma vector DB"
        ),
        new_x="LMARGIN",
        new_y="NEXT",
    )
    pdf.ln(6)
    pdf.body(
        "This tutorial teaches you to rebuild ingest.py by hand. "
        "You will not just copy-paste: you will understand imports, paths, "
        "idempotent skip logic, chunking, embeddings, and persistence."
    )

    # --- Big picture ---
    pdf.add_page()
    pdf.h1("1. Big picture: what ingest.py is for")
    pdf.body(
        "A RAG (Retrieval-Augmented Generation) app answers questions using YOUR documents. "
        "Before the chat agent can search those documents, you must load them into a searchable "
        "index. That one-time (and re-runnable) job is called ingestion."
    )
    pdf.h3("The four stages")
    pdf.bullet("LOAD: read PDF bytes and turn each page into text + metadata")
    pdf.bullet("SPLIT: cut long pages into overlapping chunks (better search units)")
    pdf.bullet("EMBED: turn each chunk into a vector of numbers (semantic meaning)")
    pdf.bullet("STORE: save vectors + text + metadata into Chroma on disk")
    pdf.reason(
        "Search later compares the question's embedding to stored chunk embeddings. "
        "If you skip ingest, the agent has nothing to retrieve."
    )
    pdf.h3("What 'hard code' means here")
    pdf.body(
        "Hard-coding means writing the script yourself with explicit constants and clear "
        "steps — not hiding the flow inside a magic framework CLI. Your values "
        "(folder paths, model name, chunk size) are written in the file so you can see "
        "and change them."
    )

    # --- Prerequisites ---
    pdf.h1("2. Prerequisites before you type code")
    pdf.bullet("Python 3.10+ and a virtualenv (this project uses rag-env/)")
    pdf.bullet("Ollama running locally with model: nomic-embed-text")
    pdf.bullet("Packages: langchain-chroma, langchain-community, langchain-ollama, langchain-text-splitters, pypdf")
    pdf.bullet("A data/ folder next to ingest.py containing one or more .pdf files")
    pdf.reason(
        "OllamaEmbeddings talks to a local Ollama server. If Ollama is not running "
        "or the embed model is missing, add_documents will fail when embeddings are computed."
    )
    pdf.code(
        "ollama pull nomic-embed-text\n"
        "pip install langchain-chroma langchain-community langchain-ollama \\\n"
        "            langchain-text-splitters pypdf"
    )

    # --- Step by step build ---
    pdf.add_page()
    pdf.h1("3. Build the file step by step")

    pdf.step(1, "Create the file and write the docstring")
    pdf.code(
        '"""Ingest PDFs from data/ into Chroma. Safe to re-run — skips already-stored files."""'
    )
    pdf.body(
        "A module docstring is the first string in the file. It documents purpose for humans "
        "and for tools (help, IDEs). The important promise here: safe to re-run."
    )
    pdf.reason(
        "Ingestion is expensive (CPU + time). Re-running should not duplicate every PDF. "
        "The docstring states that contract so future-you does not 'fix' it by always wiping the DB."
    )

    pdf.step(2, "Import only what you need")
    pdf.code(
        "from pathlib import Path\n"
        "\n"
        "from langchain_chroma import Chroma\n"
        "from langchain_community.document_loaders import PyPDFLoader\n"
        "from langchain_ollama import OllamaEmbeddings\n"
        "from langchain_text_splitters import RecursiveCharacterTextSplitter"
    )
    pdf.h3("What each import is")
    pdf.bullet("Path: modern filesystem paths (join folders, glob PDFs, resolve absolute paths)")
    pdf.bullet("Chroma: LangChain wrapper around the Chroma vector database")
    pdf.bullet("PyPDFLoader: reads a PDF into a list of Document objects (one per page)")
    pdf.bullet("OllamaEmbeddings: calls your local Ollama model to embed text")
    pdf.bullet("RecursiveCharacterTextSplitter: splits text on natural boundaries (paragraphs, sentences, words)")
    pdf.reason(
        "We import from package-specific modules (langchain_chroma, langchain_ollama) "
        "instead of old catch-all community paths when possible — clearer dependencies, fewer deprecation warnings."
    )

    pdf.step(3, "Hard-code configuration as named constants")
    pdf.code(
        'DATA_DIR = Path(__file__).parent / "data"\n'
        'CHROMA_DIR = Path(__file__).parent / "chroma_db"\n'
        'COLLECTION = "logistics_docs"\n'
        'EMBED_MODEL = "nomic-embed-text"\n'
        "\n"
        "CHUNK_SIZE = 680\n"
        "CHUNK_OVERLAP = 100"
    )
    pdf.h3("Line-by-line meaning")
    pdf.bullet(
        "Path(__file__).parent — directory containing ingest.py, no matter where you run the command from"
    )
    pdf.bullet('DATA_DIR — where source PDFs live (project/data/)')
    pdf.bullet('CHROMA_DIR — where Chroma writes its on-disk database (project/chroma_db/)')
    pdf.bullet('COLLECTION — named bucket inside Chroma; like a table name for vectors')
    pdf.bullet('EMBED_MODEL — must match what query/RAG code uses later or search breaks')
    pdf.bullet("CHUNK_SIZE = 680 — aim for ~680 characters per chunk (not words)")
    pdf.bullet("CHUNK_OVERLAP = 100 — last 100 chars of a chunk repeat at the start of the next")
    pdf.reason(
        "Constants at the top are the 'control panel'. Change chunk size here once instead of hunting through functions. "
        "Using Path(__file__).parent keeps paths stable when you run: python ingest.py from another cwd."
    )
    pdf.reason(
        "Overlap exists so a sentence split across a boundary still appears fully in at least one chunk. "
        "Without overlap, retrieval can miss answers that straddled the cut."
    )

    pdf.add_page()
    pdf.step(4, "Open (or create) the vector store")
    pdf.code(
        "def get_vectorstore() -> Chroma:\n"
        "    return Chroma(\n"
        "        persist_directory=str(CHROMA_DIR),\n"
        "        embedding_function=OllamaEmbeddings(model=EMBED_MODEL),\n"
        "        collection_name=COLLECTION,\n"
        "    )"
    )
    pdf.body(
        "This function does not ingest anything. It returns a live Chroma client pointed at your folder. "
        "If chroma_db/ does not exist yet, Chroma creates it when you add documents."
    )
    pdf.h3("Keyword arguments (library-fixed names)")
    pdf.bullet("persist_directory — string path on disk; str(...) because Chroma expects str, not Path")
    pdf.bullet("embedding_function — object that turns text into vectors; must stay consistent")
    pdf.bullet("collection_name — which collection inside that directory to use")
    pdf.reason(
        "You do not invent parameter names like persist_directory. Those are defined by LangChain's Chroma.__init__. "
        "You only choose the VALUES (your path, your model, your collection string)."
    )
    pdf.reason(
        "Wrapping this in get_vectorstore() lets ingest.py and rag.py share the same open logic. "
        "One place to fix if the API changes."
    )

    pdf.step(5, "Discover which PDFs are already stored")
    pdf.code(
        "def already_ingested_sources(vectorstore: Chroma) -> set[str]:\n"
        '    """Absolute source paths already present in Chroma."""\n'
        '    data = vectorstore.get(include=["metadatas"])\n'
        "    return {\n"
        '        meta["source"]\n'
        '        for meta in (data.get("metadatas") or [])\n'
        '        if meta and meta.get("source")\n'
        "    }"
    )
    pdf.h3("What .get() returns (shape)")
    pdf.code(
        "{\n"
        '  "ids": ["id1", "id2", ...],\n'
        '  "metadatas": [\n'
        '    {"source": "/abs/path/a.pdf", "filename": "a.pdf", "page": 0},\n'
        '    {"source": "/abs/path/a.pdf", "filename": "a.pdf", "page": 1},\n'
        "    ...\n"
        "  ]\n"
        "}"
    )
    pdf.body(
        "include=['metadatas'] asks Chroma for metadata only — not the full text or embeddings. "
        "That is cheaper when you only need to know which files exist."
    )
    pdf.h3("The set comprehension, piece by piece")
    pdf.bullet('data.get("metadatas") or [] — if metadatas is missing/None, use empty list (no crash)')
    pdf.bullet("for meta in ... — each chunk has its own metadata dict")
    pdf.bullet("if meta and meta.get('source') — skip empty/None dicts and dicts without source")
    pdf.bullet('meta["source"] — the path string we stored at ingest time')
    pdf.bullet("outer { ... } — a Python set: unique paths only (one PDF → many chunks → one path)")
    pdf.reason(
        "Idempotency: before embedding a PDF again, check if its source path is already in the DB. "
        "A set makes membership tests (path in known) O(1) and automatic de-duplication."
    )

    pdf.add_page()
    pdf.step(6, "Write main(): find PDFs")
    pdf.code(
        "def main() -> None:\n"
        '    pdf_paths = sorted(DATA_DIR.glob("**/*.pdf"))\n'
        "    if not pdf_paths:\n"
        '        print(f"No PDFs found in {DATA_DIR}")\n'
        "        return\n"
        "\n"
        '    print(f"Found {len(pdf_paths)} PDF(s) in {DATA_DIR}")\n'
        "    for i, path in enumerate(pdf_paths, start=1):\n"
        '        print(f"  {i}. {path.name}")'
    )
    pdf.bullet('glob("**/*.pdf") — recursive search for every PDF under data/')
    pdf.bullet("sorted(...) — stable order so logs look the same each run")
    pdf.bullet("Early return if empty — fail loudly with a clear message instead of silently doing nothing useful")
    pdf.bullet("enumerate(..., start=1) — human-friendly numbering in the console")
    pdf.reason(
        "Printing the inventory first helps debugging: if a PDF is missing from the list, "
        "the problem is the folder/filename, not Chroma or Ollama."
    )

    pdf.step(7, "Filter to only NEW PDFs")
    pdf.code(
        "    vectorstore = get_vectorstore()\n"
        "    known = already_ingested_sources(vectorstore)\n"
        "\n"
        "    new_paths = [\n"
        "        p\n"
        "        for p in pdf_paths\n"
        "        if str(p.resolve()) not in known and str(p) not in known\n"
        "    ]\n"
        "\n"
        "    if not new_paths:\n"
        '        print("Nothing new to ingest — all PDFs already in Chroma.")\n'
        "        return"
    )
    pdf.body(
        "p.resolve() turns a relative path into an absolute path (symlink-aware). "
        "We check BOTH resolve() and str(p) because older runs might have stored either form."
    )
    pdf.reason(
        "Defensive matching avoids re-embedding the same file just because one run saved "
        "'data/a.pdf' and another saved '/Users/.../data/a.pdf'."
    )

    pdf.step(8, "Create the text splitter once")
    pdf.code(
        "    splitter = RecursiveCharacterTextSplitter(\n"
        "        chunk_size=CHUNK_SIZE,\n"
        "        chunk_overlap=CHUNK_OVERLAP,\n"
        "    )"
    )
    pdf.body(
        "RecursiveCharacterTextSplitter tries to split on a list of separators in order "
        "(paragraph breaks, newlines, spaces, then characters). That keeps chunks more readable "
        "than a naive every-N-characters cut."
    )
    pdf.reason(
        "Create the splitter once outside the PDF loop. The object is reusable; recreating it "
        "per file wastes nothing critical but is pointless noise."
    )

    pdf.add_page()
    pdf.step(9, "Load, normalize metadata, split, embed+store")
    pdf.code(
        "    total_chunks = 0\n"
        "    for path in new_paths:\n"
        "        pages = PyPDFLoader(str(path)).load()\n"
        "        # Normalize source so re-runs match reliably\n"
        "        for page in pages:\n"
        '            page.metadata["source"] = str(path.resolve())\n'
        '            page.metadata["filename"] = path.name\n'
        "\n"
        "        chunks = splitter.split_documents(pages)\n"
        "        if not chunks:\n"
        '            print(f"  skip (empty): {path.name}")\n'
        "            continue\n"
        "\n"
        "        vectorstore.add_documents(chunks)\n"
        "        total_chunks += len(chunks)\n"
        '        print(f"  + {path.name}: {len(pages)} pages -> {len(chunks)} chunks")\n'
        "\n"
        '    print(f"\\nDone. Added {total_chunks} chunks -> {CHROMA_DIR}")'
    )
    pdf.h3("Inside the loop — exact sequence")
    pdf.bullet("PyPDFLoader(str(path)).load() — open PDF; return List[Document], usually one Document per page")
    pdf.bullet("page.metadata['source'] = str(path.resolve()) — overwrite with absolute path (skip logic depends on this)")
    pdf.bullet("page.metadata['filename'] = path.name — short name for humans/debugging")
    pdf.bullet("splitter.split_documents(pages) — pages become smaller Document chunks; metadata is copied to each chunk")
    pdf.bullet("if not chunks: continue — empty/scanned-image PDFs with no extractable text should not call embed")
    pdf.bullet("vectorstore.add_documents(chunks) — embed each chunk via Ollama, then write to Chroma disk")
    pdf.bullet("print progress — ops-friendly visibility: pages → chunks per file")
    pdf.reason(
        "Metadata normalization BEFORE split is important: split_documents copies page metadata onto each chunk. "
        "If you set source after splitting, you must loop chunks instead — more code, same result. Do it once on pages."
    )
    pdf.reason(
        "add_documents is the heavy step. It calls the embedding model for every chunk, then persists. "
        "That is why skipping known sources matters."
    )

    pdf.step(10, "Make the file executable as a script")
    pdf.code(
        'if __name__ == "__main__":\n'
        "    main()"
    )
    pdf.body(
        "When you run python ingest.py, Python sets __name__ to '__main__' and this block runs. "
        "When another file does import ingest, main() does NOT auto-run — only functions are available."
    )
    pdf.reason(
        "This pattern lets you unit-test helpers (get_vectorstore, already_ingested_sources) "
        "without accidentally starting a full ingest on import."
    )

    # --- Full file ---
    pdf.add_page()
    pdf.h1("4. Full hard-coded file (reference)")
    pdf.body("After following the steps, your ingest.py should look like this:")
    pdf.code(
        '"""Ingest PDFs from data/ into Chroma. Safe to re-run — skips already-stored files."""\n'
        "\n"
        "from pathlib import Path\n"
        "\n"
        "from langchain_chroma import Chroma\n"
        "from langchain_community.document_loaders import PyPDFLoader\n"
        "from langchain_ollama import OllamaEmbeddings\n"
        "from langchain_text_splitters import RecursiveCharacterTextSplitter\n"
        "\n"
        'DATA_DIR = Path(__file__).parent / "data"\n'
        'CHROMA_DIR = Path(__file__).parent / "chroma_db"\n'
        'COLLECTION = "logistics_docs"\n'
        'EMBED_MODEL = "nomic-embed-text"\n'
        "\n"
        "CHUNK_SIZE = 680\n"
        "CHUNK_OVERLAP = 100\n"
        "\n"
        "\n"
        "def get_vectorstore() -> Chroma:\n"
        "    return Chroma(\n"
        "        persist_directory=str(CHROMA_DIR),\n"
        "        embedding_function=OllamaEmbeddings(model=EMBED_MODEL),\n"
        "        collection_name=COLLECTION,\n"
        "    )\n"
        "\n"
        "\n"
        "def already_ingested_sources(vectorstore: Chroma) -> set[str]:\n"
        '    """Absolute source paths already present in Chroma."""\n'
        '    data = vectorstore.get(include=["metadatas"])\n'
        "    return {\n"
        '        meta["source"]\n'
        '        for meta in (data.get("metadatas") or [])\n'
        '        if meta and meta.get("source")\n'
        "    }\n"
        "\n"
        "\n"
        "def main() -> None:\n"
        '    pdf_paths = sorted(DATA_DIR.glob("**/*.pdf"))\n'
        "    if not pdf_paths:\n"
        '        print(f"No PDFs found in {DATA_DIR}")\n'
        "        return\n"
        "\n"
        '    print(f"Found {len(pdf_paths)} PDF(s) in {DATA_DIR}")\n'
        "    for i, path in enumerate(pdf_paths, start=1):\n"
        '        print(f"  {i}. {path.name}")\n'
        "\n"
        "    vectorstore = get_vectorstore()\n"
        "    known = already_ingested_sources(vectorstore)\n"
        "\n"
        "    new_paths = [\n"
        "        p for p in pdf_paths\n"
        "        if str(p.resolve()) not in known and str(p) not in known\n"
        "    ]\n"
        "\n"
        "    if not new_paths:\n"
        '        print("Nothing new to ingest — all PDFs already in Chroma.")\n'
        "        return\n"
        "\n"
        '    print(f"\\nIngesting {len(new_paths)} new PDF(s); "\n'
        '          f"skipping {len(pdf_paths) - len(new_paths)} already stored.")\n'
        "\n"
        "    splitter = RecursiveCharacterTextSplitter(\n"
        "        chunk_size=CHUNK_SIZE,\n"
        "        chunk_overlap=CHUNK_OVERLAP,\n"
        "    )\n"
        "\n"
        "    total_chunks = 0\n"
        "    for path in new_paths:\n"
        "        pages = PyPDFLoader(str(path)).load()\n"
        "        for page in pages:\n"
        '            page.metadata["source"] = str(path.resolve())\n'
        '            page.metadata["filename"] = path.name\n'
        "\n"
        "        chunks = splitter.split_documents(pages)\n"
        "        if not chunks:\n"
        '            print(f"  skip (empty): {path.name}")\n'
        "            continue\n"
        "\n"
        "        vectorstore.add_documents(chunks)\n"
        "        total_chunks += len(chunks)\n"
        '        print(f"  + {path.name}: {len(pages)} pages -> {len(chunks)} chunks")\n'
        "\n"
        '    print(f"\\nDone. Added {total_chunks} chunks -> {CHROMA_DIR}")\n'
        "\n"
        "\n"
        'if __name__ == "__main__":\n'
        "    main()"
    )

    # --- Data flow ---
    pdf.add_page()
    pdf.h1("5. Data flow (mental model)")
    pdf.code(
        "data/*.pdf\n"
        "   |\n"
        "   |  PyPDFLoader.load()\n"
        "   v\n"
        "List[Document]          # one Document per page; .page_content + .metadata\n"
        "   |\n"
        "   |  metadata['source'] = absolute path\n"
        "   |  RecursiveCharacterTextSplitter.split_documents()\n"
        "   v\n"
        "List[Document]          # many smaller chunks; metadata copied\n"
        "   |\n"
        "   |  OllamaEmbeddings (nomic-embed-text)\n"
        "   |  Chroma.add_documents()\n"
        "   v\n"
        "chroma_db/              # vectors + text + metadata on disk\n"
        "   |\n"
        "   |  later: rag.py / agent similarity_search(question)\n"
        "   v\n"
        "Top-k relevant chunks for the LLM prompt"
    )
    pdf.reason(
        "Ingest writes the library. Query/RAG only reads it. Keep EMBED_MODEL, COLLECTION, "
        "and CHROMA_DIR identical on both sides or retrieval returns garbage/empty."
    )

    # --- Glossary ---
    pdf.h1("6. Glossary of every important term")
    pdf.bullet("Document — LangChain object with page_content (str) and metadata (dict)")
    pdf.bullet("Chunk — a Document piece after splitting; the unit you embed and retrieve")
    pdf.bullet("Embedding — list/vector of floats representing semantic meaning of text")
    pdf.bullet("Vector store — database specialized for nearest-neighbor search over embeddings")
    pdf.bullet("Collection — named group of vectors inside one Chroma persist directory")
    pdf.bullet("Metadata — side information (source path, filename, page number) stored with each chunk")
    pdf.bullet("Idempotent — running the same operation twice does not create duplicate work/data")
    pdf.bullet("Persist directory — folder where Chroma saves its database files")

    # --- Practice ---
    pdf.h1("7. Practice checklist (prove you understand)")
    pdf.bullet("Delete chroma_db/, run python ingest.py, confirm chunks are added")
    pdf.bullet("Run python ingest.py again — expect 'Nothing new to ingest'")
    pdf.bullet("Add a new PDF under data/, re-run — only the new file should embed")
    pdf.bullet("Temporarily change EMBED_MODEL in rag only — observe broken/empty search (then fix)")
    pdf.bullet("Change CHUNK_SIZE to 200, wipe DB, re-ingest — note more chunks, different retrieval")
    pdf.bullet("Print already_ingested_sources(get_vectorstore()) in a REPL and read the paths")

    pdf.h1("8. Common failure modes")
    pdf.bullet("No PDFs found — wrong DATA_DIR or empty data/; check Path(__file__).parent")
    pdf.bullet("Ollama connection error — start Ollama; pull nomic-embed-text")
    pdf.bullet("Always re-ingesting — source metadata not normalized to resolve(); skip check fails")
    pdf.bullet("Empty chunks — PDF is image-only; need OCR (out of scope for this script)")
    pdf.bullet("Import errors — activate rag-env and install the langchain packages listed above")

    pdf.ln(6)
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(20, 40, 70)
    pdf.multi_cell(
        0,
        7,
        "You are done when you can explain every line out loud without looking.",
        new_x="LMARGIN",
        new_y="NEXT",
    )
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(40, 40, 40)
    pdf.multi_cell(
        0,
        5.5,
        ascii(
            "If you can teach Steps 4-9 to someone else -- vectorstore, skip set, split, "
            "metadata, add_documents -- you truly hard-coded ingest.py, not just pasted it."
        ),
        new_x="LMARGIN",
        new_y="NEXT",
    )

    pdf.output(OUT)
    return OUT


if __name__ == "__main__":
    path = build()
    print(f"Wrote {path}")
