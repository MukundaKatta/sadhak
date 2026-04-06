# Setup Guide

## Prerequisites

- Node.js >= 20
- Claude Code CLI installed
- (Optional) Playwright for PDF generation

## Installation

```bash
git clone <your-repo-url>
cd sadhak
npm install
npx playwright install chromium
```

## Configuration

### 1. Profile (required)

```bash
cp config/profile.example.yml config/profile.yml
```

Edit with your details: name, email, location, target roles, salary range.

### 2. CV (required)

Create `cv.md` in the project root with your CV in markdown format. Standard sections:
- Summary
- Work Experience
- Projects
- Education
- Skills

### 3. Portals (recommended)

```bash
cp templates/portals.example.yml portals.yml
```

Customize:
- `title_filter.positive` — keywords matching your target roles
- `title_filter.negative` — keywords to exclude
- `tracked_companies` — companies to scan directly
- `search_queries` — WebSearch queries for broad discovery

### 4. Proof Points (optional)

Create `article-digest.md` with your best achievements, case studies, and metrics. This dramatically improves evaluation quality and cover letter specificity.

## Auto-Onboarding

If you skip steps 1-3, just run `claude` in the project directory. Sadhak will detect missing files and walk you through setup interactively.

## Commands

| Command | Description |
|---------|-------------|
| `/sadhak` | Show all commands |
| `/sadhak {JD or URL}` | Full auto-pipeline |
| `/sadhak scan` | Scan portals |
| `/sadhak pdf` | Generate resume PDF |
| `/sadhak cover-letter` | Generate cover letter |
| `/sadhak tracker` | View applications |
| `/sadhak batch` | Batch process offers |

## Verification

```bash
node cv-sync-check.mjs       # Check setup
node verify-pipeline.mjs     # Check tracker integrity
```
