# Worker report — Log streaming panel

## Task as given

Product brief: "Build a developer observability log streaming panel with log
severity filtering (INFO, WARN, ERROR), JSON payload inspector, keyboard
shortcut support, and search." Target codebase: "orbitctl", an existing React
19 + Vite + TypeScript + Tailwind v4 dashboard with a dark-mode design system
already in place. Instruction was to preserve the existing visual language and
reuse existing tokens/primitives rather than inventing new ones, and to build
something functionally real rather than a static happy-path mock.

This was run as the no-skill baseline arm of an A/B evaluation; no
`ui-design-engineer` skill material was consulted at any point. All design
and engineering decisions below are my own judgment applied to the existing
codebase.

## What I read before writing any code

- `src/index.css` — the CSS-variable token system (`--color-bg*`,
  `--color-border*`, `--color-text*`, `--color-accent*`, `--color-success*`,
  `--color-warning*`, `--color-danger*`, `--color-info`, radii, fonts) and how
  it's re-exposed through Tailwind's `@theme`.
- `src/components/Badge.tsx`, `Button.tsx`, `Card.tsx`, `Input.tsx`,
  `Modal.tsx`, `Layout.tsx` — every existing primitive, to learn the
  established variant/tone naming and Tailwind class conventions (radii,
  border colors, spacing scale, hover states).
- `src/pages/Dashboard.tsx` and `src/pages/Billing.tsx` — page-level IA
  conventions: `mx-auto max-w-5xl px-6 py-6` container, `Card`/`CardHeader`/
  `CardBody` composition, table styling (`border-b border-border`, `tabular`
  class for numeric columns, `font-mono` for identifiers), and — critically —
  how `Badge` tones already map to status semantics (`healthy` → `success`,
  `degraded` → `warning`).
- `src/main.tsx` for routing, `package.json`/`tsconfig.app.json` for the
  toolchain (React 19.2, `verbatimModuleSyntax: true`, `noUnusedLocals`,
  oxlint instead of ESLint), and `.oxlintrc.json` for lint rules in force
  (`react/rules-of-hooks`, `react/only-export-components`).

## What I built

New route `/logs` ("Logs" in the sidebar nav, between Dashboard and Billing)
rendering `src/pages/Logs.tsx`, plus:

- `src/lib/logs.ts` — a `LogEntry`/`Severity` type and a mock log generator
  (varied services, routes, messages, and severity-appropriate JSON payloads,
  including a synthetic stack trace for `ERROR` and a threshold object for
  `WARN`) that produces different, non-repeating data each render/run.
- `src/components/log-panel/JsonTree.tsx` — a recursive, collapsible JSON
  tree viewer (not a `<pre>{JSON.stringify()}</pre>` dump): each
  object/array node is independently expandable/collapsible, auto-collapses
  below depth 2 to avoid overwhelming nested payloads, and color-codes token
  types (keys, strings, numbers/booleans, `null`, punctuation).
- `src/components/log-panel/ShortcutsModal.tsx` — reuses the existing
  `Modal` primitive verbatim to list all keyboard shortcuts with `<kbd>`
  chips.
- Small, targeted edit to `src/components/Input.tsx` to accept a `ref` prop
  (React 19 no longer requires `forwardRef`, but the prop still has to be
  named/typed explicitly) — needed so the toolbar search input can be
  focused programmatically by the `/` shortcut. This is the only change to a
  shared primitive; it's additive and backward compatible.
- `src/components/Layout.tsx` and `src/main.tsx` — one line each to register
  the nav entry and the route.

### Severity → color mapping (the key design decision)

I deliberately did **not** invent new severity colors. Dashboard already
established a semantic vocabulary through `Badge` tones (`success` = green,
`warning` = amber, `danger` = red, `info` = accent blue, all backed by the
existing `--color-success/-warning/-danger/-info` tokens). I mapped:

- `INFO` → `Badge tone="info"` (accent blue, same as the sidebar's active-nav
  accent) — informational, not alarming.
- `WARN` → `Badge tone="warning"` (the same amber Dashboard uses for
  `degraded` services).
- `ERROR` → `Badge tone="danger"` (the same red used for negative deltas /
  would be used for a `down` status).

The severity filter chips and the small status dot next to each chip reuse
the same three tokens at the `-muted` variants for backgrounds, so the
filter toolbar and the log rows read as one coherent color system rather
than a bolted-on new palette. For the JSON tree's *own* syntax highlighting
I deliberately used only neutral text tokens (`text-text`, `text-text-muted`,
`text-text-faint`, `text-accent-strong`) rather than success/warning/danger,
to avoid semantic collision — a green string inside an `ERROR` payload would
visually contradict the row's own red badge.

### Interaction design

- **Search** filters on message, service name, and severity string,
  live-updating a "N of M logs" count.
- **Severity filters** are independently toggleable chips (at least one must
  stay active); each shows a live count of buffered entries at that level.
- **JSON inspector**: click a row (or select + Enter/`o`) to expand an inline
  payload row below it, with a "Copy JSON" button
  (`navigator.clipboard`, wrapped in try/catch since clipboard access can be
  unavailable in some contexts — failure is silently swallowed, not
  reported to the user, which is a known minor gap).
