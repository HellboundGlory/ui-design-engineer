<!--
  Project Design Memory & Engineering Specification (DESIGN.md)
  This file is a design CONTRACT for this project — see ui-design-engineer skill.
-->

# Project Design Memory (DESIGN.md)

## 1. Product Intent

- **What is this product, in one or two sentences?** An internal enterprise customer administration grid: ops staff search, sort, filter, select, and bulk-act on customer accounts (status changes, exports, tagging, deletion).
- **What is the core job the user is doing on this screen/product?** Processing records at volume — scanning a large customer list, finding accounts that match a condition, and acting on many of them at once.
- **What does success feel like to the user?** Fast, unambiguous, and low-fatigue across an 8-hour shift — never "pretty but slow to scan."

## 2. Users & Usage Context

- **Who is the primary user?** Internal ops/support staff — trained, repeat daily users, not customers. Comfortable with dense spreadsheet-like tools (Excel, Salesforce admin, Zendesk admin).
- **How often and in what context do they use this?** Many hours a day, at a desk, on a large monitor, mouse + keyboard. Not a mobile-first workflow, though the shell should not break on a laptop.
- **What's the cost of a mistake or a slow interaction here?** Bulk actions (suspend/delete/export) on the wrong rows are costly — bulk destructive actions need confirmation. Slow scanning (poor density/contrast) compounds into real fatigue and lost throughput over a shift.

## 3. Visual Personality

- **In three adjectives, how should this feel?** Structured, unglamorous, fast.
- **Any explicit references or products this should feel similar to / deliberately different from?** Similar to: Salesforce admin console, Linear's table views, internal Stripe/Retool-style back-office tools. Deliberately different from: consumer SaaS marketing dashboards, card-grid CRMs.

## 4. Archetype / Direction

- **Active archetype(s):** Dense Enterprise.
- **Why this archetype (or blend) fits this product:** The task is explicitly a high-volume back-office record system used all day by trained staff — this is the textbook case in `references/archetypes/dense-enterprise.md`. The core object is a row (a customer record); the core action is a grid with sort/select/bulk-act. No blend needed.

## 5. Color & Semantic Tokens

OKLCH tokens, defined in `src/index.css` under `:root` (light) and `.dark` (dark). Single theme shipped is light (this audience works at a desk under office lighting; dark mode is a documented open question, not built this pass).

```css
:root {
  --background: oklch(0.99 0.002 260);
  --foreground: oklch(0.22 0.01 260);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.22 0.01 260);
  --primary: oklch(0.42 0.14 258);
  --primary-foreground: oklch(0.98 0.005 260);
  --muted: oklch(0.96 0.004 260);
  --muted-foreground: oklch(0.48 0.014 260);
  --accent: oklch(0.94 0.02 258);
  --accent-foreground: oklch(0.3 0.05 258);
  --border: oklch(0.88 0.006 260);
  --border-strong: oklch(0.78 0.008 260);
  --ring: oklch(0.52 0.16 258);
  --status-success: oklch(0.5 0.13 155);
  --status-success-bg: oklch(0.95 0.04 155);
  --status-warning: oklch(0.42 0.13 65);
  --status-warning-bg: oklch(0.95 0.06 85);
  --status-error: oklch(0.52 0.19 25);
  --status-error-bg: oklch(0.95 0.05 25);
  --status-info: oklch(0.5 0.1 250);
  --status-info-bg: oklch(0.95 0.02 250);
  --row-stripe: oklch(0.96 0.004 260);
  --row-selected: oklch(0.93 0.03 258);
  --row-hover: oklch(0.96 0.006 260);
}
```

- **Does this product need a dark mode at all, and which is the default?** Not built this pass — logged in §20. Light is default.

## 6. Typography

- **Display font stack:** `system-ui, -apple-system, "Segoe UI", sans-serif` (page titles only, capped at 18px).
- **Body font stack:** same system-ui stack — Dense Enterprise explicitly calls a system font stack correct for this archetype, and it avoids a font-loading dependency for an internal tool.
- **Code / data (monospace) font stack:** `ui-monospace, "SF Mono", Menlo, monospace` — used nowhere on this screen (no code data), kept for future use.
- **Scale ratio:** Custom, compressed (13px body / 12px meta / 14px table header emphasis / 18px page title) — not a decorative type scale, a functional one.
- **Tabular numbers policy:** Enforced in table numeric columns (`font-variant-numeric: tabular-nums`) — IDs, spend figures, counts.

## 7. Spacing

- **Spacing grid:** 4px.
- **Any section- or component-specific spacing exceptions worth recording?** Table cells use 8px horizontal / 0 vertical padding with fixed row height (see Density) rather than padding-driven row height, so row height stays exact and predictable at any zoom level.

