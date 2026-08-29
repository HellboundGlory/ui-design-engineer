# Project Design Memory (DESIGN.md)

## 1. Product Intent

- **What is this product?** Ingress — a real-time API traffic analytics dashboard: throughput, error rate, latency percentiles, and per-endpoint health for a backend API.
- **Core job on this screen:** Monitoring. An on-call engineer or SRE watches for deviation from normal and needs to notice anomalies fast, then drill into which endpoint is responsible.
- **What does success feel like?** "I can tell at a glance whether the API is healthy, and if not, which endpoint and how bad."

## 2. Users & Usage Context

- **Primary user:** Backend/platform engineers and on-call SREs — technical, fluent with HTTP status codes, percentiles, and RPS.
- **Usage context:** Kept open on a second monitor for hours at a time, or pulled up urgently during an incident.
- **Cost of a mistake:** High during an incident (missing a spike costs response time), low otherwise. Density and legibility matter more than ornamentation.

## 3. Visual Personality

- **Three adjectives:** Instrumented, precise, calm-under-load.
- **References:** Grafana / Datadog dark operational dashboards — not a marketing analytics tool.

## 4. Archetype / Direction

- **Active archetype:** Precision Technical.
- **Why:** Technical operator audience, monitoring (not exploratory analysis) task, success = "found the anomaly fast." See `references/archetypes/precision-technical.md`.

## 5. Color & Semantic Tokens

Dark is the default and primary mode (operational tool, "used at 2am during an incident"); light is supported and fully token-driven via a `data-theme` attribute toggle in the header, but every value was chosen with dark as the primary target.

Token names here diverge slightly from the template: `--surface`/`--surface-foreground` replace `--card`/`--card-foreground` (there is no separate "card" concept — the app uses full-bleed bordered panels, not nested cards).

### Dark (default)
```css
--background: oklch(0.16 0.01 250);
--foreground: oklch(0.94 0.004 250);
--surface: oklch(0.205 0.011 250);
--surface-foreground: oklch(0.94 0.004 250);
--primary: oklch(0.72 0.14 227);
--primary-foreground: oklch(0.14 0.015 250);
--muted: oklch(0.245 0.012 250);
--muted-foreground: oklch(0.65 0.014 250);
--accent: oklch(0.28 0.03 227);
--accent-foreground: oklch(0.88 0.03 227);
--border: oklch(1 0 0 / 10%);
--ring: oklch(0.72 0.14 227);
--status-success: oklch(0.7 0.15 150);
--status-warning: oklch(0.8 0.15 85);
--status-error: oklch(0.66 0.2 25);
--status-info: oklch(0.7 0.11 255);
```

### Light
```css
--background: oklch(0.985 0.002 250);
--foreground: oklch(0.18 0.012 250);
--surface: oklch(1 0 0);
--surface-foreground: oklch(0.18 0.012 250);
--primary: oklch(0.52 0.15 227);
--primary-foreground: oklch(0.99 0 0);
--muted: oklch(0.955 0.004 250);
--muted-foreground: oklch(0.46 0.012 250);
--accent: oklch(0.93 0.02 227);
--accent-foreground: oklch(0.32 0.06 227);
--border: oklch(0.9 0.006 250);
--ring: oklch(0.52 0.15 227);
--status-success: oklch(0.5 0.14 150);
--status-warning: oklch(0.45 0.14 75);
--status-error: oklch(0.55 0.21 25);
--status-info: oklch(0.55 0.12 255);
```

`--status-warning` in light mode was deliberately darkened (L 0.62 → 0.45) after the axe-core automated scan flagged the original value's text contrast as a "serious" violation against the light surface — see §21.

### Chart series tokens (separate from status/primary — see §14)
```css
--chart-1: #3987e5 (dark) / #2a78d6 (light)  /* blue — p50, throughput */
--chart-2: #d95926 (dark) / #eb6834 (light)  /* orange — reserved */
--chart-3: #199e70 (dark) / #1baf7a (light)  /* aqua — reserved */
--chart-4: #c98500 (dark) / #eda100 (light)  /* amber — p95 */
--chart-8: #e66767 (dark) / #e34948 (light)  /* red — p99 */
```
These are the dataviz skill's validated categorical palette (`references/palette.md`), sourced directly rather than derived from the OKLCH brand ramp — chart identity colors are deliberately distinct from status/semantic colors per that skill's rule ("status colors are reserved, never reused for series").

- **Dark mode default:** yes — this is the primary supported mode for the archetype; light is a fully-implemented but secondary alternative.

## 6. Typography

- **Display / body font stack:** `"Inter", ui-sans-serif, system-ui, sans-serif`
- **Code / data (monospace) stack:** `"JetBrains Mono", ui-monospace, "SFMono-Regular", monospace` — used for endpoint paths and HTTP methods in the table.
- **Scale ratio:** 1.2 (Minor Third) — implicit via Tailwind's default type scale, kept tight per the dense archetype.
- **Tabular numbers policy:** Enforced everywhere numeric — all metric values, chart axis ticks, tooltip values, and table numeric columns use `tabular-nums`.

## 7. Spacing

- **Spacing grid:** 4px (Tailwind default scale), per Precision Technical's density guidance.

## 8. Density

- **Layout density target:** Compact.
  - Table row height: ~36px (px-3 py-2 cells)
  - Time-range/live control height: ~28px
  - Panel internal padding: 16px (p-4)
  - Container max-width: 1400px, centered

## 9. Geometry

- **Global radius token:** 0.3rem (~5px) — tight, per archetype ("rounded corners exist to soften edges, not signal friendliness").

## 10. Surfaces & Elevation

