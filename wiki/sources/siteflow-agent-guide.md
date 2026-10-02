---
title: SiteFlow Agent Guide
type: source
tags: [siteflow, autodesk, langgraph, interview]
created: 2026-10-02
updated: 2026-10-02
---

# SiteFlow Agent Guide

Immutable copy: `raw/sources/Project3_SiteFlow_Agent_Guide.pdf`.

## What it is

Capstone brief for a construction project-controls assistant: React + FastAPI + LangGraph + optional AWS. It builds on the logistics RAG project (EOQ, safety stock, grounded retrieval) and is aimed at Autodesk Construction Cloud / AI platform interviews.

## Product

One job. Upload specs, RFIs, and a materials CSV. A supervisor routes to a spec/RAG agent, a materials agent, or a risk agent. Recommendations that change spend or schedule pause for Approve / Reject. The browser talks only to FastAPI.

## Build order in the brief

Local health and Project 2 formulas, then the graph, then the React UI, then S3, then a 12-question hand eval. Kubernetes, Forge credentials, and unsupervised write-back are out of scope.

## Related

- [SiteFlow](../projects/siteflow.md) — mentor course that implements this brief as lessons
- [RAG Logistics Agent](../projects/rag-logistics-agent.md) — source of the EOQ and safety-stock formulas
