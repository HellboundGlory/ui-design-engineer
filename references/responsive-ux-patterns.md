# Responsive UX Patterns

Responsive design means the workflow adapts to the viewport — not just that elements stack vertically. A dense desktop data grid that simply reflows to full-width rows at 375px is usually still unusable at that width even though nothing technically overflows. Design each breakpoint's *task*, not just its layout.

## Reference viewports (adaptable, not fixed)

Use these as a default review set unless the project's actual audience clearly points elsewhere (e.g., a B2B ops tool that is genuinely desktop-only can deprioritize the mobile pass, and should say so explicitly in DESIGN.md rather than silently skipping it):

- **375px** (mobile) — smallest common phone width to design against.
- **768px** (tablet) — the awkward middle: too narrow for full desktop chrome, too wide to just be "big mobile."
- **1440px** (desktop) — the primary working viewport for most SaaS/productivity contexts.
- **1920px** (ultrawide) — validates the layout doesn't just stretch into empty space; contain content within a sensible max-width and let the surrounding canvas breathe rather than scaling every element up.

## What actually needs to change per breakpoint

For each significant breakpoint, reason through these dimensions rather than only checking "does it fit":

- **Navigation model** — does a persistent sidebar become a drawer, a bottom tab bar, or a collapsed rail? Pick based on how often navigation is used at that viewport, not a reflex "hamburger on mobile" default — if primary nav is used constantly, a bottom tab bar (visible) often serves mobile users better than a hidden hamburger menu.
- **Action priority** — which actions stay directly visible, and which move into an overflow/"more" menu? The 1-2 most common actions should usually stay one tap away; everything else can recede.
- **Information density and removal** — what's genuinely secondary at a narrow viewport and can be dropped, deferred to a detail view, or hidden behind progressive disclosure, rather than being shrunk until unreadable? Removing a rarely-needed column from a mobile table view is usually better UX than cramming all columns into an unreadable width.
- **Tables** — a data-dense table rarely survives a straight reflow. Options: convert rows to stacked card-like summaries with key fields promoted, allow horizontal scroll within a contained region (with a clear scroll affordance) for genuinely tabular data that must stay tabular, or let the user choose which columns matter via a column picker.
- **Filters and side panels** — a persistent sidebar filter panel at desktop typically becomes a drawer or bottom sheet triggered by a filter button at mobile, not a panel squeezed into the top of a narrow column.
- **Tabs vs. accordion** — desktop tab bars with many tabs may need to collapse into a select/dropdown or an accordion at narrow widths rather than wrapping or overflowing.
- **Control density** — touch targets need to grow at touch-primary viewports (minimum 24×24px, 44×44px strongly preferred — see `accessibility-wcag.md`) even if the same control is more compact at desktop with a mouse.
- **Chart simplification** — a multi-series chart with a detailed legend at desktop may need fewer visible series, larger touch-friendly data points, or a simplified summary view at mobile, rather than shrinking every element proportionally until it's illegible.

## Horizontal overflow is a hard failure

Zero horizontal scrollbars at the page level on mobile viewports is close to an Invariant — it almost always indicates a fixed-width element, an unconstrained flex child, or a table that wasn't given a responsive treatment. Contained horizontal scroll *within* a clearly-scoped region (a table, a horizontal card carousel) is fine and sometimes the right pattern; the page itself scrolling sideways is not.

## Breakpoints are Project Decisions

The four reference viewports above are a starting checklist for review, not a mandate that a project must define exactly these Tailwind breakpoints. A project may need an additional breakpoint for a particularly awkward layout transition, or may reasonably consolidate two of these if the design genuinely doesn't change between them. Record the project's actual breakpoint strategy in DESIGN.md once decided so future work stays consistent with it.

## Testing responsive behavior

When browser rendering capability is available (see SKILL.md capability table), render and screenshot at all relevant breakpoints as part of visual QA — see `checklists/visual-qa-critique.md`. When it isn't, reason explicitly through each dimension above for the affected breakpoints rather than skipping the responsive pass — a component built without ever considering how its layout adapts is very likely to break somewhere.
