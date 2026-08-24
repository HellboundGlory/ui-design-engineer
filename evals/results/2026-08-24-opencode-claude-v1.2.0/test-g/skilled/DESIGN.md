# Project Design Memory (DESIGN.md)

## 1. Product Intent

- **What is this product, in one or two sentences?** `orbitctl` is an internal API operations console — live traffic health, service status, and account/billing administration for the team running the platform.
- **What is the core job the user is doing on this screen/product?** Monitoring service health and managing the team's own account/billing configuration.
- **What does success feel like to the user?** Fast to scan, nothing decorative in the way, numbers that line up and are trustworthy at a glance.

## 2. Users & Usage Context

- **Who is the primary user?** Backend/infra engineers and team admins — technical, comfortable with dense data, not a general consumer audience.
- **How often and in what context do they use this?** Multiple times a day at a desk, often as a secondary monitor/tab.
- **What's the cost of a mistake or a slow interaction here?** Billing/plan mistakes cost real money; misread service status costs incident-response time. Low tolerance for ambiguity, low tolerance for decorative friction.

## 3. Visual Personality

- **In three adjectives, how should this feel?** Precise, quiet, technical.
- **Any explicit references or products this should feel similar to / deliberately different from?** Closer to a terminal-adjacent ops dashboard (Vercel/Linear dark mode, Grafana) than a consumer SaaS marketing product. Deliberately not playful.

## 4. Archetype / Direction

- **Active archetype(s):** Precision Technical
- **Why this archetype (or blend) fits this product:** Internal, data-dense, technical operator audience; correctness and scan speed matter more than warmth.

## 5. Color & Semantic Tokens

Existing token system is CSS custom properties (hex) mapped into Tailwind v4 via `@theme` in `src/index.css`. This project is dark-mode only — extend this system, do not migrate it to OKLCH or introduce a parallel palette.

```css
:root {
  --color-bg: #0b0d12;            /* page canvas */
  --color-bg-raised: #12151c;     /* card/surface */
  --color-bg-sunken: #07080b;     /* sidebar, inputs, recessed wells */
  --color-border: #22262f;
  --color-border-strong: #2e333e;

  --color-text: #e6e9ef;
  --color-text-muted: #8b93a3;
  --color-text-faint: #5b6270;

  --color-accent: #5b8def;
  --color-accent-strong: #7ea2f2;
  --color-accent-muted: #26355a;   /* accent-tinted surfaces, active nav item */

  --color-success: #3fb87f;
  --color-success-muted: #16311f;
  --color-warning: #d8a53d;
  --color-warning-muted: #3a2f14;
  --color-danger: #e0596b;
  --color-danger-strong: #e6687a; /* lighter danger for text-on-muted pairings (WCAG AA) */
  --color-danger-muted: #3a1c22;
  --color-info: #5b8def;
}
```

- **Does this product need a dark mode at all, and which is the default?** Dark mode only, no light mode — this is an always-on ops console, not a marketing surface. Do not add a light theme unless explicitly asked.

## 6. Typography

- **Display font stack:** `Inter, ui-sans-serif, system-ui, -apple-system, sans-serif` (`--font-sans`) — used for headings too, no separate display face.
- **Body font stack:** same as display (`--font-sans`).
- **Code / data (monospace) font stack:** `"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace` (`--font-mono`) — used for service/entity identifiers (`api-gateway`, `INV-2091`) and the wordmark, not just literal code.
- **Scale ratio:** Custom, small/flat — this product favors density over a dramatic type scale (page title `text-lg`/`font-semibold`, card title `text-sm`/`font-medium`, body `text-sm`, meta `text-xs`).
- **Tabular numbers policy:** Enforced in tables/dashboards only, via the `.tabular` utility class (`font-variant-numeric: tabular-nums`) — apply it to every numeric column/stat value.

## 7. Spacing

