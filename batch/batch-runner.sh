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
LOG_DIR="batch/logs"
TRACKER_ADDITIONS="batch/tracker-additions"

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

# --- Stale lock detection ---
if [[ -f "$LOCK_FILE" ]]; then
  LOCK_PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
  if [[ -n "$LOCK_PID" ]] && kill -0 "$LOCK_PID" 2>/dev/null; then
    echo "Another batch is running (PID $LOCK_PID, lock: $LOCK_FILE)"
    exit 1
  else
    echo "Removing stale lock file (PID $LOCK_PID no longer running)"
    rm -f "$LOCK_FILE"
  fi
fi

# Create lock
if [[ "$DRY_RUN" == "false" ]]; then
  echo "$$" > "$LOCK_FILE"
  trap 'rm -f "$LOCK_FILE"; wait' EXIT
fi

# Check input file
if [[ ! -f "$INPUT_FILE" ]]; then
  echo "No input file found: $INPUT_FILE"
  echo "Create it with format: id<TAB>url<TAB>source"
  exit 1
fi

# Ensure directories exist
mkdir -p "$LOG_DIR" "$TRACKER_ADDITIONS" reports output

# Initialize state file if needed
if [[ ! -f "$STATE_FILE" ]]; then
  printf 'id\turl\tstatus\tstarted_at\tcompleted_at\treport_num\tscore\terror\tretries\n' > "$STATE_FILE"
fi

# --- Next report number calculation ---
next_report_num() {
  local max_num=0
  # Check existing reports
  for f in reports/[0-9]*-*.md; do
    [[ -f "$f" ]] || continue
    local num="${f#reports/}"
    num="${num%%-*}"
    num=$((10#$num))  # Remove leading zeros
    [[ $num -gt $max_num ]] && max_num=$num
  done
  # Check pending TSV additions
  for f in "$TRACKER_ADDITIONS"/[0-9]*-*.tsv; do
    [[ -f "$f" ]] || continue
    local num="${f##*/}"
    num="${num%%-*}"
    num=$((10#$num))
    [[ $num -gt $max_num ]] && max_num=$num
  done
  echo $((max_num + 1))
}

# --- Worker function ---
run_worker() {
  local id="$1"
  local url="$2"
  local report_num="$3"
  local padded
  padded=$(printf '%03d' "$report_num")
  local retries=0
  local success=false

  while [[ $retries -lt $MAX_RETRIES ]]; do
    # Build prompt with report number injected
    local worker_prompt
    worker_prompt="Evaluate this job offer. Report number: ${padded}. URL: ${url}"

    if claude -p --dangerously-skip-permissions \
      --append-system-prompt-file batch/batch-prompt.md \
      <<< "$worker_prompt" \
      > "$LOG_DIR/${id}.log" 2>&1; then
      success=true
      break
    fi
    retries=$((retries + 1))
    echo "  Retry $retries/$MAX_RETRIES for #$id"
    sleep 2
  done

  # Extract score from log if possible
  local score=""
  if [[ -f "$LOG_DIR/${id}.log" ]]; then
    score=$(grep -oP '\d\.\d/5' "$LOG_DIR/${id}.log" | tail -1 || echo "")
  fi

  # Update state
  local status_val
  if $success; then
    status_val="completed"
  else
    status_val="failed"
  fi
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t\t%s\n' \
    "$id" "$url" "$status_val" "" "$(date -Iseconds)" "$padded" "$score" "$retries" >> "$STATE_FILE"

  $success && return 0 || return 1
}

echo "Sadhak Batch Runner"
echo "==================="
echo "Parallel workers: $PARALLEL"
echo "Max retries: $MAX_RETRIES"
echo "Dry run: $DRY_RUN"
echo ""

# Count pending (excluding header)
TOTAL=$(tail -n +2 "$INPUT_FILE" | wc -l | tr -d ' ')
echo "Total offers: $TOTAL"

if [[ "$DRY_RUN" == "true" ]]; then
  echo "(Dry run — no evaluations will be executed)"
  cat "$INPUT_FILE"
  exit 0
fi

# Process offers with parallel job control
RUNNING=0
COMPLETED=0
FAILED=0
PIDS=()
IDS=()

REPORT_NUM=$(next_report_num)

while IFS=$'\t' read -r id url source; do
  # Skip header
  [[ "$id" == "id" ]] && continue

  # Skip if before start-from
  [[ "$id" -lt "$START_FROM" ]] && continue

  # Check if already completed in state file
  if grep -q "^${id}	.*	completed	" "$STATE_FILE" 2>/dev/null; then
    if [[ "$RETRY_FAILED" == "false" ]]; then
      echo "Skipping #$id (already completed)"
      continue
    fi
  fi

  # Check if failed and not retrying
  if grep -q "^${id}	.*	failed	" "$STATE_FILE" 2>/dev/null && [[ "$RETRY_FAILED" == "false" ]]; then
    echo "Skipping #$id (previously failed, use --retry-failed)"
    continue
  fi

  echo "Processing #$id: $url (report ${REPORT_NUM})"

  # Launch worker in background
  run_worker "$id" "$url" "$REPORT_NUM" &
  PIDS+=($!)
  IDS+=("$id")
  REPORT_NUM=$((REPORT_NUM + 1))
  RUNNING=$((RUNNING + 1))

  # Wait when at capacity
  if [[ $RUNNING -ge $PARALLEL ]]; then
    # Wait for any one job to finish
    for i in "${!PIDS[@]}"; do
      if ! kill -0 "${PIDS[$i]}" 2>/dev/null; then
        wait "${PIDS[$i]}" && COMPLETED=$((COMPLETED + 1)) || FAILED=$((FAILED + 1))
        echo "  Finished #${IDS[$i]}"
        unset 'PIDS[i]' 'IDS[i]'
        RUNNING=$((RUNNING - 1))
        break
      fi
    done
    # Compact arrays
    PIDS=("${PIDS[@]}")
    IDS=("${IDS[@]}")
    # Brief pause before checking again
    [[ $RUNNING -ge $PARALLEL ]] && sleep 1
  fi

done < "$INPUT_FILE"

# Wait for remaining workers
for i in "${!PIDS[@]}"; do
  wait "${PIDS[$i]}" && COMPLETED=$((COMPLETED + 1)) || FAILED=$((FAILED + 1))
  echo "  Finished #${IDS[$i]}"
done

echo ""
echo "Batch complete: $COMPLETED completed, $FAILED failed out of $TOTAL"

# Post-batch: merge and verify
if [[ $COMPLETED -gt 0 ]]; then
  echo ""
  echo "Merging tracker additions..."
  node merge-tracker.mjs

  echo "Running pipeline health check..."
  node verify-pipeline.mjs
fi

echo "Done."
