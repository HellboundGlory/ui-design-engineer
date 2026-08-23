# Archetype: Dense Enterprise

## When this reasoning applies

The product is internal or B2B software where the user's job is to process volume: CRMs, ERPs, back-office admin tools, insurance/claims processing, HR systems, inventory and logistics management, support ticket queues, billing/invoicing back offices, procurement systems. The user is often a trained employee who uses this software 6+ hours a day and has explicitly asked IT for *more information on screen*, not less. Unlike Precision Technical (an expert monitoring signals), this user is *processing records* — the core object is usually a row, a case, or a record, and the core action is usually a grid or a form.

## Design intent

Maximize legible information throughput without becoming chaotic. The interface should feel like a well-organized spreadsheet crossed with a form system — utterly unglamorous, extremely efficient, forgiving of repetitive use (keyboard shortcuts, bulk actions, inline edit). Nothing here should be trying to look exciting; excitement is a red flag in this archetype.

## Starting values (override freely in DESIGN.md)

- **Density**: Very compact. Table rows 28–36px, form control heights 32px, minimal padding (8px) inside grid cells. This is the highest-density archetype of the five.
- **Spacing scale**: 4px grid throughout.
- **Radius**: Minimal to none (0–4px). Enterprise back-office software reads as more trustworthy when it looks structured/tabular rather than "app-like."
- **Typography**: A workhorse UI sans (Inter, IBM Plex Sans, system-ui stack is often *correct* here, unlike other archetypes) at small sizes (13–14px body). Tabular numerals mandatory for any numeric column. Avoid large decorative type anywhere — headline sizes rarely exceed 20–24px even for page titles.
- **Contrast**: High enough for all-day reading; avoid low-contrast "elegant" greys that look nice in isolation but strain the eyes across an 8-hour shift.
- **Color**: Muted, mostly neutral. Status/state color (badges, chips) should be the loudest color in the interface, and even that should be a small saturated accent, not a filled block — a colored dot or thin-bordered chip communicates status without adding visual noise across a 200-row table.
- **Surfaces**: Structural borders and zebra striping (subtle alternating row backgrounds) over shadows. Enterprise users are used to spreadsheet visual language — lean into it rather than fighting it with card-based design.
- **Iconography**: Small, functional, consistent. Icon-only buttons need tooltips; this audience will not tolerate ambiguous icon buttons at volume.

## Grid and table architecture

This archetype lives or dies on its data grid: sticky headers, resizable/reorderable columns where feasible, multi-column sort, row selection with bulk-action bars, inline status chips, and pagination or virtualization for large record sets. See `references/dashboard-architecture.md` for grid patterns and `references/data-visualization.md` for when a chart (rare here) is actually warranted versus when a table is simply the right answer. Enterprise software should not force a chart where a sortable table would let the user find what they need faster.

## Motion

Nearly none. Fast, functional transitions only (row expand/collapse, panel slide, ~120ms). Any perceptible "flourish" reads as wasted time to a user processing hundreds of records per day.

## Navigation tendencies

Persistent left sidebar with nested sections (often a two-level tree: module → sub-module), breadcrumbs for deep record hierarchies, and a strong search/command affordance since navigating by menu alone doesn't scale once the app has 40+ modules.

## Common mistakes agents make with this archetype

- Applying consumer-app card grids to what should be a data table, destroying scanability.
- Adding decorative empty-state illustrations and marketing-style copy where the user just needs "No records match this filter."
- Over-designing with shadows, gradients, or large rounded corners that make the software feel like a demo rather than a tool built for volume.
- Under-supporting bulk operations (select-all, bulk edit, bulk export) because the happy-path prompt only mentioned "a table."

## When NOT to use this archetype

Skip it for anything customer-facing and low-frequency (a consumer's own account settings, viewed a few times a year) — the density that helps a power user hurts an occasional visitor. Skip it for marketing surfaces entirely.
