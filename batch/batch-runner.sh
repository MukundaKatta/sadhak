#!/usr/bin/env bash

# batch-runner.sh — Orchestrate parallel batch evaluations
#
# Usage:
#   bash batch/batch-runner.sh [options]
#
# Options:
#   --dry-run        Preview without executing
#   --retry-failed   Retry failed evaluations
#   --start-from N   Resume from specific ID
#   --parallel N     Number of concurrent workers (default: 3)
#   --max-retries N  Max retries per offer (default: 2)

set -euo pipefail

PARALLEL=3
MAX_RETRIES=2
DRY_RUN=false
RETRY_FAILED=false
START_FROM=0
INPUT_FILE="batch/batch-input.tsv"
STATE_FILE="batch/batch-state.tsv"
LOCK_FILE="batch/.lock"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift ;;
    --retry-failed) RETRY_FAILED=true; shift ;;
    --start-from) START_FROM=$2; shift 2 ;;
    --parallel) PARALLEL=$2; shift 2 ;;
    --max-retries) MAX_RETRIES=$2; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# Lock file check
if [[ -f "$LOCK_FILE" ]]; then
  echo "Another batch is running (lock file exists: $LOCK_FILE)"
  echo "If this is stale, remove it manually: rm $LOCK_FILE"
  exit 1
fi

# Create lock
if [[ "$DRY_RUN" == "false" ]]; then
  echo "$$" > "$LOCK_FILE"
  trap "rm -f $LOCK_FILE" EXIT
fi

# Check input file
if [[ ! -f "$INPUT_FILE" ]]; then
  echo "No input file found: $INPUT_FILE"
  echo "Create it with format: id<TAB>url<TAB>source"
  exit 1
fi

# Initialize state file if needed
if [[ ! -f "$STATE_FILE" ]]; then
  echo -e "id\turl\tstatus\tstarted_at\tcompleted_at\treport_num\tscore\terror\tretries" > "$STATE_FILE"
fi

echo "Sadhak Batch Runner"
echo "==================="
echo "Parallel workers: $PARALLEL"
echo "Max retries: $MAX_RETRIES"
echo "Dry run: $DRY_RUN"
echo ""

# Count pending
TOTAL=$(wc -l < "$INPUT_FILE" | tr -d ' ')
echo "Total offers: $TOTAL"

if [[ "$DRY_RUN" == "true" ]]; then
  echo "(Dry run — no evaluations will be executed)"
  cat "$INPUT_FILE"
  exit 0
fi

# Process offers
RUNNING=0
COMPLETED=0
FAILED=0

while IFS=$'\t' read -r id url source; do
  # Skip header
  [[ "$id" == "id" ]] && continue

  # Skip if before start-from
  [[ "$id" -lt "$START_FROM" ]] && continue

  # Check if already completed in state file
  if grep -q "^${id}\t.*\tcompleted\t" "$STATE_FILE" 2>/dev/null && [[ "$RETRY_FAILED" == "false" ]]; then
    echo "Skipping #$id (already completed)"
    continue
  fi

  echo "Processing #$id: $url"

  # Record start
  echo -e "${id}\t${url}\trunning\t$(date -Iseconds)\t\t\t\t\t0" >> "$STATE_FILE"

  # Run worker
  if claude -p --dangerously-skip-permissions \
    --append-system-prompt-file batch/batch-prompt.md \
    <<< "Evaluate this job offer: $url" \
    > "batch/logs/${id}.log" 2>&1; then
    COMPLETED=$((COMPLETED + 1))
    echo "  Completed #$id"
  else
    FAILED=$((FAILED + 1))
    echo "  Failed #$id"
  fi

done < "$INPUT_FILE"

echo ""
echo "Batch complete: $COMPLETED completed, $FAILED failed"

# Merge results
if [[ $COMPLETED -gt 0 ]]; then
  echo "Merging tracker additions..."
  node merge-tracker.mjs
fi

echo "Done."
