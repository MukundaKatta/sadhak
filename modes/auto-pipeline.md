# Auto-Pipeline Mode

Triggered when the user pastes a JD or URL with no explicit sub-command.

## Pipeline

### Step 0: Extract JD

**URL input:**
1. Try Playwright `browser_navigate` + `browser_snapshot` (works with SPAs)
2. Fallback: WebFetch (static pages)
3. Fallback: WebSearch (last resort)
4. Fallback: Ask user to paste JD text

**Text input:** Use directly.

Save JD to `jds/{company-slug}-{date}.md` for future reference.

### Step 1: Evaluate (A–F Blocks)

Delegate to `modes/evaluate.md` for the full 6-block evaluation.

### Step 2: Save Report

Write report to `reports/{###}-{company-slug}-{YYYY-MM-DD}.md`.

Report number = max existing number + 1 (3-digit zero-padded).

### Step 3: Generate Resume PDF

Delegate to `modes/pdf.md` for ATS-optimized, JD-tailored resume.

### Step 4: Generate Cover Letter

Delegate to `modes/cover-letter.md` for a personalized cover letter.

### Step 5: Draft Application Answers

**Only if score >= 4.0:**

Extract form questions via Playwright snapshot, or use these generic fallback questions:
1. Why are you interested in this role?
2. Why this company?
3. Describe relevant experience
4. What makes you a good fit?
5. How did you hear about us?

**Answer framework per question type:**
- Why role: Connect specific JD requirements to your experience
- Why company: Reference company mission/product + your proof points
- Relevant experience: Lead with most relevant STAR story from evaluation
- Good fit: Bridge your superpowers to their needs
- How you heard: Honest answer + genuine interest signal

**Tone:** Confident but not arrogant, specific, proof-led. "I built X that does Y" not "I'm great at X."

### Step 6: Update Tracker

Write TSV to `batch/tracker-additions/{num}-{company-slug}.tsv`.

Run `node merge-tracker.mjs` to merge into `data/applications.md`.

### Step 7: Summary

Present to user:
- Score and recommendation (apply/skip)
- Key match points and gaps
- Links to: report, resume PDF, cover letter
- Draft application answers (if generated)
- Suggested next steps
