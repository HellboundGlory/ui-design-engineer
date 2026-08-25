# Worker Report — Server Inventory / `legacy/report.html` refactor

## Run metadata

- **Arm:** baseline, no-skill (no `ui-design-engineer` plugin invoked, no reference material from that repo read).
- **Read before building:**
  - `DESIGN.md` (root) — full document.
  - `src/index.css` — token definitions and `@theme` mapping.
  - `src/components/Button.tsx`, `Card.tsx`, `Badge.tsx`, `Input.tsx`, `Modal.tsx`, `Layout.tsx`.
  - `src/pages/Dashboard.tsx`, `src/pages/Billing.tsx` (existing page conventions: container width/padding, `Card`/`CardHeader`/`CardBody` usage, table markup, `tabular` class usage).
  - `src/main.tsx` (routing setup).
  - `legacy/report.html` (the fixture to port).
- **Tools actually used for verification:** `tsc -b` (via `npm run build`), `vite build`, `oxlint` (via `npm run lint`), and a self-installed, project-local, dev-only `playwright` + `@axe-core/playwright` (added as devDependencies, not shipped in any production bundle) for screenshots and automated contrast/ARIA checks against the running `vite` dev server. No browser MCP/extension was used.

## Task as given

Port `legacy/report.html` (a bare HTML table of servers + an unlabeled "Add Server" form, using `bgcolor`/`cellpadding`/no `<label>`s) into a real, routed page in this app, styled with the project's existing token system and components — not a new palette, not new primitives duplicating what exists, no loss of semantic structure, and a genuine (not just cosmetic) accessibility improvement over the fixture.

## What I built

**New page:** `src/pages/Servers.tsx`, routed at `/servers`, added to the sidebar nav in `src/components/Layout.tsx` (between Dashboard and Billing) and to `src/main.tsx`'s route table.

**Structure, mapped from the fixture:**
- The inventory table → a `Card` + `CardHeader` + `CardBody` (`p-0`) wrapping a real `<table>`, following the exact pattern already used for the Services table on `Dashboard.tsx` and the Invoices table on `Billing.tsx`. Kept `Name / Region / Status / CPU / Memory` columns from the fixture, added a trailing actions column.
  - `<th scope="col">` on every header (fixture had none — headers were plain `<td>`s in a `bgcolor="#cccccc"` row).
  - Added a visually-hidden `<caption>` describing the table's purpose (fixture had none).
  - The trailing "Actions" header has no visible label (matches the existing Billing invoices table's pattern of a blank action-column header) but I gave it an `sr-only` span rather than leaving it truly empty — see Known Gaps below re: an existing `empty-table-header` finding on `Billing` that this page does **not** repeat.
  - Numeric columns (CPU, Memory) get the project's `.tabular` utility and are right-aligned, matching Dashboard/Billing conventions.
  - Status → `Badge` component: `up` → `tone="success"`, `down` → `tone="danger"`. Using red/danger here is for a genuine error/outage state, which is explicitly the one allowed use of `--color-danger` per `DESIGN.md` section 18's anti-pattern rule.
  - The fixture's dead `<a href="#">edit</a>` link → a real `Button size="sm" variant="ghost"` that opens an edit modal, with an `sr-only` suffix (`Edit edge-01`, etc.) so the accessible name is unambiguous when there are multiple identical "Edit" buttons in a list (the fixture's identical "edit" links had this exact ambiguity problem for screen-reader users navigating by link list).
