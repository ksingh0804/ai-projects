---
title: SiteFlow Agent Guide
type: source
tags: [siteflow, autodesk, capstone]
created: 2026-09-26
updated: 2026-09-26
---

# SiteFlow Agent Guide

Immutable copy: `raw/sources/Project3_SiteFlow_Agent_Guide.pdf`.

## What it asks for

Project 3 of a job-ready sprint. A construction assistant called SiteFlow on top of the logistics RAG project. React UI, FastAPI, LangGraph supervisor with spec, materials, and risk agents, human approval, and an AWS story (S3, optional Bedrock, optional DynamoDB). Local mode must work with no AWS account. The frontend may not call S3 or LangGraph directly.

The guide's own build order is seven days. The definition of done is a thin vertical slice: upload, chat, citations, approval, local mode, an S3 interface, 12 eval questions, and the ability to answer the interview prompts in the guide.

## How this workspace used it

The reference slice lives in `projects/siteflow/`. The study plan is `projects/siteflow/docs/three-day-plan.md`. Formulas are reused from the logistics agent. AWS calls are not made from tests.
