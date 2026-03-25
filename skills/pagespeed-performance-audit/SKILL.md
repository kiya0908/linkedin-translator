---
name: pagespeed-performance-audit
description: Analyze a local PageSpeed Insights exported HTML file, extract Lighthouse performance signals for mobile and desktop, and produce prioritized performance fixes with concrete evidence. This skill should be used when a user provides a PSI HTML export and asks what is wrong with performance and how to fix it.
---

# PageSpeed Performance Audit

Use this skill to convert a `PageSpeed Insights.html` export into an actionable performance plan.

## When To Use

Use this skill when:
- a user provides a local PageSpeed Insights HTML export file
- a user asks for performance diagnosis (especially mobile)
- a user asks for a prioritized fix plan with concrete evidence

Do not use this skill when:
- no PSI export file is provided
- only generic web performance advice is requested

## Workflow

1. Run the analyzer script with the provided HTML path.
2. Read the generated report and extract:
   - mobile vs desktop scores and core metrics
   - top weighted failing metrics (LCP/FCP/Speed Index/TBT/CLS)
   - high-impact insights (`render-blocking-insight`, `unused-javascript`, `image-delivery-insight`, `lcp-breakdown-insight`)
3. Translate findings into a prioritized plan:
   - `P0`: highest expected metric impact and lowest implementation risk
   - `P1`: medium impact or requires architecture changes
   - `P2`: low impact polish
4. If implementation is requested, map each item to real files using `rg`, then apply targeted edits.
5. Re-run build/typecheck (if code changed), then suggest re-running PSI to verify.

## Commands

Run markdown output (human-readable):

```bash
node skills/pagespeed-performance-audit/scripts/analyze-pagespeed-html.mjs --input "doc/PageSpeed Insights.html" --format md
```

Run JSON output (machine-readable):

```bash
node skills/pagespeed-performance-audit/scripts/analyze-pagespeed-html.mjs --input "doc/PageSpeed Insights.html" --format json
```

Save report to file:

```bash
node skills/pagespeed-performance-audit/scripts/analyze-pagespeed-html.mjs --input "doc/PageSpeed Insights.html" --format md --out ".tmp-pagespeed-analysis.md"
```

## Response Template

Use this structure in replies:

1. Baseline (mobile and desktop core numbers)
2. Main problems (with evidence values)
3. Fixes by priority (`P0`, `P1`, `P2`)
4. If code was changed: file list + verification status
5. Next step: re-run PSI and compare deltas

## Notes

- Prefer mobile findings when mobile and desktop disagree.
- Treat `LCP` and `FCP` as primary for first-screen issues.
- Treat low `TBT` with poor `LCP` as a rendering/resource pipeline problem, not a heavy interaction problem.
