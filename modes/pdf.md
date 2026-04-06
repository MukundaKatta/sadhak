# PDF Mode — Resume Generation

Generate an ATS-optimized, JD-tailored resume PDF.

## Pipeline (15 Steps)

1. **Read** `cv.md` (canonical CV)
2. **Get JD** if not already in context
3. **Extract keywords**: 15–20 keywords/phrases from JD
4. **Detect language**: Generate resume in JD's language
5. **Detect location** → paper format (`letter` for US/Canada, `a4` everywhere else)
6. **Detect archetype**: Classify role against _shared.md table
7. **Rewrite Professional Summary**: Inject keywords + exit narrative bridge from profile.yml
8. **Select projects**: Top 3–4 most relevant to this JD
9. **Reorder bullets**: Most JD-relevant experience first within each role
10. **Build Core Competencies**: 6–8 keyword phrases from JD as tags
11. **Inject keywords**: Reformulate existing bullets with JD vocabulary (NEVER invent)
12. **Generate HTML**: Fill `templates/cv-template.html` placeholders
13. **Write HTML** to `/tmp/cv-candidate-{company}.html`
14. **Execute**: `node generate-pdf.mjs /tmp/cv-candidate-{company}.html output/cv-candidate-{company-slug}-{date}.pdf --format={letter|a4}`
15. **Report**: PDF path, page count, keyword coverage %

## ATS Rules (Non-negotiable)

- Single-column layout
- Standard section headers (Experience, Education, Skills — not creative names)
- No images or SVGs containing text
- No critical info in headers/footers (some ATS strip them)
- UTF-8 selectable text
- No nested tables
- Links must be real URLs (not "click here")

## Design Tokens

| Token | Value |
|-------|-------|
| Heading font | Space Grotesk, 600–700 weight |
| Body font | DM Sans, 400–500 weight |
| Primary color | `hsl(187, 74%, 32%)` (teal) |
| Accent color | `hsl(270, 70%, 45%)` (purple) |
| Header gradient | linear-gradient(to right, primary, accent) |
| Margins | 0.6in all sides |
| Body text | 11px |
| Section titles | 13px uppercase |

## Section Order

1. Header (name, contact, links)
2. Professional Summary (3–4 lines, keyword-dense)
3. Core Competencies (tag grid)
4. Work Experience (reverse chronological)
5. Projects (if relevant to JD)
6. Education & Certifications
7. Skills (grouped by category)

## Keyword Injection Ethics

Only reformulate existing experience with JD vocabulary. Never invent.

**Good:**
- CV says "built data pipelines" → JD says "RAG pipelines" → "Built RAG-ready data pipelines"
- CV says "managed team" → JD says "stakeholder management" → "Managed team of 5, coordinating stakeholder requirements"

**Bad:**
- CV doesn't mention Kubernetes → JD requires it → DON'T add "Kubernetes experience"

## Template Placeholders

The HTML template uses `{{PLACEHOLDER}}` tokens:
- `{{FULL_NAME}}`, `{{EMAIL}}`, `{{PHONE}}`, `{{LOCATION}}`
- `{{LINKEDIN_URL}}`, `{{PORTFOLIO_URL}}`, `{{GITHUB_URL}}`
- `{{PROFESSIONAL_SUMMARY}}`, `{{CORE_COMPETENCIES}}`
- `{{WORK_EXPERIENCE}}`, `{{PROJECTS}}`
- `{{EDUCATION}}`, `{{CERTIFICATIONS}}`, `{{SKILLS}}`
