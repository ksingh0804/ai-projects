# SiteFlow in three days

You are learning a small construction assistant well enough to build it, test it, and explain it in an Autodesk-style interview. The code in this folder is the reference slice. Study it in the order below. Each day has one job: make one layer obviously correct before you add the next layer.

The original guide is a seven-day build. Three days is enough for the thin slice that guide ends on: one PDF path, one CSV, one chat path, one tool, one approval, local mode first. AWS is an interface you can explain, with tests that never need a real account.

## What you are building

SiteFlow helps one job. A project engineer uploads specifications, an RFI, and a materials spreadsheet. They ask a question. The system decides whether that question is about documents, inventory math, or schedule risk. It answers from the file or from a formula. If the answer would change a purchase or the schedule, the screen waits for Approve or Reject.

You should be able to say this sentence: "The React app never calls the model or the file bucket. It calls FastAPI. FastAPI runs a LangGraph supervisor that picks one specialist."

## Assumptions locked in for this slice

Change these if your machine is different. Do not quietly pretend they are true in an interview.

- No AWS keys are required. `USE_AWS=false`. The S3 code is real and tested with a fake client.
- No Ollama process is required. Answers are written from the retrieved text and the formula. Ollama and Bedrock implement the same `invoke(messages)` method when you want prose later.
- Python is the system you must be able to defend. React is the screen the interview loop expects. The screen is thin on purpose.
- EOQ and safety stock are the Project 2 formulas, copied as plain functions. See `projects/rag-logistics-agent/tools.py`.
- Approval stores a human decision. It does not create an RFI in Autodesk Construction Cloud, and it does not place a purchase order.

## The picture

```
Browser (React :5173)
    |  HTTPS JSON  (only these routes)
    v
FastAPI (:8000)  health, documents, chat, approvals
    |
    +-- local files   data/runtime/projects/{id}/docs/
    +-- library       chunks + materials table, rebuilt from those files
    +-- LangGraph
          supervisor
            |-- spec_rag     BM25 over this project's chunks
            |-- materials    EOQ / safety stock / SKU lookup
            |-- risk         rules on hold and weather lines
            |-- human_review interrupt until Approve or Reject
            +-- respond
    |
    +-- SQLite checkpoint   so a paused approval survives a restart
```

S3, Bedrock, and DynamoDB sit beside this picture. They are the same jobs (store a file, write a sentence, save a checkpoint) with AWS authentication. They are not on the default path.

## Tiny definitions

Use these words. They are enough.

- **Agent.** A function that reads the question and returns an update to the shared state. The spec agent reads documents. The materials agent calls a formula.
- **Supervisor.** The function that picks which agent runs. Ours is a keyword cascade in `backend/app/agents/supervisor.py`.
- **Tool.** A plain function with checked inputs and a checked result. `calculate_eoq` is a tool. A decorator is optional packaging.
- **RAG.** Retrieval-augmented generation. Find a passage first, then write the answer from that passage. If you skip the find step, the model invents a spec.
- **Chunk.** A piece of a document small enough to cite, large enough to contain the rule. We cut on paragraphs and sentences before we cut on characters.
- **BM25.** A score for "how surprising is it that this document contains the query words?" Exact tokens like `RFI-014` rank well. Synonyms do not, unless both words are in the text.
- **Embedding.** A list of numbers for a sentence, so "slab on grade" can sit near "foundation pour" even when the words differ. We did not ship one. There is no embedding model in this environment, and a fake vector would be a lie.
- **Checkpoint.** A saved graph state. The approval can happen minutes later, or after the process restarts, because SQLite still has the paused turn.
- **HITL.** Human in the loop. The graph stops on `human_review` and waits. The person decides. The agent does not.
- **IAM.** A list of AWS actions an identity is allowed to call. Our file is `infra/iam-siteflow.json`.
- **Presigned URL.** A temporary link that lets the browser upload to S3 without holding the secret key. We implemented the function. The running UI still uploads through FastAPI.

