#!/usr/bin/env node

/**
 * merge-tracker.mjs — Merge TSV additions into applications.md
 *
 * Reads TSV files from batch/tracker-additions/
 * Merges into data/applications.md with dedup and update-in-place
 *
 * Usage:
 *   node merge-tracker.mjs [--dry-run] [--verify]
 */

import { readdir, readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { existsSync } from 'node:fs';

const DRY_RUN = process.argv.includes('--dry-run');
const VERIFY = process.argv.includes('--verify');

const TRACKER_PATH = existsSync('data/applications.md')
  ? 'data/applications.md'
  : 'applications.md';

const ADDITIONS_DIR = 'batch/tracker-additions';
const MERGED_DIR = join(ADDITIONS_DIR, 'merged');

// Canonical statuses
const VALID_STATUSES = [
  'Evaluated', 'Applied', 'Responded', 'Interview',
  'Offer', 'Rejected', 'Discarded', 'SKIP',
];

const STATUS_ALIASES = {
  'eval': 'Evaluated', 'reviewed': 'Evaluated',
  'submitted': 'Applied', 'sent': 'Applied',
  'reply': 'Responded', 'replied': 'Responded',
  'interviewing': 'Interview', 'phone screen': 'Interview',
  'technical': 'Interview', 'onsite': 'Interview',
  'offered': 'Offer',
  'declined by company': 'Rejected', 'no': 'Rejected',
  'withdrawn': 'Discarded', 'closed': 'Discarded', 'expired': 'Discarded',
  'no apply': 'SKIP', 'pass': 'SKIP',
};

function validateStatus(raw) {
  const trimmed = raw.trim().replace(/\*\*/g, '');
  if (VALID_STATUSES.includes(trimmed)) return trimmed;
  const lower = trimmed.toLowerCase();
  if (STATUS_ALIASES[lower]) return STATUS_ALIASES[lower];
  console.warn(`  Warning: Unknown status "${trimmed}", defaulting to "Evaluated"`);
  return 'Evaluated';
}

function normalizeCompany(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function fuzzyRoleMatch(a, b) {
  const wordsA = a.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const wordsB = b.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const shared = wordsA.filter(w => wordsB.includes(w));
  return shared.length >= 2;
}

function isScoreLike(val) {
  return /^\d+\.?\d*\/5$/.test(val.trim()) || val.trim() === 'N/A' || val.trim() === 'DUP';
}

function isStatusLike(val) {
  const clean = val.trim().replace(/\*\*/g, '');
  return VALID_STATUSES.includes(clean) || STATUS_ALIASES[clean.toLowerCase()] !== undefined;
}

function parseTSV(line) {
  const cols = line.split('\t').map(c => c.trim());
  if (cols.length < 8) return null;

  // Detect column order: status and score might be swapped
  let num, date, company, role, status, score, pdf, report, notes;

  if (cols.length >= 9) {
    [num, date, company, role] = cols.slice(0, 4);
    // Columns 4 and 5 could be status/score or score/status
    if (isScoreLike(cols[4]) && isStatusLike(cols[5])) {
      score = cols[4]; status = cols[5];
    } else {
      status = cols[4]; score = cols[5];
    }
    [pdf, report, notes] = cols.slice(6, 9);
  } else {
    [num, date, company, role, status, score, pdf, report] = cols;
    notes = '';
  }

  return {
    num: num.replace(/^#/, ''),
    date,
    company,
    role,
    status: validateStatus(status || 'Evaluated'),
    score: score || 'N/A',
    pdf: pdf || '',
    report: report || '',
    notes: notes || '',
  };
}

async function main() {
  // Read tracker
  if (!existsSync(TRACKER_PATH)) {
    console.error(`Tracker not found: ${TRACKER_PATH}`);
    console.log('Run sadhak to create the tracker first.');
    process.exit(1);
  }

  const trackerContent = await readFile(TRACKER_PATH, 'utf-8');
  const trackerLines = trackerContent.split('\n');

  // Find header separator line
  const sepIndex = trackerLines.findIndex(l => /^\|[-\s|]+\|$/.test(l));
  if (sepIndex === -1) {
    console.error('Could not find tracker table header separator.');
    process.exit(1);
  }

  // Parse existing entries
  const existingEntries = [];
  for (let i = sepIndex + 1; i < trackerLines.length; i++) {
    const line = trackerLines[i].trim();
    if (!line || !line.startsWith('|')) continue;
    const cols = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length >= 4) {
      existingEntries.push({
        lineIndex: i,
        num: cols[0]?.replace(/^#/, ''),
        company: cols[2],
        role: cols[3],
        score: cols[4],
      });
    }
  }

  // Read TSV additions
  if (!existsSync(ADDITIONS_DIR)) {
    console.log('No additions directory found.');
    return;
  }

  const files = (await readdir(ADDITIONS_DIR))
    .filter(f => f.endsWith('.tsv'))
    .sort();

  if (files.length === 0) {
    console.log('No TSV files to merge.');
    return;
  }

  console.log(`Found ${files.length} TSV file(s) to merge.`);

  let added = 0;
  let updated = 0;
  let skipped = 0;
  const newLines = [];

  for (const file of files) {
    const content = (await readFile(join(ADDITIONS_DIR, file), 'utf-8')).trim();
    if (!content) continue;

    const entry = parseTSV(content);
    if (!entry) {
      console.warn(`  Skipping ${file}: could not parse`);
      skipped++;
      continue;
    }

    // Check for duplicates
    const normCompany = normalizeCompany(entry.company);
    const dup = existingEntries.find(e =>
      e.num === entry.num ||
      (normalizeCompany(e.company) === normCompany && fuzzyRoleMatch(e.role, entry.role))
    );

    if (dup) {
      // Update in place if new score is higher
      const existingScore = parseFloat(dup.score);
      const newScore = parseFloat(entry.score);
      if (!isNaN(newScore) && !isNaN(existingScore) && newScore > existingScore) {
        const newLine = `| ${entry.num} | ${entry.date} | ${entry.company} | ${entry.role} | ${entry.score} | ${entry.status} | ${entry.pdf} | ${entry.report} | Re-evaluated: ${entry.notes} |`;
        trackerLines[dup.lineIndex] = newLine;
        updated++;
        console.log(`  Updated: ${entry.company} — ${entry.role} (${existingScore} → ${newScore})`);
      } else {
        skipped++;
        console.log(`  Skipped (duplicate): ${entry.company} — ${entry.role}`);
      }
    } else {
      // New entry
      const newLine = `| ${entry.num} | ${entry.date} | ${entry.company} | ${entry.role} | ${entry.score} | ${entry.status} | ${entry.pdf} | ${entry.report} | ${entry.notes} |`;
      newLines.push(newLine);
      added++;
      console.log(`  Added: ${entry.company} — ${entry.role} (${entry.score})`);
    }
  }

  // Insert new lines after header separator
  if (newLines.length > 0) {
    trackerLines.splice(sepIndex + 1, 0, ...newLines);
  }

  // Write tracker
  if (!DRY_RUN) {
    await writeFile(TRACKER_PATH, trackerLines.join('\n'));

    // Move processed TSVs to merged/
    await mkdir(MERGED_DIR, { recursive: true });
    for (const file of files) {
      await rename(
        join(ADDITIONS_DIR, file),
        join(MERGED_DIR, file)
      );
    }
  }

  console.log(`\nSummary: ${added} added, ${updated} updated, ${skipped} skipped${DRY_RUN ? ' (DRY RUN)' : ''}`);

  // Optional verify
  if (VERIFY && !DRY_RUN) {
    const { execSync } = await import('node:child_process');
    console.log('\nRunning verification...');
    try {
      execSync('node verify-pipeline.mjs', { stdio: 'inherit' });
    } catch {
      process.exit(1);
    }
  }
}

main().catch(err => {
  console.error('Merge failed:', err.message);
  process.exit(1);
});
