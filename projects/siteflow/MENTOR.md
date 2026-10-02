# SiteFlow mentor course

You are the junior engineer. This file is the class. Build one step, run its check, then go on. The goal is that you can explain every file out loud to an Autodesk-style interviewer.

Do not open `ANSWER_KEYS.md` on the first try. Read the contract, write the function, run the check. If the check fails, read the contract again and fix your own code. If it fails a second time, open only that step’s answer, type it in yourself, and say out loud what each line does.

Sample documents for a fictional job, the Harbor School Gym Addition, are already in `data/sample/`. Read them. You will be quoting them.

Formulas live in [FORMULAS.md](FORMULAS.md). Read that file before Step 3. You should be able to compute EOQ = 547.72 and safety stock = 99 with a calculator and no code.

---

## How you will explain this project

Memorize this paragraph. It is the first thing you say when they ask “walk me through SiteFlow.”

> SiteFlow is a project-controls assistant for one construction job. A project engineer uploads specs, an RFI, and a materials CSV. They ask a question in a React app. React talks only to a FastAPI backend. FastAPI runs a LangGraph supervisor that routes the question to one specialist: a spec agent that retrieves document chunks, a materials agent that runs EOQ, safety stock, or SKU lookup, or a risk agent that flags holds and weather delays. If the answer would change spend or the schedule, the graph pauses and the UI shows an Approve or Reject card. Files sit in a local folder or in S3. The model is Ollama locally, and the same chat function can call Bedrock later. I measure routing accuracy and whether the citation actually contains the fact.

If you can say that slowly, the rest of the course is you making each sentence true in code.

---

## The picture you draw on a whiteboard

Draw five boxes, left to right.

```
[React :5173]
    |  HTTPS JSON
    v
[FastAPI :8000]  ---->  [files: ./data or S3]
    |
    v
[LangGraph]
    supervisor
      |-- spec agent --> Chroma (chunks of the PDFs/txt)
      |-- materials agent --> EOQ / safety stock / SKU tools
      |-- risk agent --> same chunks + a few rules
      |-- human review --> pause until Approve / Reject
      '-- respond --> JSON back to React
```

Say this while you draw: “The browser never calls S3 and never calls LangGraph. FastAPI is the only door.”

One user question, every hop, in order:

1. The person types in the chat box.
2. `client.js` sends `POST /api/chat` with `project_id`, `thread_id`, and `message`.
3. Vite proxies `/api` to FastAPI on port 8000.
4. A Pydantic model rejects an empty message before any agent runs.
5. FastAPI calls the compiled graph with that `thread_id` as the memory key.
6. The supervisor writes `route` on the state: `spec`, `materials`, `risk`, or `chat`.
7. One specialist updates `sources`, `tool_result`, `recommendation`, and `needs_approval`.
8. If `needs_approval` is true and nobody has decided yet, the graph stops on the human-review node.
9. FastAPI returns JSON: answer, sources, agents used, needs approval, recommendation.
10. React renders the answer, the source chips, and the approval card.
11. Approve or Reject is a second request, `POST /api/approvals/{thread_id}`, which resumes the same thread.

That list is interview question 1. Practice it until you do not need notes.

---

## Python you need for this project

You do not need all of Python. You need these pieces. Type each one in a scratch file and run it.

A function takes inputs and returns one value.

```python
import math

def calculate_eoq(annual_demand: float, order_cost: float, holding_cost: float) -> dict:
    eoq = math.sqrt(2 * annual_demand * order_cost / holding_cost)
    return {"eoq": round(eoq, 2)}
```

`float` means a decimal number. `-> dict` means the function returns a dictionary. The hints are for you and for FastAPI. Python still runs if a caller passes the wrong type, so you also check values yourself.

A dictionary is a labeled box.

```python
row = {"sku": "SKU-REBAR", "on_hand": 40}
row["on_hand"]   # 40
```

A list is an ordered collection. `sources` is a list of dictionaries.

```python
sources = [{"title": "RFI-014", "page": 1, "snippet": "blocks the foundation pour"}]
```

`if` chooses a path.

```python
if on_hand < reorder_point:
    status = "REORDER"
else:
    status = "OK"
```

A class here is a form with named fields. Pydantic checks the form when a request arrives.

```python
from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    project_id: str
    thread_id: str
    message: str = Field(min_length=1)
```

You will write almost no classes of your own besides these request and response forms and one `TypedDict` for agent state. Routes are functions.

Read a CSV one row at a time:

```python
import csv
from pathlib import Path

with Path("materials.csv").open(newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        print(row["sku"], row["annual_demand"])
```

`DictReader` uses the first line as the keys. Our keys are `sku`, `description`, `on_hand`, `lead_days`, `unit_cost`, `annual_demand`, `reorder_point`.

---

## Where each fact lives

Interviewers ask what belongs in the graph, what belongs in a database, and what belongs in S3. Answer with this table.

