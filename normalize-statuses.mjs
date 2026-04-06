#!/usr/bin/env node

/**
 * normalize-statuses.mjs — Map status aliases to canonical values
 *
 * Handles English, Spanish, and common typo aliases.
 * Creates .bak backup before writing.
 *
 * Usage: node normalize-statuses.mjs [--dry-run]
 */

import { readFile, writeFile, copyFile } from 'node:fs/promises';
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
  // Evaluated
  'eval': 'Evaluated', 'reviewed': 'Evaluated', 'evaluado': 'Evaluated',
  'scored': 'Evaluated', 'assessed': 'Evaluated',

  // Applied
  'submitted': 'Applied', 'sent': 'Applied', 'aplicado': 'Applied',
  'postulado': 'Applied', 'applied online': 'Applied',

  // Responded
  'reply': 'Responded', 'replied': 'Responded', 'response': 'Responded',
  'respondido': 'Responded', 'heard back': 'Responded',

  // Interview
  'interviewing': 'Interview', 'phone screen': 'Interview',
  'technical': 'Interview', 'onsite': 'Interview', 'final round': 'Interview',
  'entrevista': 'Interview', 'phone': 'Interview', 'screen': 'Interview',
  'coding challenge': 'Interview', 'take home': 'Interview',
  'assessment': 'Interview', 'hr screen': 'Interview',

  // Offer
  'offered': 'Offer', 'oferta': 'Offer', 'condicional': 'Offer',

  // Rejected
  'declined by company': 'Rejected', 'no': 'Rejected',
  'rejected by company': 'Rejected', 'rechazado': 'Rejected',
  'not selected': 'Rejected', 'declined': 'Rejected',

  // Discarded
  'withdrawn': 'Discarded', 'closed': 'Discarded', 'expired': 'Discarded',
  'descartado': 'Discarded', 'duplicado': 'Discarded',
  'cerrada': 'Discarded', 'cancelada': 'Discarded',
  'repost': 'Discarded', 'geo blocker': 'Discarded',
  'geo blocked': 'Discarded', 'no longer available': 'Discarded',

  // SKIP
  'no apply': 'SKIP', 'pass': 'SKIP', 'skip': 'SKIP',
  'hold': 'SKIP', 'maybe later': 'SKIP', 'not now': 'SKIP',
  'pasar': 'SKIP',
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

    // Status column — try index 6 first, fall back to scanning
    let statusIdx = -1;
    for (let c = 1; c < cols.length - 1; c++) {
      const val = cols[c].trim().replace(/\*\*/g, '');
      if (VALID_STATUSES.includes(val) || ALIASES[val.toLowerCase()]) {
        statusIdx = c;
        break;
      }
    }
    if (statusIdx === -1) statusIdx = 6; // default position

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
    await copyFile(TRACKER_PATH, TRACKER_PATH + '.bak');
    console.log(`  Backup: ${TRACKER_PATH}.bak`);
    await writeFile(TRACKER_PATH, lines.join('\n'));
  }

  console.log(`\n${changes} status(es) normalized${DRY_RUN ? ' (DRY RUN)' : ''}.`);
}

main().catch(err => {
  console.error('Normalization failed:', err.message);
  process.exit(1);
});
