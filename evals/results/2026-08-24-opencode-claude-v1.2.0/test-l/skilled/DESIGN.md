<!--
  Project Design Memory & Engineering Specification (DESIGN.md)
  See ui-design-engineer skill references/ for the reasoning behind each section.
-->

# Project Design Memory (DESIGN.md)

## 1. Product Intent

- **What is this product, in one or two sentences?** Pulse is a real-time API traffic analytics dashboard: throughput, error rate, latency percentiles, and per-endpoint health for a backend API, refreshed continuously.
- **What is the core job the user is doing on this screen/product?** Monitoring — noticing deviation from normal traffic/error/latency patterns quickly, and identifying which endpoint is responsible.
- **What does success feel like to the user?** "I can tell in under 5 seconds whether the API is healthy right now, and if not, which endpoint and how bad."

## 2. Users & Usage Context

- **Who is the primary user?** Backend/platform engineers and on-call responders — technically fluent, familiar with HTTP status codes, percentile latency, and their own API's endpoint surface.
- **How often and in what context do they use this?** Kept open on a secondary monitor for hours during a shift, or opened urgently during an incident. Desktop-first; a phone check during an on-call page is plausible but secondary.
- **What's the cost of a mistake or a slow interaction here?** High during an incident — a hard-to-read chart or a hidden anomaly directly costs time-to-detection. Low friction tolerance; density over decoration.

## 3. Visual Personality

- **In three adjectives, how should this feel?** Instrumented, calm-under-pressure, legible.
- **Any explicit references or products this should feel similar to / deliberately different from?** Similar in spirit to Grafana/Datadog-style ops consoles; deliberately different from a consumer analytics product (no card-fatigue, no decorative color).

## 4. Archetype / Direction

- **Active archetype(s):** Precision Technical
- **Why this archetype (or blend) fits this product:** The user is a technical operator watching for anomalies under time pressure, exactly the "cockpit" use case the archetype describes — see `references/archetypes/precision-technical.md`.

## 5. Color & Semantic Tokens

This is a **dark-only** product by deliberate decision (§5 note below) — tokens are declared once on `:root`, no `.dark` class toggle.

```css
:root {
  --background: oklch(0.16 0.014 258);
  --foreground: oklch(0.94 0.006 258);
  --card: oklch(0.205 0.015 258);
  --card-foreground: oklch(0.94 0.006 258);
  --primary: oklch(0.78 0.13 199);       /* cyan accent — actions, live state, p50 series */
  --primary-foreground: oklch(0.16 0.02 250);
  --muted: oklch(0.24 0.012 258);
  --muted-foreground: oklch(0.66 0.014 258);
  --accent: oklch(0.28 0.02 258);
  --accent-foreground: oklch(0.94 0.006 258);
  --border: oklch(1 0 0 / 10%);
  --ring: oklch(0.78 0.13 199);
  --status-success: oklch(0.72 0.16 149);
  --status-warning: oklch(0.8 0.15 82);
  --status-error: oklch(0.74 0.18 25);   /* raised from an initial 0.66 L after axe flagged a contrast failure on the error badge — see §21 */
  --status-info: oklch(0.7 0.12 235);
  --chart-1: oklch(0.78 0.13 199);  /* p50 / cyan */
  --chart-2: oklch(0.72 0.16 149);  /* success / green */
  --chart-3: oklch(0.8 0.15 82);    /* warning / amber */
  --chart-4: oklch(0.7 0.16 320);   /* p95 / magenta */
  --chart-5: oklch(0.66 0.21 25);   /* reserved */
}
```

- **Does this product need a dark mode at all, and which is the default?** Dark-only by decision — this is a "used at 2am during an incident" operator tool (archetype guidance), not a themeable marketing surface. Light mode is an open question (§20), not implemented.

## 6. Typography

- **Display font stack:** IBM Plex Sans, ui-sans-serif, system-ui, sans-serif
- **Body font stack:** IBM Plex Sans, ui-sans-serif, system-ui, sans-serif
- **Code / data (monospace) font stack:** JetBrains Mono, ui-monospace, SFMono-Regular, monospace
- **Scale ratio:** 1.2 Minor Third — dense/technical, preserves vertical space
- **Tabular numbers policy:** Enforced everywhere numeric (metric strip, chart tooltips/legends, table cells) via `.tabular-nums` / `font-variant-numeric: tabular-nums`

