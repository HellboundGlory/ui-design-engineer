<!--
  Project Design Memory & Engineering Specification (DESIGN.md)
  This file is a design CONTRACT for this project. It records decisions so
  future sessions build on this system instead of drifting from it.
-->

# Project Design Memory (DESIGN.md)

## 1. Product Intent

- **What is this product, in one or two sentences?** A real-time API traffic analytics dashboard for backend/platform engineers monitoring a production API surface: request throughput, error rates, latency percentiles, and per-endpoint health.
- **What is the core job the user is doing on this screen/product?** Monitoring — watching for deviation from normal (error spikes, latency degradation, traffic anomalies) and, when something looks wrong, drilling into which endpoint is responsible.
- **What does success feel like to the user?** "I can tell in under 5 seconds whether the API is healthy right now, and if it isn't, which endpoint is the problem."

## 2. Users & Usage Context

- **Who is the primary user?** SRE / backend engineer / on-call responder. High technical fluency, deep familiarity with HTTP status codes, percentiles, and rate metrics — no need to explain what p99 means.
- **How often and in what context do they use this?** Left open on a second monitor for hours during a shift, glanced at frequently; stared at intensely during an incident. Desktop-first; not a phone-first workflow, though it should not break on a tablet.
- **What's the cost of a mistake or a slow interaction here?** High. A missed error spike or an unreadable latency chart during an incident directly costs detection time. Density and legibility outrank visual warmth.

## 3. Visual Personality

- **In three adjectives, how should this feel?** Instrumented, dense, trustworthy.
- **Any explicit references or products this should feel similar to / deliberately different from?** Similar in spirit to Datadog/Grafana operational dashboards and Vercel's analytics surface — dense, numeric, dark-first. Deliberately different from generic "startup SaaS metrics" dashboards (soft shadows, big rounded KPI cards, pastel gradients).

## 4. Archetype / Direction

- **Active archetype(s):** Precision Technical
- **Why this archetype (or blend) fits this product:** The user is a technical operator using this tool for hours at a time to detect anomalies fast. Success is measured by "I found the problem quickly," not delight. See `references/archetypes/precision-technical.md`.

## 5. Color & Semantic Tokens

New token system, OKLCH. Dark-first (see §5 note below) with a light mode also implemented for completeness/accessibility (some engineers work in bright rooms). Primary accent is a cyan/teal (hue ~215) chosen for a deliberate "instrument/scope" read distinct from the purple/blue-gradient SaaS default — used only for focus rings, links, and the live indicator, never as a decorative fill. Status colors are semantic and reused identically everywhere (metric strip, charts, table badges).

### Light mode
```css
:root {
  --background: oklch(0.99 0.002 240);
  --foreground: oklch(0.18 0.01 240);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.18 0.01 240);
  --primary: oklch(0.49 0.13 215);
  --primary-foreground: oklch(0.99 0.005 240);
  --muted: oklch(0.95 0.004 240);
  --muted-foreground: oklch(0.46 0.015 240);
  --accent: oklch(0.93 0.02 215);
  --accent-foreground: oklch(0.3 0.05 215);
  --border: oklch(0.89 0.006 240);
  --ring: oklch(0.49 0.13 215);
  --status-success: oklch(0.5 0.14 150);
  --status-warning: oklch(0.52 0.15 75);
  --status-error: oklch(0.54 0.21 25);
  --status-info: oklch(0.51 0.12 235);
}
```

Light-mode status/primary lightness values went through two rounds of contrast tuning against `axe-core`'s `color-contrast` check (both found by actually running the automated scan, not by inspection): an initial `0.6`/`0.72`/`0.58` set failed at 2.5:1-4.4:1 against a white card; a second `0.53-0.58` pass fixed all body/UI text but still failed at 4.3:1 (needs 4.5:1) on the small (10px) method-badge labels, whose actual rendered background is the status color tinted at 10% opacity over the card — a lighter, higher-luminance surface than the plain card the first recalculation targeted. Final values (`0.49-0.54`) were computed for ≈5.6:1 against pure white, giving enough margin to clear 4.5:1 against that lighter tinted background too. Re-verified with a manual `axe-core` run against the actual rendered tint (see worker-report.md). OKLCH's perceptual lightness does not track WCAG relative luminance 1:1, especially for saturated hues, and a tinted/opacity-blended background is not the same contrast context as the surface it's tinted from — both worth remembering for any future OKLCH token work in this project.

