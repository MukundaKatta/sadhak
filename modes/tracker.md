# Tracker Mode

Display and manage application status.

## Tracker Table Format

```
| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
```

## State Machine

```
Evaluated → Applied → Responded → Interview → Offer
                                             → Rejected
                                             → Discarded
SKIP (never applied)
```

### State Definitions

- **Evaluated**: Report completed, pending decision
- **Applied**: Candidate submitted application
- **Responded**: Company replied (inbound)
- **Interview**: In interview process (any stage)
- **Offer**: Offer received
- **Rejected**: Rejected by company at any stage
- **Discarded**: Candidate withdrew or offer closed
- **SKIP**: Evaluated but not worth applying

## Statistics to Display

- Total applications
- Count by state (with percentages)
- Average score
- Score distribution (>=4.5, 4.0-4.4, 3.5-3.9, <3.5)
- % with PDF generated
- % with cover letter
- % with report
- Recent activity (last 7 days)

## Actions

- **Update status**: User says "mark #42 as Interview" → edit applications.md
- **Add notes**: User says "add note to #42: phone screen went well" → edit applications.md
- **Filter**: User says "show all interviews" → filter and display
- **Sort**: By date, score, status, company
- **Search**: By company name or role title