## Day 1 — Make the facts true before any agent exists

Day 1 is the part you can check with a calculator and a file folder. Do not start here with LangGraph, React, or AWS. If the formula is wrong, a beautiful agent will say the wrong number with confidence.

### The platform split

The browser is the product. FastAPI is the platform. The product asks for things. The platform decides how they happen.

Why this is the split to defend: an Autodesk product team can ship a new screen without redeploying the agent, and a platform team can change the model without rewriting the screen. One process also means one place to reject a bad file and one place to keep stack traces off the screen.

The weaker split is letting the browser call S3 and the model directly. Then every secret and every validation rule has to live in JavaScript, and you cannot answer "who is allowed to read project B?"

Tests: `test_health_and_cors`, `test_internal_errors_hide_the_exception_text`.

### EOQ

Economic order quantity is the order size that balances two costs. Order too often and you pay the order cost `S` many times. Order too much and you pay holding cost `H` to store units all year. Demand `D` is how many units you need in a year.

```
EOQ = sqrt(2 * D * S / H)
```

For rebar, D = 12000, S = 50, H = 4:

```
sqrt(2 * 12000 * 50 / 4) = sqrt(300000) = 547.72
```

The question in the guide gives demand and holding cost and forgets the order cost. A careless agent invents `S`. This one looks up `REBAR-5` in the CSV, uses order cost 50, and says it did that. It never copies unit cost 4.10 into `H`. Unit cost is what one bar costs to buy. Holding cost is what it costs to keep one bar for a year. They are different questions.

If two SKUs match the word "steel", the agent stops and asks which SKU. A guessed mix of their order costs would be a false recommendation.

Why the classic formula and not a fancier inventory model: you can recompute it by hand in an interview, and Project 2 already uses it. The assumption is steady demand and a fixed order cost. It is the wrong tool for a one-time buy or for a lead time that jumps every week. Say that limitation out loud.

Tests: `test_eoq_matches_project2_formula`, `test_eoq_uses_order_cost_from_the_one_matching_sku_and_not_unit_cost`, `test_eoq_refuses_to_guess_when_two_skus_match`.

### Safety stock

```
safety_stock = z * demand_std * sqrt(lead_time)
```

`z` of 1.65 is about a 95 percent cycle service level. `demand_std` is how much demand bounces around in one period. `lead_time` is how many of those periods you wait for the truck. The square root is there because independent periods add variance, and variance of the sum grows with the number of periods, so the standard deviation grows with the square root.

If lead time is also uncertain, this number is too small. The fuller formula adds a term for lead-time variance. We did not use it, because Project 2 did not, and the sample table has no lead-time standard deviation. The default `z` is stated in the answer when the user omits it. A hidden default is how assistants smuggle assumptions into a buy.

Tests: `test_safety_stock_matches_project2_formula`, `test_safety_stock_states_the_default_z_score`.

### Files

Uploads go to `data/runtime/projects/{id}/docs/{filename}`. The project id is a short token, not a path. The filename is the base name only, so `../../secrets.txt` becomes `secrets.txt` inside that project folder.

Allowed types are PDF, CSV, and text. The cap is 10 MB, checked while the bytes are still being read, so a huge body is refused before it is stored. A PDF with no text is refused. Scanned drawings need OCR. Saying "I cannot read this" is the correct product behavior. Pretending the drawing was understood is how you get a made-up spec in front of a superintendent.

CSV files are the materials table, not search passages. `materials.csv` wins if several CSVs exist. Otherwise the newest CSV wins.

Tests: `test_upload_list_and_reject_bad_files`, `test_upload_size_limit_is_enforced_while_reading`, `test_bad_csv_is_rejected`, `test_replacing_a_file_drops_the_old_sentence`.

### Chunks

`recursive_split` cuts on blank lines, then newlines, then sentences, then spaces. Only a leftover piece with no separator becomes a sliding window. That window is what the Project 2 test calls `abcd / cdef / efgh / ghij` for a 4-character chunk and a 2-character overlap.