| Fact | Where it lives | Why |
|------|----------------|-----|
| The PDF or CSV bytes | `./data` or S3 prefix `projects/{id}/docs/` | Files are large. S3 is the file cabinet. |
| Chunk text + embeddings | Chroma, with metadata `project_id` | Search needs vectors. Filter by project so two jobs never mix. |
| Chat memory, route, approval flag | LangGraph checkpoint (SQLite, later DynamoDB) keyed by `thread_id` | The graph must resume after the human clicks Approve. |
| The HTTP request and response | Nowhere permanent | They are the envelope, not the record. |

Two projects stay isolated because every upload path starts with `projects/{project_id}/` and every Chroma search filters `project_id`.

---

## Step 1 — Say the product before you code

**Interview sentence:** “SiteFlow serves three people on one job: the project engineer searching specs and RFIs, the superintendent checking material and field limits, and the estimator running EOQ and safety stock.”

Read the six files in `data/sample/`. Then close them and answer on paper:

1. How many days must concrete stay moist?
2. What bolt standard is required on primary steel?
3. What is the steel lead time after approved shop drawings?
4. Which RFI is open, and what does it block?
5. What is the on-hand quantity of `SKU-REBAR`?
6. What are gate hours?

**Check:** you can answer all six from memory. The answers are 7 days, ASTM A325, 14 to 16 weeks, RFI-014 blocks the foundation pour and the slab on grade, 40, and 07:00 to 15:30.

**Inside this step there is no function.** If you cannot answer these, the agent you build later will be a black box to you.

---

## Step 2 — Create the folders

From the repo root:

```bash
mkdir -p projects/siteflow/backend/app/api
mkdir -p projects/siteflow/backend/app/agents
mkdir -p projects/siteflow/backend/app/tools
mkdir -p projects/siteflow/backend/app/rag
mkdir -p projects/siteflow/backend/app/aws
mkdir -p projects/siteflow/backend/tests
mkdir -p projects/siteflow/frontend/src/api
mkdir -p projects/siteflow/frontend/src/components
mkdir -p projects/siteflow/infra
mkdir -p projects/siteflow/eval
touch projects/siteflow/backend/app/__init__.py
touch projects/siteflow/backend/app/api/__init__.py
touch projects/siteflow/backend/app/agents/__init__.py
touch projects/siteflow/backend/app/tools/__init__.py
touch projects/siteflow/backend/app/rag/__init__.py
touch projects/siteflow/backend/app/aws/__init__.py
touch projects/siteflow/backend/tests/__init__.py
```

Add `projects/siteflow/backend/requirements.txt` with these lines:

```
fastapi
uvicorn
pydantic
python-multipart
python-dotenv
sse-starlette
langchain
langchain-ollama
langchain-text-splitters
langchain-chroma
langgraph
langchain-community
chromadb
pypdf
boto3
pytest
httpx
```

Create the virtualenv and install:

```bash
cd projects/siteflow/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Add `projects/siteflow/backend/.gitignore` containing `.venv/` and `.env`.

**Check:** `python -c "import fastapi, langgraph, math"` prints nothing and exits 0.

**Interview sentence:** “I install the backend in its own virtualenv so SiteFlow’s packages do not fight Project 2’s packages.”

---

## Step 3 — The three math tools, and tests, before any AI

This is the live-coding drill. Do it with no LangChain decorator yet. Pure functions are easier to test and easier to explain.

File: `backend/app/tools/inventory.py`

### `calculate_eoq(annual_demand, order_cost, holding_cost) -> dict`

Inside, in order:

1. If any of the three numbers is less than or equal to 0, return `{"error": "annual_demand, order_cost, and holding_cost must all be > 0"}`.
2. Compute `eoq = math.sqrt(2 * annual_demand * order_cost / holding_cost)`.
3. Compute `orders_per_year = annual_demand / eoq`.
4. Return a dict with `eoq` and `orders_per_year` rounded to 2 decimals, plus the three inputs, plus `formula` set to `"sqrt(2 * D * S / H)"`.

### `safety_stock(demand_std, lead_time, z_score=1.65) -> dict`

Inside, in order:

1. If `demand_std < 0` or `lead_time < 0` or `z_score <= 0`, return an error dict that says so.
2. Compute `z_score * demand_std * math.sqrt(lead_time)`.
3. Return `safety_stock` rounded to 2 decimals, the inputs, and `formula` set to `"z * demand_std * sqrt(lead_time)"`.

### `lookup_sku(sku, csv_path) -> dict`

Inside, in order:

1. Open the CSV with `csv.DictReader`.
2. Build a dict keyed by `sku.strip().upper()`.
3. Convert `on_hand`, `lead_days`, and `reorder_point` with `int`. Convert `unit_cost` and `annual_demand` with `float`.
4. If the SKU is missing, return `{"error": "...", "known_skus": "..."}`.
5. If it exists, add `below_reorder_point` (true when `on_hand < reorder_point`) and `status` (`"REORDER"` or `"OK"`).

`csv_path` should default to the sample file. Do not count parents by hand. Walk upward until you find it:

Put this function in `backend/app/paths.py` and import it from the tools:

```python
def siteflow_root() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        candidate = parent / "data" / "sample" / "materials.csv"
        if candidate.exists():
            return parent
    raise FileNotFoundError("Could not find data/sample/materials.csv")
