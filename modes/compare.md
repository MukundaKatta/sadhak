# Compare Mode — Multi-Offer Comparison

Compare and rank multiple job offers side by side using a weighted scoring matrix.

## Input

User provides 2+ offers to compare. Can be:
- Text/URLs pasted directly
- References to already-evaluated offers in the tracker (e.g., "#42 and #47")
- Mix of both

If referencing existing evaluations, read their reports from `reports/`.

## Scoring Matrix (10 Dimensions)

| Dimension | Weight | Score 1-5 Criteria |
|-----------|--------|-------------------|
| Role fit | 25% | 5=exact target role, 1=unrelated |
| CV match | 15% | 5=90%+ match, 1=<40% match |
| Level alignment | 15% | 5=staff+, 4=senior, 3=mid-senior, 2=mid, 1=junior |
| Compensation | 10% | 5=top quartile, 1=below market |
| Growth trajectory | 10% | 5=clear path to next level, 1=dead end |
| Remote quality | 5% | 5=full remote async, 1=onsite only |
| Company reputation | 5% | 5=top employer, 1=red flags |
| Tech stack modernity | 5% | 5=cutting edge, 1=legacy |
| Time to offer | 5% | 5=fast process, 1=6+ months |
| Culture signals | 5% | 5=builder culture, 1=bureaucratic |

## Process

1. For each offer: score across all 10 dimensions
2. Calculate weighted total for each
3. Rank offers by weighted score
4. Highlight trade-offs between top contenders

## Output Format

```markdown
# Offer Comparison

## Ranking

| Rank | Company | Role | Score | Key Advantage |
|------|---------|------|-------|---------------|
| 1 | ... | ... | 4.5/5 | ... |
| 2 | ... | ... | 4.2/5 | ... |

## Detailed Matrix

| Dimension (Weight) | Offer A | Offer B | Offer C |
|--------------------|---------|---------|---------|
| Role fit (25%) | 5 | 4 | 3 |
| CV match (15%) | 4 | 5 | 4 |
| ... | ... | ... | ... |
| **Weighted Total** | **4.5** | **4.2** | **3.8** |

## Trade-offs

- Offer A vs B: A has better role fit but B has higher comp...
- ...

## Recommendation

{Which to prioritize and why, considering time-to-offer and strategic value}
```

Ask the user for offers if not already in context. Can reference text, URLs, or tracker entries.