Why not semantic chunking on day 1: semantic chunking asks an embedding model where the topic changes. Specification PDFs are already structured by section, and the model can glue two unrelated "shall" sentences because they share vocabulary. Recursive splitting is boring and inspectable. Overlap exists so a rule that crosses a boundary still appears in the next chunk.

Page numbers stored on chunks start at 1. Libraries count from 0. People say "page 1".

Tests: `test_character_window_matches_the_project2_example`, `test_paragraphs_split_before_the_middle_of_a_word`, `test_pages_are_numbered_from_one`, `test_sample_pdf_text_survives_a_round_trip`.

### Retrieval

BM25 ranks chunks inside one `project_id`. The id filter is the isolation boundary: job A cannot cite job B even if the words match. Stopwords such as "the" and "where" are removed from the query so they cannot earn a citation by themselves.

Why BM25 before Chroma or OpenSearch: this corpus is a handful of pages full of exact codes (`RFI-014`, `ASTM F3125`, `SB-21`). Lexical search is the right first index, it runs in the test process, and you can explain the score. Embeddings help when field language and spec language diverge ("mud mat" versus "lean concrete"). Add them when you have a model and a set of paraphrase questions that BM25 misses. Moving to OpenSearch Serverless before that eval exists means you cannot tell a bad answer from a bad cluster.

Tests: `test_bm25_ranks_the_document_that_shares_the_query_terms`, `test_bm25_does_not_return_another_projects_chunks`, `test_stopwords_alone_do_not_cite_every_document`.

### Day 1 done when

You can upload a file, list it, compute 547.72 by hand, and show a test that fails if someone swaps holding cost for unit cost.

```bash
cd projects/siteflow/backend
pytest tests/test_inventory.py tests/test_chunking_and_retrieval.py tests/test_api.py -q
```

Break one thing on purpose: in `calculate_eoq`, change `sqrt(2 * D * S / H)` to `sqrt(2 * D * H / S)` and watch `test_eoq_matches_project2_formula` fail. Put the formula back.

## Day 2 — One graph, three specialists, one pause

### State

`AgentState` in `backend/app/agents/state.py` holds the current turn: the question, the route, citations, the tool result, the recommendation, and whether a person still owes a decision.

Put a fact in state when the next node needs it and the turn is not over. Put a file in the document store when it must outlive the turn and be shared by every question on that project. Put the paused turn in the SQLite checkpoint when a human might answer later. Do not put PDF bytes in the checkpoint. Do not put the conversation only in React memory, or a refresh loses the approval.

### Routing

The supervisor is a cascade. First match wins.

1. Formula language (EOQ, safety stock, SKU, holding cost, annual demand) goes to materials, unless the user asked what the spec says.
2. Schedule language (delay, risk, weather, block, hold, pour) goes to risk, even if the question also says RFI. "Which RFI blocks the pour?" is a schedule question.
3. Document language (spec, division, submittal, curing, mill cert, lead time language) goes to spec.
4. Anything else goes to chat, which refuses general knowledge.

Why a cascade and not an LLM classifier: the same question always takes the same path, the reason string says which word matched, and the gold file can score 12 out of 12 with no model spend. An LLM router is reasonable later for long, messy questions that match no rule. Its failure mode is a flip between two runs, which makes an eval score wobble.

Why the fall-through is a refusal and not "best guess": a wrong route to materials invents a buy. A wrong route to spec says "not in the documents" and skips a formula the documents were never going to contain. A refusal is the safe miss. You can see it in the reason string and add a keyword.

The failure you should describe in an interview:

- Mis-route to materials: a number comes back with an empty source list.
- Mis-route to spec: EOQ never runs, and the user hears that the documents do not contain the formula.
- Mis-route to chat: a real project question is refused. Annoying, and visible.

Tests: `test_gold_questions_all_route_correctly`, `test_document_question_about_eoq_stays_on_spec`, `test_hold_is_not_matched_inside_threshold`. The word "hold" must not match inside "threshold". That is why the patterns use word boundaries.