- **Elevation model:** Border-based separation (1px low-opacity border), no drop shadows except the segmented time-range control's active-segment shadow.
- **Glassmorphism policy:** Forbidden.

## 11. Iconography

- **Primary icon set:** None imported — a single inline SVG wordmark glyph in the header. No other decorative icons; status is communicated via color + text label (dot + word), not icons, keeping the icon surface minimal by design.
- **Label requirement:** All icon-only/glyph-only controls carry `aria-label` or `aria-hidden` as appropriate (verified via axe-core scan, 0 violations).

## 12. Navigation

- **Primary navigation model:** Single-screen dashboard, top bar only (product mark, live/pause toggle, time-range control, theme toggle). No sidebar — there is only one screen in this product's current scope.
- **Narrow viewports:** Header wraps via flex-wrap; metric strip and chart grid collapse to a single column below `lg`; the endpoint table scrolls horizontally rather than reflowing (acceptable per archetype — desktop-first operator tool).

## 13. Components

- **Primary component/primitive source:** None (custom, hand-built). No shadcn/Radix/MUI — the entire UI is ~10 small bespoke components (badges, controls, table) with no interactive-primitive complexity (popovers, dialogs, comboboxes) that would justify a primitive engine. Adding one here would be dependency weight without a corresponding need.
- **Utility/specialized registries in use:** None.

## 14. Data Visualization

- **Charting engine:** Recharts — standard line/area charts with reasonable customization, no need for bespoke D3 visuals or very large datasets.
- **Max simultaneous chart series:** 3 (latency percentiles: p50/p95/p99), well under the 5-series cap.
- **Series color assignment:** Fixed order from the dataviz skill's validated categorical palette (chart-1 blue, chart-4 amber, chart-8 red) chosen to read as an intensity ramp (cool → hot = better → worse percentile), never cycled or reassigned by filter state.
- **Tooltips:** One shared `<ChartTooltip>` component reused by all three charts for consistent formatting.
- **Anomaly surfacing:** Error-rate chart carries a dashed reference line at the 5% SLA threshold; a dedicated incident banner surfaces active endpoint-level incidents by name rather than relying on the user to eyeball chart deviation (see `references/dashboard-architecture.md` §Alerting).

## 15. Motion

- **Motion engine:** CSS transitions only (color/background transitions on interactive controls); Recharts animation explicitly disabled (`isAnimationActive={false}`) so the live-updating charts don't re-animate on every 2s tick.
- **Reduced-motion compliance:** Global `prefers-reduced-motion` media query zeroes transition/animation durations (includes the live-indicator's ping animation).

## 16. Responsive Behavior

- **Breakpoint scale:** Tailwind defaults (sm/md/lg/xl). Chart grid switches from 2-column to 1-column at `lg`.
- **Viewport support:** Verified 375/768/1440/1920 via `scripts/visual-qa.js` — no horizontal overflow at any size. Mobile is supported but not optimized as a primary use case (see §12).

## 17. Accessibility

- **Target:** WCAG 2.2 AA. Automated axe-core scan (via `scripts/visual-qa.js`) returns 0 violations at all four viewports in both themes after the light-mode warning-color contrast fix (§21). This is an automated-subset result, not full manual AA conformance — a full manual pass against `checklists/accessibility-audit.md` has not been separately completed.
- **Known debt:** None identified beyond the standard "axe covers ~30-40% of real issues" caveat.

## 18. Project-Specific Anti-Patterns (STRICT NEVER)

- Never fake a chart or sparkline with static/hardcoded data — the endpoint table's trend sparkline and all three charts are wired to the same live `trafficEngine` stream, never illustrative placeholder data.
- Never let a status color (success/warning/error) double as a chart series color — chart series always use the `--chart-*` tokens, status always uses `--status-*`.
- Never reintroduce the default AI-slop "3 KPI cards + 2 chart cards" layout — metrics stay in one divided inline strip, not individual cards (see `references/dashboard-architecture.md`).

## 19. Component Sources & Exceptions

- **Primary primitives:** None — custom-built.
- **Charting engine:** Recharts.
- **Documented exceptions:** `--chart-*` tokens are raw hex (not OKLCH) by deliberate exception — they're sourced verbatim from the dataviz skill's pre-validated, colorblind-safety-tested categorical palette, and re-deriving them in OKLCH risked breaking that validation. Flagged by `audit-hardcoded-colors.js`; reviewed and kept.

## 20. Open Questions / Not Yet Decided

- No backend exists yet — all data comes from an in-browser simulation (`src/lib/trafficEngine.ts`). Wiring to a real metrics backend (Prometheus, a custom ingest API, etc.) is the natural next step and would replace the engine's `setInterval` tick with a WebSocket/SSE subscription while keeping the same `EngineSnapshot` shape consumed by `useTrafficStream`.
- No drill-down view exists yet (clicking a table row or chart point does nothing beyond what's already visible) — flagged as a known gap rather than silently omitted.

## 21. Design Decisions Log

- 2026-08-29: Initialized DESIGN.md for Ingress. Archetype: Precision Technical, dark-default with full light-mode support.
- 2026-08-29: Darkened light-mode `--status-warning` from `oklch(0.62 0.15 75)` to `oklch(0.45 0.14 75)` after `visual-qa.js`'s axe-core pass flagged a serious color-contrast violation on `.text-status-warning` (the endpoint table's "Degraded" badge) in light mode. Re-ran the scan clean afterward.
- 2026-08-29: Increased the endpoint table's sortable column-header buttons from an implicit ~16×21px hit target to ~36×29px+ (added `px-1 py-2.5`) after `visual-qa.js` flagged them as REVIEW-level undersized interactive targets across all four viewports.
