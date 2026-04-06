# Pipeline Mode

Process pending URLs from `data/pipeline.md`.

## Pipeline Format

```markdown
# Pending Offers

| URL | Source | Added | Status |
|-----|--------|-------|--------|
| https://... | scan | 2024-01-15 | pending |
```

## Workflow

1. Read `data/pipeline.md`
2. Filter for `pending` status entries
3. For each pending URL (or user-specified subset):
   a. Verify offer is still active (Playwright)
   b. If active: run auto-pipeline (evaluate + PDF + cover letter + tracker)
   c. If closed: mark as `closed` in pipeline.md
   d. If error: mark as `error` with note
4. Update pipeline.md status for each processed URL

## Processing Options

- **All**: Process all pending URLs
- **Next N**: Process next N pending URLs
- **Specific**: Process URLs matching a filter (company, source, date)

## Subagent Delegation

If 3+ URLs to process, delegate to a subagent:
```
Agent(
  subagent_type="general-purpose",
  prompt="[_shared.md]\n\n[pipeline.md]\n\nProcess these pending URLs: ..."
)
```

## Post-Processing

1. Run `node merge-tracker.mjs`
2. Present summary: processed, closed, errored, skipped
