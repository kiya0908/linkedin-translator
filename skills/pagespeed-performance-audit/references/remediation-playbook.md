# PSI Remediation Playbook

Use this mapping to convert audit IDs into concrete actions.

## High-Impact Audits

- `render-blocking-insight`
  - Inline critical CSS
  - Defer non-critical CSS
  - Avoid large font chains in first paint path

- `unused-javascript`
  - Delay third-party scripts (analytics, auth SDKs) until `load` or first interaction
  - Lazy-load non-critical components/routes
  - Avoid mounting heavy widgets in hero immediately

- `image-delivery-insight`
  - Replace oversized images with dimension-appropriate assets
  - Prefer small logo/icon variants for nav usage
  - Add explicit `width`/`height` for stable layout

- `lcp-breakdown-insight`
  - If `elementRenderDelay` is high, avoid hiding first-screen content behind hydration animations
  - Render first-screen heading/hero text statically first

## Secondary Audits

- `cache-insight`
  - Increase cache lifetime for static third-party assets where controllable

- `forced-reflow-insight`
  - Avoid layout-thrashing reads/writes in the same frame
  - Remove expensive first-screen transitions dependent on measured layout

## Quick Prioritization Rule

Choose fixes in this order:

1. Largest expected `LCP/FCP` savings from PSI
2. Lowest blast radius code changes
3. Re-test and keep only changes with measured gains