- **Keyboard shortcuts**, wired via a single `window` `keydown` listener in
  `Logs.tsx` (real `addEventListener`/`removeEventListener`, not decorative
  UI): `/` focus search, `j`/`k` (and arrow keys) move selection, `Enter`/`o`
  toggle the selected row's payload, `1`/`2`/`3` toggle each severity filter,
  `p` pause/resume the stream, `c` clear the buffer, `Esc` clear
  selection/blur search, `?` open the shortcuts modal. The listener ignores
  keystrokes while an `<input>`/`<textarea>`/contenteditable element is
  focused (except `Escape`, which blurs it), so typing in the search box
  isn't hijacked. Selection is tracked by log **id**, not array index, so it
  stays pinned to the same entry even as new logs stream in above it.
- **Simulated live stream**: a `setInterval` (600–1500ms, randomized)
  prepends a new mock entry every tick, capped at 400 buffered entries via
  `slice`. Pause/Resume actually tears down/re-creates the interval (not a
  cosmetic flag) — verified via screenshot (`07-logs-paused.png`) that the
  status pill flips to "Paused" and the button flips to "Resume".

### Layout/visual choices

Container width for this page is `max-w-6xl` (vs. `max-w-5xl` on
Dashboard/Billing) — a deliberate, minor deviation because the log table
needs more horizontal room for the message column and expanded JSON; padding
scale, card radius/border, table row borders, `tabular`/`font-mono` usage,
and typography sizes are all unchanged from the established convention.

## Checks actually performed

- `npm run build` (`tsc -b && vite build`) — passes clean, no type errors.
- `npm run lint` (`oxlint`) — clean; one `react-hooks/exhaustive-deps`
  warning was raised during development (missing `moveSelection` dep on the
  keydown effect) and fixed by wrapping `moveSelection` in `useCallback` and
  adding it to the dependency array. Final lint output has zero
  warnings/errors.
- Installed `playwright` as a devDependency (chromium binary only, not
  `--with-deps`, since this sandbox has no passwordless sudo for system
  libs) and drove the running dev server (`vite --port 5183`) with a
  throwaway script at `.eval/shot.mjs`. This exercised, for real, in a
  headless browser: initial render, clicking a row to expand its JSON
  payload, toggling severity filters down to ERROR-only, typing a search
  query, keyboard-only navigation (`j` × 3 → selection highlight moves),
  `Enter` to expand the keyboard-selected row, `p` to pause the stream, and
  `?` to open the shortcuts modal — then navigated back to `/` to screenshot
  Dashboard for a side-by-side visual comparison. `page.on("pageerror")` and
  `console.error` were captured and came back empty (`CONSOLE_ERRORS: []`).
  Screenshots are in `.eval/screenshots/`:
  1. `01-logs-initial.png` — initial stream state, filter chips with live
     counts.
  2. `02-logs-payload-expanded.png` — JSON tree inspector expanded via
     click.
  3. `03-logs-error-filter.png` — ERROR-only filter, confirms the count
     ("2 of 61 logs") and red badge contrast.
  4. `04-logs-search.png` — search-in-progress state with focus ring and
     zero-result empty state.
  5. `05-logs-keyboard-selection.png` — `j`×3 keyboard navigation, selected
     row highlighted.
  6. `06-logs-keyboard-expand.png` — `Enter` on the keyboard-selected row.
  7. `07-logs-paused.png` — `p` shortcut toggling to "Paused"/"Resume".
  8. `08-logs-shortcuts-modal.png` — `?` shortcut opening the shortcuts
     modal (reusing the existing `Modal` primitive).
  9. `09-dashboard-for-comparison.png` — Dashboard page, for visual
     side-by-side against the new Logs page.
- I did **not** run an automated accessibility audit (no axe-core/Lighthouse
  pass). I relied on: reusing accessible existing primitives (`Modal` already
  has `role="dialog"`/`aria-modal`/focus-trap-free-but-Escape-closing
  behavior unchanged), `aria-label`s on the search input and shortcuts
  button, `aria-pressed` on severity filter chips, and the app's existing
  global `:focus-visible` outline. I did not verify screen-reader behavior,
  color-contrast ratios numerically (I relied on reusing already-shipped
  color pairs from Badge, which presumably already met whatever bar the app
  was built to), or keyboard-only reachability of literally every control
  (e.g., I did not confirm Tab order through the severity chips vs. the
  table rows).
- I did not test at narrow/mobile viewports — the existing app has no
  responsive layout to speak of (fixed 224px sidebar, no breakpoints in the
  files I read), so I matched that assumption and did not add any.
- I did not write unit/integration tests — none exist elsewhere in this
  codebase to follow a pattern from, and none were requested.

## Known gaps / deliberately out of scope

- The log stream is entirely client-side/mocked (as instructed) — no real
  backend, WebSocket, or SSE integration.
- No persistence: pausing/clearing/filters reset on page reload; there's no
  URL-state sync for filters or search.
- `Copy JSON` failures are silently swallowed rather than surfaced via a
  toast — the app has no toast/notification primitive to reuse, and adding
  one felt out of scope for this task.
- No virtualization on the log table; capped the buffer at 400 rows as a
  cheap ceiling instead. Fine for a demo/mock stream, would need
  windowing (e.g. `react-window`) for a real high-throughput feed.
- Multiple payload rows can be expanded simultaneously (accordion-style, not
  single-open) — a deliberate choice for comparing entries, not a bug.
- Found and worked around a footgun in the repo's own `.gitignore`: it
  contains a bare `logs` pattern (intended for npm debug log files) that
  silently ignores *any* directory or file literally named `logs` anywhere
  in the tree — including a `src/components/logs/` directory. I did not
  touch the shared `.gitignore`; instead I named the component folder
  `src/components/log-panel/` to sidestep it. Worth flagging to whoever
  reviews this, since it's an easy trap for future contributions to this
  repo.