```

Default `csv_path` is `siteflow_root() / "data" / "sample" / "materials.csv"`.

File: `backend/tests/test_inventory.py`

Three tests:

1. `calculate_eoq(12000, 50, 4)["eoq"] == 547.72`
2. `safety_stock(20, 9, 1.65)["safety_stock"] == 99`
3. `lookup_sku("sku-rebar")["on_hand"] == 40` and `status == "REORDER"` because 40 is below 80.

Also test that `calculate_eoq(0, 50, 4)` returns a dict that contains the key `"error"`.

**Check:**

```bash
cd projects/siteflow/backend
source .venv/bin/activate
pytest tests/test_inventory.py -q
```

**Interview sentence:** “EOQ is the square root of two D S over H. I tested D=12000, S=50, H=4 and got 547.72. Ordering cost and holding cost both come out near 1095, which is the balance check. Safety stock is z times sigma times the square root of lead time. I reused these formulas from Project 2 under new function names, as plain functions the materials agent can call. I did not copy the Streamlit app.”

Project 2 called them `eoq_calculator`, `safety_stock_estimator`, and `lookup_sample_inventory`. Same math. New home.

---

## Step 4 — Know the sample job

You already have the files. Make a one-page cheat sheet in your own words with the six facts from Step 1, plus:

- Anchor bolts are “revise and resubmit”.
- Vapor barrier is submitted and tied to RFI-014.
- Concrete trucks use Gate 2. Steel uses Gate 1 and Laydown Zone B.
- Do not place concrete below 40 F or if rain is forecast within 4 hours.

**Check:** a friend could grade your agent using only your cheat sheet.

These files are `.txt` on purpose. The upload API will accept pdf, csv, and txt. A PDF with the same words is a later polish. `pypdf` reads PDFs; a `.txt` file is just its own text, so your ingest function should branch on the suffix.

---

## Step 5 — FastAPI health and CORS

File: `backend/app/main.py`

Create `app = FastAPI(title="SiteFlow")`.

Add CORS middleware. Allowed origin: `http://localhost:5173`. Allow all methods and headers for local dev.

Function `health()` on `GET /api/health`. Return `{"status": "ok", "mode": "local"}`. Read mode from the environment variable `SITEFLOW_MODE`, default `"local"`.

Add an exception handler for `Exception` that returns status 500 and `{"detail": "Something went wrong. Please try again."}`. The interviewer line is: “I never return a raw stack trace to the browser.”

Run:

```bash
uvicorn app.main:app --reload --port 8000
```

You must run that from `backend/` with the venv active, so `app.main` imports.

**Check:** `curl http://127.0.0.1:8000/api/health` prints the JSON.

File: `backend/tests/test_health.py` using `TestClient` from `fastapi.testclient` (or `httpx`). Assert status code 200 and `status == "ok"`.

**Interview sentence:** “The first route I ship is health. If health fails, I do not debug the agent.”

---

## Step 6 — Upload and list documents

File: `backend/app/api/docs.py`

Constants:

```python
ALLOWED = {".pdf", ".csv", ".txt"}
MAX_BYTES = 10 * 1024 * 1024
```

### `project_dir(project_id: str) -> Path`

Inside:

1. Reject an empty id or an id that contains `/`, `\\`, or `..`. Raise `HTTPException` 400.
2. Return `Path("data") / "projects" / project_id / "docs"` under the siteflow folder, and `mkdir(parents=True, exist_ok=True)`.

Use `siteflow_root()` from Step 3. Write uploads to `data/projects/{id}/docs/` under that root, not into `data/sample/`. Sample files stay clean.

### `save_upload(project_id: str, upload: UploadFile) -> dict`

Inside:

1. Suffix must be in `ALLOWED`, lowercase. Otherwise 400, detail like `"Only pdf, csv, and txt files are allowed"`.
2. Read the bytes. If length is 0, 400. If length is greater than `MAX_BYTES`, 400.
3. Write the bytes to `project_dir(project_id) / filename`.
4. Return `{"filename": ..., "bytes": ..., "project_id": ...}`.

### `list_documents(project_id: str) -> dict`

Return `{"project_id": ..., "documents": [{"filename": ..., "bytes": ...}, ...]}` sorted by filename.

Routes, included from `main.py` with prefix `/api`:

- `POST /api/projects/{project_id}/documents` — multipart form field name `file`.
- `GET /api/projects/{project_id}/documents`

**Check:** a pytest that uses `TestClient` to post `data/sample/division-03-concrete.txt` to project `demo`, then GET, and asserts the filename is in the list. Second test: posting a `.exe` returns 400.

**Interview sentence:** “The frontend uploads through FastAPI. I check type and a 10 MB cap before I write the file. Local mode writes to disk. AWS mode writes the same bytes to S3 under `projects/{id}/docs/`. The route shape does not change.”

---

## Step 7 — Ingest and retrieve

File: `backend/app/rag/ingest.py`

### `load_text_file(path: Path, project_id: str) -> list`

A LangChain `Document` has `page_content` and `metadata`. For a `.txt` file, one document is enough: the whole text, metadata `project_id`, `filename`, `page` = 1, `title` = the filename.

For a `.pdf`, use `pypdf.PdfReader`. One document per page. `page` is the page number starting at 1. Skip a page whose text is empty.

