#!/usr/bin/env node

/**
 * dedup-tracker.mjs — Remove duplicate entries from applications.md
 *
 * Duplicates are detected by normalized company name + fuzzy role match.
 * Keeps the entry with the most advanced status (or highest score as tiebreak).
 * Creates .bak backup before writing.
 *
 * Usage: node dedup-tracker.mjs [--dry-run]
 */

import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const DRY_RUN = process.argv.includes('--dry-run');

const TRACKER_PATH = existsSync('data/applications.md')
  ? 'data/applications.md'
  : 'applications.md';

// Status progression order (higher index = more advanced)
const STATUS_RANK = {
  'SKIP': 0,
  'Evaluated': 1,
  'Applied': 2,
  'Responded': 3,
  'Interview': 4,
  'Offer': 5,
  'Rejected': 3,  // Same as Responded (terminal but mid-process)
  'Discarded': 0, // Terminal, lowest
};

function normalizeCompany(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function fuzzyRoleMatch(a, b) {
  const normalize = s => s.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const wordsA = normalize(a).split(/\s+/).filter(w => w.length > 2);
  const wordsB = normalize(b).split(/\s+/).filter(w => w.length > 2);
  if (wordsA.length === 0 || wordsB.length === 0) return false;
  const shared = wordsA.filter(w => wordsB.includes(w));
  // Match if ≥50% of shorter role's words overlap
  const minLen = Math.min(wordsA.length, wordsB.length);
  return shared.length >= Math.max(2, Math.ceil(minLen * 0.5));
}

function statusRank(status) {
  return STATUS_RANK[status.trim()] ?? 1;
}

function pickWinner(a, b) {
  const rankA = statusRank(a.status);
  const rankB = statusRank(b.status);
  if (rankA !== rankB) return rankA >= rankB ? a : b;
  // Tiebreak: higher score wins
  return a.score >= b.score ? a : b;
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
    if (cols.length >= 6) {
      entries.push({
        lineIndex: i,
        company: cols[2] || '',
        role: cols[3] || '',
        score: parseFloat(cols[4]) || 0,
        status: cols[5] || '',
        line: lines[i],
      });
    }
  }

  // Find duplicates — group by company+role key
  const groups = new Map();
  for (const entry of entries) {
    const compKey = normalizeCompany(entry.company);
    let matched = false;
    for (const [key, group] of groups) {
      if (key.startsWith(compKey + '::') || key.startsWith(compKey + '|')) {
        // Same company — check role
        if (fuzzyRoleMatch(entry.role, group[0].role)) {
          group.push(entry);
          matched = true;
          break;
        }
      }
    }
    if (!matched) {
      const groupKey = `${compKey}::${entry.role.toLowerCase()}`;
      if (groups.has(groupKey)) {
        groups.get(groupKey).push(entry);
      } else {
        groups.set(groupKey, [entry]);
      }
    }
  }

  // Identify lines to remove
  const toRemove = new Set();
  for (const [, group] of groups) {
    if (group.length <= 1) continue;
    // Find winner
    let winner = group[0];
    for (let i = 1; i < group.length; i++) {
      const w = pickWinner(winner, group[i]);
      if (w !== winner) {
        toRemove.add(winner.lineIndex);
        winner = w;
      } else {
        toRemove.add(group[i].lineIndex);
      }
      const loser = w === winner ? group[i] : winner;
      console.log(`  Duplicate: ${loser.company} — ${loser.role} (${loser.status}, score: ${loser.score}) → keeping ${w.status} entry`);
    }
  }

  if (toRemove.size === 0) {
    console.log('No duplicates found.');
    return;
  }

  // Remove duplicate lines
  const newLines = lines.filter((_, i) => !toRemove.has(i));

  if (!DRY_RUN) {
    // Create backup
    await copyFile(TRACKER_PATH, TRACKER_PATH + '.bak');
    console.log(`  Backup: ${TRACKER_PATH}.bak`);
    await writeFile(TRACKER_PATH, newLines.join('\n'));
  }

  console.log(`\n${toRemove.size} duplicate(s) removed${DRY_RUN ? ' (DRY RUN)' : ''}.`);
}

main().catch(err => {
  console.error('Dedup failed:', err.message);
  process.exit(1);
});
