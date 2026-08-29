# Worker Report — API Traffic Analytics Dashboard

## What I built

A single-screen, real-time API traffic monitoring dashboard: React 19 + TypeScript + Vite, Tailwind v4, Recharts. Greenfield project — scaffolded from scratch (no prior `package.json` existed).

**Layout, top to bottom:**
- **Top bar** — product identity, a live/paused toggle (with an animated pulse dot, disabled under `prefers-reduced-motion`), a time-range selector (5m/15m/30m), and a last-updated timestamp.
- **Metric strip** — grouped inline stats (Traffic / Errors / Latency) separated by dividers rather than individual cards, so they read as one summary. Requests/sec, active + degraded endpoint count, error rate with a trend arrow vs. earlier in the window, and p50/p95/p99.
- **Throughput chart** — stacked area chart of requests/sec by response-status class (2xx/3xx/4xx/5xx).
- **Error rate chart** and **latency percentiles chart**, side by side — error rate over time with a 5% critical-threshold reference line; p50/p95/p99 over time with a 500ms SLA reference line.
- **Active endpoint table** — sortable by any numeric column, status dot per row, and a real (not decorative) sparkline of each endpoint's recent throughput.

## Why these decisions

I ran this through the `ui-design-engineer` skill's full workflow rather than jumping to components. Two decisions shaped everything else:

1. **Archetype: Precision Technical.** The audience is backend/SRE engineers watching for anomalies, often for hours or during an incident — legibility and consistent color semantics matter more than warmth. This drove: a single dark theme (no half-built light mode), a 4px spacing grid, tight 6px radii, border-based panel separation (no drop shadows), Inter for UI text and JetBrains Mono with `tabular-nums` for every live-updating number (so digits don't jitter as values change), and a disciplined status palette (green/amber/red) used *only* for health state — never decoratively.

2. **Monitoring, not analysis.** Per `dashboard-architecture.md`'s framing, this is a "is the system healthy right now" screen, not an exploratory one. That's why anomalies are surfaced explicitly (threshold reference lines, status-colored rows/text/sparklines, a "degraded" count in the metric strip) rather than leaving the user to eyeball a chart against its own history.

Full reasoning, token values, and the decision log live in `DESIGN.md`. Two exceptions worth calling out:

- **Bespoke primitives instead of shadcn/Radix.** The interactive surface here is small — one dropdown, one sortable table, chart tooltips Recharts already provides. Pulling in a full primitive library for that would be net-negative. Logged as a deliberate exception in `DESIGN.md` §13/§19.
- **Dark-only, v1.** A real ops tool would likely want a light/high-contrast mode for shared displays, but a good one needs its own design pass rather than a naive token inversion — left as an open item (§20) instead of shipping a half-considered light theme.

## Simulated real-time data

There's no backend, so `src/lib/traffic-simulator.ts` is the load-bearing piece: it models 10 realistic endpoints (`GET /api/users`, `POST /api/orders`, etc.) each with its own baseline RPS/latency/error-rate, a slow sinusoidal traffic wave, per-tick random-walk noise, and a small per-tick chance of triggering a transient "incident" (an error spike or a latency spike) that decays over 15–40 ticks. Global throughput/error-rate/latency figures are the RPS-weighted aggregate across endpoints, which is also how the numbers stay internally consistent (e.g., the error-rate chart and the table's per-endpoint error rates never disagree).

`useTrafficData` (in `src/hooks/`) owns the live buffer: it seeds 30 minutes of history synchronously on mount (so the charts aren't empty on first paint, matching how a real dashboard connecting to an existing metrics backend would behave), then appends one tick every 2 seconds, capped at a 900-point ring buffer. The selected time range slices that buffer rather than re-fetching anything. Pausing stops the interval outright — I anchored the visible-window cutoff to the *latest data timestamp* rather than `Date.now()`, so pausing freezes the view instead of the window silently shrinking to nothing while data is frozen but wall-clock time keeps advancing.

Every chart and the table read from this one shared source — nothing is hardcoded or faked independently, per the skill's "never fake a chart" rule.

## Verification

- `npm run build` (tsc + vite) and `npm run lint` (oxlint) both pass clean.
- `visual-qa.js` (Playwright + axe-core) at 375/768/1440/1920px: no horizontal overflow, no structural defects, 0 automated axe violations. One advisory (undersized table-header sort targets) was fixed by adding vertical padding rather than dismissed.
- A scenario run exercised the paused state and a live-incident state (an endpoint mid-error-spike) to confirm the anomaly-surfacing actually renders correctly, not just the steady-state view.
- `check-ui-dependencies.js` and `audit-hardcoded-colors.js`: clean.

## Known limitations / things I'd flag before calling this production-ready

- No light theme (deliberate — see above).
- No backend; the simulator is a stand-in. Swapping in a real metrics source means replacing `useTrafficData`'s tick loop with a WebSocket/SSE/polling subscription — the rest of the component tree only depends on the `TrafficTick[]` shape, so that swap shouldn't ripple further.
- Sub-768px is a "doesn't actively break" target, not a designed one — this is a desktop-first operator tool per the archetype, consistent with how Datadog/Grafana-style consoles are typically used.
- `src/lib/palette.ts` duplicates the color values from `index.css`'s `@theme` block by hand, because Recharts needs JS-readable color strings for its SVG props. It's a small, documented sync burden (noted in `DESIGN.md` §19) rather than a hidden inconsistency risk.
