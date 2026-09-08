# Interview prep — Logistics RAG Agent

Use this guide with the **mock interview app** and your existing cue card.

## Quick start

```bash
./rag-env/bin/streamlit run mock_interview.py
```

**Practice loop (one question):**

1. Read the question aloud.
2. Start the timer (auto-starts on each card).
3. Answer in **2–4 short sentences** (see cue card).
4. Click **Reveal answer** — compare to short answer.
5. If they’d push technical depth → **Show deep answer**.
6. Jot one improvement in notes → **Next question**.

---

## Memorize these three anchors

| Anchor | Say this |
|--------|----------|
| **Purpose** | DeCA-style morning rush: alerts + PDFs + math → one trusted assistant |
| **Demo** | Phantom flour: system 48, shelf 0 → agent + citeable SOP steps |
| **Honesty** | Synthetic docs; real commissary pain; production-ready pattern |

---

## Question map (22 in bank)

| Category | Count | Example |
|----------|-------|---------|
| Opening & motivation | 3 | Tell me about the project |
| Architecture & stack | 3 | Walk through architecture |
| RAG & grounding | 3 | How do you reduce hallucinations? |
| Agent & tools | 3 | What tools and when? |
| Ingest & data | 2 | How does ingest work? |
| Performance & ops | 2 | Why is it slow? |
| Tradeoffs & production | 2 | Biggest limitation? |
| Behavioral & domain | 2 | Phantom flour walkthrough |
| Coding / TDD style | 2 | How would you test inventory lookup? |

Full Q&A lives in `docs/interview_qa_bank.py` (loaded by `mock_interview.py`).

---

## 60-second open (stammer-friendly)

Say one line, breathe, next line:

1. I built a logistics ops agent for DeCA-style inventory work.
2. I worked inventory and supply at a DoD commissary.
3. Alerts, PDFs, and math piled up at once.
4. So I built one trusted assistant for that rush.
5. Tools do the numbers. RAG searches the SOPs.
6. Example: flour — system 48, shelf empty.
7. Outcome: faster decisions. Safer orders. Answers I can cite.

---

## Tech one-liners

| Topic | One line |
|-------|----------|
| Stack | Python, LangChain agent, Ollama, Chroma, Streamlit |
| Models | Chat: llama3.1:8b · Embed: nomic-embed-text |
| EOQ | √(2DS/H) |
| Safety stock | z × σ × √L |
| Grounding | Context only → else "I don't know" |
| Slow path | Ollama LLM on CPU, not tools/Chroma |

---

## TDD verbal template (coding round)

> "I'd drive this with tests. First I'd pin the happy path with a concrete example. Then I'd add failure cases the agent must handle — missing SKU, bad EOQ inputs. I'd keep the LLM behind a seam so unit tests stay fast. Once green, I'd refactor names to match our domain: SKU, source path, grounded context."

---

## Before the real interview

- [ ] Run mock interview — full deck once
- [ ] Demo live app: `./rag-env/bin/streamlit run app.py`
- [ ] Know phantom flour beats (Nancy, Item 10045, BoH vs shelf)
- [ ] Explain agent vs RAG-only in one sentence
- [ ] Name one limitation + one production fix

Cue card: `docs/deca-interview-cue-card.md`
