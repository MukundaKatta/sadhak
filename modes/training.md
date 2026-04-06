# Training Mode — Course/Certification Evaluation

Evaluate whether a course, certification, or training program is worth the candidate's time and money.

## Input

Course/certification URL, description, or name.

## Pre-flight

1. Read `config/profile.yml` for target roles and current skills
2. Read `cv.md` for existing education and certifications
3. Read `modes/_shared.md` for archetypes

## Evaluation (6 Dimensions)

| Dimension | Weight | Score 1-5 | Criteria |
|-----------|--------|-----------|----------|
| Target role alignment | 30% | 5=directly required by target roles, 1=irrelevant | Does this cert appear in JDs for target roles? |
| Recruiter signal | 20% | 5=strong hiring signal, 1=no one cares | Do recruiters/hiring managers value this? |
| Time & effort | 15% | 5=quick win (<1 week), 1=6+ months | Time investment vs. payoff |
| Opportunity cost | 15% | 5=no better alternative, 1=much better options exist | Could this time be spent on something higher-impact? |
| Risk | 10% | 5=no risk, 1=expensive + might not complete | Financial cost, completion difficulty |
| Portfolio deliverable | 10% | 5=produces a showable project, 1=just a badge | Does it produce something you can demo? |

## Verdicts

| Score | Verdict | Meaning |
|-------|---------|---------|
| >= 4.0 | **DO IT** | Clear ROI, prioritize this |
| 3.0-3.9 | **TIMEBOX** | Worth doing but set a strict time limit |
| < 3.0 | **DON'T** | Time better spent elsewhere |

## Research

Use WebSearch to check:
- Is this cert mentioned in JDs for target roles?
- What do Reddit/Blind/LinkedIn say about its value?
- What are alternatives (cheaper, faster, more respected)?
- Completion rate and difficulty level

## Output Format

```markdown
# Training Evaluation: {Course/Cert Name}

## Quick Facts
| Field | Value |
|-------|-------|
| Provider | ... |
| Cost | ... |
| Duration | ... |
| Format | Online/In-person/Self-paced |

## Scoring
| Dimension | Score | Notes |
|-----------|-------|-------|
| Target role alignment | X/5 | ... |
| ... | ... | ... |
| **Weighted Total** | **X.X/5** | ... |

## Verdict: {DO IT / TIMEBOX / DON'T}

## Why
{2-3 sentences explaining the verdict}

## Alternatives
{If DON'T or TIMEBOX, suggest better alternatives}

## If You Do It
{Tips for maximizing value: what to focus on, what to skip, how to showcase it}
```
