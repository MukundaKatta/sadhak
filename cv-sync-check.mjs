#!/usr/bin/env node

/**
 * cv-sync-check.mjs — Validate setup consistency + detect hardcoded metrics
 *
 * Checks:
 * 1. All required files exist
 * 2. Profile isn't using placeholder values
 * 3. No hardcoded metrics in prompt/mode files (should come from cv.md)
 * 4. article-digest.md staleness (warns if > 30 days old)
 *
 * Usage: node cv-sync-check.mjs
 */

import { existsSync, statSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

let ok = 0;
let warnings = 0;
let missing = 0;

function check(path, label) {
  if (existsSync(path)) {
    console.log(`  \x1b[32m✓\x1b[0m ${label}`);
    ok++;
  } else {
    console.log(`  \x1b[31m✗\x1b[0m ${label} — not found`);
    missing++;
  }
}

function warn(msg) {
  console.log(`  \x1b[33m!\x1b[0m ${msg}`);
  warnings++;
}

// Patterns that suggest hardcoded metrics
const METRIC_PATTERNS = [
  /\b\d{2,}%\s*(reduction|increase|improvement|faster|growth)/i,
  /\$\d{2,}[KkMm]\b/,
  /\b\d{1,3}(,\d{3})+\s*(users|customers|requests|transactions)/i,
  /\b\d+x\s*(faster|improvement|growth|throughput)/i,
  /\b\d+ms\s*(latency|p\d{2})/i,
  /\b\d{2,}\s*engineers?\b/i,
  /99\.\d+%\s*(uptime|availability|SLA)/i,
];

// Files that should NOT contain hardcoded metrics
const SCAN_PATHS = [
  'modes/_shared.md',
  'modes/evaluate.md',
  'modes/auto-pipeline.md',
  'modes/pdf.md',
  'modes/cover-letter.md',
  'batch/batch-prompt.md',
];

async function scanHardcodedMetrics() {
  console.log('\nHardcoded metrics scan:');
  let found = 0;

  for (const filePath of SCAN_PATHS) {
    if (!existsSync(filePath)) continue;
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip comment lines, example blocks, and template markers
      if (line.trim().startsWith('#') || line.trim().startsWith('//')) continue;
      if (line.includes('{{') && line.includes('}}')) continue;
      if (line.includes('example') || line.includes('Example')) continue;

      for (const pattern of METRIC_PATTERNS) {
        const match = line.match(pattern);
        if (match) {
          warn(`${filePath}:${i + 1} — possible hardcoded metric: "${match[0]}"`);
          found++;
          break; // One warning per line
        }
      }
    }
  }

  if (found === 0) {
    console.log('  \x1b[32m✓\x1b[0m No hardcoded metrics detected in prompt files');
    ok++;
  }
}

async function checkArticleStaleness() {
  const digestPath = 'article-digest.md';
  if (!existsSync(digestPath)) return;

  console.log('\nArticle digest freshness:');
  const stat = statSync(digestPath);
  const daysSinceModified = Math.floor((Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24));

  if (daysSinceModified > 30) {
    warn(`article-digest.md last modified ${daysSinceModified} days ago — consider updating proof points`);
  } else {
    console.log(`  \x1b[32m✓\x1b[0m article-digest.md is fresh (${daysSinceModified} days old)`);
    ok++;
  }
}

async function checkCvConsistency() {
  if (!existsSync('cv.md') || !existsSync('article-digest.md')) return;

  console.log('\nCV ↔ Digest consistency:');
  const cv = await readFile('cv.md', 'utf-8');
  const digest = await readFile('article-digest.md', 'utf-8');

  // Extract project names from digest headers
  const digestProjects = [...digest.matchAll(/^##\s+(.+)/gm)].map(m => m[1].trim());

  let mismatches = 0;
  for (const project of digestProjects) {
    // Check if project name (or significant words) appears in CV
    const keywords = project.split(/[\s—–-]+/).filter(w => w.length > 4);
    const found = keywords.some(kw => cv.toLowerCase().includes(kw.toLowerCase()));
    if (!found) {
      warn(`Digest project "${project}" not found in cv.md — may be out of sync`);
      mismatches++;
    }
  }

  if (mismatches === 0 && digestProjects.length > 0) {
    console.log(`  \x1b[32m✓\x1b[0m All ${digestProjects.length} digest projects referenced in CV`);
    ok++;
  }
}

async function main() {
  console.log('Sadhak Setup & Sync Check\n');

  console.log('Required files:');
  check('cv.md', 'CV (cv.md)');
  check('config/profile.yml', 'Profile (config/profile.yml)');

  console.log('\nRecommended files:');
  check('portals.yml', 'Portal config (portals.yml)');
  check('article-digest.md', 'Proof points (article-digest.md)');

  console.log('\nData directories:');
  check('data', 'Data directory');
  check('reports', 'Reports directory');
  check('output', 'Output directory');

  console.log('\nTemplates:');
  check('templates/cv-template.html', 'Resume template');
  check('templates/cover-letter-template.html', 'Cover letter template');
  check('templates/states.yml', 'States definition');

  console.log('\nTools:');
  check('generate-pdf.mjs', 'PDF generator');
  check('merge-tracker.mjs', 'Tracker merger');
  check('verify-pipeline.mjs', 'Pipeline verifier');
  check('dedup-tracker.mjs', 'Dedup tool');
  check('normalize-statuses.mjs', 'Status normalizer');

  // Check profile.yml content if it exists
  if (existsSync('config/profile.yml')) {
    console.log('\nProfile validation:');
    const profile = await readFile('config/profile.yml', 'utf-8');
    if (profile.includes('Your Name') || profile.includes('you@example.com')) {
      warn('Profile contains placeholder values — update with your details');
    } else {
      console.log('  \x1b[32m✓\x1b[0m Profile has been customized');
      ok++;
    }
  }

  await scanHardcodedMetrics();
  await checkArticleStaleness();
  await checkCvConsistency();

  console.log(`\n${'—'.repeat(40)}`);
  const issues = missing + warnings;
  if (issues > 0) {
    console.log(`\x1b[32m${ok} passed\x1b[0m, \x1b[31m${missing} missing\x1b[0m, \x1b[33m${warnings} warning(s)\x1b[0m`);
    if (missing > 0) console.log('Run /sadhak to start onboarding.');
  } else {
    console.log(`\x1b[32mAll ${ok} checks passed!\x1b[0m`);
  }
}

main().catch(err => {
  console.error('Check failed:', err.message);
  process.exit(1);
});
