#!/usr/bin/env node

/**
 * dedup-tracker.mjs — Remove duplicate entries from applications.md
 *
 * Duplicates are detected by normalized company name + fuzzy role match.
 * Keeps the entry with the highest score.
 *
 * Usage: node dedup-tracker.mjs [--dry-run]
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const DRY_RUN = process.argv.includes('--dry-run');

const TRACKER_PATH = existsSync('data/applications.md')
  ? 'data/applications.md'
  : 'applications.md';

function normalizeCompany(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function fuzzyRoleMatch(a, b) {
  const wordsA = a.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const wordsB = b.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const shared = wordsA.filter(w => wordsB.includes(w));
  return shared.length >= 2;
}

async function main() {
  if (!existsSync(TRACKER_PATH)) {
    console.error(`Tracker not found: ${TRACKER_PATH}`);
    process.exit(1);
  }

  const content = await readFile(TRACKER_PATH, 'utf-8');
  const lines = content.split('\n');

  const sepIndex = lines.findIndex(l => /^\|[-\s|]+\|$/.test(l));
  if (sepIndex === -1) {
    console.error('Could not find header separator');
    process.exit(1);
  }

  // Parse data lines
  const entries = [];
  for (let i = sepIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || !line.startsWith('|')) continue;
    const cols = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length >= 5) {
      entries.push({
        lineIndex: i,
        company: cols[2] || '',
        role: cols[3] || '',
        score: parseFloat(cols[4]) || 0,
        line: lines[i],
      });
    }
  }

  // Find duplicates
  const toRemove = new Set();
  for (let i = 0; i < entries.length; i++) {
    if (toRemove.has(entries[i].lineIndex)) continue;
    for (let j = i + 1; j < entries.length; j++) {
      if (toRemove.has(entries[j].lineIndex)) continue;
      const sameCompany = normalizeCompany(entries[i].company) === normalizeCompany(entries[j].company);
      const sameRole = fuzzyRoleMatch(entries[i].role, entries[j].role);
      if (sameCompany && sameRole) {
        // Remove the one with lower score
        const removeIdx = entries[i].score >= entries[j].score ? j : i;
        toRemove.add(entries[removeIdx].lineIndex);
        console.log(`  Duplicate: ${entries[removeIdx].company} — ${entries[removeIdx].role} (score: ${entries[removeIdx].score}) — removing`);
      }
    }
  }

  if (toRemove.size === 0) {
    console.log('No duplicates found.');
    return;
  }

  // Remove duplicate lines
  const newLines = lines.filter((_, i) => !toRemove.has(i));

  if (!DRY_RUN) {
    await writeFile(TRACKER_PATH, newLines.join('\n'));
  }

  console.log(`\n${toRemove.size} duplicate(s) removed${DRY_RUN ? ' (DRY RUN)' : ''}.`);
}

main().catch(err => {
  console.error('Dedup failed:', err.message);
  process.exit(1);
});
