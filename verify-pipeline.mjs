#!/usr/bin/env node

/**
 * verify-pipeline.mjs — Health check for pipeline integrity
 *
 * Checks:
 * 1. All statuses are canonical
 * 2. No duplicate company+role entries
 * 3. All report links point to existing files
 * 4. Score format is valid
 * 5. All rows have correct column count
 * 6. No pending TSVs in tracker-additions (only in merged/)
 * 7. No markdown bold in score/status cells
 *
 * Exit code 0 = clean, 1 = errors found
 */

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const TRACKER_PATH = existsSync('data/applications.md')
  ? 'data/applications.md'
  : 'applications.md';

const VALID_STATUSES = [
  'Evaluated', 'Applied', 'Responded', 'Interview',
  'Offer', 'Rejected', 'Discarded', 'SKIP',
];

let errors = 0;
let warnings = 0;

function pass(msg) { console.log(`  \x1b[32m✓\x1b[0m ${msg}`); }
function fail(msg) { console.log(`  \x1b[31m✗\x1b[0m ${msg}`); errors++; }
function warn(msg) { console.log(`  \x1b[33m!\x1b[0m ${msg}`); warnings++; }

async function main() {
  console.log('Pipeline Health Check\n');

  if (!existsSync(TRACKER_PATH)) {
    fail(`Tracker not found: ${TRACKER_PATH}`);
    process.exit(1);
  }

  const content = await readFile(TRACKER_PATH, 'utf-8');
  const lines = content.split('\n');

  const sepIndex = lines.findIndex(l => /^\|[-\s|]+\|$/.test(l));
  if (sepIndex === -1) {
    fail('Could not find tracker table header separator');
    process.exit(1);
  }

  const dataLines = [];
  for (let i = sepIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && line.startsWith('|')) {
      dataLines.push({ line, lineNum: i + 1 });
    }
  }

  console.log(`Found ${dataLines.length} tracker entries.\n`);

  // Check 1: Canonical statuses
  console.log('1. Status validation');
  let statusErrors = 0;
  for (const { line, lineNum } of dataLines) {
    const cols = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length >= 6) {
      const status = cols[5].replace(/\*\*/g, '');
      if (!VALID_STATUSES.includes(status)) {
        fail(`Line ${lineNum}: Invalid status "${status}"`);
        statusErrors++;
      }
    }
  }
  if (statusErrors === 0) pass('All statuses are canonical');

  // Check 2: Duplicates
  console.log('\n2. Duplicate detection');
  const seen = new Map();
  let dupCount = 0;
  for (const { line, lineNum } of dataLines) {
    const cols = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length >= 4) {
      const key = `${cols[2].toLowerCase().replace(/[^a-z0-9]/g, '')}::${cols[3].toLowerCase()}`;
      if (seen.has(key)) {
        fail(`Line ${lineNum}: Duplicate of line ${seen.get(key)} — ${cols[2]} / ${cols[3]}`);
        dupCount++;
      } else {
        seen.set(key, lineNum);
      }
    }
  }
  if (dupCount === 0) pass('No duplicate entries');

  // Check 3: Report links
  console.log('\n3. Report link validation');
  let brokenLinks = 0;
  for (const { line, lineNum } of dataLines) {
    const match = line.match(/\[.*?\]\((reports\/[^)]+)\)/);
    if (match) {
      if (!existsSync(match[1])) {
        fail(`Line ${lineNum}: Report not found — ${match[1]}`);
        brokenLinks++;
      }
    }
  }
  if (brokenLinks === 0) pass('All report links valid');

  // Check 4: Score format
  console.log('\n4. Score format validation');
  let scoreErrors = 0;
  for (const { line, lineNum } of dataLines) {
    const cols = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length >= 5) {
      const score = cols[4].replace(/\*\*/g, '').trim();
      if (!/^\d+\.?\d*\/5$/.test(score) && score !== 'N/A' && score !== 'DUP') {
        fail(`Line ${lineNum}: Invalid score format "${score}"`);
        scoreErrors++;
      }
    }
  }
  if (scoreErrors === 0) pass('All scores are valid');

  // Check 5: Column count
  console.log('\n5. Column count validation');
  let colErrors = 0;
  for (const { line, lineNum } of dataLines) {
    const cols = line.split('|').filter(Boolean);
    if (cols.length < 9) {
      warn(`Line ${lineNum}: Only ${cols.length} columns (expected 9)`);
      colErrors++;
    }
  }
  if (colErrors === 0) pass('All rows have correct column count');

  // Check 6: Pending TSVs
  console.log('\n6. Pending TSV check');
  const additionsDir = 'batch/tracker-additions';
  if (existsSync(additionsDir)) {
    const files = (await readdir(additionsDir)).filter(f => f.endsWith('.tsv'));
    if (files.length > 0) {
      warn(`${files.length} pending TSV(s) — run "node merge-tracker.mjs" to merge`);
    } else {
      pass('No pending TSVs');
    }
  } else {
    pass('No pending TSVs');
  }

  // Check 7: Markdown bold in cells
  console.log('\n7. Markdown formatting check');
  let boldErrors = 0;
  for (const { line, lineNum } of dataLines) {
    const cols = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length >= 6) {
      if (cols[4].includes('**') || cols[5].includes('**')) {
        fail(`Line ${lineNum}: Markdown bold in score/status cells`);
        boldErrors++;
      }
    }
  }
  if (boldErrors === 0) pass('No markdown bold in score/status cells');

  // Summary
  console.log(`\n${'—'.repeat(40)}`);
  if (errors > 0) {
    console.log(`\x1b[31m${errors} error(s)\x1b[0m, ${warnings} warning(s)`);
    process.exit(1);
  } else if (warnings > 0) {
    console.log(`\x1b[32m0 errors\x1b[0m, \x1b[33m${warnings} warning(s)\x1b[0m`);
  } else {
    console.log('\x1b[32mAll checks passed!\x1b[0m');
  }
}

main().catch(err => {
  console.error('Verification failed:', err.message);
  process.exit(1);
});