### `chunk_documents(documents) -> list`

Use `RecursiveCharacterTextSplitter(chunk_size=680, chunk_overlap=100)`. Copy metadata onto every chunk.

Why this splitter, in one breath: “Spec text is headings and short clauses. A recursive splitter breaks on paragraphs and then sentences, so a clause stays together. A semantic splitter needs another model call per break, and on a 6-page spec that cost does not buy me cleaner citations.”

### `ingest_project(project_id: str) -> int`

1. Load every pdf and txt in that project’s docs folder.
2. Chunk them.
3. Open a Chroma collection named `siteflow` with persist directory `backend/chroma_db`.
4. Before adding, delete existing chunks whose metadata `project_id` equals this project, so re-ingest does not duplicate.
5. Add the chunks. Return how many chunks you added.

Embeddings: `OllamaEmbeddings(model="nomic-embed-text")` when Ollama is running. If you cannot run Ollama yet, write the loader and the splitter first and test those with no Chroma. The splitter test does not need a model.

File: `backend/app/rag/retriever.py`

### `retrieve(project_id: str, query: str, k: int = 4) -> list[dict]`

1. Similarity search with filter `{"project_id": project_id}`.
2. Return at most `k` dicts: `title`, `page`, `snippet` (the first 400 characters of the chunk), `score` if the search gives one.
3. If the collection is empty or the project has no chunks, return `[]`. Do not raise.

**Check:** a unit test that chunks a known string and asserts more than one chunk when the string is longer than 680 characters, and asserts overlap by checking that the tail of chunk 1 appears in chunk 2. A second test can call `retrieve` only if Chroma and Ollama are up; skip it otherwise with `pytest.importorskip` or a clear `pytest.skip`.

**Interview sentence:** “I retrieve k=4 chunks filtered by project id. If the list is empty, the spec agent refuses. It does not answer from the model’s general knowledge of concrete.”

---

## Step 8 — Agent state

File: `backend/app/agents/state.py`

```python
class AgentState(TypedDict, total=False):
    messages: list
    user_text: str
    route: str
    sources: list
    tool_result: dict
    needs_approval: bool
    recommendation: str
    project_id: str
    agents_used: list
    approved: bool | None
```

`total=False` means a brand-new state may omit a field. You still fill every field in the chat route so the nodes never guess.

`user_text` is a copy of the latest user message as a plain string. Nodes read `state["user_text"]`. You will not have to unpack LangChain message objects.

What each field is for:

| Field | Who writes it | What it means |
|-------|----------------|---------------|
| `user_text` | API | The latest question as a plain string. Every node reads this. |
| `messages` | API, then the graph | The same question, kept so you can show the turn later |
| `route` | Supervisor | `spec`, `materials`, `risk`, or `chat` |
| `sources` | Spec or risk | Citations shown as chips |
| `tool_result` | Materials | The dict from EOQ, safety stock, or SKU lookup |
| `needs_approval` | Materials or risk | True when spend or schedule would change |
| `recommendation` | The specialist | The sentence the human approves |
| `project_id` | API | Which job’s files to search |
| `agents_used` | Each node appends its name | Shown in the UI |
| `approved` | The approval API | `None` until the human clicks; then true or false |

Start every chat with `user_text` set to the message, `needs_approval=False`, `sources=[]`, `tool_result={}`, `recommendation=""`, `approved=None`, `agents_used=[]`.

**Check:** a test that builds that dict and asserts `approved is None`.

**Interview sentence:** “State is the envelope for one turn. Files stay in S3. Vectors stay in Chroma. The checkpoint stores this envelope so Approve can resume the same thread.”

---

## Step 9 — Three specialists as plain functions

No graph yet. Each function takes `AgentState` and returns a new dict of the fields it changed. Test them with fake retrieval so you do not need a model.

### Spec agent — `run_spec(state, retrieve_fn=retrieve) -> dict`

`retrieve_fn` defaults to the real retriever. Tests pass a fake that returns a list you write by hand. That is how you test the agent without Ollama.

Inside:

1. Call `retrieve_fn(state["project_id"], state["user_text"], k=4)`.
2. Append `"spec"` to `agents_used`.
3. If `sources` is empty, set `recommendation` to `"I cannot find that in the project documents."`, `needs_approval` false.
4. If sources exist, set `recommendation` to a short answer that only uses words supported by the snippets. For v1 you may stitch the top snippet into two sentences and prefix it with the title. A real model call comes in Step 11 behind one function, `complete(system, user) -> str`. Keep the stitch so the demo works with the laptop offline.
5. `needs_approval` stays false. Citing a spec does not spend money.

The system rule you will later hand the model, word for word:

> Answer only from the snippets. Cite the title and page. If the snippets do not contain the fact, say you cannot find it in the project documents. Do not use outside construction knowledge.

### Materials agent — `run_materials(state) -> dict`

Inside:

1. Append `"materials"`.
2. Read the user text. This is a small parser, not an LLM.
   - If the text contains `"eoq"`: read numbers for D, S, and H. A simple way: look for `D=12000`, `S=50`, `H=4`, and also accept the words “demand”, “order cost”, “holding”. If S is missing, return an error in `tool_result` and a recommendation that asks for the order cost. Do not invent S.
   - If the text contains `"safety stock"`: read std, lead time, and optional z. Default z is 1.65.
   - If the text contains `"sku"` or a token like `SKU-REBAR`: call `lookup_sku`.