- The "Add Server" form → opens in the existing `Modal` component (same one used elsewhere in the app), triggered by a primary `Button` in the `CardHeader` action slot — this mirrors the "Change plan" / "Update" action-in-header pattern already established on `Billing.tsx`. The same modal/form is reused for both "Add server" and "Edit `<name>`" (prefilled via `defaultValue`, remounted via a `key` on the `<form>` so uncontrolled defaults reset correctly when switching rows), so there's one form implementation, not two.
- Form fields, each with a real `<label htmlFor>`/`id` pair (fixture had bare `Name:<input>` text with no association at all):
  - Name — `Input`, `required`.
  - Region — new `Select` primitive (didn't exist; added, see below), `required`, options taken from the fixture's three regions.
  - IP address — `Input`, `required`, `pattern` for dotted-decimal IPv4, plus a visible hint paragraph wired via `aria-describedby` (the fixture's IP field had no colon after its label and no validation at all).
  - Active / Enable monitoring — new `Checkbox` primitive, grouped in a `<fieldset>`/`<legend>` ("Options") so screen-reader users get the grouping the fixture's two bare, run-together checkboxes lacked.
  - Notes — new `Textarea` primitive.
  - A visible "Fields marked * are required" note (not just an asterisk with no explanation) covers WCAG 3.3.2 (labels/instructions) for the required fields, since I relied on native HTML5 `required`/`pattern` constraint validation (browser-native, accessible-by-default) rather than hand-rolling custom validation UI.
  - Submit ("Add server"/"Save changes") and Cancel live in the `Modal`'s `footer` slot, matching every other modal-shaped affordance in the app; the submit button uses `form="server-form"` to associate with the `<form>` in the modal body from outside it.
- On submit, the page holds real local React state (`useState<Server[]>`) seeded with the fixture's four rows; "Add server" appends a new row (status defaults to `up`, CPU/Memory show `—` since there's no real telemetry for a server that was never actually provisioned — I deliberately did not fabricate fake percentages), and "Edit" updates name/region on the existing row in place. This is a working, not a decorative, form.

**New primitives added to `src/components/Input.tsx`:** `Select`, `Textarea`, `Checkbox`, alongside the existing `Input`/`Label`. These didn't exist in the design system but the form genuinely needed them; each one reuses the exact same tokens/sizing as `Input` (`h-9`/`rounded-md`/`border-border`/`bg-bg-sunken`/`focus:border-accent`, `text-sm`), so they read as the same family rather than a new system. I did not reach for shadcn/Radix or any headless-UI library, per `DESIGN.md` section 18's strict rule. No new colors were introduced anywhere — every class used maps to a token already defined in `src/index.css` or a Tailwind utility already used elsewhere in the app (`sr-only`, `flex`, spacing scale, etc.).

**Global focus handling:** relies entirely on the existing `*:focus-visible` rule in `index.css` — I didn't add any bespoke focus styling to the new checkboxes/selects.

## Key decisions / reasoning

1. **Modal-based add/edit instead of an inline second Card.** The fixture just stacked "Add Server" below the table. I chose a modal because (a) `Billing.tsx` already established the "header action button → dialog-shaped interaction" pattern for mutating state (`Change plan`, `Update`), and (b) it lets one form implementation serve both add and edit, avoiding a second near-duplicate form on the page. This is a bigger structural change than a literal 1:1 port, but it's the app's own established pattern, not an invented one.
2. **Reused Edit for the fixture's dead link rather than dropping it.** The brief calls a "table becomes a div grid for no reason" a weak result; by the same logic, silently deleting the only interactive affordance in the legacy table (however non-functional) felt like the wrong default, so I gave it real behavior.
3. **Didn't invent table columns the form implies (IP, notes, active/monitoring) that the fixture's own table never had.** The legacy table's columns are Name/Region/Status/CPU/Mem; the legacy form collects more than that. Rather than fabricate a richer schema, new rows only populate the columns the table already tracks — IP/notes/active/monitoring are collected and validated (matching the fixture's form) but not persisted/displayed anywhere, since there is no backend and no existing column for them. This is a deliberate scope-limiting choice; noted below as a gap.
4. **Kept the `<table>` as a real table.** No div-grid conversion — `scope="col"` headers, a `<caption>`, and semantic `<td>`s throughout, per the brief's explicit guidance.

## Verification actually performed