### Spec agent

Search this project's chunks. If nothing scores, the answer is the refusal sentence. The model is not asked to fill a hole with general construction knowledge. Citations carry title, page, and snippet. `needs_approval` stays false because reading a spec does not change the job.

A paraphrase model is allowed only through `maybe_paraphrase`. If the new sentence contains a number that was not in the draft, the draft is kept. If the model throws, the draft is kept. The template writer is the default model. That is `TemplateChatModel`.

Tests: `test_spec_refusal_has_no_outside_fact`, `test_spec_update_cites_only_this_project`, `test_paraphrase_keeps_the_draft_when_the_model_adds_a_number`.

### Materials agent

Parse numbers from the sentence, including `12,000`. Call one of `calculate_eoq`, `safety_stock`, or `lookup_sku`. A lookup is not an approval. An EOQ or a safety-stock quantity is an approval, because it changes a buy. The recommendation is one paragraph that includes the formula and the inputs, so a superintendent can check it without reading Python.

Tests: `test_sku_lookup_is_not_an_approval`, `test_anchor_bolt_lookup_reads_the_table`.

### Risk agent

The level is a rule, not a vibe.

- A line that starts with `Blocked activity:` means high, and the activity is listed.
- "on hold" with no activity line is still high.
- A weather limit with no hold is medium.
- No matching text is unknown, and the agent says it will not invent a schedule risk.

High and medium need approval because they can stop a pour. The user's words are searched first. The extra hold vocabulary is used only when the first search is empty. Always adding the word "RFI" would drag the open hold into every weather question. When both a hold and a weather limit are actually in the hits, the answer mentions both, and the level stays high.

Tests: `test_risk_levels_come_from_explicit_lines`, and the API test that expects `slab on grade foundation pour`.

### The pause

LangGraph's `interrupt()` stops inside `human_review` and writes the checkpoint. The HTTP response says `needs_approval: true` and `status: awaiting_approval`. The next chat on that thread returns 409 until Approve or Reject. Resume sends `Command(resume={"approved": ..., "note": ...})`. The node runs from the top again, receives the decision, and appends "Decision: approved." or "Decision: rejected." plus the sentence that SiteFlow does not place the order.

If the person never clicks, the checkpoint stays paused. There is no write tool, so nothing in a system of record changes. A second process can resume the same SQLite file. That is the test `test_checkpoint_survives_a_new_process`.

Why interrupt and not "poll a status flag we invented": the library already knows how to pause and resume, and the interview word is LangGraph HITL. The node functions stay plain, so most tests never boot the graph.

### Day 2 done when

You can point at `eval/questions.json`, run the routing test, ask the three demo questions through `POST /api/chat`, reject the EOQ, and show the 409 if you ask something else first.

```bash
pytest tests/test_routing_and_agents.py tests/test_api.py -q
```

## Day 3 — The screen, the AWS story, the eval you can say out loud

### The screen

`frontend/src/api/client.js` has four calls: `uploadDocument`, `listDocuments`, `sendChat`, `submitApproval`. Vite proxies `/api` to port 8000. CORS allows `localhost:5173` for the case where the proxy is not used.

The chat box stays closed while an approval is open, because the API would 409 anyway. The button still says Send. A line under it tells you to resolve the card. It does not say Working, because the system is waiting on a person, not on the model. The card says approval records a decision and does not place the order. That sentence is doing product work. It stops you from demoing a capability you did not build.

Loading and error text come from the JSON `detail` field. The server never returns a traceback. The UI should show `detail`, not `error.stack`.

Why React and not a second Streamlit app: Project 2 is already Streamlit. This interview loop wants a real frontend talking to an API. Streamlit would hide the contract. Python remains the place where the behavior lives, which is why the tests are pytest and not a browser test suite.

### AWS, without pretending you deployed it