### Dark mode (default)
```css
.dark {
  --background: oklch(0.16 0.006 240);
  --foreground: oklch(0.93 0.004 240);
  --card: oklch(0.2 0.007 240);
  --card-foreground: oklch(0.93 0.004 240);
  --primary: oklch(0.72 0.13 215);
  --primary-foreground: oklch(0.14 0.01 240);
  --muted: oklch(0.24 0.008 240);
  --muted-foreground: oklch(0.64 0.012 240);
  --accent: oklch(0.28 0.03 215);
  --accent-foreground: oklch(0.85 0.05 215);
  --border: oklch(1 0 0 / 10%);
  --ring: oklch(0.72 0.13 215);
  --status-success: oklch(0.72 0.15 150);
  --status-warning: oklch(0.8 0.15 80);
  --status-error: oklch(0.68 0.19 25);
  --status-info: oklch(0.7 0.12 235);
}
```

- **Does this product need a dark mode at all, and which is the default?** Yes. Dark is the default (fluorescent-light/2am-incident use case, and the archetype's "developer tool dark-first" legitimate exception applies), light mode fully implemented and toggleable, not an afterthought.

## 6. Typography

- **Display font stack:** `"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif` (used only for the page title / section labels, at restrained sizes — this is not an editorial product, display type stays modest)
- **Body font stack:** `"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif`
- **Code / data (monospace) font stack:** `"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace`
- **Scale ratio:** 1.2 (Minor Third) — dense/technical, too much size variance costs vertical space at this density.
- **Tabular numbers policy:** Enforced everywhere numeric — the metric strip, chart axis labels/tooltips, and every table numeric column use `tabular-nums` (mono font family for table numeric columns specifically, since digit alignment matters most there).
- **Font loading note:** No external font fetch (no Google Fonts CDN) — relies on the declared stacks' system fallbacks (`ui-sans-serif`/`ui-monospace`) so the app renders identically with or without network access. Documented here as a deliberate exception, not an oversight.

## 7. Spacing

- **Spacing grid:** 4px, per Precision Technical density target.
- **Any section- or component-specific spacing exceptions worth recording?** Table row height fixed at 32px; metric strip vertical padding 12px (slightly more generous than the 8px widget default because it's the primary at-a-glance summary and benefits from a touch more breathing room around the largest numerals on screen).

## 8. Density

- **Layout density target:** Compact
  - Table row height: 32px
  - Form control height: 32px (time-range segmented control, search input, method filter)
  - Card/widget internal padding: 12px (16px for chart panels, which need room for axis labels)
  - Container max-width: none — fluid, uses full viewport width down to a 1152px min-comfortable width, then reflows at breakpoints (see §16)

## 9. Geometry

- **Global radius token (`--radius`):** 6px
- **Any per-element radius exceptions (e.g., avatars always full-round, cards always sharp)?** Status dots and the live-indicator pulse are fully round (`9999px`); everything else derives from `--radius`. No `rounded-xl`/`rounded-2xl` anywhere.

## 10. Surfaces & Elevation

- **Elevation model:** Border rules — 1px low-opacity borders separate panels; no drop shadows on static panels.
- **Glassmorphism policy:** Forbidden.

## 11. Iconography

- **Primary icon set:** Lucide (`lucide-react`) — 14-16px, stroke width 1.75, used only as scannable glyphs next to labels/table cells, never decoratively.
- **Default stroke width:** 1.75
- **Label requirement:** icon-only controls require an accessible name — always true.

## 12. Navigation

- **Primary navigation model:** Single-screen operational tool — no sidebar/multi-page nav needed for this scope. Top bar holds product identity, live status, and the global time-range control (persistently visible, not hidden in a modal, per `dashboard-architecture.md`).
- **How does navigation adapt at narrow viewports?** Top bar controls wrap to a second row rather than collapsing into a hamburger menu (see `references/responsive-ux-patterns.md`) — the controls (time range, theme toggle) are few enough to stay visible.

## 13. Components

- **Primary component/primitive source:** Bespoke (hand-built Tailwind components), no shadcn/Radix install.
- **Reasoning:** Greenfield project, but the actual interactive-primitive surface is small (a segmented time-range control, a search input, a sortable/filterable table, badges, a theme toggle) — none of it needs shadcn's Radix-backed overlay primitives (no modal, popover, or combobox in this build). Per the component-selection hierarchy, level 7 (bespoke) is the right call here over pulling in a registry (level 5/6) speculatively for controls this simple; it also avoids the code-review/dependency overhead of an unused primitive engine. If a future iteration adds a modal, command palette, or combobox, shadcn/ui on Radix is the documented default to reach for then.
- **Utility/specialized registries in use, if any:** None.

## 14. Data Visualization

- **Charting engine:** Recharts — standard business charts (stacked area, line, bar) with reasonable accessibility/tooltip support and low setup cost, appropriate for a new React/Tailwind project per `data-visualization.md`.
- **Max simultaneous chart series before aggregating to "Other":** 5 (default); latency chart uses exactly 3 (p50/p95/p99), throughput chart uses 3 (2xx/4xx/5xx stacked).

## 15. Motion

- **Motion engine:** CSS transitions only.
- **Default transition dynamic:** 120-150ms ease-out for state changes (row hover, sort indicator, live value updates); the live-indicator pulse is the one continuous animation, disabled under reduced motion.
- **Reduced-motion compliance:** mandatory — `prefers-reduced-motion` disables the live-pulse animation and cuts transition durations to ~0, per `globals.css` base layer.

## 16. Responsive Behavior

- **Breakpoint scale:** Mobile 375px / Tablet 768px / Desktop 1280px / Wide 1600px (Tailwind defaults: sm/md/lg/xl).
- **Any viewport this product deliberately does not support (and why)?** None hard-blocked, but the endpoint table intentionally switches from a full multi-column grid to a stacked card-per-row layout below `md` (768px) — a technical operator may check this dashboard from a phone during an incident, so full data must remain reachable, but the desktop grid genuinely does not read at 375px width without this workflow adaptation.

## 17. Accessibility

- **Target:** WCAG 2.2 AA (default).
- **Known accessibility debt, if inheriting an existing codebase:** N/A — new project. See worker-report.md Automated Checks / Accessibility sections for what was actually verified in this build.

## 18. Project-Specific Anti-Patterns (STRICT NEVER)

- Never use `--status-error` (red) for anything other than an actual error/failure state — not for a generic "important" callout.
- Never add a second charting library alongside Recharts.
- Never render a metric or sparkline without live/mocked data actually behind it — this dashboard's entire premise is real-time truthfulness.
- Never wrap the metric strip's individual numbers in separate bordered cards — they are one grouped summary per §Metric-strip decision below, not a KPI card row.

## 19. Component Sources & Exceptions

- **Primary primitives:** Bespoke Tailwind components (see §13).
- **Utility registries:** None.
- **Charting engine:** Recharts.
- **Documented exceptions to any rule above, with reasoning:** Metric-strip vertical padding exceeds the 8px widget default (see §7) — deliberate, not drift. No external font loading (see §6) — deliberate, for offline reliability.

## 20. Open Questions / Not Yet Decided

- Multi-environment (prod/staging) or multi-service scoping was not requested and is out of scope for this build; the dashboard assumes a single API surface.
- Authentication/access control is out of scope (no login flow was requested).

## 21. Design Decisions Log

- [2026-08-24]: Initialized DESIGN.md for the API Traffic Analytics dashboard. Chose Precision Technical archetype, dark-first OKLCH token system, bespoke component layer (no shadcn install — no overlay primitives needed at this scope), Recharts for charting. Rejected the generic 3-KPI-card + 2-chart-card + table-card shape in favor of grouped metric strip (Throughput / Errors / Latency) + task-derived chart set (throughput-by-status stacked area, error-rate trend with threshold line, latency percentiles multi-line) + a dense sortable/filterable endpoint table.
- [2026-08-24]: Visual QA loop (via `scripts/visual-qa.js` + a manual light-mode `axe-core` pass) surfaced and fixed four real defects: (1) `aria-sort` was placed on the sortable `<button>` instead of its parent `<th>`, an invalid ARIA attribute — moved to `<th>`. (2) Light-mode status/primary token lightness values failed `color-contrast` at 2.5:1-4.4:1 (see §5 note) — retuned in two passes to clear 4.5:1 against both the plain card and the tinted method-badge background. (3) The latency chart's p50 and p95 series both used blue-family hues (`status-info` vs `primary`) that were hard to visually separate — p50 recolored to `muted-foreground` grey, giving a clearer low→high visual gradient (grey/blue/amber) across p50/p95/p99. (4) The metric strip's Latency group overflowed its grid column at tablet width (768px) because its value+delta row had no wrap — changed to `flex-wrap`. All four confirmed fixed by re-running the automated scan, not just visually. Two remaining `visual-qa.js` flags were investigated and are not real defects: 5 "zero-size interactive" sort buttons at the 375px viewport are inside a `display:none` desktop-table subtree (confirmed non-focusable via a direct DOM check, not actually reachable by any user); a 16×16 checkbox input is under the 24×24 target-size guidance but sits inside a 32px-tall `<label>` that is the real click/tap target (label-click-toggles-checkbox is standard browser behavior).
- [2026-08-24]: A manual keyboard-tab pass (not caught by `visual-qa.js`'s axe scan, since axe doesn't simulate Tab navigation) found the endpoint-table search input and method `<select>` had `focus-visible:outline-none`, silently suppressing the global focus ring for keyboard users on those two controls — confirmed via a screenshot showing no visible ring while `document.activeElement` was the input. Removed the class from both; the project's global `:focus-visible` rule (`globals.css`/`index.css`) now applies everywhere, re-verified with a `getComputedStyle` check (`outline: 2px solid`) and a screenshot showing the ring.
