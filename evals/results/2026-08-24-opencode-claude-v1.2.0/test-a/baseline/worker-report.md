# Worker Report — API Traffic Analytics Dashboard

## 1. Run Metadata

- **Worker**: Claude (Sonnet 5), background CLI agent
- **Mode**: Baseline (no skill) — no `/ui-design-engineer` skill, references, checklists, or archetype files were consulted at any point. Design decisions below come entirely from general front-end/product-design judgment.
- **Branch**: `eval-test-a-baseline-claude`, based on commit `e4f0a0f`
- **Worktree**: `/home/james/orca/workspaces/ui-design-engineer-eval-greenfield/eval-test-a-baseline`
- **Framework/tools chosen**:
  - **React 19 + TypeScript**, scaffolded via `npm create vite@latest -- --template react-ts` (run in a scratch dir and copied in, since `create-vite` refused to scaffold into a non-empty directory — the worktree already had `.gitignore` and `.opencode/`).
  - **Tailwind CSS v4** via `@tailwindcss/vite` (the new zero-config Vite plugin — no `tailwind.config.js`/PostCSS setup needed, just `@import "tailwindcss"` in `src/index.css`).
  - **Recharts 3.x** for charting — chosen because it's the most established declarative charting library for React, composes well with Tailwind for styling (tooltips/legends via inline style + className), handles responsive containers out of the box, and its `AreaChart`/`LineChart` primitives cover the throughput/error-rate/latency needs without hand-rolling SVG.
  - **oxlint** (came pre-wired in the Vite scaffold's `package.json` as the `lint` script) — used as-is rather than adding a second linter.
  - No state-management library, no CSS-in-JS, no UI kit (shadcn, MUI, etc.) — the surface area didn't need one; plain Tailwind + a handful of components was sufficient and kept the bundle honest.

## 2. The Task As Given

> "Build a real-time API traffic analytics dashboard with error rate trends, throughput charts, latency percentiles, and an active endpoint table."

No further product context was given. Greenfield, own design direction, within the required stack (React + TS + Tailwind). Expected to be functionally real — charts wired to actual (simulated is fine) data, a genuinely sortable/filterable table, not static markup.

## 3. What I Built

**Product framing**: an API gateway observability dashboard ("API Traffic" / "v2 gateway"), the kind of internal tool an platform/SRE team would keep open on a monitor — dense, dark, information-forward, similar in spirit to Grafana/Datadog dashboards but with its own visual identity rather than cloning either.

**Information architecture** (top to bottom, single-page, no navigation — the task didn't call for multi-page IA and a single dense view is the idiomatic shape for this kind of tool):
1. **Header** — product name, a "v2 gateway" scope tag, a live/paused status dot with last-updated timestamp, a Pause/Resume control, and a 4-way time-range segmented control (5m/15m/1h/6h).
2. **Stat tiles row** (4 tiles) — Total Requests (in window), Throughput (req/s, with trend delta vs. the prior tick), Error Rate (%, with trend delta, colored red past the SLO line), P99 Latency. These are the numbers someone glances at first.
3. **Charts row** — Throughput (2/3 width) paired with Error Rate (1/3 width) side by side on wide screens, stacking to full-width on narrower ones. Putting throughput and error rate next to each other lets you visually correlate a traffic spike with an error spike without scrolling.
4. **Latency percentiles chart** — full width on its own row, since three overlapping percentile lines need horizontal room to stay legible.
5. **Active endpoints table** — full width, the "what's actually happening right now" drill-down.
6. Footer disclosure that the data is simulated client-side.

**Chart choices and why**:
- **Throughput** → stacked `AreaChart` split by response class (2xx/4xx/5xx). A stacked area was chosen over a plain line because it answers two questions in one chart: "how much traffic" and "how much of it is failing," visually, without needing a second overlay.
- **Error rate** → `LineChart` with a dashed `ReferenceLine` at a 5% SLO threshold, and the panel itself gets a subtle red ring when the current value breaches it — so the alert state is visible even from a glance at the panel border, not just the number.
- **Latency percentiles** → `LineChart` with p50/p95/p99 as three separate lines. This is the standard way to show percentile spread (rather than e.g. a single average, which would hide tail latency — the whole point of the ask).
- All three charts share dark tooltip styling, a consistent muted grid, and a coherent small color palette (cyan/violet/amber/rose) rather than defaulting to Recharts' stock colors, to avoid the charts looking like three unrelated widgets bolted together.

**Table design**:
- Columns: status badge, endpoint (method badge + path + owning service), RPS, requests (in window), error rate, p50/p95/p99, and a per-row sparkline (custom inline-SVG component, not another Recharts instance, to keep 17 rows of mini-charts cheap to render).
- **Sortable**: every numeric column and the endpoint path are sortable by clicking the column header (button element, not a bare `<th>`, so it's keyboard-reachable and has proper `aria-sort`); clicking again reverses direction.
- **Filterable**: free-text search over path/service, a method dropdown, and a status dropdown (healthy/warning/critical), all composable together, with a "N of 17 shown" count.
- Status is computed live from the endpoint's rolling error rate (healthy <1%, warning 1–5%, critical ≥5%), and an active "incident" on an endpoint pulses its status dot — a small detail that ties the table back to the same underlying simulation state driving the charts, rather than being decorative.

**Data — how it's "real" without a backend**: I did not want a table full of frozen numbers or charts that just replay a static array, since the task explicitly called that out. `src/lib/simulator.ts` defines 17 realistic-looking endpoints (auth, users, orders, payments, search, inventory, webhooks, reports, etc.) each with a base RPS/latency/error-rate profile. Every 2 seconds (`src/hooks/useTrafficSimulator.ts`), each endpoint is "ticked": request volume follows a diurnal (time-of-day) curve plus noise, latency percentiles are derived analytically from a log-normal model (rather than sampling thousands of individual requests, which would be wasteful for a client-side demo), and a small per-tick probability triggers a transient "incident" on an endpoint (elevated latency + error rate for 6–18 ticks) that resolves on its own — this is what produces the visible spikes/dips in the charts and the "critical" rows in the table, so the dashboard has something worth looking at rather than a flat line. Switching the time range (5m/15m/1h/6h) re-seeds the whole simulation with backfilled synthetic history for that window so charts are immediately populated instead of starting empty and filling up over several minutes of real wall-clock time — documented as a deliberate simplification, not hidden.

## 4. Approach / Reasoning

1. Scaffolded via `create-vite` into a scratch directory (it refuses to run against a non-empty target) and copied the result into the worktree, preserving the existing `.gitignore` and `.opencode/` stub. This did overwrite `.gitignore` with Vite's default one (dropping some unused Next.js-specific ignore lines from the original like `.next`/`out`/`build`, adding standard OS/editor ignores) — worth flagging as an incidental side effect, though functionally harmless for a Vite project.
2. Added Tailwind v4 + the Vite plugin, replaced the scaffold's default landing-page CSS with a minimal dark-mode base stylesheet.
3. Designed the data model and simulator first (`types.ts`, `lib/simulator.ts`) before any UI, since the whole point was for the UI to be driven by something real rather than mocked in the component tree.
4. Built the hook (`useTrafficSimulator`) to own all simulation state (rolling per-endpoint tick buffers, incident lifecycle, backfill-on-range-change, live interval), keeping components pure/presentational.
5. Built components bottom-up: `Sparkline` → `ChartPanel` (shared card chrome) → the three chart components → `EndpointTable` → `Header`/`StatTile` → `App` composition.
6. Fixed TypeScript errors from Recharts' tooltip `formatter` typing (its generic `ValueType` isn't narrowed to `number` the way I first wrote it) and cleaned up two `react/purity` oxlint warnings by lazily initializing `Date.now()`-based state instead of calling it inline during render.
7. Ran the app in a real Chrome tab (via the `claude-in-chrome` MCP tools) and manually exercised it rather than trusting the build alone — details below.

## 5. Checks Actually Performed

- **`npm run build`** (`tsc -b && vite build`): passes cleanly. Output: `dist/index.html`, `dist/assets/index-*.css` (19.4 kB), `dist/assets/index-*.js` (596 kB / 175.6 kB gzipped). Vite warns the JS chunk exceeds its 500 kB heuristic (Recharts + React account for most of it) — noted as a known tradeoff, not addressed with code-splitting since a single-page dashboard has nothing meaningful to lazy-load.
- **`npm run lint`** (`oxlint`): passes (exit 0). One warning remains and was deliberately left in place rather than suppressed: `react(set-state-in-effect)` on the range-change effect in `useTrafficSimulator.ts` — that effect legitimately re-seeds an entire simulated dataset (imperative loop with side effects on incident state) when the range control changes, which isn't something that can be "derived during render"; I judged the warning to be a reasonable false-positive for this specific case rather than a real bug, but I did not add a suppression comment, so it's visible to anyone running lint.
- **Live browser verification** (Chrome via MCP, not just visual inspection — actually interacted with the running `npm run dev` server on `localhost:5183`):
  - Confirmed charts render with live-flowing data: took screenshots several seconds apart at the same scroll position and confirmed the throughput/error-rate/latency numbers and curves changed between them (e.g., total requests ticking from 953.3k → 954.2k → 957.4k etc. across successive screenshots).
  - Noticed and diagnosed a transient rendering artifact on first paint (the throughput chart briefly appeared to spike-then-flatten before settling into its real shape a couple of seconds later) — determined via a follow-up zoomed screenshot and a second clean page load that this was a `ResponsiveContainer` first-measure layout hiccup, not a data bug (the error-rate and latency charts, driven by the same `series` state, rendered correctly from the first paint). Reproduced a clean load afterward to confirm.
  - **Table sort**: clicked the "Error rate" column header — rows reordered descending correctly with the status badges (critical/warning/healthy) aligning with the values. Also tested keyboard-driven sort (Tab to the "Endpoint" header button, press Enter) — sort applied correctly and the `↓` indicator appeared.
  - **Table filters**: typed "orders" into the search box — filtered from 17 to 3 matching rows correctly. Set the status filter to "Critical" via the select — correctly narrowed to the one endpoint (`/api/v1/webhooks/stripe`) currently over the error threshold. Reset both back to "all".
  - **Pause/Resume**: clicked Pause — status dot stopped pulsing, label changed to "Paused"/"Resume", and confirmed via two screenshots 4 seconds apart that all numbers (total requests, throughput, error rate, table rows) were byte-identical while paused, i.e. the interval genuinely stops rather than just hiding the "live" indicator. Resumed afterward.
  - **Time range switch**: clicked "1h" — chart x-axes and the endpoint table re-seeded immediately with a full hour of backfilled synthetic history (not an empty chart slowly filling up), total-requests stat scaled up accordingly (~3.7M vs. ~950k at 15m), and a different simulated incident pattern was visible in the backfilled history.
  - **Keyboard/focus pass**: tabbed through the page from a neutral starting point — focus moved search input → method select → status select → table sort-header buttons, each with a clearly visible cyan focus ring (`focus-visible:ring-2`). One incidental finding: the Recharts SVG chart container itself is also in the tab order and gets a plain browser-default focus rectangle around the whole chart panel when focused — functional and visible, if not deliberately styled; I did not add a `tabIndex={-1}` to suppress it, so it's left as-is and disclosed here rather than silently accepted.
  - **Responsive check** at three widths via the browser's actual window resize (not just CSS breakpoints read from code): 1440×900 (desktop — 4-column stat row, 2/3+1/3 chart row), 768×1024 (tablet — stat tiles stay 4-across since Tailwind's `sm:` breakpoint is 640px, charts stack to full width), 390×844 (mobile — stat tiles go 2×2, charts stack, and the endpoint table scrolls horizontally within its own `overflow-x-auto` container rather than breaking the page's vertical-only scroll — confirmed by screenshot showing the `Requests` column truncated at the viewport edge with no page-level horizontal scrollbar).
  - **Console check**: read the browser console after a fresh reload — zero errors or warnings beyond Vite's own HMR connect messages and the standard React DevTools suggestion.
  - Screenshots saved as evidence under `.eval/screenshots/`:
    - `01-desktop-overview.jpg` — clean first-paint desktop view at 1440px.
    - `02-desktop-table-sorted-error-rate.jpg` — table sorted by error rate descending, status badges visible.
    - `03-mobile-390px-overview.jpg` / `04-mobile-390px-charts.jpg` — 390px mobile layout.
    - `05-desktop-paused-state.jpg` — paused state showing the "Paused"/"Resume" UI.

## 6. Unresolved Issues / Known Gaps / Deliberate Scope Cuts

- **No automated tests.** Nothing in the task asked for a test suite, and given the time budget I prioritized manual/live browser verification over writing unit tests for the simulator's statistical model. If this were headed to production I'd want at least a couple of unit tests around `tickEndpoint`'s percentile math and the table's sort/filter reducer logic.
- **Global percentile aggregation is an approximation.** The dashboard's top-level p50/p95/p99 (stat tile + latency chart) are a request-weighted average of each endpoint's own percentiles for that tick, not a true percentile of the merged raw request distribution — true percentile merging across services isn't mathematically well-defined without raw samples, and this weighted-average approach is a common, disclosed simplification (also called out in a code comment in `useTrafficSimulator.ts`).
- **Error class split (4xx vs 5xx) is heuristic**, not independently modeled — a tick's error count is split 70/30 into 5xx/4xx for the stacked throughput chart rather than being tracked as genuinely distinct error types per endpoint.
- **Time-range backfill is synthetic**, not "real" history — switching to 1h/6h doesn't reflect anything that happened before the page loaded; it re-runs the same generator backwards in time. This is disclosed both in the footer copy ("Data is simulated client-side... not connected to a live backend") and in this report, not hidden behind a realistic-looking historical chart.
- **Bundle size warning** (596 kB JS, mostly Recharts) was left unaddressed — no code-splitting was added since there's only one route/view and nothing meaningful to defer.
- **The Recharts chart container's default focus outline** (mentioned above) wasn't styled or suppressed — a minor polish item, not a functional accessibility failure since it is visible.
- I did not test with a screen reader (VoiceOver/NVDA) — the keyboard/focus-visibility pass was manual tab-order + visual inspection only, not a full assistive-technology audit.
- I did not run this on an actual mobile device or in a non-Chromium browser — responsive checks were done by resizing the Chrome window, not on real mobile hardware or Safari/Firefox.
