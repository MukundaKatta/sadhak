#!/usr/bin/env node

/**
 * generate-pdf.mjs — Convert HTML to PDF using Playwright Chromium
 *
 * Usage:
 *   node generate-pdf.mjs <input.html> <output.pdf> [--format=letter|a4]
 *
 * Fonts are loaded from ./fonts/ relative to the input HTML file.
 */

import { chromium } from 'playwright';
import { readFile, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node generate-pdf.mjs <input.html> <output.pdf> [--format=letter|a4]');
  process.exit(1);
}

const inputPath = resolve(args[0]);
const outputPath = resolve(args[1]);
const formatFlag = args.find(a => a.startsWith('--format='));
const format = formatFlag ? formatFlag.split('=')[1] : 'letter';

const inputDir = dirname(inputPath);

async function main() {
  // Read HTML
  let html = await readFile(inputPath, 'utf-8');

  // Rewrite font paths to absolute file:// URIs
  // This ensures Chromium can load self-hosted fonts from any working directory
  html = html.replace(
    /url\(['"]?\.\/fonts\//g,
    `url('file://${inputDir}/fonts/`
  );

  // Also handle fonts relative to project root
  const projectRoot = resolve(import.meta.dirname || dirname(import.meta.url.replace('file://', '')));
  html = html.replace(
    /url\(['"]?fonts\//g,
    `url('file://${projectRoot}/fonts/`
  );

  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Set content and wait for fonts
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // Page dimensions
  const dimensions = {
    letter: { width: '8.5in', height: '11in' },
    a4: { width: '210mm', height: '297mm' },
  };

  const dim = dimensions[format] || dimensions.letter;

  // Generate PDF
  const pdfBuffer = await page.pdf({
    width: dim.width,
    height: dim.height,
    printBackground: true,
    preferCSSPageSize: false,
    margin: {
      top: '0.6in',
      right: '0.6in',
      bottom: '0.6in',
      left: '0.6in',
    },
  });

  await browser.close();

  // Write PDF
  const { writeFile } = await import('node:fs/promises');
  await writeFile(outputPath, pdfBuffer);

  // Count pages (regex on PDF structure)
  const pdfText = pdfBuffer.toString('latin1');
  const pageCount = (pdfText.match(/\/Type\s*\/Page[^s]/g) || []).length;

  // File size
  const stats = await stat(outputPath);
  const sizeKB = (stats.size / 1024).toFixed(1);

  console.log(`PDF generated: ${outputPath}`);
  console.log(`Pages: ${pageCount} | Size: ${sizeKB} KB | Format: ${format}`);
}

main().catch(err => {
  console.error('PDF generation failed:', err.message);
  process.exit(1);
});