- `npm run build` (`tsc -b && vite build`) — **passes**, no type errors, builds cleanly.
- `npm run lint` (`oxlint`) — **passes**, exit code 0, no findings.
- Self-installed `playwright` + `@axe-core/playwright` (devDependencies only) against `vite --port 5183`:
  - Screenshots saved to `.eval/screenshots/`:
    1. `01-servers-page.png` — the Servers list page.
    2. `02-add-server-modal.png` — "Add server" modal, empty state.
    3. `03-add-server-validation.png` — attempted submit with required fields empty (native browser validation).
    4. `04-edit-server-modal.png` — "Edit edge-01" modal, prefilled.
    5. `05-dashboard-for-reference.png` — existing Dashboard page, for visual side-by-side token consistency.
  - Automated axe scans on `/`, `/billing`, `/servers`, and `/servers` with the Add modal open (scripts left at `.eval/verify.mjs` and `.eval/verify2.mjs`). Findings, and how I handled each:
    - **`color-contrast` on `.bg-accent` primary buttons (white text on `--color-accent`, ~3.23:1, needs 4.5:1):** this is a defect in the *existing* `Button` component's `primary` variant token pairing, not something I introduced — I confirmed neither `Dashboard.tsx` nor `Billing.tsx` uses `variant="primary"` at all (they only use `secondary`/`ghost`), so this page is simply the first to exercise that variant and surface a pre-existing, unexercised design-system defect. I judged it out of scope to silently change `--color-accent` or `Button.tsx`'s color mapping for the whole app without a logged design decision (this affects every future primary button, not just this page) — flagging it here is the more honest move than either papering over it with a page-local hardcoded color (which the brief explicitly warns against) or quietly leaving it unmentioned.
    - **`color-contrast` on `Badge tone="danger"` (`#e0596b` on `#3a1c22`, 4.24:1, needs 4.5:1):** same category of issue — a pre-existing, marginal (off by ~6%) token pairing in `Badge.tsx` that no existing page happened to exercise (Dashboard only uses success/warning tones, Billing only success). Flagged for the same reason, not fixed locally.
    - **`color-contrast` on my own hint/help text:** initially used `text-text-faint` (2.97:1 against the modal's `bg-bg-raised`) for the "required fields" note and the IP-format hint. Caught this in the axe run and fixed it by switching to `text-text-muted` (the tier already used for real body/meta text elsewhere, e.g. Billing's "Renews on..." caption) — re-ran axe and confirmed this specific finding cleared. This one *was* mine to fix, and I fixed it.
    - **`heading-order` (h1 → h3, skipping h2):** present identically on `Dashboard` and `Billing` already (caused by `CardHeader` always rendering an `h3`). Not a regression I introduced — Servers matches the same pre-existing pattern as every other page in the app.
    - **`empty-table-header` on Billing's blank action-column header:** pre-existing on `Billing`, and Servers does **not** reproduce it, since I gave the trailing header an `sr-only` label.
  - I did **not** run a full manual screen-reader pass (VoiceOver/NVDA), a keyboard-only walkthrough beyond visual/Escape-to-close checks, or a Lighthouse/full WCAG audit — the axe-core automated ruleset plus manual code-level review (label associations, `aria-describedby`, `fieldset`/`legend`, `scope="col"`) is what actually happened, and axe itself only catches a subset of WCAG issues (it does not verify e.g. logical tab order, or that the native `required`/`pattern` validation messages are well-announced by every browser/AT combination).

## Known gaps / deliberately out of scope

- The `--color-accent` / primary-button and danger-badge contrast shortfalls described above are real, pre-existing, WCAG-AA-failing token pairings in the shared design system that this page's normal, correct use of `variant="primary"` and `tone="danger"` happens to be the first thing in the app to surface. I did not fix them, since doing so means changing shared tokens/components used (or usable) app-wide, which is a design decision beyond this page's brief — flagging clearly here instead of hiding it or hacking around it locally.
- No backend: `Add server`/`Save changes` only mutate in-memory React state; nothing persists across a reload. This matches the fixture's own `<form action="/servers" method="post">`, which also had no real backend in this repo.
- IP/Active/Enable monitoring/Notes are collected and validated in the form (matching the fixture) but not displayed anywhere in the table afterward, since the existing table schema has no columns for them and I didn't want to invent new ones unasked (see decision #3 above).
- No mobile/narrow-viewport treatment — `DESIGN.md` section 16 explicitly says this is an open, undecided question for the whole app, not something to resolve unilaterally on one new page.
- No full manual AT (screen reader) pass — see Verification section above.
- `legacy/report.html` itself was left in place on disk but is now unused/orphaned, per the task instructions (it didn't need to keep working standalone).
