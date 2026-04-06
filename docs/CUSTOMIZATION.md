# Customization Guide

Everything in Sadhak is designed to be edited by Claude. Just ask:

## Profile (config/profile.yml)

| Field | Purpose |
|-------|---------|
| `candidate` | Name, email, phone, links |
| `target_roles` | What you're looking for |
| `narrative` | Exit story, superpowers, proof points |
| `compensation` | Target range, minimum, currency |
| `location` | City, timezone, visa, onsite availability |
| `preferences` | Company stage, deal-breakers, nice-to-haves |

## Archetypes (modes/_shared.md)

The archetype table determines how Sadhak frames your experience. Default archetypes:
- Backend Engineer
- Frontend Engineer
- Full-Stack Engineer
- AI/ML Engineer
- DevOps/Platform
- Engineering Manager

**To customize:** "Change the archetypes to data engineering roles" or edit `modes/_shared.md` directly.

## Portals (portals.yml)

Four things to customize:
1. `title_filter.positive` — Keywords matching your target roles
2. `title_filter.negative` — Keywords to exclude
3. `search_queries` — WebSearch queries for broad portal discovery
4. `tracked_companies` — Companies to scan directly

## Resume Template (templates/cv-template.html)

Design tokens you can change:
- Fonts (Space Grotesk + DM Sans by default)
- Colors (teal + purple gradient)
- Layout (single column, ATS-safe)
- Margins, font sizes, spacing

## Cover Letter (modes/cover-letter.md)

- Paragraph structure and tone guidelines
- Anti-patterns list
- Output format options

## Scoring (modes/evaluate.md)

10 dimensions with weights. Adjust weights to match your priorities:
- Role fit (15%), Technical match (15%), Level (10%), Comp (10%)
- Location (10%), Stage (10%), Growth (10%), Culture (5%), Brand (5%), Effort (10%)

## States (templates/states.yml)

Rarely changed. If you add new states, also update `normalize-statuses.mjs`.
