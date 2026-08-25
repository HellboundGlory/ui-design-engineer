# Worker Report — Customer Admin Console

## Run metadata

- **Stack:** React 19 + TypeScript, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`
  plugin, CSS-first config via `@theme` — no `tailwind.config.js` needed in v4).
  No component library (no shadcn/MUI/AntD) — hand-built table, dropdowns, and
  badges. No router, no server — single-page, single-view app, appropriate for
  the scope of the brief.
- **Dependencies added and why:**
  - `tailwindcss` + `@tailwindcss/vite` — utility styling.
  - No other runtime dependencies. Deliberately did not reach for a table
    library (e.g. TanStack Table) or a UI kit — the brief's surface area
    (sort, select, bulk actions, pagination) is small enough that hand-rolled
    logic is more transparent to review and keeps the bundle small
    (213 KB JS / 66 KB gzipped for the whole app).
- **Tools actually used for verification:** the `claude-in-chrome` browser
  MCP extension (navigate, resize_window, click/type, screenshot,
  read_console_messages). It worked reliably for everything I needed,
  including window resizing, so I did not fall back to a local Playwright
  install.
- Scaffolded with `npm create vite@latest -- --template react-ts` into a
  temp dir and moved contents in (the target directory wasn't empty enough
  for create-vite to scaffold in place non-interactively).

## Task as given

"Build an enterprise customer administration system with multi-column
sorting, row selection, bulk actions menu, status badge chips, and
pagination." Greenfield, audience = internal ops staff using the tool all
day at a desk, 8-hour shifts. Brief asked for the density framing to
visibly shape decisions, not just be flavor text, and for a real, sortable,
paginated dataset of 100+ rows rather than a static happy-path mock.

## What I built

A single-page **Customers** view inside a minimal app shell (12px-height
top bar with product name / breadcrumb / account count — no sidebar, since
a sidebar with mostly-dead nav items would itself have been the kind of
non-functional decoration the brief warns against). The view is one card
containing, top to bottom: a filter/search toolbar, a bulk-actions bar that
only renders when `selectedCount > 0`, the table itself, and a pagination
footer.

**Data model** (`src/types.ts`, `src/data/generateCustomers.ts`): a
`Customer` has id, company, contact name/email, status (active / trial /
past_due / suspended / churned), plan tier (starter / growth / enterprise /
enterprise+), MRR, seats (used/total), region, account owner, a health
score, and created/last-activity dates. 220 rows are generated with a
seeded PRNG (`mulberry32`) so the dataset is large enough to make sorting
and pagination meaningful and is stable across reloads within a session
rather than reshuffling on every render — but it does regenerate fresh (not
persisted) on a hard reload, which is a known/acceptable limitation for a
mocked dataset (see Gaps).

**Density / layout reasoning (the part the brief cared about most):** the
"8-hour desk shift" framing drove several concrete, checkable decisions
rather than staying abstract:
- Row height is `h-9` (36px) with `py-1.5` cell padding and `text-sm`
  (14px) body text — noticeably tighter than a consumer-app card list or a
  typical marketing-site table, closer to the density of tools like
  Retool/Airtable-grid/admin-panel tables that people stare at all day.
  I explicitly rejected a card-grid reinterpretation of the data — this is
  a real `<table>`/`<thead>`/`<tbody>`/`<th scope="col">` structure, because
  a card grid would cost roughly 3-4x the vertical space per row for the
  same information and would break column-wise scanning, which is the
  actual task ops staff do (scanning a column, not reading one row as a
  unit).
- Numeric columns (MRR, seats, health) are right-aligned with
  `tabular-nums` so digits line up vertically for fast scanning — a detail
  that matters more the longer someone stares at a column of numbers.
- Sticky table header (`sticky top-0`) so column headers stay visible
  while scrolling a long page of rows within the card.
- Status badge chips are intentionally low-weight: a small dot + 11px text
  on a pale tint background with a subtle ring, not a saturated filled
  pill. They're meant to be scannable peripherally (color cues) without
  visually shouting on every single row of a dense table — five different
  saturated chip colors repeated down 50 rows would fight for attention all
  day.
- The bulk-actions bar is genuinely contextual: it does not render at all
  (not just hidden/disabled) when `selectedIds.size === 0`, and appears as
  a compact dark bar (distinguishable from the light toolbar above it)
  only once something is selected — verified visually (screenshots
  02/03).
- Toolbar and pagination footer are similarly compact (small `text-xs`
  controls, ~44px toolbar height) rather than the larger touch-friendly
  controls appropriate for an occasional-use consumer surface.

**Functional behavior (not decorative):**
- **Multi-column sort:** click a header to sort by it (asc → desc → off);
  shift-click another header to add it as a secondary key, shown with a
  small numbered badge next to the arrow indicating sort priority. Sort
  state is an ordered `SortRule[]`, applied left-to-right in
  `src/lib/sort.ts` with a final stable id tiebreaker. Verified this
  actually changes row order, including the secondary key correctly
  breaking ties within the primary key's groups (see screenshot 04: sorted
  by Status then MRR — MRR is visibly ascending *within* the Active group).
- **Row selection:** per-row checkbox, header checkbox with real
  indeterminate state (`ref` callback setting `.indeterminate`), scoped to
  the current page (selection persists across pages in the `Set<string>`
  even though "select all on page" only touches the visible page — I did
  not build a "select all N matching across pages" affordance; see Gaps).
- **Bulk actions:** "Set status" (mark active / suspend / mark churned) —
  actually mutates the underlying dataset via `setCustomers`, confirmed by
  screenshot 03 showing three rows' Status column changing from
  Active/Active/Trial to Suspended after the action, and selection
  clearing afterward. "Export CSV" builds a real CSV client-side and
  triggers a browser download via an object URL. "Delete" removes the
  selected rows from state after a native `confirm()` guard.
- **Filters:** free-text search (company/contact/email/id), a multi-select
  status filter (checkbox dropdown), and single-select plan/region
  filters, all combined and re-applied live, with a result count and a
  "Reset filters" affordance that only appears when a filter is active.
  Changing any filter resets to page 1.
- **Pagination:** real slicing of the sorted+filtered array
  (`sorted.slice(start, start + pageSize)`), page-size selector
  (25/50/100), numbered page buttons with ellipsis collapsing for larger
  page counts, "Showing X–Y of Z" — verified with screenshot 05 (page 2
  correctly shows rows 51–100 and sort order continues correctly across
  the page boundary).

## Key decisions / reasoning

- Kept the app to one view rather than adding sidebar nav to other
  "enterprise" sections (Billing, Reports, etc.) that the brief didn't ask
  for — those would have been unwired decoration, which the brief
  explicitly flags as a failure mode.
- Table columns are fixed-width-ish via `min-w-*` utility classes and the
  table has `overflow-x-auto`; below ~1150px the table scrolls
  horizontally rather than the columns getting so cramped they become
  illegible or wrapping into multi-line cells. For a data-dense internal
  tool used at a desk on presumably a reasonably wide monitor, this felt
  like the right trade-off versus collapsing to a card layout on narrow
  viewports (which would undermine the "real table" requirement).
- Health score is shown as a plain color-coded number rather than a
  progress bar / sparkline, to avoid adding visual weight to a column that
  exists mostly for quick threshold scanning.
- Contact cell shows name + a muted, truncated email on a second line
  within the same row height band — the only two-line cell in the table —
  because splitting contact into two full columns (Name, Email) would have
  cost significant horizontal width for information that's rarely sorted
  or scanned independently of the name.

## What I actually verified

- `npx tsc -b` — clean, no type errors.
- `npx oxlint` — clean, no lint findings (rules: react/rules-of-hooks,
  react/only-export-components, plus default oxc/typescript rule sets).
- `npm run build` — succeeds (`tsc -b && vite build`), production bundle
  213 KB JS / 21 KB CSS (66.8 KB / 5 KB gzipped).
- Live browser verification via `claude-in-chrome` against `vite preview`
  (production build) at `http://localhost:4321`, screenshots saved to
  `.eval/screenshots/`:
  1. `01-desktop-default-view.jpg` — 1440×900 default load, sorted by MRR
     desc, 220 accounts, dense table visible.
  2. `02-row-selection-bulk-bar.jpg` — 3 rows selected, bulk bar appears,
     selected rows highlighted.
  3. `03-bulk-status-update-applied.jpg` — after choosing "Suspend" from
     the Set Status menu: the 3 rows' Status cells actually changed to
     "Suspended" and selection cleared. This is the strongest evidence the
     bulk action is wired to real state, not a UI-only affordance.
  4. `04-multicolumn-sort-status-then-mrr.jpg` — Status (priority 1) +
     MRR (priority 2) sort, confirming secondary-key ordering within
     primary-key groups.
  5. `05-pagination-page2.jpg` — page 2, "Showing 51–100 of 220", sort
     order continuous across the page boundary.
  6. `06-status-filter-applied.jpg` — status multi-filter narrows 220 → 191
     matches, page resets to 1.
  7. `07-search-filter.jpg` — text search "cascade" narrows to 13 matching
     rows, all containing "Cascade" in the company name.
  8. `08-laptop-1024-horizontal-scroll.jpg` — 1024px viewport: table
     scrolls horizontally rather than collapsing/breaking.
  9. `09-mobile-390-graceful-scroll.jpg` — 390px viewport: toolbar wraps,
     table remains a real scrollable table with no broken/overlapping
     layout, pagination controls wrap sanely. Not a designed-for-mobile
     layout (correctly out of scope for an at-a-desk tool) but confirmed
     it degrades without breaking.
  - Checked `read_console_messages` after a fresh navigation — no console
    errors or warnings on load.