3. Put the tool dict in `tool_result`.
4. Write one paragraph in `recommendation` that includes the number and the formula name.
5. Set `needs_approval` true when you produced an EOQ or a safety-stock quantity. Those numbers tell someone how much to buy. A plain SKU lookup stays `needs_approval` false.

Parser hint: `re.findall(r"[-+]?\d*\.?\d+", text)` finds numbers, but the order is ambiguous. Prefer explicit labels. Teach the UI examples to use `D=12000 S=50 H=4`. Tell the interviewer: “v1 parses labeled numbers so the math is testable. The model is not allowed to do the arithmetic.”

### Risk agent — `run_risk(state) -> dict`

Inside:

1. Append `"risk"`.
2. Retrieve k=4 the same way.
3. Join the snippets into one lowercase string.
4. Apply these rules in order:
   - If the text has `"rfi-014"` or (`"open"` and `"rfi"`) and (`"block"` or `"hold"` or `"pour"`): `risk_level = "high"`, `blocked_activities = ["foundation pour", "slab on grade"]`, `needs_approval = true`.
   - Else if the text has `"below 40"` or `"rain"`: `risk_level = "medium"`, `blocked_activities = ["concrete pour"]`, `needs_approval = true`.
   - Else: `risk_level = "low"`, `blocked_activities = []`, `needs_approval = false`.
5. `recommendation` states the level, the blocked activities, and the file title you used.
6. `tool_result` is `{"risk_level": ..., "blocked_activities": ...}`.
7. `sources` are the chunks you retrieved.

**Check:** three tests with a fake `retrieve` that returns a snippet you control.

- Spec question with an empty list returns the refusal sentence.
- Materials text `EOQ D=12000 S=50 H=4` returns `eoq == 547.72` and `needs_approval is True`.
- Risk text plus a snippet that says RFI-014 blocks the foundation pour returns `risk_level == "high"`.

**Interview sentence:** “The materials agent calls a tested function. The model does not invent the square root. The risk agent uses retrieved hold language plus a rule I can point at. High and medium risks pause for a human because they move the schedule.”

---

## Step 10 — Supervisor

File: `backend/app/agents/supervisor.py`

### `choose_route(message: str) -> str`

Return exactly one of `"materials"`, `"risk"`, `"spec"`, `"chat"`.

Check in this order so a mixed question does the math:

1. Materials if any of these appear, lowercase: `eoq`, `safety stock`, `sku`, `holding cost`, `order cost`, `annual demand`, `on hand`, `on-hand`.
2. Else risk if any of: `risk`, `delay`, `weather`, `pour`, `blocked`, `block`, `hold`.
3. Else spec if any of: `spec`, `rfi`, `division`, `submittal`, `curing`, `concrete`, `steel`, `bolt`, `vapor`, `lead time`.
4. Else `chat`.

Lead time is spec when they ask “what is the lead time language”, and materials when they ask for a SKU. The materials check runs first, so “EOQ and lead time for SKU-REBAR” stays on the calculator. Say that failure mode out loud.

### Failure mode

If the supervisor sends an EOQ question to the spec agent, the spec agent looks in the PDFs, does not find D, S, and H, and refuses or, worse, the model invents a quantity. If it sends an RFI question to materials, no tool matches and the user gets no citation. You measure this separately: routing accuracy on 12 questions.

A later upgrade is a one-token model call with the same four labels. Keep the keyword function as the fallback when the model is down, and as the thing your tests call.

**Check:** a table of sentences in `tests/test_router.py`. At least:

| Message | Route |
|---------|--------|
| What is the curing time for concrete? | spec |
| EOQ D=12000 S=50 H=4 | materials |
| Which open RFI blocks the foundation pour? | risk |
| What is the capital of France? | chat |

**Interview sentence:** “I route with an ordered keyword check: math, then schedule risk, then documents, then general chat. I can swap in a classifier later because both return the same four strings. A mis-route is a wrong tool, so I score routing on its own.”

---

## Step 11 — The graph and the human pause

File: `backend/app/agents/graph.py`

Nodes:

- `supervisor_node`: set `route = choose_route(user text)`, append `"supervisor"` to `agents_used`.
- `spec_node`: `run_spec`.
- `materials_node`: `run_materials`.
- `risk_node`: `run_risk`.
- `chat_node`: set recommendation to “I answer project documents, material quantities, and schedule risk for this job.” `needs_approval` false. Append `"chat"`.
- `human_review`: do not call a model. Return the state unchanged. This node exists so the graph has a place to pause.
- `respond`: copy `recommendation` into the assistant message.

Edges:

- Start at `supervisor_node`.
- Conditional from supervisor on `route` to spec, materials, risk, or chat.
- From each specialist, a second conditional named `needs_human`:
  - if `needs_approval` is true and `approved` is `None`, go to `human_review`.
  - else go to `respond`.
- `human_review` goes to END.
- `respond` goes to END.

Compile:

