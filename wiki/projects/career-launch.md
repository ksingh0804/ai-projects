---
title: Career Launch — Bay Area junior interview playbook
type: project
tags: [careers, interviews, bay-area, software-engineer, ai-engineer, data-engineer, data-scientist]
created: 2026-07-11
updated: 2026-09-27
---

# Career Launch

Job-search prep for **Kaustubh Singh** (East Bay). The asset in this tree is a printable interview playbook for junior **software engineer**, **AI engineer**, **data engineer**, and **data scientist** roles in the San Francisco Bay Area.

Project path: `projects/career-launch/`

## Contents

| Asset | Path |
|-------|------|
| Playbook PDF | `interview-playbook/Bay-Area-Junior-Interview-Playbook.pdf` |
| Source | `interview-playbook/playbook.html` |
| Rebuild | `python3 interview-playbook/build_pdf.py` (needs WeasyPrint) |

Earlier resume, LinkedIn, and Travis AFB notes were removed from the tree before this playbook. Do not link to those paths as if they are still present.

## How the playbook is organized

Recruiter screens and interviewer loops are separate parts. Recruiter answers stay short: motivation, work authorization, East Bay hybrid logistics, and a total-compensation range. Interviewer answers use STAR-style stories plus a production example.

First-person examples are only the projects that are actually in this repo:

- [RAG Logistics Agent](rag-logistics-agent.md) — tool calling, SOP grounding, refusal, flour 48 vs empty shelf
- [Loan Defaulter](loan-defaulter.md) — 307,511 applications, 8.07% default, dummy ~92% accuracy with zero default recall
- [Steady](steady-voice.md) — private browser practice, no accounts, Echo headphone constraint

Scenarios marked **production pattern** in the PDF are industry-shaped (idempotent loads, checkout experiments, metric drops). They are for “here is how I would build it,” not invented employment.

Research notes: [Bay Area junior interviews, 2026](../sources/bay-area-junior-interviews-2026.md).

## Related

- [RAG Logistics Agent](rag-logistics-agent.md)
- [Loan Defaulter](loan-defaulter.md)
- [Steady](steady-voice.md)