## 7. Spacing

- **Spacing grid:** 4px (Tailwind's default scale), per Precision Technical density
- **Any section- or component-specific spacing exceptions worth recording?** Table cell padding tightened from an initial `px-4` to `px-3` after visual QA showed the endpoint table's rightmost column clipping at the 768px tablet breakpoint (see §21).

## 8. Density

- **Layout density target:** Compact
  - Table row height: 32px (`h-8`)
  - Form control height: 32px (`h-8`) for selects/buttons, 24px (`h-6`) for inline sort headers
  - Card/widget internal padding: 16px (`p-4`)
  - Container max-width: 1600px, centered — keeps the layout from stretching into empty space at ultrawide (1920px) per `responsive-ux-patterns.md`

## 9. Geometry

- **Global radius token (`--radius`):** 4px (`0.25rem`) — tight, per Precision Technical
- **Any per-element radius exceptions?** None; badges, buttons, cards, table, popovers all derive from the same `--radius` scale.

## 10. Surfaces & Elevation

- **Elevation model:** Border rules — 1px low-opacity borders separate cards/table/popovers from the background; no drop shadows except the popover/select dropdown (`shadow-md`), which is a genuinely floating layer.
- **Glassmorphism policy:** Restricted to floating chrome — the sticky top bar uses `backdrop-blur` over a translucent background so content scrolling underneath doesn't visually collide with it.

## 11. Iconography

- **Primary icon set:** Lucide (`lucide-react`)
- **Default stroke width:** Default Lucide stroke (1.5–1.75 equivalent), 14–16px sizing throughout (`size-3.5`/`size-4`)
- **Label requirement:** All icon-only controls (info tooltip trigger, live/pause toggle) carry `aria-label` or visible adjacent text — verified, not assumed.

## 12. Navigation

- **Primary navigation model:** None — this is a single-screen operator dashboard, not a multi-section app. No sidebar/nav was added since there is nothing else to navigate to; adding a decorative nav rail with non-functional links would itself be an anti-pattern (fake affordance).
- **How does navigation adapt at narrow viewports?** N/A (no nav). The top bar's own controls adapt: the time-range segmented control (`hidden sm:flex`) collapses to a single `Select` dropdown below the `sm` breakpoint (`sm:hidden`) — a genuine behavioral adaptation, not just a reflow, verified via Playwright keyboard-focus testing (see §21 and the worker report's Accessibility section).

## 13. Components

