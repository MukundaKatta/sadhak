# Evaluate Mode

Full structured evaluation of a job offer against the candidate's profile.

## Input

JD text or URL. If URL, extract JD using Playwright → WebFetch → WebSearch fallback chain.

## Pre-flight

1. Read `cv.md`
2. Read `config/profile.yml`
3. Read `article-digest.md` (if exists)
4. Read `modes/_shared.md` for archetypes and rules

## Evaluation Blocks (A–F)

### Block A: Role Summary

- Company name, role title, location, compensation (if listed)
- Role archetype classification (from _shared.md table)
- Key requirements extracted from JD
- Team/reporting structure if mentioned
- Tech stack requirements

### Block B: CV Match Analysis

- **Strong matches**: Where candidate's experience directly maps to requirements
- **Partial matches**: Where experience is adjacent or transferable
- **Gaps**: Missing requirements with mitigation strategies
- **Hidden strengths**: Candidate advantages not explicitly required but valuable
- For each gap, provide a concrete mitigation strategy

### Block C: Level Strategy

- Is the role's level appropriate? (under/over-leveled risk)
- Growth trajectory alignment
- Scope of role vs. candidate's experience
- Reporting structure fit

### Block D: Compensation Research

- Use WebSearch to find market data for role + location + company stage
- Check levels.fyi, Glassdoor, Payscale
- Compare to candidate's target range from profile.yml
- Flag if below minimum or if equity-heavy

### Block E: Resume Personalization Plan

- Top 3-4 projects to highlight
- Keywords to inject from JD
- Summary rewrite angle
- Skills to emphasize/de-emphasize
- Bullet reordering priorities

### Block F: Interview Prep

- 3-5 STAR+R stories mapped to likely interview questions
  - **S**ituation: Context
  - **T**ask: Challenge
  - **A**ction: What you did (specific)
  - **R**esult: Measurable outcome
  - **R**eflection: What you learned
- Technical topics to brush up on
- Questions to ask the interviewer
- Red flags to watch for

**Append new stories to `interview-prep/story-bank.md`.**

## Scoring

10 dimensions, each scored 1–5:

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| Role fit | 15% | How well the JD matches target archetypes |
| Technical match | 15% | Stack/skill overlap |
| Level alignment | 10% | Seniority fit |
| Compensation | 10% | Meets target range |
| Location | 10% | Remote/hybrid/onsite fit |
| Company stage | 10% | Startup vs enterprise preference |
| Growth potential | 10% | Learning and career trajectory |
| Culture signals | 5% | Values, work style, team dynamics |
| Brand value | 5% | Resume line strength |
| Application effort | 10% | Complexity of application process |

**Final score** = weighted average, rounded to 1 decimal.

## Recommendation

| Score | Recommendation |
|-------|---------------|
| >= 4.5 | Strong apply — fast-track with full pipeline |
| 4.0–4.4 | Apply — good fit, run full pipeline |
| 3.5–3.9 | Consider — evaluate trade-offs, ask user |
| 3.0–3.4 | Weak — recommend skip unless specific reason |
| < 3.0 | Skip — not worth the effort |

## Report Format

```markdown
# {Company} — {Role Title}

**Date:** {YYYY-MM-DD}
**Score:** {X.X}/5 — {Recommendation}
**URL:** {job_url}
**PDF:** {path_or_pending}
**Archetype:** {detected_archetype}

## A. Role Summary
{content}

## B. CV Match
{content}

## C. Level Strategy
{content}

## D. Compensation Research
{content}

## E. Resume Personalization Plan
{content}

## F. Interview Prep
{content}

## Scoring Breakdown
| Dimension | Score | Notes |
|-----------|-------|-------|
{10 rows}

**Final Score: {X.X}/5**
```
