# Architecture

## System Overview

```
                    ┌─────────────────────────────────┐
                    │         Claude Code Agent        │
                    │   (reads CLAUDE.md + modes/*.md) │
                    └──────────┬──────────────────────┘
                               │
            ┌──────────────────┼──────────────────────┐
            │                  │                       │
     ┌──────▼──────┐   ┌──────▼──────┐   ┌───────────▼────────┐
     │ Single Eval  │   │ Portal Scan │   │   Batch Process    │
     │ (auto-pipe)  │   │  (scan.md)  │   │   (batch-runner)   │
     └──────┬──────┘   └──────┬──────┘   └───────────┬────────┘
            │                  │                       │
            │           ┌──────▼──────┐          ┌────▼─────┐
            │           │ pipeline.md │          │ N workers│
            │           │ (URL inbox) │          │ (claude -p)
            │           └─────────────┘          └────┬─────┘
            │                                          │
     ┌──────▼──────────────────────────────────────────▼──────┐
     │                    Output Pipeline                      │
     │  ┌──────────┐  ┌────────────┐  ┌─────────┐  ┌──────┐ │
     │  │ Report.md│  │ Resume PDF │  │ Cover   │  │ TSV  │ │
     │  │ (A-F)    │  │ (Playwright)│  │ Letter  │  │      │ │
     │  └──────────┘  └────────────┘  └─────────┘  └──────┘ │
     └────────────────────────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  data/applications.md │
                    │  (canonical tracker)  │
                    └──────────────────────┘
```

## Evaluation Flow (Single Offer)

1. **Input**: User pastes JD text or URL
2. **Extract**: Playwright/WebFetch extracts JD from URL
3. **Classify**: Detect archetype from _shared.md table
4. **Evaluate**: 6 blocks (A–F): Summary, Match, Level, Comp, Resume Plan, Interview Prep
5. **Score**: Weighted average across 10 dimensions (1–5)
6. **Report**: Save as `reports/{num}-{company}-{date}.md`
7. **Resume PDF**: Generate ATS-optimized, keyword-injected PDF
8. **Cover Letter**: Generate personalized 4-paragraph letter
9. **Track**: Write TSV to `batch/tracker-additions/`, auto-merged

## Data Flow

```
cv.md                         →  Evaluation + PDF + Cover Letter context
article-digest.md             →  Proof points for matching
config/profile.yml            →  Candidate identity + targets
portals.yml                   →  Scanner configuration
templates/states.yml          →  Canonical status values
templates/cv-template.html    →  Resume PDF generation template
templates/cover-letter-template.html → Cover letter PDF template
```

## Pipeline Integrity

| Script | Purpose |
|--------|---------|
| `merge-tracker.mjs` | Merges batch TSV additions into applications.md |
| `verify-pipeline.mjs` | Health check: statuses, duplicates, links, formats |
| `dedup-tracker.mjs` | Removes duplicate entries by company+role |
| `normalize-statuses.mjs` | Maps status aliases to canonical values |
| `cv-sync-check.mjs` | Validates setup consistency |