```python
graph = builder.compile(
    checkpointer=MemorySaver(),
    interrupt_before=["human_review"],
)
```

`interrupt_before` means: when the next node would be `human_review`, stop and give control back to FastAPI. The checkpoint keeps the state under `thread_id`.

What if the user never clicks Approve? The checkpoint stays pending. Nothing is ordered, nothing is written to a system of record, the pour is not delayed by the software. You can say: “No decision is a no. The card can sit there. A later version can expire the thread and record an automatic reject.”

**Check:** invoke the graph with the EOQ sentence and a config `{"configurable": {"thread_id": "t1"}}`. Then `graph.get_state(config).next` contains `"human_review"`. Invoke a curing question and `next` is empty (the graph finished) and the answer mentions 7 days after you have ingested the concrete file into that project.

**Interview sentence:** “Human review is a node in the graph, not a popup glued on the UI. The graph pauses before that node. Resume happens only when the approval route writes `approved` and calls the graph again.”

---

## Step 12 — Chat and approvals API

File: `backend/app/api/chat.py`

`ChatRequest`: `project_id: str`, `thread_id: str`, `message: str` with `min_length=1`.

`Source`: `title: str`, `page: int`, `snippet: str`.

`ChatResponse`: `answer: str`, `sources: list[Source]`, `agents_used: list[str]`, `needs_approval: bool`, `recommendation: str`.

### `post_chat(body: ChatRequest)`

Inside:

1. `config = {"configurable": {"thread_id": body.thread_id}}`.
2. If this thread is already waiting on human review (`"human_review"` is in `get_state(config).next`), return 409 with detail `"Approve or reject the current recommendation before asking a new question."`
3. Build the initial state from Step 8. Set `user_text` to the message.
4. `graph.invoke(state, config)`.
5. Read the state back with `graph.get_state(config)`.
6. `needs_approval` in the response is true when the snapshot’s next node is `human_review`.
7. `answer` is `recommendation`. When approval is still required, add the sentence “This needs approval before anyone acts on it.”
8. Log one line: `request_id`, `project_id`, `route`, `latency_ms`. Use the `logging` module. This is the line you later send to CloudWatch.
9. On any unexpected exception, return a 500 with the safe detail from Step 5. Use a fixed sentence.

File: `backend/app/api/approvals.py`

`POST /api/approvals/{thread_id}` body: `approved: bool`, `note: str = ""`.

Inside:

1. Load the checkpoint for `thread_id`. If there is no checkpoint, 404.
2. Update state: `approved` is the boolean, and append the note onto the recommendation if you want it visible.
3. `graph.invoke(None, config)` resumes from the pause. Passing `None` means “continue, do not start a new user message.”
4. Return the same `ChatResponse` shape. After a decision, `needs_approval` is false.

Wire both routers into `main.py`.

**Check:**

- POST chat with `message=""` returns 422. That is Pydantic, and it is the live-coding point: “empty message never reaches the graph.”
- POST the EOQ message, see `needs_approval: true`.
- POST approval `approved: true`, see `needs_approval: false` and the same EOQ number still in the answer.
- POST “What is the capital of France?” and see the chat refusal, `needs_approval: false`.

**Interview sentence:** “The contract is four calls: upload, list, chat, approve, plus health. React imports only those. I validate with Pydantic so a blank message is a 422, not a confused agent.”

---

## Step 13 — React UI

From `projects/siteflow/frontend`:

```bash
npm create vite@latest . -- --template react
npm install
```

In `vite.config.js`, proxy `/api` to `http://127.0.0.1:8000`.

File: `src/api/client.js` with four functions. Each one:

1. `fetch` the path.
2. If `response.ok` is false, read JSON and throw `Error(detail)`.
3. Return the JSON.

| Function | Request |
|----------|---------|
| `uploadDocument(projectId, file)` | `POST /api/projects/{id}/documents` as `FormData` field `file` |
| `listDocuments(projectId)` | `GET /api/projects/{id}/documents` |
| `sendChat(projectId, threadId, message)` | `POST /api/chat` JSON |
| `submitApproval(threadId, approved, note)` | `POST /api/approvals/{threadId}` JSON |

Components:

- `Upload.jsx` — file input, button, calls `uploadDocument`, then reloads the list. Show the error string if the throw happens. Disable the button while the request is in flight.
- `Chat.jsx` — a list of messages, a text box, a send button. On send, append the user line immediately, set loading, call `sendChat`, append the assistant line. Keep `threadId` in React state, created once with `crypto.randomUUID()`.
- `Sources.jsx` — receives `sources` and renders a chip per item: title, page, and the snippet.
- `ApprovalCard.jsx` — rendered only when `needs_approval` is true. Two buttons. They call `submitApproval` and then replace the card with “Approved” or “Rejected”.

`App.jsx` holds `projectId` defaulting to `"demo"`, the document list, and the chat.

Empty states you must show on purpose:

- No files yet: “Upload a spec or the materials CSV.”
- Chat before any message: “Ask about a spec, an RFI, or an EOQ.”
- Error from the API: the `detail` string in red, not a blank screen.

