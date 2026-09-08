# DeCA Logistics RAG — Interview Cue Card

**How to use:** Speak one numbered line. Stop. Breathe 2 seconds. Next line.  
If you stick on a word — pause, restart that **one short line**, keep going. Short beats beat long sentences.

---

## A. Origin story (memorize this arc)

| Step | One word | What happened |
|------|----------|----------------|
| 1 | **Why me** | I worked inventory and supply at a DoD commissary. I felt that morning alert rush. |
| 2 | **Problem** | Alerts, PDFs, and math piled up at once. People hunted docs and guessed. |
| 3 | **Build** | One trusted agent: tools for numbers, RAG for DeCA-style SOPs. No invented facts. |
| 4 | **Demo** | Phantom flour — system says 48, shelf is empty. Agent helps the next safe step. |
| 5 | **Outcome** | Faster morning decisions. Safer orders. Answers I can cite. |

**Purpose line (locked):**  
> I built it because DeCA-style work piles alerts, PDFs, and math at once — I wanted one trusted assistant for that morning rush.

**Data honesty (if asked):**  
> The docs are synthetic, DeCA-style. The pain is real from commissary work. The agent pattern is what I’d run on real SOPs.

---

## B. DeCA real-world scenario (your “why”)

### Setting
**DeCA** (Defense Commissary Agency) — commissary shelves for military families.  
You know this world from **DoD commissary inventory / supply work**.  
Demo lead: **Nancy** (morning replenishment desk).

### The problem (phantom flour morning)
1. Daily **NIS / BoH variance** report flags **Gold Medal Flour (5lb), Item 10045**.
2. System BoH says **48**. Physical shelf count is **0** — **phantom inventory**.
3. Without help, Nancy must:
   - dig **planogram / NIS / recall / shrink / cost** PDFs
   - fix BoH by hand
   - run **EOQ / reorder** math
   - still hit the vendor cutoff window
4. Slow answers → **rushed POs**, wrong sizes, answers that are **not audit-ready**.

### Why you built the project
One plain-English assistant that:
- **looks up** SKU / inventory facts (no guessing)
- **calculates** EOQ and safety stock with real formulas
- **searches** ingested DeCA-style SOP PDFs and answers **only from docs** (or says “I don’t know”)

### Final outcome
- Faster morning triage  
- Safer, explainable order sizes  
- Policy answers you can **cite**  
- Fewer panic / expedite orders  

---

## C. Speak script — 60-second open (stammer-friendly)

Say each line. **[BREATHE]** = silent 2-count. Then **stop** and wait.

1. I built a logistics ops agent for DeCA-style inventory work.  
   **[BREATHE]**
2. I worked inventory and supply at a DoD commissary.  
   **[BREATHE]**
3. I felt that morning alert rush myself.  
   **[BREATHE]**
4. Alerts, PDFs, and math piled up at once.  
   **[BREATHE]**
5. So I built one trusted assistant for that rush.  
   **[BREATHE]**
6. Tools do the numbers. RAG searches the SOPs.  
   **[BREATHE]**
7. Example: flour looks like 48 in the system — shelf is empty.  
   **[BREATHE]**
8. Outcome: faster morning decisions. Safer orders. Answers I can cite.

*(If they want more: “Happy to walk the flour morning next.”)*

---

## D. Demo story — phantom flour (follow-up)

| Beat | Say this | Point at |
|------|----------|----------|
| 1 | Morning NIS report: flour Item 10045. System 48. Shelf 0. | NIS / variance |
| 2 | That’s phantom inventory — BoH must be fixed. | Problem |
| 3 | Nancy asks the agent in English. | Agent |
| 4 | Doc search finds planogram, NIS rules, maybe recall. | Chroma / docs |
| 5 | Tools handle EOQ or safety stock if she asks how much. | EOQ / safety |
| 6 | Agent does not invent facts. Thin docs → “I don’t know.” | Grounding |
| 7 | She corrects BoH and writes a safer next step — with a cite. | Outcome |

---

## E. Tech cheat sheet (short answers)

| If they ask… | You say… |
|--------------|----------|
| Stack? | Python. LangChain agent. Ollama LLM. Chroma. Local embeddings. |
| Models? | Chat: llama3.1:8b. Embed: nomic-embed-text. |
| Tools? | Inventory lookup. EOQ. Safety stock. Doc search. |
| EOQ formula? | Square root of two D S over H. |
| Safety stock? | Z times demand std times square root of lead time. |
| Grounding? | Answer only from retrieved chunks. Else: I don’t know. |
| Ingest? | PDFs → chunk → embed → Chroma. Safe re-run skips old files. |
| Why local? | Ops data stays local. Cost control. Works offline-ish. |
| Real DeCA data? | Synthetic DeCA-style docs. Real commissary pain. Same pattern on real SOPs. |
| Why this project? | Morning rush: alerts + PDFs + math. One trusted assistant. |

---

## F. Soft landing phrases (when you stutter)

Use these instead of apologizing:

- “One second — I’ll restart that line.”
- “Short version: …”
- “The key point is …”
- “Next beat: …”

Never say “sorry I stutter.” Just pause and continue.

---

## G. Mock interview — your turn order

Interviewer asks **one** question.  
You answer with **2–4 short lines** from this card.  
Then wait for the next question.

Suggested answer length: under 45 seconds per follow-up. Open = Section C only (~60 seconds).
