# Logistics RAG Agent — Business flow diagrams

These Mermaid (`.mmd`) diagrams tell a **real ops story**: Nancy, an inventory & replenishment lead, uses the logistics RAG agent across a workday.

## Files

| File | Use in interview |
|------|------------------|
| `system-architecture.mmd` | How the system works: CLI → agent/RAG → tools → Chroma/CSV |
| `nancy-day-business-flow.mmd` | Full business day: alert → tools → decision → PO |
| `nancy-interview-speaking-beats.mmd` | Short speaking beats with deliberate pauses (stammer-friendly) |
| `agent-tool-routing.mmd` | How the agent picks inventory / EOQ / safety stock / docs |

## Color + shape legend (color-blind safe)

Okabe–Ito palette. **Never rely on color alone** — every node has a letter tag.

| Tag | Role | Color | Typical shape |
|-----|------|-------|---------------|
| `[U]` / `[N]` | User / Nancy | Blue `#0072B2` | Stadium / rounded |
| `[A]` | Agent / prompts / loop | Orange `#E69F00` | Hex / rounded |
| `[T]` / `[S]` | Tools / systems | Sky `#56B4E9` | Rectangle |
| `[D]` | Data stores | Green `#009E73` | Rectangle |
| `[M]` | Models (LLM / embeddings) | Purple `#CC79A7` | Rounded |
| `[I]` | Ingest pipeline | Vermillion `#D55E00` | Rectangle |
| `[?]` | Decision / mode | Yellow `#F0E442` | Diamond |
| `[=]` | Outcome | Purple `#CC79A7` | Stadium |

## Open in a browser

Use the local `openmmd` tool:

```bash
/Users/ilkay1/ai-software/mermaid/bin/openmmd \
  /Users/ilkay1/desktop/logistics-rag-agent/docs/nancy-day-business-flow.mmd
```

Or from this folder:

```bash
openmmd nancy-interview-speaking-beats.mmd
```

(if `openmmd` is on your `PATH` — see `/Users/ilkay1/ai-software/mermaid/README.md`)

## One-sentence pitch (memorize)

> I built it because DeCA-style work piles alerts, PDFs, and math at once — I wanted one trusted assistant for that morning rush.

Cue card (60s open + phantom-flour demo): `docs/deca-interview-cue-card.md`

Locked story PDF:

```bash
python docs/build_locked_interview_story_pdf.py
```

Output: `docs/locked-interview-story.pdf`

## Interview PDF (Nancy + mock Q&A)

Stammer-friendly speaking guide with DeCA scenario and 12 Q&A beats:

```bash
python docs/build_nancy_interview_pdf.py
```

Output: `docs/nancy-mock-interview-qa.pdf`  
Cue card (markdown): `docs/deca-interview-cue-card.md`
