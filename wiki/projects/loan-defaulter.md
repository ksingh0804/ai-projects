---
title: Loan Defaulter
type: project
tags: [credit-risk, machine-learning, imbalanced-classification, home-credit]
created: 2026-09-08
updated: 2026-09-08
---

# Loan Defaulter

Home Credit **probability of default (PD)** analysis: EDA on ~307k applications, then a leakage-safe sklearn pipeline with real underwriting features.

Also published as a standalone repo: [ksingh0804/Loan-Defaulter](https://github.com/ksingh0804/Loan-Defaulter).

## Path

`projects/loan-defaulter/`

## Highlights

- Business framing: false approve vs false reject; accuracy is the wrong headline (~92% majority baseline)
- Keeps `EXT_SOURCE_2/3`; handles `DAYS_EMPLOYED == 365243` sentinel
- Features: annuity/income, credit/income, credit/goods; education; occupation; gender in EDA only
- Models: dummy, logistic (unweighted / class_weight / oversample), histogram gradient boosting
- Metrics: ROC-AUC, PR-AUC, KS, Gini + cost-weighted threshold

## Run

Place Kaggle `application_data.csv` next to the notebook, then open `Loan Defaulter Analysis.ipynb`.

## Related

- [rag-logistics-agent](rag-logistics-agent.md) — separate logistics RAG portfolio piece
