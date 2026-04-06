#!/usr/bin/env node

/**
 * normalize-statuses.mjs — Map status aliases to canonical values
 *
 * Usage: node normalize-statuses.mjs [--dry-run]
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const DRY_RUN = process.argv.includes('--dry-run');

const TRACKER_PATH = existsSync('data/applications.md')
  ? 'data/applications.md'
  : 'applications.md';

const VALID_STATUSES = [
  'Evaluated', 'Applied', 'Responded', 'Interview',
  'Offer', 'Rejected', 'Discarded', 'SKIP',
];

const ALIASES = {
  'eval': 'Evaluated', 'reviewed': 'Evaluated',
  'submitted': 'Applied', 'sent': 'Applied',
  'reply': 'Responded', 'replied': 'Responded',
  'interviewing': 'Interview', 'phone screen': 'Interview',
  'technical': 'Interview', 'onsite': 'Interview', 'final round': 'Interview',
  'offered': 'Offer',
  'declined by company': 'Rejected', 'no': 'Rejected',
  'withdrawn': 'Discarded', 'closed': 'Discarded', 'expired': 'Discarded',
  'no apply': 'SKIP', 'pass': 'SKIP',
};

async function main() {
  if (!existsSync(TRACKER_PATH)) {
    console.error(`Tracker not found: ${TRACKER_PATH}`);
    process.exit(1);
  }

  const content = await readFile(TRACKER_PATH, 'utf-8');
  const lines = content.split('\n');
  let changes = 0;

  const sepIndex = lines.findIndex(l => /^\|[-\s|]+\|$/.test(l));
  if (sepIndex === -1) {
    console.error('Could not find header separator');
    process.exit(1);
  }

  for (let i = sepIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || !line.startsWith('|')) continue;

    const cols = line.split('|');
    if (cols.length < 7) continue;

    // Status is typically column index 6 (1-indexed col 5, but split includes empty first)
    const statusIdx = 6;
    const raw = cols[statusIdx]?.trim().replace(/\*\*/g, '');
    if (!raw) continue;

    if (!VALID_STATUSES.includes(raw)) {
      const canonical = ALIASES[raw.toLowerCase()];
      if (canonical) {
        cols[statusIdx] = ` ${canonical} `;
        lines[i] = cols.join('|');
        console.log(`  Line ${i + 1}: "${raw}" → "${canonical}"`);
        changes++;
      } else {
        console.warn(`  Line ${i + 1}: Unknown status "${raw}" — skipping`);
      }
    }
  }

  if (changes === 0) {
    console.log('All statuses are already canonical.');
    return;
  }

  if (!DRY_RUN) {
    await writeFile(TRACKER_PATH, lines.join('\n'));
  }

  console.log(`\n${changes} status(es) normalized${DRY_RUN ? ' (DRY RUN)' : ''}.`);
}

main().catch(err => {
  console.error('Normalization failed:', err.message);
  process.exit(1);
});