## 8. Density

- **Layout density target:** Compact (Dense Enterprise's "very compact" tier).
  - Table row height: 36px
  - Form control height (inputs, buttons, select triggers): 32px
  - Card/panel internal padding: 12px
  - Container max-width: none — grid fills viewport width (a back-office grid should use available width, not center in a narrow column)

## 9. Geometry

- **Global radius token (`--radius`):** 4px.
- **Any per-element radius exceptions?** Status chips use 4px (not pill/full-round) to stay low-key rather than "badge-like" attention-grabbing pills; avatars (customer initials) use full-round since that's a recognizable person-glyph convention, not a decorative flourish.

## 10. Surfaces & Elevation

- **Elevation model:** Border rules + subtle zebra striping, not shadows. One exception: the bulk-action bar and dropdown menus use a small shadow because they are transient overlays, not structural panels.
- **Glassmorphism policy:** Forbidden.

## 11. Iconography

- **Primary icon set:** lucide-react.
- **Default stroke width:** 1.75 (slightly lighter than default 2 to stay quiet at small sizes).
- **Label requirement:** icon-only controls require `aria-label` + a Radix Tooltip. Always true.

## 12. Navigation

- **Primary navigation model:** Persistent left sidebar (module list) + top bar (search, user). Matches Dense Enterprise's navigation tendency for a multi-module back office, even though this build only implements the Customers module — the shell communicates "this is one module in a larger admin system," which is honest to the stated context.
- **How does navigation adapt at narrow viewports?** Sidebar collapses to an icon rail under 1024px and to an off-canvas drawer (toggled from the top bar) under 640px; see `references/responsive-ux-patterns.md`. The data grid itself switches from a full multi-column table to a condensed single-column "record card per row" list below 640px (columns collapse into a label/value stack) since a 9-column table cannot scan on a phone — this is a workflow adaptation, not naive reflow.

## 13. Components

- **Primary component/primitive source:** Radix primitives (`@radix-ui/react-checkbox`, `-dropdown-menu`, `-tooltip`, `-select`), styled directly with Tailwind — not the full shadcn CLI/registry. Reasoning below.
- **Reasoning:** Greenfield project, no existing primitive system (confirmed via `scripts/inspect-project.js`). The interface needs exactly four accessible primitives (checkbox, menu, tooltip, select) plus one highly specific component — the sortable/selectable data grid — that no registry component matches out of the box. Installing full shadcn for four primitives would add unused scaffolding; installing the Radix packages directly and normalizing them to project tokens gets the same accessibility guarantees with less surface area. The table itself is bespoke (native `<table>`), per the component-selection hierarchy's level 7 — no data-grid library is justified for one screen with straightforward client-side sort/paginate.
- **Utility/specialized registries in use, if any:** None.

## 14. Data Visualization

- **Charting engine:** Not applicable — this screen is a table by design (Dense Enterprise: "should not force a chart where a sortable table would let the user find what they need faster").

## 15. Motion

- **Motion engine:** CSS transitions only.
- **Default transition dynamic:** 120ms ease-out for hover/selection/menu states; no animation on table sort (re-render is instant, not animated, to avoid a "flourish" reading as wasted time to a high-volume user).
- **Reduced-motion compliance:** `prefers-reduced-motion` respected — the few transitions used (120ms opacity/background) are already under the threshold where this matters, and `motion-reduce:transition-none` is applied to interactive elements regardless.

## 16. Responsive Behavior

- **Breakpoint scale:** Mobile 375px / Tablet 768px / Desktop 1280px / Wide 1600px (Tailwind defaults, sm/md/lg/xl/2xl).
- **Any viewport this product deliberately does not support (and why)?** None excluded, but density is deliberately relaxed at mobile widths (see §12) since this audience is desk-based; mobile support exists for completeness/on-call use, not as the primary target.

## 17. Accessibility

- **Target:** WCAG 2.2 AA.
- **Known accessibility debt, if inheriting an existing codebase:** N/A — greenfield.

## 18. Project-Specific Anti-Patterns (STRICT NEVER)

- Never render the customer list as a card grid — it is tabular data and must stay a `<table>`.
- Never fill a status chip with a solid saturated background — chips stay thin-border/low-fill so 30+ visible chips per screen don't compete for attention.
- Never let a bulk-destructive action (delete) execute without a confirmation step.
- Never introduce a second icon set or a second date-formatting convention.

## 19. Component Sources & Exceptions

- **Primary primitives:** Radix UI (unstyled), styled with Tailwind v4 (`@tailwindcss/vite`).
- **Utility registries:** None.
- **Charting engine:** None (not applicable).
- **Documented exceptions to any rule above, with reasoning:** Full shadcn CLI skipped in favor of installing Radix primitives directly — see §13 reasoning. This is a scope-matched exception, not a shortcut. `check-ui-dependencies.js --strict` flags the six separate `@radix-ui/react-*` packages as a "primitive-engine conflict" because it counts each Radix package individually — these are all one engine family, not competing systems, so the exception is recorded in `ui-design-engineer.config.json` (`--strict` passes clean with it in place).

## 20. Open Questions / Not Yet Decided

- Dark mode: tokens structured to support a `.dark` block later, but not implemented/tested this pass.
- Server-side pagination/sorting: this build uses client-side sort/paginate over an in-memory mock dataset (200 rows). A real backend would likely need server-side sort/filter/paginate for large datasets — noted for whoever wires up the API.
- Column resize/reorder (mentioned as "where feasible" in the archetype doc): not implemented this pass — fixed column widths tuned for the current column set.

## 21. Design Decisions Log

- [2026-08-24]: Initialized DESIGN.md for the Enterprise Customer Administration grid. Selected Dense Enterprise archetype (no blend). Chose Radix-direct over full shadcn install (§13). Chose thin-border/low-fill status chips over filled badges (§18) specifically to satisfy "status color should be the loudest color, and even that a small accent" from the archetype doc.
- [2026-08-24]: `visual-qa.js` axe scan found two real defects, both fixed: (1) `--status-warning` foreground (oklch 0.55 L) failed color-contrast against `--status-warning-bg` on the "Past due" chip — darkened to oklch(0.42 0.13 65), re-scan confirmed 0 axe violations at all 4 viewports. (2) icon-only nav links in the tablet-collapsed icon rail had no accessible name (Radix Tooltip content isn't exposed as an accessible name) — added `aria-label` to the `<a>` when collapsed. Also investigated the 71/60/56/56 "zero-size visible interactive" and 3 "focus-obscured" structural findings by hand (Playwright script + `checkVisibility()`/`elementsFromPoint()` checks): the zero-size findings are false positives — every one is inside a `hidden <breakpoint>:flex` ancestor for a viewport where that nav/column is correctly hidden (`checkVisibility() === false`), and the tool's check doesn't appear to walk the ancestor chain for `display:none`. The 3 focus-obscured findings (375px viewport only) are the last row's action button in the mobile stacked list being ~80% clipped by `<main>`'s `overflow-auto` boundary right where `<Pagination>` begins in normal flow — a normal artifact of any scrollable list with variable row heights, not a WCAG 2.4.11 violation, since focusing that button triggers the browser's native scroll-into-view. Recorded here rather than "fixed" because there was nothing to fix; not accepted silently either.
- [2026-08-24]: 16px row-selection checkboxes come back as `REVIEW: undersized interactive target(s)` (advisory, <24px). Kept at 16px deliberately: WCAG 2.5.8's "sufficient spacing" exception applies — center-to-center distance to the next checkbox is the full row height (36px desktop, ~110px mobile stacked list), both well past the 24px-diameter non-overlap requirement, and shrinking the density-critical grid's control size to force a literal 24px box would fight the Dense Enterprise archetype's own density mandate for no accessibility gain. `check-ui-dependencies.js --strict` also flagged the 6 separate `@radix-ui/react-*` packages as a primitive-engine conflict; recorded as a reviewed exception in `ui-design-engineer.config.json` (§19) since they're one engine family, not competing systems.
- [2026-08-24]: Manual accessibility pass (keyboard tab order, dropdown-menu open/Escape/focus-return, alert-dialog role/focus-trap, `<h1>`) via a scripted Playwright pass, since the browser extension's `resize_window` had no effect in this sandbox and couldn't be used interactively. Found and fixed two real gaps the automated axe scan doesn't cover: (1) neither `@radix-ui/react-dialog` nor `@radix-ui/react-alert-dialog` emit `aria-modal="true"` by default in the installed version — added it explicitly to both `ConfirmDialog` and the mobile nav `Dialog.Content`. (2) the page had no real `<h1>` — breadcrumb's current-page crumb ("All accounts") is now an `<h1>`, plus an `sr-only` `<h1>` fallback for the `<640px` view where the breadcrumb is hidden. Also fixed a real responsive bug found during screenshot review: `BulkActionBar` had no `overflow-x-auto`/`shrink-0`/`whitespace-nowrap`, so at 375px its buttons compressed and wrapped mid-word ("Add" / "tag" on separate lines) — now scrolls horizontally as a single row, matching `FilterBar`'s existing pattern. Everything else checked (focus-visible ring present via box-shadow on every interactive element sampled, dropdown/dialog keyboard operability, focus trap + return-to-trigger, Escape-to-close) passed without changes.