**Check:** with both servers running, upload `division-03-concrete.txt`, ask “What is the curing time for concrete?”, see a source chip. Ask “EOQ D=12000 S=50 H=4”, see 547.72 and the approval card. Click Approve. Ask “What is the capital of France?” and see the refusal.

**Interview sentence:** “I demo the integration, not a component library. One project, one upload, one cited answer, one tool call, one approval.”

---

## Step 14 — AWS, after local mode works

Do not start here. Local mode must already pass Step 13.

### What you create in the AWS console

1. A bucket `siteflow-docs-<yourname>`. Block all public access. Default encryption SSE-S3 (Amazon’s key, not a key you manage).
2. An IAM user used only by this backend. Its policy allows, on that one bucket and its objects:
   - `s3:PutObject`
   - `s3:GetObject`
   - `s3:ListBucket`
3. Explicitly do not grant `s3:*`, do not grant `s3:DeleteBucket`, and do not grant access to other buckets.
4. Optional later: `bedrock:InvokeModel` on one model in one region, and `dynamodb:GetItem`, `PutItem`, `Query` on one table whose partition key is `thread_id`.

File: `infra/iam-siteflow.json` — write that policy with the real bucket ARN. The answer key has the shape.

File: `backend/.env` (gitignored):

```
SITEFLOW_MODE=local
USE_AWS=false
OLLAMA_MODEL=llama3.1:8b
AWS_REGION=us-west-2
S3_BUCKET=siteflow-docs-YOURNAME
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```

Never commit keys. `.env` stays local. In git you commit `.env.example` with empty values.

### `backend/app/aws/s3.py`

Three functions, all using `boto3` only when `USE_AWS` is true:

- `upload_fileobj(fileobj, key) -> None`
- `list_prefix(prefix) -> list[str]`
- `generate_presigned_url(key, expires_seconds=300) -> str` for a PUT.

When `USE_AWS` is false, `save_upload` keeps writing to disk. When it is true, the key is `projects/{project_id}/docs/{filename}`.

Presigned URL, said simply: “The backend asks S3 for a temporary PUT address that dies in five minutes. The browser uploads the bytes straight to that address. The AWS keys never go to the browser. I still proxy small files through FastAPI in v1 because the 10 MB cap and the type check are easier in one place. The presign function is there so I can explain the other design: big drawings should not pass through the API server.”

### One chat interface

File: `backend/app/aws/bedrock.py` can be a stub.

```python
def complete(system: str, user: str) -> str:
    # if USE_AWS: bedrock-runtime invoke_model, return the text
    # else if Ollama is up: ChatOllama.invoke
    # else: return "" and let the caller use the stitched snippet
```

Say: “Ollama and Bedrock both sit behind `complete()`. Bedrock adds a region, a model id, IAM, and a quota. The agent nodes do not change.”

Region rule: call Bedrock in the same region as the bucket, `us-west-2`, unless you have a reason not to. If the model is enabled only in another region, set the Bedrock client’s region separately and keep S3 in the bucket’s region. Cross-region is a config bug, not a reason to copy the bucket.

A 200 MB drawing set should not be ingested inside the upload request. The upload returns as soon as S3 has the object. A later worker (Lambda on `ObjectCreated`, or a background task) chunks it. On the request path, a big file would time out the superintendent’s browser and tie up a FastAPI worker.

**Check:** with `USE_AWS=false`, the old upload test still passes. With real keys, a manual upload appears in the bucket under `projects/demo/docs/`.

**Interview sentence:** “Least privilege is three S3 actions on one bucket. Public access stays blocked. Keys stay in the environment. The app runs with zero AWS on a laptop.”

---

## Step 15 — Twelve questions and a score

File: `eval/questions.json`. A list of 12 objects:

```json
{
  "id": 1,
  "question": "What is the curing time for cast-in-place concrete?",
  "expected_route": "spec",
  "must_mention": "7 days",
  "bucket": "spec"
}
```

Write four spec, four materials, two risk, two out-of-scope. Use the facts in your cheat sheet so you can grade them.

Suggested set:

1. Curing time → spec, “7 days”.
2. Bolt standard for primary connections → spec, “A325”.
3. Structural steel lead time → spec, “14 to 16 weeks”.
4. Status of the vapor barrier submittal → spec, “Submitted”.
5. `EOQ D=12000 S=50 H=4` → materials, “547.72”.
6. `safety stock std=20 lead=9 z=1.65` → materials, “99”.
7. On hand for SKU-REBAR → materials, “40”.
8. Annual demand for SKU-ABOLT → materials, “500”.
9. Which open RFI blocks the foundation pour? → risk, “RFI-014”.
10. Can we pour concrete at 35 F? → risk, “40”.
11. What is the capital of France? → chat, and the answer must not invent a project fact.
12. Write a poem about the ocean → chat, same refusal. The word “concrete” would have hit the spec route, which is a router bug you should be able to describe.

Score by hand in `eval/scores.md`:

- Routing accuracy = correct routes / 12.
- Faithfulness = on the spec and risk questions, the `must_mention` string appears in the cited snippet. Materials questions are faithful when the number matches the formula, not when a PDF says it.
- Note one latency: time for a spec question and time for an EOQ question. EOQ should be faster because it does not embed a query.

