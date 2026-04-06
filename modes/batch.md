# Batch Mode

Two-mode batch processor for high-volume offer evaluation.

## Architecture

A "conductor" Claude instance orchestrates independent `claude -p` worker processes, each with a clean 200K-token context.

## Mode A: Conductor with Chrome

1. Read `batch/batch-state.tsv` for resumability
2. Navigate live portal in Chrome, read DOM for JD text
3. Save JD to `/tmp/batch-jd-{id}.txt`
4. Spawn worker:
   ```bash
   claude -p --dangerously-skip-permissions \
     --append-system-prompt-file batch/batch-prompt.md \
     < /tmp/batch-jd-{id}.txt
   ```
5. Update state TSV after each result
6. Handle pagination automatically

## Mode B: Standalone Script

```bash
bash batch/batch-runner.sh [options]
```

Options:
- `--dry-run` — Preview without executing
- `--retry-failed` — Retry failed evaluations
- `--start-from N` — Resume from specific ID
- `--parallel N` — Number of concurrent workers (default: 3)
- `--max-retries N` — Max retries per offer (default: 2)

## batch-state.tsv Schema

```
id\turl\tstatus\tstarted_at\tcompleted_at\treport_num\tscore\terror\tretries
```

## Resumability

- Skip completed offers on re-run
- Lock file prevents double execution
- Each worker is independent (no shared state)

## Worker Output

Each worker produces:
- Report `.md` in `reports/`
- Resume PDF in `output/`
- Cover letter in `output/`
- Tracker TSV in `batch/tracker-additions/{id}.tsv`
- JSON result on stdout

## Error Recovery

| Error | Recovery |
|-------|----------|
| URL inaccessible | Mark `error`, skip, notify user |
| JD behind login | Save URL, mark `login_required` |
| Portal layout changed | Fallback to WebFetch, warn user |
| Worker crash | Retry up to max-retries |
| Conductor death | Resume from batch-state.tsv |
| PDF failure | Complete evaluation without PDF, flag in tracker |

## Post-Batch

After all workers complete:
1. Run `node merge-tracker.mjs` to merge all TSVs
2. Run `node verify-pipeline.mjs` to health-check
3. Present summary: completed, failed, skipped, average score