- **What I did NOT verify:** no automated accessibility audit (e.g. axe)
  was run — I applied ARIA by hand (`aria-sort` on sortable headers,
  `aria-label` on checkboxes, `role="toolbar"`/`role="menu"` on the bulk
  bar, `aria-selected` on rows, `aria-current="page"` on pagination) and
  spot-checked focus states visually, but did not do a full keyboard-only
  pass through every interactive element or screen-reader testing. No
  automated unit/integration tests were written (no test framework was
  installed) — verification here is build/type/lint-clean plus manual
  browser interaction as documented above, not a test suite. No
  cross-browser testing (Chromium only, via the MCP extension). No
  performance profiling of render cost at higher row counts (only tested
  at 220 rows).

## Known gaps / deliberately out of scope

- No backend — all data is client-side generated/mocked and mutations
  (status change, delete) are local state only; a reload regenerates the
  same 220 rows from the seeded PRNG rather than persisting mutations.
- No "select all N matching filters across all pages" — selection/bulk
  actions operate on individually- or page-checked rows only, which is a
  common enough real-world admin-table limitation but worth flagging.
- No undo for bulk Delete beyond the browser `confirm()` guard.
- No column-visibility toggle, no saved views/filters, no row-detail
  drawer or edit-in-place — the brief scoped this to sorting/selection/bulk
  actions/badges/pagination and I stayed inside that rather than
  speculatively adding an edit surface.
- No dark mode / theming.
- Mobile/narrow-viewport layout is "doesn't break," not "designed for" —
  consistent with the stated desk-bound audience.
