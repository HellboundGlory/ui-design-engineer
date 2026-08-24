<!--
  Project Design Memory & Engineering Specification (DESIGN.md)
  This file is a design CONTRACT for Meridian, recording decisions this project has
  made so future sessions build on the same system instead of drifting from it.
-->

# Project Design Memory (DESIGN.md) — Meridian

## 1. Product Intent

- **What is this product, in one or two sentences?** Meridian is an internal project-tracking app: an Overview dashboard, a Projects list, and (as of this session) a Board for per-task work tracking.
- **What is the core job the user is doing on this screen/product?** Operating and monitoring in-flight work — checking status, reassigning/re-prioritizing tasks, seeing what's overdue.
- **What does success feel like to the user?** Fast orientation: "what's late, what's mine, what's next" answered in one glance, with low friction to update status.

## 2. Users & Usage Context

- **Who is the primary user?** Internal team members and project leads (PM-adjacent), moderate technical fluency, familiar with kanban/task-tracker conventions (Linear/Jira-adjacent mental model).
- **How often and in what context do they use this?** Multiple times a day, at a desk, alongside other tools — glanceable and quick to act in.
- **What's the cost of a mistake or a slow interaction here?** Low-to-moderate — mis-assigning a task or missing a due date is recoverable but costly if it recurs; the UI should make status/ownership state hard to misread (hence explicit overdue flagging, not just a date string).

## 3. Visual Personality

- **In three adjectives:** clean, quiet, purposeful.
- **References:** Established already by Overview/Projects — a light, low-chrome Mantine app with a single purple brand accent used sparingly (primary actions, active nav, "Live"/"Workspace" badges), not a colorful/dashboard-loud style.

## 4. Archetype / Direction

- **Active archetype(s):** Calm Productivity, blended with light Dense-Enterprise structure (real tables/lists carrying meaningful density).
- **Why this archetype (or blend) fits this product:** Meridian is a daily-return operational tool, not a monitoring console — content (tasks, projects) should read clearly while chrome (nav, filters) stays quiet and recedes. The existing Overview/Projects pages already follow this: bordered `Paper` surfaces, restrained badge color, no gradients or heavy elevation.
- This session preserved the **existing, already-established** visual language over introducing a fresh archetype from scratch — see §13 and §19.

## 5. Color & Semantic Tokens

Meridian's token system is **Mantine's `theme.ts` JS API**, not a hand-authored CSS custom-property sheet — Mantine generates its own `--mantine-color-*` variables at runtime from this config. `scripts/validate-design-tokens.js` (which expects a documented `:root { --var }` contract) doesn't apply directly to this project; this section documents the equivalent contract in Mantine's terms instead.

- **Brand color (`brand`):** 10-shade tuple in `src/theme.ts`, primary shade index 6 (`#7047d6`). Used via `primaryColor: "brand"`.
- **Status/priority colors:** drawn from Mantine's built-in named palette (not custom hex), chosen per-use for contrast (see §17 for the contrast work behind these picks):
  - Task priority: low=`gray`, medium=`blue`, high=`violet`, urgent=`red` (light-variant Badges).
  - Project status (Projects.tsx, pre-existing): on-track=`teal`, at-risk=`yellow`, done=`gray`.
  - Board avatar identity color: hashed per-person from `["teal.9","indigo.9","cyan.9","grape.9","blue.9"]`, `variant="filled"`, shade pinned to `.9` for reliable AA contrast (see §21 2026-08-24 entry).
- **`autoContrast: true`** added to `theme.ts` this session so Mantine auto-picks black/white text on filled/colored surfaces instead of always defaulting to white.
- **Light mode only.** No dark mode implemented; `defaultColorScheme="light"` in `main.tsx`.

## 6. Typography

- **Display / heading font stack:** `Source Sans Pro, ui-sans-serif, system-ui, sans-serif`, weight 600 (theme.ts `headings`).
- **Body font stack:** same family (`Source Sans Pro, ui-sans-serif, system-ui, sans-serif`).
- **Code / data (monospace):** not currently used anywhere in the app; not yet decided.
- **Scale:** Mantine's default type scale (xs/sm/md/lg/xl), used as-is — no custom scale ratio defined.
- **Tabular numbers policy:** Not enforced; dates/counts are short enough that misalignment hasn't been an issue. Revisit if a numeric-heavy table is added.

## 7. Spacing

- **Spacing grid:** Mantine's default spacing scale (`xs/sm/md/lg/xl`), used via component `gap`/`p` props — no custom spacing tokens introduced.
- **Board-specific:** card internal padding `sm`, inter-card gap `xs`, column gap `md` (SimpleGrid `spacing="md"`).