`S3DocumentStore` has the same `save`, `read`, `list_files`, and `delete` methods as the disk store. `put_object` sets `ServerSideEncryption` to `AES256`, which is SSE-S3. Keys look like `projects/{id}/docs/{filename}`. Public access stays blocked because the bucket policy is not in this repo and you do not grant `s3:PutObject` to `*` principals. The IAM user policy is the allow list.

`presigned_put_url` refuses expirations over 300 seconds and refuses keys outside `projects/{id}/docs/`. A leaked URL then dies in five minutes. Five minutes is long enough for a normal PDF and short enough that a forwarded link is not a permanent backdoor.

Which upload did we ship, and why: the UI posts multipart to FastAPI. The guide's API contract says that. The server can reject a corrupt PDF before anything is stored. Presigned PUT is the better path when files get large, because the API process should not hold a 200 MB drawing in memory. The function is tested so you can add a route later without inventing the signing rules during the interview.

`build_engine` raises if `USE_AWS=true`. It does not silently open a real boto3 client. Turning AWS on is an explicit swap of the store, with a bucket name, in one region.

The IAM actions in `infra/iam-siteflow.json` are only:

- `s3:ListBucket` on the one bucket, and only for the prefix `projects/*`
- `s3:GetObject`, `s3:PutObject`, and `s3:DeleteObject` on `arn:aws:s3:::siteflow-docs-YOURNAME/projects/*`

`DeleteObject` is not in the guide's minimum list. It is here so a failed rebuild can delete the object it just wrote. It is still limited to that prefix. There is no `s3:*`, no `iam:*`, and no Bedrock permission. Bedrock is a different decision and a different statement you add when you actually call it.

There is no explicit Deny. You should say that clearly. Omission protects you only if this user has no second policy that Allows more. An explicit Deny would also be valid. A sloppy Deny on `s3:*` would cancel the Allows, so do not add one you have not thought through.

Regions: pick `us-west-2` for the bucket, the model, and the app. A Bedrock call in `us-east-1` against a bucket in `us-west-2` is two regions, two failure domains, and sometimes a model that is not enabled where you called. Keep them together.

Keys: `backend/env.example` has empty placeholders. `.env` is gitignored. Rotation means a new access key, the secret updated in the place the process reads, then the old key deleted. Do not commit the new key to prove it works.

DynamoDB, when you leave one machine: partition key `thread_id`, a payload blob, an optional TTL. `thread_checkpoint_item` builds that shape and does not call AWS. SQLite is the local version of the same idea. On ECS, a file on the container disk disappears with the task, so the checkpoint has to move to Dynamo or another shared store before you run more than one task.

The 200 MB drawing: do not parse it inside the upload request. Store it, return, and let an S3 `ObjectCreated` event start a worker. The request path stays short. You can describe that Lambda even though this slice ingests inside FastAPI for small text PDFs.

ECS sketch, if they ask: one Fargate service for FastAPI behind an ALB, React built to static files on S3 with CloudFront, documents on S3, checkpoints on DynamoDB. The task is stateless only after SQLite is gone. Do not start with EKS. The guide says so because a cluster does not teach the agent.

Tests: `test_s3_store_round_trip_uses_sse_s3_and_paginates`, `test_presign_is_capped_at_five_minutes_and_stays_under_the_prefix`, `test_iam_policy_is_limited_to_one_bucket_prefix`, `test_use_aws_flag_does_not_silently_open_a_real_client`, `test_claude_body_and_parser_match_the_bedrock_messages_contract`, `test_dynamo_item_uses_thread_id_as_the_partition_key`.

### Models

Three classes, one method: `invoke(messages) -> str`.

- `TemplateChatModel` returns the draft. Default. Costs nothing. Cannot invent 99999.
- `OllamaChatModel` posts to the local Ollama HTTP API. Tested with a fake HTTP transport, so the test does not need a running model.
- `BedrockChatModel` sends the Anthropic Messages body (`anthropic_version` `bedrock-2023-05-31`) and reads the text block back.

