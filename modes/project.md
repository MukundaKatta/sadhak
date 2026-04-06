# Project Mode — Portfolio Project Evaluation

Evaluate whether a portfolio project idea is worth building to strengthen your job search.

## Input

Project idea, description, or URL to existing project.

## Pre-flight

1. Read `config/profile.yml` for target roles
2. Read `cv.md` for existing projects
3. Read `article-digest.md` for existing proof points

## Evaluation (6 Dimensions)

| Dimension | Weight | Score 1-5 | Criteria |
|-----------|--------|-----------|----------|
| Signal for target roles | 25% | 5=directly demonstrates key skill for target role, 1=irrelevant | Would a hiring manager for your target roles care? |
| Uniqueness | 20% | 5=nobody has this, 1=yet another todo app | Does it stand out from 1000 other portfolios? |
| Demo-ability | 20% | 5=live demo in 30 seconds, 1=needs 20min explanation | Can you show it working in an interview? |
| Metric potential | 15% | 5=clear measurable outcomes, 1=no metrics possible | Can you attach numbers to the impact? |
| Time to MVP | 10% | 5=weekend project, 1=6+ months | How fast can you ship something showable? |
| STAR story potential | 10% | 5=rich in challenges and decisions, 1=trivial build | Will building this generate good interview stories? |

## Verdicts

| Score | Verdict | Meaning |
|-------|---------|---------|
| >= 4.0 | **BUILD IT** | High ROI, prioritize |
| 3.0-3.9 | **MAYBE** | Build if you have time, but don't prioritize over applications |
| < 3.0 | **SKIP** | Time better spent applying to jobs |

## Interview Pack Requirements

If verdict is BUILD IT, also specify:
1. **One-pager**: What to write as the project README/summary
2. **Live demo**: What the 30-second demo should show
3. **Postmortem**: What architectural decision to highlight and why
4. **STAR story**: Draft the STAR+R story this project will generate

## Output Format

```markdown
# Project Evaluation: {Project Name}

## Concept
{1-2 sentence description}

## Scoring
| Dimension | Score | Notes |
|-----------|-------|-------|
| Signal for target roles | X/5 | ... |
| ... | ... | ... |
| **Weighted Total** | **X.X/5** | ... |

## Verdict: {BUILD IT / MAYBE / SKIP}

## Why
{2-3 sentences}

## If You Build It

### MVP Scope (ship in {timeframe})
- Feature 1
- Feature 2
- Feature 3 (cut if behind schedule)

### Interview Pack
- **One-pager**: ...
- **Live demo**: ...
- **Key decision to highlight**: ...
- **STAR story draft**: S: ... T: ... A: ... R: ... Reflection: ...

### Tech Stack Recommendation
{What to build it with, optimizing for speed + signal}

## Alternatives
{Other project ideas that might be higher-signal}
```