## 8. Density

- **Layout density target:** Comfortable — matches Overview/Projects (roomy `Paper` cards, `verticalSpacing="sm"` tables).
- Board cards default to a slightly tighter internal padding (`p="sm"`) than the page-level `Paper` cards on Overview (`p="md"`) since Board needs to show more items in view at once; this is a deliberate density exception for the kanban column context, not drift.

## 9. Geometry

- **Global radius token:** `defaultRadius: "md"` (theme.ts) — applies to `Paper`, `Button`, `Modal`, `Badge`, cards, inputs, etc. project-wide. Board's new components (TaskCard, NewTaskModal, empty-state placeholders) all inherit this via Mantine's theme defaults; no per-component radius overrides were introduced.
- **Avatars:** `radius="xl"` (fully round) — standard Mantine avatar convention, no exception.

## 10. Surfaces & Elevation

- **Elevation model:** Border rules — `Paper` uses `withBorder: true` by default (theme.ts), no drop-shadows or glass anywhere in the app.
- **Glassmorphism policy:** Forbidden — none exists in the app; keep it that way.
- **Board column background:** Backlog/In progress/etc. columns sit on a flat `gray.0` panel (`var(--mantine-color-gray-0)`) to visually group cards without adding another bordered-Paper layer — an intentional light exception to "Paper for every surface," matching the archetype note to avoid card-in-card fatigue.

## 11. Iconography

- **Primary icon set:** `@tabler/icons-react` (already the project standard — Layout.tsx, Projects.tsx).
- **Default stroke width:** `1.5` (matches existing nav/button icon usage).
- **Board additions:** `IconLayoutKanban` (nav), `IconSearch`, `IconPlus`, `IconDots`, `IconAlertTriangle` — all Tabler, same set, no mixing.
- Icon-only controls (the per-card "…" move menu, the mobile nav burger) carry explicit `aria-label`s.

## 12. Navigation

- **Primary navigation model:** Persistent left sidebar (`AppShell.Navbar`), collapsing to a burger-triggered overlay below the `sm` breakpoint.
- **This session's change:** the sidebar previously had no mobile collapse behavior at all (it stayed permanently visible and overlapped page content below `sm`, which axe flagged as a focus-obscured violation). Added a `Burger` + `useDisclosure` toggle in `Layout.tsx` so the nav collapses on mobile and opens as an overlay, closing again on route selection. This fix benefits all three pages (Overview, Projects, Board), not just the new one — see §21.

## 13. Components

- **Primary component/primitive source:** Mantine (`@mantine/core`, `@mantine/hooks`, `@mantine/dates` — added this session). **No shadcn/ui, Radix, Base UI, or Tailwind exists or was introduced anywhere in this project.**
- **Reasoning:** Existing system to preserve. Meridian was seeded entirely on Mantine with its own `theme.ts`; per `references/component-selection.md`'s hierarchy (level 2 — "existing project design-system component"), the Board feature was built exclusively from Mantine's own component set and theming API, using the same idioms already established (`Paper` cards, `Table`-free list-of-cards here since kanban columns fit better than a table, `Badge` for status/priority, `Group`/`Stack` layout primitives).
- **Utility/specialized registries in use:** `@mantine/dates` (official Mantine sibling package, not a third-party registry) for the due-date picker — matched exactly to the installed `@mantine/core@9.5.2` version, with `dayjs` as its required peer.

## 14. Data Visualization

- **Charting engine:** Not applicable — no charts in this app yet.

## 15. Motion

- **Motion engine:** Mantine's built-in component transitions (Modal open/close fade, Menu open/close) — no custom animation library added.
- **Reduced-motion compliance:** Mantine's built-in transitions respect `prefers-reduced-motion` out of the box; no custom keyframe/animation was added this session that would need separate handling.

## 16. Responsive Behavior