Use a small local model, or no model, for routing. We already routed with keywords. Use Haiku when you want a classifier for the questions the cascade sends to chat. Use a larger model only to polish a final paragraph, and keep the number guard in front of it. Spending a large model on every routing decision burns money to do a job a regex already does.

### Eval

`eval/questions.json` has 12 questions: 4 spec, 4 materials, 2 risk, 2 out of scope. `score_routes` reports routing accuracy. The API tests check faithfulness on the answers you will demo:

- steel lead time contains `8 to 12 weeks` and a source
- rebar EOQ is `547.72` and needs approval
- the foundation pour names `slab on grade foundation pour` and needs approval
- a poem has an empty source list and the refusal sentence

What we did not score yet: a latency budget, and a citation grade for every one of the 12. Routing accuracy answers "did the right agent run?" Faithfulness answers "is the sentence supported by the cited page?" Both can be perfect while the product is slow. The log line `latency_ms` is where that third number will come from.

A correct citation, said precisely: a claim in the answer is supported when the cited page contains that claim. Precision is supported claims divided by claims you cited. Recall is supported claims you cited divided by claims in the corpus that answer the question. For this demo, the practical check is an expected phrase from the gold page plus the source title.

Embedding drift, when you add a model later: freeze 20 query and chunk pairs, store the rank order, and compare after the model upgrade. A drift alert is a rank change, not a feeling that answers got worse.

### Day 3 done when

The UI can upload, ask, show a source, and approve. You can answer the section below out loud without reading the code. You can say what is not built.

```bash
cd projects/siteflow/backend && pytest -q
cd projects/siteflow/frontend && npm install && npm run dev
```

## Two questions, hop by hop

### "What is the lead time language for structural steel?"

1. `Chat.jsx` calls `sendChat` in `client.js`.
2. The browser sends `POST /api/chat` with `project_id`, `thread_id`, and `message`. Vite forwards it to FastAPI.
3. Pydantic rejects an empty message before any agent runs.
4. `Engine.chat` loads the checkpoint. A paused approval would stop here with 409.
5. `supervisor_update` matches `lead time language` and sets `route` to `spec`.
6. `spec_update` calls `search_chunks` for this `project_id` only.
7. BM25 ranks `Division_05_Structural_Steel.pdf` first because it contains those words. The chunk text was extracted with pypdf when the file was uploaded, from bytes on disk under `projects/demo/docs/`.
8. The answer is built from the chunk. It includes "8 to 12 weeks". `needs_approval` is false.
9. SQLite stores the turn. JSON goes back. `Sources.jsx` shows title, page, and snippet.

S3 is not on this hop while `USE_AWS` is false. Say that. If the file had been uploaded with the S3 store, hop 7 would read the same bytes from `s3://bucket/projects/demo/docs/...` and the rest would be identical.

### "If rebar demand is 12,000 and holding cost is $4, what EOQ should we use?"

1. Same HTTP hop.
2. The cascade matches `eoq` and `holding cost` and selects materials. It does not search PDFs.
3. The parser reads D = 12000 and H = 4. S is missing.
4. One row matches "rebar": `REBAR-5`, order cost 50. The answer says the order cost came from the table.
5. `calculate_eoq(12000, 50, 4)` returns 547.72.
6. `needs_approval` is true, so the edge goes to `human_review`.
7. `interrupt()` pauses the graph. The UI shows the card and disables the composer.
8. `POST /api/approvals/{thread_id}` resumes with the boolean and the note.
9. The answer grows a decision line. The materials table is unchanged. No order was sent.

## Interview answers that match this repo

Say what the code does. Skip any sentence you cannot point at.

**Walk me through SiteFlow.** Use the picture, then one of the two hops above.

**Why can't the frontend call S3 or LangGraph?** Secrets, per-project checks, file validation, and a single contract. The screen is replaceable. The graph is not a public API.

**How does the supervisor choose, and what if it is wrong?** Cascade in `supervisor.py`. Wrong materials route yields a number with no citation. Wrong spec route skips the formula. Wrong chat route refuses. Refusals are the misses you can see.

