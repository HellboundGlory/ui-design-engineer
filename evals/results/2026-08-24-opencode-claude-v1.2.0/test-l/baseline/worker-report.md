# Worker Report — API Traffic Analytics Dashboard

## 1. Run Metadata

- **Worker:** Claude (Sonnet 5), Claude Code CLI
- **Mode:** Baseline (no skill) — no `/ui-design-engineer` slash command or skill guidance was invoked or read for this run.
- **Branch:** `eval-test-l-baseline-claude`, based on commit `e4f0a0f` (starting tree: empty greenfield repo with only `.gitignore` and an `.opencode/` bridge stub, which was left untouched).
- **Worktree path:** `/home/james/orca/workspaces/ui-design-engineer-eval-greenfield/eval-test-l-baseline`
- **Framework/tooling chosen:**
  - **Vite + React 18 + TypeScript** — fast, standard, minimal-ceremony scaffold for a client-rendered SPA dashboard; TypeScript for compile-time safety on the data model (endpoint metrics, sample shapes) flowing into charts and table.
  - **Recharts 2.x** for the three charts (throughput, error rate, latency percentiles) — a common, reasonably lightweight React charting library that composes well with TypeScript and doesn't require a lot of imperative glue code.
  - **Plain hand-written CSS** (`src/index.css`), no Tailwind/UI kit — kept dependencies minimal and every style rule auditable by reading the file directly, which mattered given there was no way to visually confirm the result.
  - **ESLint** (flat config, `typescript-eslint` + React hooks/refresh plugins) as the linter.
  - No test framework was added (see Scope/Gaps below).
- **Tooling constraint (explicit):** This run had **no browser automation tool, no MCP server, and no way to render or screenshot the app**. All verification below was done through the build/type-check toolchain, `curl` against a running dev/preview server, and manual reading of my own JSX/CSS — never a visual render.

## 2. Task As Given

> Build a real-time API traffic analytics dashboard with error rate trends, throughput charts, latency percentiles, and an active endpoint table.

No further product/design context was provided; this was a from-scratch (greenfield) build with full discretion over stack and design direction.

## 3. What I Built

**Data layer (`src/data/traffic.ts`, `src/hooks/useTrafficFeed.ts`):** There is no real backend, so "real-time" is a client-side simulator: 10 representative REST endpoints (`GET /api/users`, `POST /api/orders`, `POST /api/auth/login`, `GET /api/search`, `POST /api/webhooks/stripe`, etc.), each with its own baseline throughput/error-rate/latency profile. A `useTrafficFeed` hook ticks on an interval (default 2s, user-selectable 1s/2s/5s), applying bounded random-walk drift to each endpoint's metrics plus a small per-tick chance of a transient "incident" (temporary error/latency spike on one endpoint), then aggregates all endpoints into a single fleet-wide sample (request-volume-weighted, so one low-traffic endpoint spiking doesn't dominate the aggregate percentile numbers) appended to a rolling 60-point history window that feeds the charts.

