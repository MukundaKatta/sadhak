# Sadhak — The Seeker

> AI-powered job search pipeline built on Claude Code. Evaluate offers, generate tailored resumes, write cover letters, scan portals, and track everything — powered by AI agents.

**Sadhak** (Sanskrit: साधक) means "The Seeker" — one who strives towards a goal with dedication and discipline.

![Claude Code](https://img.shields.io/badge/Claude_Code-000?style=flat&logo=anthropic&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat&logo=playwright&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

---

## What Is This

Sadhak turns Claude Code into a full job search command center. Instead of manually tracking applications in a spreadsheet, you get an AI-powered pipeline that:

- **Evaluates offers** with a structured 10-dimension scoring system (1–5 scale)
- **Generates tailored resume PDFs** — ATS-optimized, keyword-injected per job description
- **Writes cover letters** — personalized, proof-led, never generic
- **Scans portals** automatically (Greenhouse, Ashby, Lever, company pages)
- **Processes in batch** — evaluate 10+ offers in parallel with sub-agents
- **Tracks everything** in a single source of truth with integrity checks

> **Important: This is NOT a spray-and-pray tool.** Sadhak is a filter — it helps you find the few offers worth your time out of hundreds. The system strongly recommends against applying to anything scoring below 4.0/5.

Sadhak is agentic: Claude Code navigates career pages with Playwright, evaluates fit by reasoning about your CV vs the job description, and adapts your resume and cover letter per listing.

Inspired by [career-ops](https://github.com/santifer/career-ops) by Santiago Fernandez.

## Features

| Feature | Description |
|---------|-------------|
| **Auto-Pipeline** | Paste a URL, get evaluation + resume PDF + cover letter + tracker entry |
| **10-Dimension Scoring** | Role fit, tech match, level, comp, location, stage, growth, culture, brand, effort |
| **Resume Tailoring** | ATS-optimized PDFs with JD keywords injected into your real experience |
| **Cover Letters** | 4-paragraph structure: hook, proof, bridge, close — never generic |
| **Interview Prep** | STAR+R stories mapped to likely questions, accumulated in a story bank |
| **Portal Scanner** | Pre-configured companies + search queries across Ashby, Greenhouse, Lever |
| **Batch Processing** | Parallel evaluation with `claude -p` workers |
| **Application Forms** | AI fills forms using your evaluation data — you review and submit |
| **Pipeline Integrity** | Automated merge, dedup, status normalization, health checks |
| **Fully Customizable** | Ask Claude to change archetypes, templates, scoring, companies — it edits itself |

## Quick Start

```bash
# 1. Clone and install
git clone <your-repo-url>
cd sadhak && npm install
npx playwright install chromium   # Required for PDF generation

# 2. Configure
cp config/profile.example.yml config/profile.yml  # Edit with your details
cp templates/portals.example.yml portals.yml       # Customize companies

# 3. Add your CV
# Create cv.md in the project root with your CV in markdown

# 4. Start using with Claude Code
claude   # Open Claude Code in this directory

# Paste a job URL or run /sadhak to see all commands
```

Or skip steps 2-3 — just run `claude` and Sadhak will walk you through onboarding.

## Usage

```
/sadhak                    → Show all available commands
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
```

Or just paste a job URL or description — Sadhak auto-detects it and runs the full pipeline.

## How It Works

```
You paste a job URL or description
        │
        ▼
┌──────────────────┐
│  Archetype       │  Classifies role against your target archetypes
│  Detection       │
└────────┬─────────┘
         │
┌────────▼─────────┐
│  A-F Evaluation   │  Match, gaps, comp research, STAR stories
│  (reads cv.md)    │
└────────┬─────────┘
         │
    ┌────┼────┬────┐
    ▼    ▼    ▼    ▼
 Report  PDF  Cover  Tracker
  .md   .pdf  Letter  .tsv
```

## Project Structure

```
sadhak/
├── CLAUDE.md                    # Agent instructions
├── cv.md                        # Your CV (create this)
├── article-digest.md            # Your proof points (optional)
├── config/
│   └── profile.example.yml      # Template for your profile
├── modes/                       # 11 skill modes
│   ├── _shared.md               # Shared context (customize this)
│   ├── auto-pipeline.md         # Full auto pipeline
│   ├── evaluate.md              # Structured evaluation
│   ├── pdf.md                   # Resume PDF generation
│   ├── cover-letter.md          # Cover letter generation
│   ├── scan.md                  # Portal scanner
│   ├── pipeline.md              # Pending URL processor
│   ├── batch.md                 # Batch processing
│   ├── tracker.md               # Application tracking
│   ├── apply.md                 # Form filling assistant
│   ├── deep.md                  # Company research
│   └── outreach.md              # LinkedIn/email outreach
├── templates/
│   ├── cv-template.html         # ATS-optimized resume template
│   ├── cover-letter-template.html # Cover letter template
│   ├── portals.example.yml      # Scanner config template
│   └── states.yml               # Canonical statuses
├── batch/
│   ├── batch-prompt.md          # Self-contained worker prompt
│   └── batch-runner.sh          # Orchestrator script
├── interview-prep/
│   └── story-bank.md            # STAR+R stories (grows over time)
├── data/                        # Your tracking data
├── reports/                     # Evaluation reports
├── output/                      # Generated PDFs
├── jds/                         # Saved job descriptions
├── fonts/                       # Space Grotesk + DM Sans
├── docs/                        # Setup, architecture docs
└── examples/                    # Sample files
```

## Verification Commands

```bash
node cv-sync-check.mjs       # Check setup is complete
node verify-pipeline.mjs     # Health check tracker integrity
node merge-tracker.mjs        # Merge batch additions into tracker
node normalize-statuses.mjs   # Normalize status aliases
node dedup-tracker.mjs        # Remove duplicate entries
```

## Customization

Everything is designed to be edited by Claude:

- **Target roles**: Edit `modes/_shared.md` archetype table
- **Companies**: Edit `portals.yml` tracked companies and search queries
- **Resume design**: Edit `templates/cv-template.html`
- **Cover letter style**: Edit `templates/cover-letter.md` mode
- **Scoring weights**: Edit `modes/evaluate.md` scoring table
- **Profile**: Edit `config/profile.yml`

Just tell Claude what you want to change — it reads these files and knows what to edit.

## License

MIT
