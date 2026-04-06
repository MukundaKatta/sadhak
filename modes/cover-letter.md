# Cover Letter Mode

Generate a personalized, compelling cover letter tailored to a specific job.

## Pre-flight

1. Read `cv.md`
2. Read `config/profile.yml`
3. Read evaluation report if exists (check `reports/` for this company)
4. Read `article-digest.md` if exists

## Structure (4 Paragraphs)

### Paragraph 1: Hook + Why This Role
- Open with a specific, genuine reason for interest (not generic flattery)
- Reference something concrete about the company (product, mission, recent news)
- Connect it to your experience or values
- Mention the specific role title

### Paragraph 2: Proof of Value
- Lead with your strongest proof point that maps to the role's #1 requirement
- Use specific metrics from cv.md or article-digest.md
- Frame as: "I did X, which resulted in Y, which is exactly what Z role needs"
- Match the archetype framing from _shared.md

### Paragraph 3: Why You + Why Now
- Bridge your exit narrative to this opportunity
- Show you understand the company's challenges
- Explain what unique perspective you bring
- Reference 1-2 additional proof points

### Paragraph 4: Close + Call to Action
- Express enthusiasm without desperation
- Reference something specific you'd want to discuss
- Clean professional close

## Tone Guidelines

- **Confident, not arrogant**: "I built X" not "I'm the best at X"
- **Specific, not generic**: Reference exact projects, metrics, company details
- **Conversational, not formal**: Write like a thoughtful professional, not a template
- **Concise**: Max 350 words (4 paragraphs). Recruiters skim.
- **Language**: Match the JD language (English/Spanish/etc.)

## Anti-patterns (NEVER do these)

- "I am writing to express my interest in..." (generic opener)
- "I am a highly motivated professional..." (empty claim)
- "I believe I would be a great fit..." (unsubstantiated)
- "Dear Hiring Manager" when the recruiter's name is known
- Repeating the resume in paragraph form
- Including salary expectations in the letter
- More than one page

## Output Formats

### Plain Text
For pasting into application forms. Clean, no formatting.

### HTML → PDF
Use `templates/cover-letter-template.html` for styled PDF output.
- Same design tokens as resume (Space Grotesk + DM Sans)
- Company name and role in header
- Date and candidate info
- Execute: `node generate-pdf.mjs /tmp/cover-letter-{company}.html output/cover-letter-{company-slug}-{date}.pdf`

### Email Body
For direct outreach. Slightly more casual, with a subject line.
Subject: `{Role Title} — {Candidate Name} | {One-line hook}`

## Context Enrichment

If WebSearch is available, research the company before writing:
- Recent news, product launches, funding rounds
- Company blog posts or engineering blog
- Glassdoor/LinkedIn culture signals
- Reference specific findings in the letter (shows genuine research)
