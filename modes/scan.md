# Scan Mode

Portal discovery mode. Designed to run as a subagent for long-running scans.

## Three-Level Discovery

### Level 1: Playwright (Most Reliable)
Direct navigation to `careers_url` of each company in `tracked_companies`.
- Works with SPAs (React/Next.js career pages)
- Real-time, no Google cache lag
- Run in batches of 3–5 companies (never parallel Playwright)

### Level 2: Greenhouse API (Fast)
JSON endpoint: `boards-api.greenhouse.io/v1/boards/{slug}/jobs`
- Only for companies with `api` field in portals.yml
- Faster than Playwright but Greenhouse-only

### Level 3: WebSearch (Broad Discovery)
`site:` queries across Ashby, Greenhouse, Lever, Wellfound, Workable.
- Finds companies not yet in `tracked_companies`
- Results may be stale (Google cache)
- Use to expand your tracked companies list

## Workflow

1. **Read config**: Load `portals.yml` (title_filter, search_queries, tracked_companies)
2. **Read history**: Load `data/scan-history.tsv` for dedup
3. **Read dedup sources**: Load `data/applications.md` and `data/pipeline.md`
4. **Level 1**: Playwright scan of enabled `tracked_companies`
5. **Level 2**: Greenhouse API scan for companies with `api` field
6. **Level 3**: WebSearch with enabled `search_queries`
7. **Filter**: Apply `title_filter.positive` and `title_filter.negative` keywords
8. **Deduplicate** against: scan-history.tsv, applications.md, pipeline.md
9. **Add new offers** to `data/pipeline.md`
10. **Log results** to `data/scan-history.tsv`

## Title Extraction

Regex for common ATS title formats:
```
(.+?)(?:\s*[@|—–-]\s*|\s+at\s+)(.+?)$
```
Handles: "Software Engineer at Anthropic", "ML Engineer — OpenAI", "Backend Dev | Stripe"

## Scan History TSV Schema

```
url\tfirst_seen\tportal\ttitle\tcompany\tstatus
```

Status values: `added`, `skipped_title`, `skipped_dup`

## Careers URL Patterns

| ATS | Pattern |
|-----|---------|
| Ashby | `jobs.ashbyhq.com/{slug}` |
| Greenhouse | `job-boards.greenhouse.io/{slug}` or `boards.greenhouse.io/{slug}` |
| Lever | `jobs.lever.co/{slug}` |
| Workable | `apply.workable.com/{slug}` |
| Custom | Company's own careers page |

If a company's `careers_url` is missing, attempt to discover it and save back to `portals.yml`.

## Output

Present summary to user:
- New offers found (count + list)
- Offers skipped (title filter / duplicate)
- Companies scanned vs. errors
- Suggested next: process pipeline or evaluate specific offers