- **Spacing grid:** 4px (Tailwind default scale, used directly — no custom spacing scale).
- **Any section- or component-specific spacing exceptions worth recording?** Page content is capped at `max-w-5xl` with `px-6 py-6` outer padding; cards use `px-4 py-3.5`–`py-4` internally; table cells use `px-4 py-2.5`. Keep new screens inside these same paddings rather than introducing looser, more "consumer" spacing.

## 8. Density

- **Layout density target:** Compact.
  - Table row height: ~36–40px (`px-4 py-2.5` on `text-sm` rows).
  - Form control height: `h-9` (36px) for inputs and default buttons, `h-7` (28px) for `sm` buttons.
  - Card/widget internal padding: `px-4 py-3.5`/`py-4`.
  - Container max-width: `max-w-5xl`.

## 9. Geometry

- **Global radius token (`--radius`):** Small — `--radius-md: 6px` is the default for cards/inputs/buttons/modals (`rounded-md`/`rounded-lg` in Tailwind, mapped 6–10px). Do not introduce the larger `rounded-2xl`/pill-everywhere look; it reads as consumer-app, not ops-tool.
- **Any per-element radius exceptions?** Badges use `rounded-sm` (4px) — deliberately tighter than cards/buttons since they're inline text-adjacent chips, not containers.

## 10. Surfaces & Elevation

- **Elevation model:** Border rules — `border border-border` on cards/inputs, `border-border-strong` for emphasis (hover, modal panel). No drop-shadows except the modal panel (`shadow-xl`, the one deliberate elevated-surface exception) and no glassmorphism anywhere.
- **Glassmorphism policy:** Forbidden.

## 11. Iconography

- **Primary icon set:** Not yet adopted — current UI uses text/mono-badge labels (`VISA`) rather than icons. If icons are introduced, keep stroke width consistent and match the existing restrained, non-decorative tone (no filled/colorful icon sets).
- **Default stroke width:** N/A yet — decide on first real icon need and log it in section 21.
- **Label requirement:** icon-only controls require an accessible name (`aria-label` or visually-hidden text) — always true, not a project choice.

## 12. Navigation

- **Primary navigation model:** Persistent left sidebar (`w-56`, `bg-bg-sunken`), flat list (Dashboard, Servers, Billing). One nav DOM node that reflows — see §21 for the responsive decision.
- **How does navigation adapt at narrow viewports?** Below `lg` (1024px) the sidebar becomes a top strip: brand row + horizontal nav links (decided 2026-08-24, logged in §21).

## 13. Components

- **Primary component/primitive source:** Custom internal components (`src/components/`) built directly on Tailwind utility classes — `Button`, `Card`/`CardHeader`/`CardBody`, `Badge`, `Input`/`Label`, `Select`, `Textarea`, `Checkbox`, `Modal`. No shadcn/ui, no Radix, no headless-UI dependency.
- **Reasoning:** Existing hand-built system to preserve — small enough that a component library wasn't justified yet. New UI should extend these same components rather than introducing shadcn/Radix/another library alongside them.
- **Utility/specialized registries in use, if any:** None.

## 14. Data Visualization

- **Charting engine:** Not applicable yet — no charts exist in the current UI (Dashboard uses stat tiles + a status table, not charts).
- **Max simultaneous chart series before aggregating to "Other":** 5 (default), if/when charts are introduced.

## 15. Motion

- **Motion engine:** CSS transitions only (`transition-colors duration-100` on interactive elements). No animation library in use.
- **Default transition dynamic:** Fast, linear-ish color/background transitions (~100ms) on hover/focus states — nothing springy or decorative.
- **Reduced-motion compliance:** mandatory — see `references/motion-microinteractions.md`. Not a project choice.

## 16. Responsive Behavior

- **Breakpoint scale:** Tailwind default breakpoints (sm 640 / md 768 / lg 1024 / xl 1280). The meaningful layout switch is `lg` — sidebar ↔ top strip (decided 2026-08-24, see §21).
- **Any viewport this product deliberately does not support (and why)?** None excluded; narrow viewports are supported via the §21 decisions (top-strip nav, contained table scroll).

## 17. Accessibility

