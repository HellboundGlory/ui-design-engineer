# Project Design Memory (DESIGN.md)

## 1. Product Intent

- **What is this product, in one or two sentences?** A real-time API traffic analytics dashboard: a single operational screen that shows request throughput, error rates, latency percentiles, and per-endpoint health for a backend API.
- **What is the core job the user is doing on this screen?** Monitoring — watching live traffic for deviation from normal (error spikes, latency degradation, a misbehaving endpoint) and confirming the system is healthy at a glance.
- **What does success feel like to the user?** "I can tell in under five seconds whether traffic is healthy, and if not, exactly which endpoint and which metric is the problem."

## 2. Users & Usage Context

- **Who is the primary user?** Backend/platform engineers and on-call SREs. Technically fluent, fluent with HTTP status codes, percentiles, RPS.
- **How often and in what context do they use this?** Left open on a second monitor for hours during a shift, or pulled up urgently during an incident. Desktop-first; not a mobile use case.
- **What's the cost of a mistake or a slow interaction here?** High — a missed error spike or an illegible latency chart delays incident response. Legibility and glanceable anomaly signaling matter more than visual flourish.

## 3. Visual Personality

- **Three adjectives:** instrumented, high-contrast, unhurried-under-pressure (calm even while surfacing alarming data).
- **References:** Datadog / Grafana / Vercel Analytics-style ops tooling — deliberately not a consumer analytics product (not Mixpanel/Amplitude's softer, marketing-facing style).

## 4. Archetype / Direction

- **Active archetype:** Precision Technical.
- **Why:** The audience is technical operators using this for hours at a time to catch anomalies fast; trust comes from legibility and consistency, not warmth. This is the textbook case the archetype describes.

## 5. Color & Semantic Tokens

Dark-mode only for v1 (see note below). OKLCH tokens, defined once in Tailwind v4's `@theme` block in `src/index.css` and treated as the single theme. Token names carry Tailwind v4's required `--color-*` prefix (not the unprefixed `--background`-style names shown in this skill's generic template) so that utilities like `bg-background`/`text-foreground` are generated automatically.

```css
@theme {
  --color-background: oklch(0.17 0.012 260);        /* app canvas, near-black slate */
  --color-surface: oklch(0.21 0.013 260);            /* panel/table surface */
  --color-surface-raised: oklch(0.25 0.014 260);     /* hover/raised rows, popovers */
  --color-foreground: oklch(0.94 0.004 260);         /* primary text */
  --color-muted-foreground: oklch(0.64 0.012 260);   /* secondary text, axis labels */
  --color-border: oklch(0.32 0.014 260);             /* structural 1px borders */
  --color-border-subtle: oklch(0.27 0.013 260);
  --color-primary: oklch(0.72 0.14 232);             /* accent: live indicator, focus, links */
  --color-primary-foreground: oklch(0.17 0.012 260);
  --color-status-success: oklch(0.73 0.16 149);      /* 2xx, healthy */
  --color-status-warning: oklch(0.8 0.15 82);        /* 4xx, degraded latency */
  --color-status-error: oklch(0.65 0.21 25);         /* 5xx, breached threshold */
  --color-status-info: oklch(0.7 0.12 240);
}
```

`src/lib/palette.ts` mirrors these same values as plain JS strings (Recharts needs JS-readable colors for its SVG props, not CSS custom properties) — kept in sync by hand; documented in §19.

- **Does this product need a dark mode at all, and which is the default?** Dark is the only mode for v1. Rationale logged in §21 — ops tools of this archetype are used for long stretches and often during incidents; a single well-executed dark theme was prioritized over a half-built light/dark toggle. Recorded as an open item in §20 rather than silently skipped.

## 6. Typography

- **UI font stack:** `Inter, ui-sans-serif, system-ui, sans-serif` — loaded via Google Fonts, with the system stack as fallback.
- **Data/numeric font stack:** `"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace` — every live-updating number, table metric column, timestamp, and axis tick.
- **Scale ratio:** Compact custom scale (11/12/13/14/16/20/28px) rather than a large type-ramp — this screen is data-dense, not editorial.
- **Tabular numbers policy:** Enforced everywhere numeric (`font-variant-numeric: tabular-nums`) — mandatory given live-updating figures throughout.

## 7. Spacing

- **Spacing grid:** 4px.
- **Exceptions:** none yet.

## 8. Density

- **Layout density target:** Compact.
  - Table row height: 36px
  - Form control height: 32px
  - Panel internal padding: 12–16px
  - Container max-width: full-bleed (fluid), with a 1440px content max on ultra-wide

## 9. Geometry

- **Global radius token:** 6px (`--radius: 6px`). Slightly larger 8px reserved for the outer app shell/panels only.
- **Exceptions:** status dots and the live-pulse indicator are fully round.

## 10. Surfaces & Elevation

- **Elevation model:** Border-based. 1px low-opacity borders separate panels; no drop shadows except the time-range popover.
- **Glassmorphism policy:** Forbidden.

## 11. Iconography

- **Primary icon set:** lucide-react.
- **Default stroke width:** 1.75, 14–16px.
- **Label requirement:** icon-only controls always carry `aria-label`.

## 12. Navigation

- **Primary navigation model:** Single-screen dashboard — a top bar (product mark, live/paused status, time-range control) with no sidebar. There is only one screen in this product; a sidebar would be pure decoration.
- **Narrow viewports:** the metric strip and chart grid collapse to a single column; the endpoint table scrolls horizontally within its own container rather than the page scrolling horizontally.

## 13. Components

- **Primary component/primitive source:** Bespoke (bare Tailwind + a handful of ~20–60 line hand-built components: `Select`, `SortableTable`, `StatusDot`, `MetricStat`).
- **Reasoning:** This is level 7 of the selection hierarchy, chosen deliberately over shadcn (level 5): the interactive surface is small (one dropdown, one sortable table, chart tooltips that Recharts already provides) and doesn't need a dialog/form/menu system. Pulling in Radix + shadcn's scaffolding for one `<select>`-equivalent would be net-negative bundle weight for what's used. Logged as an exception in §19.

## 14. Data Visualization

- **Charting engine:** Recharts. Reasonable default for a new React project needing standard line/area charts with tooltip and accessibility support at low setup cost; no existing chart library to reuse since this is greenfield.
- **Max simultaneous chart series before aggregating to "Other":** 5 (default). Latency chart uses exactly 3 (p50/p95/p99); throughput chart uses up to 4 status-class series (2xx/3xx/4xx/5xx).

## 15. Motion

- **Motion engine:** CSS transitions only.
- **Default transition dynamic:** 120–150ms ease-out for state changes (row hover, value updates, panel focus); no springs/bounce.
- **Reduced-motion compliance:** `prefers-reduced-motion` disables the live-pulse animation and chart-update transitions; data still updates, just without animated interpolation.

## 16. Responsive Behavior

- **Breakpoint scale:** Desktop-first: 1920 / 1440 / 1024 (min supported) as primary targets; 768 given a best-effort single-column fallback since this is a desktop-first ops tool, not a phone use case.
- **Viewport not supported:** sub-768px is not a design target (per archetype guidance: desktop-first tools for technical operators aren't expected to run on a phone), but nothing actively breaks there.

## 17. Accessibility

- **Target:** WCAG 2.2 AA.
- **Known debt:** none yet — this is a new build.

## 18. Project-Specific Anti-Patterns (STRICT NEVER)

- Never use `--status-error` (red) for anything but an actual error/breach state — not decoration, not a neutral "hot" color choice.
- Never render a chart or sparkline with hardcoded/example data — every visual is wired to the shared simulated-traffic data source (see worker-report.md), even though there is no real backend yet.
- Never let a live-updating number reflow its neighbors (tabular-nums is mandatory on every metric, table cell, and axis label).

## 19. Component Sources & Exceptions

- **Primary primitives:** Bespoke Tailwind components (see §13).
- **Charting engine:** Recharts.
- **Documented exceptions:** Chose bespoke primitives over shadcn/Radix (level 7 over level 5) — justified by minimal interactive-surface needs; revisit if this product grows a second screen with real forms/dialogs.

## 20. Open Questions / Not Yet Decided

- Light theme was deliberately deferred, not designed — if this product needs to support a well-lit shared/TV-mounted display, a light or high-contrast variant should be designed as its own pass, not derived by inverting the dark tokens.
- No authentication/multi-tenant/environment-switching concerns were in scope; the dashboard assumes one API's traffic.

## 21. Design Decisions Log

- 2026-08-29: Initialized DESIGN.md for API Traffic Analytics Dashboard. Chose Precision Technical archetype, dark-only theme, Recharts, and bespoke primitives over shadcn (see §13, §19).
