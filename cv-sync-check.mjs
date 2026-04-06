#!/usr/bin/env node

/**
 * cv-sync-check.mjs — Validate setup consistency
 *
 * Checks that all required files exist and are properly configured.
 *
 * Usage: node cv-sync-check.mjs
 */

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

let ok = 0;
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

async function main() {
  console.log('Sadhak Setup Check\n');

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

  // Check profile.yml content if it exists
  if (existsSync('config/profile.yml')) {
    console.log('\nProfile validation:');
    const profile = await readFile('config/profile.yml', 'utf-8');
    if (profile.includes('Your Name') || profile.includes('you@example.com')) {
      console.log('  \x1b[33m!\x1b[0m Profile contains placeholder values — update with your details');
    } else {
      console.log('  \x1b[32m✓\x1b[0m Profile has been customized');
    }
  }

  console.log(`\n${'—'.repeat(40)}`);
  if (missing > 0) {
    console.log(`\x1b[33m${ok} found, ${missing} missing\x1b[0m`);
    console.log('Run /sadhak to start onboarding.');
  } else {
    console.log(`\x1b[32mAll ${ok} checks passed!\x1b[0m`);
  }
}

main().catch(err => {
  console.error('Check failed:', err.message);
  process.exit(1);
});