**How did you reuse Project 2?** Same two formulas, new module, no Streamlit and no LangChain wrapper. Tests pin 547.72 and 33.0.

**What is in state, the database, and S3?** State is the turn. SQLite is the paused turn. Files are the PDFs and the CSV. The in-memory library is a cache rebuilt from the files.

**How are two projects isolated?** `project_id` on the folder and on every chunk. Retrieval filters on it. A thread id cannot move to another project.

**When do you leave Chroma for OpenSearch?** When many projects, filters, and concurrent indexing show up, and you already have an eval that tells you the answers got worse or better. Doing it first hides whether the agent or the cluster is wrong. This slice uses BM25 because there is no embedding model here. Chroma is the local step when you add one. OpenSearch is the shared step after that.

**How do you stay grounded?** No hits, no answer. The draft quotes chunks. A paraphrase that adds a number is thrown away. Stopwords cannot cite every page.

**Presign or proxy?** Proxy, because the contract is multipart and bad PDFs are rejected before storage. Presign is written and capped at 5 minutes for the large-file path.

**Where is approval, and what if they never click?** `interrupt()` in `human_review`. The thread stays paused. The next question gets 409. No write tool runs.

**How would you add "create RFI"?** A draft in state, a person approves, then a separate function writes. The agent does not get that function. This repo does not write RFIs.

**What did you measure?** Routing accuracy on 12 gold questions, and faithfulness on the demo answers (the week range, the EOQ, the blocked activity). Latency is logged and not yet graded.

**Which IAM actions?** List, get, put, delete on one bucket prefix. Delete is only for rollback. No star action. No Bedrock until you call Bedrock. No explicit Deny, so this user must not carry a second allow-all policy.

**Bedrock region mismatch?** One region for the bucket and the model. `us-west-2` in the sample env file.

**Keys?** Example file has no secrets. `.env` is gitignored. Rotate by issuing a new key and deleting the old one.

**ECS sketch?** Fargate plus ALB for FastAPI, CloudFront plus S3 for the built React app, S3 for documents, Dynamo for checkpoints. SQLite on the task disk is the stateful part you have to remove first.

**200 MB drawing?** Not on the request path. S3 event, then a worker. This slice only ingests small text PDFs inside the request, and it refuses a PDF with no text.

**Why recursive split?** Specs already have headings and sentences. Semantic split needs a model and can merge unrelated requirements that share the word "shall".

**Embedding drift?** You have not measured it, because this slice has no embedding model. The method is a frozen set of query and chunk ranks compared before and after the model change.

**Correct citation?** The cited page contains the claim. Precision is the share of cited claims that pass. Recall is the share of true answering passages you actually cited.

**Small model or Bedrock?** Keywords for routing now. A small model is enough if you replace the cascade. A larger model only rewrites a draft that already has the numbers, behind the number guard.

**Behavioral.** Use your own field story. The mapping is: incomplete information still needed a decision, so the product shows the source and the missing input instead of guessing `S`. A stakeholder wanted the agent to place the order; you put the pause before any write, and you still have not built the write. Why this industry: the work is RFIs, submittals, lead times, and holds, which is the same shape as the logistics tools you already trust, pointed at a jobsite.

## What this slice does not do

- It does not call a live AWS account.
- It does not run Ollama unless you construct `OllamaChatModel` yourself.
- It does not index scanned sheets. No text means a 400.
- It does not create RFIs, submittals, or purchase orders.
- It does not run OpenSearch, Lambda, ECS, or EKS.
- It does not score all 12 answers for faithfulness automatically. Routing is fully scored. The demo answers are tested end to end.
- It does not stream tokens. The contract we implemented is the JSON body in the guide's API section. Streaming is a later response format on the same graph.

## Run the tests

From `projects/siteflow/backend` with the virtualenv active:

```bash
pytest -q
```

You want every test green before you change a formula, a route word, or a citation rule. When a test fails, read the assertion before you change the test. The assertion is the spec.