- **Breakpoint scale:** Mantine defaults (`sm` = 768px used as the nav collapse point, matching `AppShell`'s existing `breakpoint: "sm"`).
- **Board layout:** `SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}` — 4 kanban columns on desktop, 2-up on tablet, single stacked column list on mobile. Filter/search row wraps (`Group wrap="wrap"`) rather than clipping.
- **No viewport is deliberately unsupported.**

## 17. Accessibility

- **Target:** WCAG 2.2 AA.
- **Verified this session (Board page):** 0 axe-core automated violations at 375/768/1440/1920px (see `.eval/visual-qa-board/report.json`), plus a manual keyboard pass — Tab order, focus visibility, Menu keyboard activation, Modal focus trap + Escape-to-close + focus return, all confirmed working (see `.eval/worker-report.md`).
- **Known accessibility debt inherited from the existing codebase (NOT fixed this session — out of scope for a single-feature addition):** Overview.tsx and Projects.tsx both have pre-existing axe color-contrast failures — `c="dimmed"` text at small sizes, and the `yellow` "at-risk" status Badge on Projects — that predate this session's changes. See `.eval/visual-qa-overview/report.json` and `.eval/visual-qa-projects/report.json`. Flagged in §20 as an open item for a future, deliberately-scoped pass.

## 18. Project-Specific Anti-Patterns (STRICT NEVER)

- Never introduce shadcn/ui, Radix primitives, Base UI, or Tailwind CSS into this project — Mantine is the established system project-wide; a second primitive/styling engine is the single named failure mode for this codebase.
- Never hardcode hex/rgb colors in component files — use Mantine theme colors/shades (`c="gray.7"`, `color="violet"`, etc.) so contrast and theming stay centrally controlled.
- Never add a second date library (e.g. `date-fns`) alongside `dayjs` — `dayjs` is now the project's date library via `@mantine/dates`.

## 19. Component Sources & Exceptions

- **Primary primitives:** Mantine (`@mantine/core`, `@mantine/hooks`).
- **Utility registries:** `@mantine/dates` (+ `dayjs` peer) — added 2026-08-24 for the Board feature's due-date picker, version-pinned to match `@mantine/core@9.5.2`.
- **Charting engine:** none.
- **Documented exceptions:**
  - Board's kanban columns sit on a flat `gray.0` panel instead of a bordered `Paper`, to avoid nested-card visual noise (see §10).
  - Board task cards use `p="sm"` instead of the page-level `p="md"` Paper convention, for kanban information density (see §8).
  - Avatar colors are pinned to an explicit `.9` shade (`teal.9`, `indigo.9`, etc.) rather than Mantine's default shade-resolution, specifically to guarantee AA contrast on the `filled` variant — the default shade-6 resolution left `grape` at 4.02:1 (fails AA) even with `autoContrast: true` enabled.

## 20. Open Questions / Not Yet Decided

- Pre-existing color-contrast failures on Overview.tsx (`dimmed` text) and Projects.tsx (`yellow` status Badge) were discovered during this session's QA but are out of scope for a single-feature addition — worth a dedicated a11y pass across the whole app.
- No monospace/tabular-numbers policy defined yet; revisit if a numeric-heavy table/report page is added.
- No dark mode; not yet decided whether Meridian needs one.

## 21. Design Decisions Log

- **2026-08-24**: Initialized DESIGN.md for Meridian, documenting the design system already established by the Overview/Projects seed (Mantine, light theme, purple `brand` accent, `radius: md`, bordered `Paper` surfaces) — Calm Productivity archetype, blended with light Dense-Enterprise table density.
- **2026-08-24**: Added the Board feature (kanban task board: search/filter, per-task priority/assignee/due-date, "Move to" status menu, "New task" modal) entirely in Mantine — `Paper`, `Badge`, `Avatar`, `Menu`, `Modal`, `Select`, `TextInput`, `Textarea`, `DateInput`. No shadcn/Tailwind/Radix introduced.
- **2026-08-24**: Added `@mantine/dates` + `dayjs` (peer) for the due-date picker, version-pinned to the installed `@mantine/core@9.5.2`. This is the official Mantine dates package, not a third-party registry — does not violate the one-primitive-engine rule.
- **2026-08-24**: Added `autoContrast: true` to `theme.ts` — a global, low-risk accessibility default that makes Mantine auto-select readable text color on colored surfaces app-wide (verified it doesn't change the existing brand Button's white-on-purple text).
- **2026-08-24**: Fixed a pre-existing, now-Board-exposed responsive/accessibility gap in `Layout.tsx`: the sidebar had no mobile collapse, permanently overlapping and obscuring focused content below the `sm` breakpoint (axe: `focus-obscured`, WCAG 2.4.11). Added a `Burger` + `useDisclosure` toggle. This is a shared-layout fix, not a redesign — visual style of the nav is unchanged, only its mobile collapse behavior was added.
- **2026-08-24**: Pinned Board avatar colors to explicit `.9` shades after discovering the default `filled`-variant shade resolution left `grape` avatars at 4.02:1 contrast (fails AA) even with `autoContrast: true`. Verified via direct computed-style contrast checks (documented in `.eval/worker-report.md`) rather than relying solely on axe.
- **2026-08-24**: Changed the "high" priority Badge color from `orange` to `violet` after finding Mantine's default `orange` light-variant text/background pairing measures 3.62:1 (fails AA at Badge's text size); `violet` measures 5.39:1.