- **Target:** WCAG 2.2 AA (default — see `references/accessibility-wcag.md`).
- **Known accessibility debt, if inheriting an existing codebase:** Icon-only close button in `Modal` has an `aria-label`; focus-visible ring is defined globally (`*:focus-visible`). First automated audit (axe-core via visual-qa, 2026-08-24) ran against `/servers`: two contrast failures found and fixed (see §21); the Dashboard/Billing pages have not been re-audited since the Button/Badge tone fixes and may still carry the pre-fix pairings.

## 18. Project-Specific Anti-Patterns (STRICT NEVER)

- Never introduce shadcn/ui, Radix, or any second component/styling system alongside the existing hand-built components in `src/components/`.
- Never use `--color-danger` (or red generally) for anything other than destructive/error states.
- Never add a light theme without an explicit decision logged here first.
- Never use `rounded-2xl`/pill-shaped containers — this product's geometry is small-radius (`--radius-md`, 6px), not the rounder consumer-app look.

## 19. Component Sources & Exceptions

- **Primary primitives:** Custom (`src/components/Button.tsx`, `Card.tsx`, `Badge.tsx`, `Input.tsx`, `Select.tsx`, `Textarea.tsx`, `Checkbox.tsx`, `Modal.tsx`).
- **Utility registries:** None.
- **Charting engine:** None yet.
- **Documented exceptions to any rule above, with reasoning:** None yet — no deliberate deviations have been made from the system described above.

## 20. Open Questions / Not Yet Decided

- ~~Mobile/narrow-viewport behavior~~ — decided 2026-08-24 (see §21); revisit if nav grows nesting.
- Icon set — not yet adopted.
- Charting engine — not yet needed, but will be once trend/analytics views are added.

## 21. Design Decisions Log

- 2026-08-24: Initialized DESIGN.md for `orbitctl`, documenting the token system, component set, and density/geometry conventions already established in the shipped Dashboard and Billing settings pages.
- 2026-08-24: **Servers page added** (`/servers`, `src/pages/Servers.tsx`) — server inventory table + Add server form, refactored from the legacy `legacy/report.html` fixture. Semantic `<table>` preserved (no div-grid reflow); identifiers in `font-mono`, numerics `.tabular` right-aligned, status as Badge (`up`→success, `down`→danger).
- 2026-08-24: **Form primitives extended in-house** — `Select`, `Textarea`, `Checkbox` added to `src/components/` in the existing idiom (no registry/library, per §18). `Label` gained optional `htmlFor` for programmatic label association. Checkbox is a native control at 24×24 (`size-6`, `accent-accent`) to satisfy WCAG 2.5.8 target size.
- 2026-08-24: **Contrast fix — danger badge text.** axe flagged `text-danger` on `bg-danger-muted` at 4.25:1 (< 4.5). Added token `--color-danger-strong: #e6687a` (4.9:1 on danger-muted) and pointed the Badge `danger` tone at it. `--color-danger` remains for error text on raised/sunken surfaces (5.1:1) and non-badge uses.
- 2026-08-24: **Contrast fix — primary button label.** White on `--color-accent` measured 3.23:1 (< 4.5 for `text-sm`). Primary variant now uses `text-bg` (near-black) on accent: ~6.5:1, matching the terminal-adjacent Vercel/Linear look. No other page rendered a primary button at the time of the change.
- 2026-08-24: **Responsive decision.** Breakpoint scale = Tailwind defaults; the layout switch is `lg` (1024px). Below `lg`: sidebar becomes a top strip (brand row + horizontal nav, same `NavLink` styles); data tables live in a contained `overflow-x-auto` region with `min-w-[640px]` so columns keep integrity (semantic table preserved, page never scrolls sideways); the 3-field form grid reflows 3→2→1 (`sm`/`lg`). Rationale: ops tables must stay scannable; stacking table rows into cards was rejected as it breaks column comparison for this audience.
- 2026-08-24: **Focus ring timing note.** `transition-colors` (Tailwind v4) includes `outline-color`, so the global `*:focus-visible` ring animates from currentColor to accent over ~100ms. Ring is visible throughout; no change made.
