---
name: sadhak
description: "AI job search command center — evaluate offers, generate resumes, write cover letters, scan portals, track applications"
user_invocable: true
args: mode
---

# Sadhak — The Seeker

## Mode Routing

| Input | Mode | Files to Load |
|-------|------|---------------|
| (empty) | discovery | Show command menu |
| JD text or URL | auto-pipeline | _shared.md + auto-pipeline.md |
| `evaluate` | evaluate | _shared.md + evaluate.md |
| `pdf` | pdf | _shared.md + pdf.md |
| `cover-letter` | cover-letter | _shared.md + cover-letter.md |
| `scan` | scan | _shared.md + scan.md |
| `pipeline` | pipeline | _shared.md + pipeline.md |
| `batch` | batch | _shared.md + batch.md |
| `tracker` | tracker | tracker.md only |
| `apply` | apply | _shared.md + apply.md |
| `deep` | deep | deep.md only |
| `outreach` | outreach | _shared.md + outreach.md |

## Auto-Detection

If `{{mode}}` is not a known sub-command AND contains any of these signals, treat as auto-pipeline input:

**JD keywords:** `responsibilities`, `requirements`, `qualifications`, `about the role`, `we're looking for`, `you will`, `you'll`, `what you'll do`, `who you are`, `nice to have`, `must have`, `tech stack`

**URL patterns:** Contains `greenhouse.io`, `lever.co`, `ashbyhq.com`, `workable.com`, `jobs.`, `careers.`, `linkedin.com/jobs`, `indeed.com`, `wellfound.com`

## Discovery Mode (empty input)

When invoked with no arguments, display:

```
Sadhak — The Seeker

Available commands:

  /sadhak {paste JD or URL}  → Full pipeline (evaluate + resume + cover letter + track)
  /sadhak evaluate           → Evaluate a single offer
  /sadhak pdf                → Generate ATS-optimized resume PDF
  /sadhak cover-letter       → Generate personalized cover letter
  /sadhak scan               → Scan portals for new offers
  /sadhak pipeline           → Process pending URLs
  /sadhak batch              → Batch evaluate multiple offers
  /sadhak tracker            → View application status
  /sadhak apply              → Fill application forms with AI
  /sadhak deep               → Deep company research
  /sadhak outreach           → LinkedIn/email outreach messages

Or just paste a job URL or description — Sadhak auto-detects it.
```

## Context Loading

For modes that need shared context:
1. Read `modes/_shared.md`
2. Read `modes/{mode}.md`
3. Read `cv.md` (if evaluation/generation mode)
4. Read `config/profile.yml`

**Standalone modes** (tracker, deep): Read only `modes/{mode}.md`.

## Subagent Delegation

For long-running modes (scan, batch, pipeline with 3+ URLs, apply with Playwright):

```
Agent(
  subagent_type="general-purpose",
  prompt="[_shared.md content]\n\n[{mode}.md content]\n\n[invocation data]",
  description="sadhak {mode}"
)
```

This preserves main-thread context for interactive use.
