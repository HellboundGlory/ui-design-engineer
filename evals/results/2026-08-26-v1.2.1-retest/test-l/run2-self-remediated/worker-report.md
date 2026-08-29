# Worker Report — Ingress (API Traffic Analytics Dashboard)

## What I built

A greenfield React + TypeScript + Vite app called **Ingress**: a real-time API
traffic monitoring dashboard with:

- **Metric strip** — throughput, error rate, p95/p99 latency, active endpoint
  count, and open-incident count, shown as one divided inline bar (not a row of
  KPI cards), with trend deltas vs. the prior ~1-minute window.
- **Throughput chart** — total requests/sec over time (area chart).
- **Error rate chart** — overall error-rate % over time, with a dashed 5% SLA
  threshold reference line.
- **Latency percentile chart** — p50/p95/p99 as three lines, weighted across
  active endpoints, colored as a cool→hot intensity ramp (blue → amber → red).
- **Active endpoints table** — 14 representative endpoints (auth, users,
  orders, catalog, payments, notifications, analytics), sortable by any
  column, each row showing live req/s, error rate, p95/p99, a status badge,
  and a small real-data sparkline.
- **Incident banner** — surfaces active anomalies by endpoint name/method
  rather than relying on the user to eyeball a chart deviation.
- A **time-range control** (5m/15m/1h/6h) and a **live/pause toggle**, both
  wired to real behavior (pausing genuinely stops the stream; ranges reslice
  and downsample real history, they don't just relabel the same window).
- A **light/dark theme toggle** on top of a full dual-mode OKLCH token system.

## Why these choices

I ran this through the `ui-design-engineer` skill's workflow rather than
defaulting to a generic "3 KPI cards + 2 charts" layout:

- **Archetype: Precision Technical.** The audience is an on-call engineer
  watching for deviation, not exploring data — that's a monitoring task, and
  the archetype's guidance (dense, high-contrast, border-based surfaces,
  color reserved for status, dark-first) fit directly.
- **Metric strip over KPI cards.** The dashboard-architecture reference is
  explicit that 3+ individually-boxed metric cards fragment attention and
  waste space on decoration; a single divided strip reads as "one summary."
- **Anomaly surfacing, not just passive charts.** The error-rate chart has an
  explicit SLA threshold line, and a dedicated incident banner names the
  affected endpoint — the reference material calls out that passive charts
  alone are a weak monitoring tool for time-sensitive state.
- **Chart series colors are the dataviz skill's validated palette**, not the
  charting library's defaults or hand-picked hex — I ran the categorical
  palette through that skill's reasoning (fixed order, distinct from status
  colors, colorblind-safety already validated) rather than eyeballing colors.
- **No component library.** The UI is ~10 small bespoke components with no
  dialogs/popovers/comboboxes — pulling in shadcn/Radix/MUI here would be
  dependency weight with nothing to justify it.
- **Recharts** for charting: standard line/area charts, no need for bespoke
  D3 visuals or huge datasets, and it's the skill's stated default for this
  situation.

## Data source (important tradeoff)

There is no backend in this repo, so `src/lib/trafficEngine.ts` is an
in-browser simulation: 14 endpoint definitions with baseline RPS/error-rate/
latency, a smoothed random walk for natural jitter, and a small chance per
tick of a randomized "incident" (elevated errors + a latency multiplier) on
one endpoint for 16–40 seconds. It seeds a full hour of history synchronously
on load (so switching to the "1h" range doesn't show an empty chart that has
to fill up live) and then ticks forward every 2 real seconds via
`setInterval`, exposed to React through `useSyncExternalStore`. Every chart,
metric, and table row reads from this same stream — nothing is hardcoded or
faked independently, so the "never fake a sparkline" rule holds even though
the underlying traffic itself is synthetic. Swapping this for a real backend
(WebSocket/SSE/polling a metrics API) means replacing the engine's internal
tick loop while keeping the same `EngineSnapshot` shape — the UI layer
doesn't know or care that the data is simulated.

## QA performed

- `tsc -b` and `oxlint` are clean.
- Installed Playwright + axe-core as devDependencies (Chromium binary only,
  no system deps available in this sandbox) and ran the skill's
  `visual-qa.js` at 375/768/1440/1920px, plus a scripted scenario that
  toggles into light mode. Final pass: **0 structural defects, 0 axe-core
  violations, 0 undersized-hit-target findings** at every viewport in both
  themes.
- Two real issues turned up and were fixed, not just noted:
  1. Light-mode `--status-warning` failed axe's automated contrast check on
     the endpoint table's "Degraded" badge text — darkened it
     (`oklch(0.62 0.15 75)` → `oklch(0.45 0.14 75)`).
  2. The endpoint table's sortable column headers had a ~16×21px click
     target — padded them to clear the 24px minimum.
  3. (Design-consistency bug, not caught by tooling) the "Open incidents" KPI
     was originally counting only formally-tracked incident objects, while
     the table's per-row status badge could independently read "Degraded"
     from a noisy rolling error rate — the two numbers could disagree on
     screen. Unified both to derive from the same per-row status computation.
- `scripts/audit-hardcoded-colors.js` flags the 10 raw-hex `--chart-*` token
  definitions in `src/index.css` — these are intentional (the dataviz skill's
  pre-validated colorblind-safe palette, used verbatim rather than
  re-derived in OKLCH) and are recorded as a reviewed exception in
  `DESIGN.md` §19 rather than silently dismissed.
- `scripts/check-ui-dependencies.js` and `scripts/validate-design-tokens.js`
  both pass clean.
- Did not run a manual WCAG audit against `checklists/accessibility-audit.md`
  beyond the automated axe pass — flagged as open in `DESIGN.md` §17 rather
  than claimed as done.

## Known gaps / things I'd do next

- No drill-down: clicking a table row or chart point doesn't do anything yet.
  Flagged in `DESIGN.md` §20 rather than building fake interactivity.
- The production bundle is ~583KB minified (mostly Recharts) — fine for this
  scope, but worth code-splitting if this dashboard grows more routes/views.
- Mobile gets a working single-column layout and a horizontally-scrollable
  table, but per the Precision Technical archetype this is deliberately a
  desktop-first operator tool, not mobile-optimized.

See `DESIGN.md` for the full token system, archetype reasoning, and decision
log.
