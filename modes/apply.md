# Apply Mode

Live application assistant for filling out forms in real time.

## Workflow

1. **Detect context**: Get active Chrome tab via screenshot/URL/title
2. **Identify offer**: Extract company and role from page
3. **Find evaluation**: Search `reports/` for existing evaluation (Grep case-insensitive)
4. **Load context**: Read report + draft answers (Section G) if found
5. **Check for changes**: If role changed since evaluation, offer to re-evaluate
6. **Analyze form**: Detect all question types:
   - Free text (short/long)
   - Dropdowns/selects
   - Yes/no / checkboxes
   - Salary expectations
   - File uploads (resume, cover letter)
   - Links (LinkedIn, portfolio, GitHub)
7. **Generate answers**: Match to existing draft answers or generate new ones from report + cv.md
8. **Post-apply**: Update tracker to "Applied", save final answers, suggest LinkedIn outreach

## Output Format

Present per-question copy-paste blocks:

```
---
Report: #{num} | Score: {X.X}/5 | Archetype: {type}
---

**Q: {question text}**

{generated answer}

---
```

Followed by notes/suggestions.

## Answer Sources (Priority Order)

1. Section G from evaluation report (pre-drafted answers)
2. Generated from report sections + cv.md
3. Generated from cv.md + profile.yml alone

## Form Navigation

If the form extends below the fold:
- Process visible questions first
- Ask user for additional screenshot
- Continue with remaining questions

## File Upload Guidance

When form requires file uploads:
- Point to latest resume PDF in `output/`
- Point to cover letter PDF in `output/`
- Remind user to upload manually (Claude can't upload files to external sites)

## Salary Field Strategy

- If profile.yml has `compensation.target_range`, use it
- If report Block D has market data, reference it
- Default: "Open to discussion based on the full compensation package"
- Never share minimum/walk-away number