**Layout/IA:** Single-page dashboard, top to bottom:
1. **Header** — title, a "Live/Paused" status indicator, a refresh-interval selector, and a pause/resume control (so a reader isn't fighting a moving target while inspecting a row).
2. **KPI row** (4 cards) — Total Throughput, Error Rate, Latency p50, Latency p99, each with a tick-over-tick delta indicator. This gives an at-a-glance fleet summary before drilling into trends.
3. **Trend charts** — Throughput (area chart, req/s) and Error Rate (line chart, % with warning/critical reference lines at 2%/5%) side by side on desktop, stacked on narrow screens.
4. **Latency Percentiles** — full-width multi-line chart (p50/p95/p99) below the two-column row, since it's the densest chart and benefits from more horizontal space.
5. **Active Endpoints table** — full width at the bottom: method + path, status badge (Healthy/Degraded/Critical, derived from error rate and p99 vs. baseline), req/s, error %, p50/p95/p99, all columns click-to-sort.
6. **Footer** — an explicit disclosure that the feed is simulated, no real backend.

**Chart choices:** Area chart for throughput (volume metric, area reads as "amount"), line chart for error rate with threshold reference lines (a rate metric where the interesting question is "did it cross a line"), multi-line chart for the three latency percentiles together (so p50 vs. p95 vs. p99 divergence — the classic "tail latency is much worse than the median" story — is visible in one view rather than three separate charts).

**Table design:** Sortable by any column via clickable `<th>` headers with `aria-sort`. Default sort is **alphabetical by path**, not by a live-changing metric — see the honesty note in §5 about why I changed this after first writing it the other way. Status badges encode severity redundantly (color dot + text label + colored numeric cells for error % breaches), not by color alone.

**Visual direction:** Dark theme (common for ops/monitoring tooling — Grafana/Datadog-style), monospace numerals for metrics/table data to keep digits aligned, a small teal accent color, semantic red/amber/green reserved for critical/degraded/healthy states only (not used decoratively elsewhere, so the semantic meaning stays legible).

## 4. Approach/Reasoning

1. Scaffolded the project by hand (writing `package.json`, `tsconfig*.json`, `vite.config.ts`, `eslint.config.js` directly) after `npm create vite@latest` failed non-interactively in this shell (its overwrite-confirmation prompt returned "Operation cancelled" against a piped `yes`, and produced no files) — verified this by checking the directory remained empty afterward, then fell back to a manual scaffold rather than fighting the interactive prompt.
2. Built the data simulation layer first, since every visual piece depends on its shape.
3. Built components bottom-up: KPI card → chart wrapper (`ChartCard`, providing a consistent header/description/legend and a screen-reader text summary) → the three charts → status/method badges → the sortable table → `App.tsx` composition → CSS last, once I knew what class names/structure existed.
4. After the first complete pass, did a dedicated accessibility/UX re-read pass (see §5) specifically because I had no visual tooling to lean on — I treated "read the JSX and CSS as if I were a screen reader or a keyboard user" as the primary verification method, and it caught two real issues I fixed before finishing (detailed below).

## 5. Checks Actually Performed — Honest Results

**What I could verify with tooling:**
- `npm run build` (`tsc -b && vite build`) — **passes**, zero TypeScript errors, produces `dist/index.html` + bundled JS/CSS. Output includes a standard Vite warning that the main JS chunk is >500kB minified (mostly Recharts + React); noted as a known gap below, not fixed.
- `npm run lint` (ESLint via flat config, typescript-eslint + react-hooks + react-refresh) — **passes**, zero errors/warnings.
- Ran `npm run dev` and `curl`'d `http://localhost:5177/` — got HTTP 200 and confirmed the returned HTML contains the expected `<title>API Traffic Dashboard</title>`, the `#root` mount div, and a `<script src="/src/main.tsx">` tag; also confirmed `/src/main.tsx` itself returns HTTP 200 from the dev server. This confirms **the server serves the expected HTML shell and Vite is willing to transform the entry module** — it does **not** confirm the React app actually mounts, renders without a runtime error, or looks correct, since I have no JS execution environment (no headless browser, no jsdom test run) in this session.
- Ran `npm run build` then `npm run preview` and `curl`'d the production server the same way — HTTP 200, correct title in the served HTML. Same caveat: this proves the built static output is served correctly, not that it renders correctly in a browser.
- `npm audit` — flags 2 vulnerabilities (1 moderate, 1 high) in `esbuild`/`vite`'s dev-server request-handling, fixable only via a major Vite version bump. These affect the dev server only (not the production build output) and I chose not to force a breaking upgrade for a demo dashboard; noted as a known gap rather than silently ignored.

**What I explicitly could NOT verify, and did not claim to:**
- I never saw this app rendered. No screenshot was taken, no browser opened, no DOM was inspected at runtime. "The server returned the right HTML shell" is not the same claim as "the page renders correctly," and I'm not conflating them.
- No automated accessibility scan (axe or otherwise) was run — that tooling was explicitly off-limits for this exercise, and I didn't attempt to work around that.
- I did not test actual interaction behavior (does the sort actually re-render the rows in the right order, does the pause button actually stop the interval, does the interval-select actually change tick cadence) beyond reading the code and reasoning about it — `setInterval`/`useEffect`/`useState` wiring in `useTrafficFeed.ts` and `EndpointTable.tsx` all look correct to me on inspection, but "looks correct on inspection" is a weaker claim than "observed to behave correctly," and I want that distinction on record.
- Responsive breakpoints (`@media (max-width: 1024px)`, `900px`, `520px` in `src/index.css`) were sanity-checked by reading the CSS and reasoning about the grid `fr` values at each breakpoint (4→2→1 columns for KPI cards, 2→1 for the chart row) — not by resizing an actual viewport.

**Accessibility review — code-reading only, two real issues found and fixed:**
- Re-reading `ChartCard.tsx`, I'd originally given the screen-reader-only chart summary paragraph `role="status"` (an ARIA live region). On review I realized that with data ticking every 1–5 seconds, that would force screen readers to re-announce the chart summary on every tick — disruptive, not helpful. I removed the live-region role, leaving the text reachable on demand (still in the accessibility tree, just not auto-announced). This was reasoned through by re-reading the code against how ARIA live regions behave, not observed in an actual screen reader.
- Re-reading `EndpointTable.tsx`, the default sort was by `rps` descending. Since `rps` drifts every tick for every endpoint, the default view would have continuously reordered rows — hard to visually track, and worse for anyone using a screen reader or keyboard to navigate to a specific row that keeps moving. I changed the default sort to alphabetical-by-path (stable), leaving all live metrics sortable on demand via the column headers.
- Other things checked by reading (not rendering): semantic structure (`header`/`main`/`footer`, one `h1`, `h2`s per chart card section, `<table>` with `<caption>` (visually hidden but present), `scope="col"`/`scope="row"`, `aria-sort` on sortable headers); the refresh-interval `<select>` has both a wrapping `<label>` and an `aria-label` (the `aria-label` wins for the accessible name — slightly redundant, functionally fine, noted rather than silently left); `:focus-visible` outline defined once globally for keyboard-focusable controls; `prefers-reduced-motion` guard on the pulsing "live" dot; status/severity is conveyed by icon+text+color together, not color alone; chart SVGs are marked `aria-hidden` with a parallel plain-text summary alongside, since Recharts SVGs are not reliably screen-reader-navigable. I could not confirm any of this actually behaves as intended in a real screen reader — this is code review against my knowledge of how these ARIA/HTML semantics are supposed to work, not observed assistive-technology behavior.
- Color choices (dark background `#0a0d13`, primary text `#e8ecf3`, secondary text `#9aa4ba`, status colors `#34d399`/`#f5a623`/`#f2495c`) were chosen and reasoned about for contrast by estimating luminance relationships mentally against a dark background — I did **not** run any contrast-ratio calculator or automated tool, so treat this as "chosen carefully" rather than "measured/verified."

## 6. Unresolved Issues, Known Gaps, and Out-of-Scope Items

- **No visual/browser verification of any kind** — this is the headline caveat for the whole report, restated per the task instructions. Everything above that isn't a build/lint/curl result is code-reading and reasoning, not observation.
- **No automated accessibility audit** — deliberately not run, per the constraints of this exercise.
- **No test suite** — no unit/component tests were added (e.g., for the simulator's aggregation math or the table's sort comparator). Given the tooling constraints and time, I prioritized getting a working, honestly-verified build over adding tests I'd also only be able to verify by reading, though tests would have been a legitimate way to gain *some* execution-level confidence without a browser, and I'd add them first if this went further.
- **Data is entirely synthetic/client-side** — there's no real backend, streaming protocol (SSE/WebSocket), or persistence; wiring this to an actual metrics source (Prometheus, a WebSocket feed, etc.) is out of scope for this pass and would change several implementation details (e.g., the aggregation logic currently assumes it owns the full endpoint list every tick).
- **Bundle size warning** — the production JS bundle is ~552kB minified (mostly React + Recharts) and Vite flags it as large; acceptable for a dashboard demo but I did not attempt code-splitting or an alternate lighter charting library.
- **`npm audit` flags 2 vulnerabilities** in Vite's dev-server dependency chain (esbuild), fixable only via a breaking Vite major-version bump; left as-is rather than risking an untested breaking upgrade, and explicitly flagged here rather than silently accepted.
- **No time-range selection** (e.g., "last 15m/1h/6h") — I kept the dashboard to a single rolling live window (60 ticks) rather than building a fake historical-range picker on top of purely synthetic data, since that felt like scope creep that wouldn't be verifiable as "correct" anyway without real historical data.
- **Redundant `aria-label` on the refresh-interval `<select>`** alongside its wrapping `<label>` — functionally harmless (the `aria-label` simply wins as the accessible name) but I noticed it on final review and am flagging it rather than pretending the code is perfectly clean; would tidy it in a follow-up pass.