- **Primary component/primitive source:** Radix UI primitives (`@radix-ui/react-select`, `-tooltip`, `-slot`), normalized into local shadcn-style wrappers in `src/components/ui/`
- **Reasoning:** Greenfield React/Tailwind project with no existing primitive system — Radix/shadcn is the skill's documented default for this case (`component-selection.md` §5).
- **Utility/specialized registries in use, if any:** None beyond Radix; the endpoint table is a bespoke component (a generic data-grid registry wasn't justified for 6 columns / 11 rows).

## 14. Data Visualization

- **Charting engine:** Recharts
- **Max simultaneous chart series before aggregating to "Other":** 5 (default) — the busiest chart (latency percentiles) uses 3 (p50/p95/p99); throughput uses 3 (2xx/4xx/5xx)

## 15. Motion

- **Motion engine:** CSS transitions only (Tailwind `transition-colors`, the live-indicator `animate-ping`)
- **Default transition dynamic:** Fast, linear/ease-out (100–150ms range), per Precision Technical — no springs/bounce
- **Reduced-motion compliance:** Mandatory — `prefers-reduced-motion: reduce` is handled globally in `index.css` (cuts all transition/animation durations) and the live-indicator ping specifically carries `motion-reduce:animate-none`.

## 16. Responsive Behavior

- **Breakpoint scale:** Mobile 375px, Tablet 768px, Desktop 1440px, Wide 1920px (Tailwind's default `sm`/`md`/`xl` map onto these)
- **Any viewport this product deliberately does not support (and why)?** None deliberately excluded — verified render + axe scan at all four reference viewports (see worker report).

## 17. Accessibility

- **Target:** WCAG 2.2 AA (default). See worker-report.md for the specific automated + manual findings from this build.
- **Known accessibility debt, if inheriting an existing codebase:** N/A — greenfield.

## 18. Project-Specific Anti-Patterns (STRICT NEVER)

- Never use `--status-error` red for anything other than an actual error/critical state (never decoratively).
- Never add a sparkline or trend indicator that isn't wired to the same `EndpointStat.trend` data used elsewhere — no decorative charts.
- Never let a chart's Y-axis margin go negative without re-verifying tick-label clipping at all four reference viewports (this bit the first draft — see §21).

## 19. Component Sources & Exceptions

- **Primary primitives:** Radix UI (`@radix-ui/react-select`, `@radix-ui/react-tooltip`, `@radix-ui/react-slot`)
- **Utility registries:** None
- **Charting engine:** Recharts
- **Documented exceptions to any rule above, with reasoning:** None yet beyond what's logged in §21.

## 20. Open Questions / Not Yet Decided

- Light mode: not implemented. If a future requirement needs it (e.g., a shared-screen wallboard in a bright room), the token contract already separates role from value, so it's additive, not a rework.
- Drill-down: clicking a table row or chart point currently does nothing beyond hover/tooltip. If a per-endpoint detail view or trace drill-down becomes a requirement, add it deliberately rather than leaving row hover states looking clickable without a destination.
- Environment switcher (`production`/`staging`) currently only changes the label shown, not the underlying mocked data set — acceptable for this task's scope (there's no real backend), but worth flagging if this ever gets wired to a real API.

## 21. Design Decisions Log

- 2026-08-24: Initialized DESIGN.md for Pulse (API traffic analytics dashboard). Chose Precision Technical archetype, dark-only OKLCH token system, Inter/JetBrains Mono, 4px radius/spacing, Radix + Recharts.
- 2026-08-24: Ran `scripts/visual-qa.js` (Playwright + axe-core were found available via a pre-existing shared cache on this machine, not installed by this session — see worker-report.md's Skill Behavior Observed section for the full account). First pass found: (1) invalid `aria-sort` placed on a `<button>` instead of its parent `<th>` — critical axe violation, fixed by moving the attribute; (2) `--status-error` at L=0.66 failed axe's color-contrast check on the badge — raised to L=0.74; (3) two undersized (<24px) interactive targets (the info-tooltip trigger, the sort-header buttons) — bumped to 24px+ hit areas. Re-run confirmed 0 axe violations at all four viewports.
- 2026-08-24: Manual visual inspection (real Playwright screenshots) caught a Y-axis tick-label clipping bug across all three charts, caused by a `margin.left: -16` fighting the `YAxis` width allocation (visible as `.00s`/`!%` truncated labels). Fixed by setting `margin.left: 0`. Re-screenshotted to confirm full labels render (`0%`/`2%`/`4%`/`6%`/`8%`, `0ms`/`250ms`/`500ms`/`750ms`/`1.00s`).
- 2026-08-24: Measured (via a Playwright script, not just visual guess) that the endpoint table's `scrollWidth` (744px) exceeded its scroll container (718px) at the 768px tablet breakpoint, clipping the rightmost "Status" column's "Degraded" badge on first paint. Fixed by tightening table cell padding (`px-4`→`px-3`) and the sparkline width (72→56px); re-measured `scrollWidth === clientWidth` (718 = 718) confirming the fix.
- 2026-08-24: Verified via a Playwright keyboard Tab-order script (not just assumption) that the desktop-only segmented time-range control and desktop-only table sort headers — both hidden at 375px via Tailwind `hidden` (display:none) and replaced by their mobile equivalents — are correctly unreachable by keyboard at that viewport, despite the visual-qa script's structural heuristic flagging them as "zero-size visible interactive" (a known limitation: the heuristic doesn't distinguish a responsively-hidden ancestor from an accidentally-collapsed control). Documented as a reviewed, verified non-issue rather than silently ignored.
- 2026-08-24: Swapped the body/display font from Inter to IBM Plex Sans (the archetype's other sanctioned neutral technical sans — see `references/archetypes/precision-technical.md`) after a design-quality hook flagged Inter as one of the most overused faces in AI-generated UI. This is a real fix, not a suppressed finding: Inter's genericness is exactly the kind of default-reaching the skill's own anti-patterns catalog argues against, and IBM Plex Sans keeps the same neutral/high-legibility intent without the "seen everywhere" association. JetBrains Mono (the numeric/tabular face) was unaffected — it wasn't flagged.