**Interview sentence:** “I split routing accuracy from faithfulness. A right route with a made-up citation is still a failure. I graded 12 questions by hand: 4 spec, 4 materials, 2 risk, 2 out of scope.”

---

## Step 16 — README and the demo you can talk through

`projects/siteflow/README.md` should grow from the course pointer into the project README once the app runs. Include:

- The paragraph from the top of this file.
- The whiteboard diagram.
- How to run local mode, including “pull `nomic-embed-text` and `llama3.1:8b` in Ollama”.
- How AWS mode differs (`USE_AWS=true`).
- One example of each question type and the answer you actually got.
- Limitations: keyword router, stitched answers until Ollama is up, no real write-back to a system of record, one project at a time in the UI, txt stand-ins for drawings.
- Cost: local Ollama is free aside from your machine. Bedrock charges per token. Use a small model to route and a larger one only for the final paragraph. Cache embeddings so re-ingest of the same file does not re-bill.

Demo script, about three minutes:

1. Show an empty project, upload the concrete spec and the CSV.
2. Ask the curing question. Point at the source chip.
3. Ask the EOQ question. Point at 547.72 and the approval card. Click Approve.
4. Ask the RFI question. Point at high risk and the hold.
5. Say the limitation: “Approve records the human decision. It does not create an RFI in Autodesk Construction Cloud. A write-back would be a second tool that only runs after `approved` is true.”

---

## Answers you should be able to give

Speak these in your own words. The facts have to stay.

**Why can’t the frontend call S3 or LangGraph?**
The browser is the product. FastAPI is the platform. If the browser had AWS keys or could pick an agent, every user could see another project’s files or skip the approval node. One door means one place for auth, file checks, logging, and the human gate.

**How does a mis-route fail?**
The wrong specialist runs. Math never hits the calculator, or a document question never retrieves. I log `route` and I score routing separately so I notice.

**What did you reuse from Project 2?**
The EOQ formula, the safety-stock formula, the SKU status rule, and the habit of refusing when retrieval is empty. I left the Streamlit loop behind. SiteFlow’s orchestrator is a supervisor graph.

**When do you leave Chroma for OpenSearch?**
When more than one API server needs the same index, or the corpus is large enough that a local folder is awkward, or you need a managed backup. Doing it on day one adds a cluster before the citations are even right. What breaks if you rush: your filters, your metadata field names, and your cost, while you are still changing the chunk size.

**How do you keep answers grounded?**
The spec prompt forbids outside knowledge. Empty retrieval returns a fixed refusal. The eval checks that the gold fact is in the snippet, not only in the answer sentence.

**Where is approval, and what if they never click?**
Before the human-review node, using `interrupt_before`. No click means the checkpoint waits. No purchase and no schedule change is written.

**How would you add “create RFI”?**
A tool that only drafts text. A second step writes to the system of record only when `approved` is true and the route is that tool. The agent never holds a credential that can write directly.

**IAM you actually need.**
`s3:PutObject`, `s3:GetObject`, `s3:ListBucket` on one bucket. No `s3:*`. No public bucket policy. Optional Bedrock invoke and one DynamoDB table.

**Bedrock region mismatch.**
S3 client uses the bucket region. Bedrock client uses the region where the model is enabled. They can differ, and the code should say so in config. I would still prefer one region.

**Keys.**
`.env` is gitignored. `.env.example` has names only. Rotate by creating a new IAM access key, updating the environment, restarting the process, then disabling the old key.

**ECS picture.**
FastAPI in one container behind an application load balancer. React as static files on S3 with CloudFront. The container is stateless if checkpoints are in DynamoDB and files are in S3. Chroma on local disk would make the container stateful, which is why the managed search index comes before a second task.

**Why is ingest-on-upload a bad idea for 200 MB?**
The HTTP request would hold a worker for parsing and embedding. The user waits, the request times out, and a retry double-embeds. Store the object, then ingest from an event.

**Embeddings drifted after a model change.**
Re-embed a fixed set of chunks and compare cosine similarity to the old vectors. If the average similarity drops, rebuild the index. Do not mix two embedding models in one collection.

**Small model versus Bedrock.**
An 8B local model is enough to route or to refuse. Final wording for a superintendent can use a hosted model when you need stronger writing. The calculator does not use either one.

**Behavioral, field decision with incomplete information.**
Use your own story. The SiteFlow tie-in is: RFI-014 is open, the vapor barrier detail is missing, and the pour is the next activity. The risk agent surfaces the hold and stops. A person still decides whether the field waits. The software does not pour and does not “close” the RFI.

**Behavioral, disagreement about a risky automation.**
The gate is the human-review node on anything that changes spend or the schedule. You can ship the cited Q&A without that gate. You do not ship an agent that orders steel or creates RFIs with no approval.

---

## What you will not build

One FastAPI app, not five services. No Kubernetes. No Autodesk Forge account. No claim that you wrote an RFI into Construction Cloud. Local mode first, S3 second, Bedrock only as the same `complete()` function.

The thin slice that is enough to start interviewing: one text spec, one CSV, health, upload, one cited chat, one EOQ with an approval card.

When a step’s check fails twice, open `ANSWER_KEYS.md` at that step only.
