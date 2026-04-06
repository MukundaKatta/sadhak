# Shared Context — Sadhak

## Sources of Truth

| File | Content | Rule |
|------|---------|------|
| `cv.md` | Full CV in markdown | Read before every evaluation. NEVER hardcode metrics. |
| `article-digest.md` | Proof points, case studies, metrics | Read if exists. Optional but dramatically improves quality. |
| `config/profile.yml` | Identity, targets, narrative, compensation | Read before every evaluation. |

## Target Roles / Archetypes

Customize this table to match the user's career targets. Each archetype guides how the system frames the candidate.

| Archetype | Focus Areas | What They Buy |
|-----------|-------------|---------------|
| Backend Engineer | Systems design, APIs, databases, scalability | Production-hardened builder who ships reliable systems |
| Frontend Engineer | UI/UX, React/Vue/Angular, design systems, performance | User-focused developer who bridges design and engineering |
| Full-Stack Engineer | End-to-end delivery, product sense, rapid iteration | Versatile builder who owns features from DB to UI |
| AI/ML Engineer | Model training, MLOps, LLM integration, data pipelines | Applied AI practitioner who ships models to production |
| DevOps/Platform | Infrastructure, CI/CD, Kubernetes, observability | Reliability-obsessed engineer who accelerates teams |
| Engineering Manager | Team building, delivery, process, stakeholder comms | Technical leader who grows people and ships products |

### Adaptive Framing by Archetype

| Archetype | Emphasize From CV | Emphasize From Proof Points |
|-----------|-------------------|-----------------------------|
| Backend | System design, API work, database optimization | Throughput improvements, uptime stats, scale metrics |
| Frontend | UI projects, design collaboration, performance wins | User engagement metrics, accessibility scores, load times |
| Full-Stack | End-to-end features, product ownership | Feature adoption, revenue impact, time-to-market |
| AI/ML | Model deployments, pipeline architecture | Accuracy improvements, cost savings, inference latency |
| DevOps/Platform | Infrastructure projects, automation | Deploy frequency, MTTR, cost optimization |
| Engineering Manager | Team growth, process improvements | Team velocity, retention, delivery metrics |

## Exit Narrative

Use the candidate's `exit_story` from `profile.yml` across all content types:
- **PDF summary**: Bridge from past role to target role
- **STAR stories**: Frame transitions as intentional growth
- **Form answers**: Connect experience to opportunity
- **Cover letters**: Open with compelling narrative arc

## Compensation Intelligence

- Use WebSearch for market data when evaluating comp
- Check levels.fyi, Glassdoor, Blind, Payscale for ranges
- Factor in: location, company stage, equity vs. cash, benefits
- Contractor vs. employee: multiply salary by 1.3-1.5x for contractor equivalent

### Negotiation Scripts

**Script 1 — Setting expectations:**
> "Based on my experience with [proof point] and the market rate for this role in [location], my target range is [range]. I'm flexible on the mix of base, equity, and benefits."

**Script 2 — Geographic discount pushback:**
> "I understand location-based adjustments are common, but my contributions are location-independent. The value I bring — [specific proof point] — doesn't change based on where I sit."

**Script 3 — Below-target counter:**
> "I appreciate the offer. Based on my research and the value I'd bring — specifically [proof point that maps to role] — I was targeting [target]. Can we explore ways to close that gap?"

## Location Policy

- Remote = no location penalty
- Hybrid in candidate's city = no penalty
- Hybrid outside candidate's country = score 3.0 (not 1.0)
- Strict on-site outside candidate's city = score 1.0

## Global Rules: NEVER

1. NEVER invent metrics, numbers, or achievements not in cv.md or article-digest.md
2. NEVER modify cv.md (it's the source of truth — generate tailored versions as separate files)
3. NEVER submit an application without explicit user approval
4. NEVER skip reading cv.md before generating any content
5. NEVER create duplicate tracker entries (check company+role first)
6. NEVER hardcode proof points — always read from source files
7. NEVER launch 2+ Playwright agents in parallel (shared browser instance)
8. NEVER apply to roles scoring below 4.0/5 without explicit user override

## Global Rules: ALWAYS

1. ALWAYS read cv.md and profile.yml before any evaluation
2. ALWAYS include a cover letter draft in the auto-pipeline
3. ALWAYS run cv-sync-check at first session start
4. ALWAYS register every evaluation in the tracker via TSV
5. ALWAYS write tracker additions as TSV, not direct edits to applications.md
6. ALWAYS verify offer URLs with Playwright before evaluating
7. ALWAYS detect JD language and generate content in that language
8. ALWAYS include STAR+R stories in interview prep sections
9. ALWAYS save JD text to `jds/` for future reference
10. ALWAYS update story-bank.md with new STAR stories after each evaluation

## Tools Reference

| Tool | Use For |
|------|---------|
| WebSearch | Market data, company research, salary ranges |
| WebFetch | Static page content extraction |
| Playwright | SPA navigation, form analysis, PDF generation, offer verification |
| Read | Source files (cv.md, profile.yml, reports) |
| Write | New files (reports, TSVs, HTML) |
| Edit | Updating existing files (tracker status, profile) |
| Bash | Running Node.js scripts (generate-pdf, merge-tracker, verify-pipeline) |
