<!--
  Project Design Memory & Engineering Specification (DESIGN.md)
  Instantiated retroactively from the existing orbitctl codebase (Dashboard + Billing
  pages, src/components/ primitives, src/index.css tokens) which predates this file.
  Sections 1-17 describe what was already in place, reverse-engineered rather than
  invented. Section 21 records the Logs feature added in this session.
-->

# Project Design Memory (DESIGN.md)

## 1. Product Intent

- **What is this product, in one or two sentences?** orbitctl — an API-ops control console for monitoring and administering backend services (request throughput, error rate, latency, service health, billing).
- **What is the core job the user is doing on this screen/product?** Operating and monitoring: watching live system state, checking service health, and now, streaming/inspecting application logs during debugging or incident response.
- **What does success feel like to the user?** "I found the anomaly / the failing request fast, without fighting the tool."

## 2. Users & Usage Context

- **Who is the primary user?** A backend/platform engineer or on-call responder — technically fluent, domain-expert in the systems they operate.
- **How often and in what context do they use this?** Many times a day at a desk, often during active incidents where speed matters.
- **What's the cost of a mistake or a slow interaction here?** High — missing a log line or a slow filter during an incident directly extends time-to-resolution.

## 3. Visual Personality

- **In three adjectives:** precise, dense, instrumented.
- **References:** Cockpit/terminal-adjacent ops tooling (Datadog, Grafana, Vercel logs) — never a consumer dashboard.

## 4. Archetype / Direction

- **Active archetype(s):** Precision Technical.
- **Why this archetype fits:** orbitctl is a tool a technical operator uses for hours to monitor and debug live systems. Success is measured by "found it fast," not delight. The existing Dashboard/Billing pages already express this (dense tables, mono for IDs/numbers, border-based surfaces, restrained status color) — the Logs feature extends the same language rather than introducing a new one.

## 5. Color & Semantic Tokens

Existing tokens in `src/index.css` (hex-based, not OKLCH — this project predates the OKLCH default and is extended in place rather than migrated, per the skill's own guidance to extend an existing system rather than convert it).

### Dark mode (the only mode — see below)
```css
:root {
  --color-bg: #0b0d12;
  --color-bg-raised: #12151c;
  --color-bg-sunken: #07080b;
  --color-border: #22262f;
  --color-border-strong: #2e333e;

  --color-text: #e6e9ef;
  --color-text-muted: #8b93a3;
  --color-text-faint: #5b6270;

  --color-accent: #5b8def;
  --color-accent-strong: #7ea2f2;
  --color-accent-muted: #26355a;

  --color-success: #3fb87f;
  --color-success-muted: #16311f;
  --color-warning: #d8a53d;
  --color-warning-muted: #3a2f14;
  --color-danger: #e0596b;
  --color-danger-muted: #3a1c22;
  --color-info: #5b8def;  /* == --color-accent, deliberately aliased */
}
```

- **Does this product need a dark mode at all, and which is the default?** Dark-only. No light theme exists or is planned; do not introduce one incidentally.

## 6. Typography

- **Display/body font stack:** `--font-sans`: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif.
- **Code / data (monospace) font stack:** `--font-mono`: "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace. Used for: IDs, timestamps, service names, invoice numbers, tabular numeric values, and now log messages/JSON payloads.
- **Scale ratio:** Not a formal modular scale — a small hand-picked set (text-[11px], text-xs, text-sm, text-lg for page titles). Keep new UI within this existing set rather than introducing new sizes.
- **Tabular numbers policy:** Enforced wherever numbers update or are scanned in a column, via the `.tabular` utility class already defined in index.css. Applied to log timestamps.

## 7. Spacing

- **Spacing grid:** 4px (Tailwind default scale), consistent with Precision Technical's density guidance.
- **Exceptions:** none new.

## 8. Density

- **Layout density target:** Compact.
  - Table row height: existing tables use ~36-40px rows (`py-2.5`); Logs stream rows match this.
  - Form control height: 36px (`h-9`, existing `Input`/`Button` md size).
  - Card/widget internal padding: `px-4 py-3.5` / `px-4 py-4` (existing `CardBody`).
  - Container max-width: `max-w-5xl` on Dashboard/Billing. The Logs page is widened to `max-w-none` within the main scroll region because a log stream + inspector split genuinely needs the width a 5xl column would starve — documented exception, see §19.

## 9. Geometry

- **Global radius tokens:** `--radius-sm` (4px) / `--radius-md` (6px) / `--radius-lg` (10px) exist in index.css but aren't wired into the Tailwind `@theme`; in practice the codebase uses Tailwind's own `rounded-sm`/`rounded-md`/`rounded-lg` utilities directly and consistently (Badge = sm, Button/Input = md, Card/Modal = lg). New Logs UI follows the same mapping — no new radius values introduced.

## 10. Surfaces & Elevation

- **Elevation model:** Border rules (1px `--color-border` hairlines), not shadows. `bg-bg-raised` for cards, `bg-bg-sunken` for recessed/input surfaces.
- **Glassmorphism policy:** Forbidden — none exists in the codebase and none is introduced.

## 11. Iconography

- **Primary icon set:** None installed (no lucide/heroicons dependency; the one existing icon-like glyph is a literal "✕" character in `Modal`'s close button). The Logs feature needed a chevron (JSON tree expand/collapse) and a search glyph; rather than pull in a new icon library for two glyphs, these are hand-drawn 16px inline SVGs matching the archetype's stroke conventions (1.5px stroke, `currentColor`) — see `src/components/icons.tsx`. Documented exception in §19.
- **Label requirement:** icon-only controls require an accessible name — applied to the stream pause/resume button, inspector close button, and severity filter chips.

## 12. Navigation

- **Primary navigation model:** Persistent left sidebar (`Layout.tsx`), dense single-level links. "Logs" added as a third entry between Dashboard and Billing (operational before billing, matching task frequency).
- **Narrow viewports:** the sidebar is currently fixed-width and not collapsible at any breakpoint — a pre-existing condition of `Layout.tsx`, not something introduced by this feature. Noted as an open item in §20 rather than silently fixed, since resolving it is outside this task's scope (it would touch the existing Dashboard/Billing shell).

## 13. Components

- **Primary component/primitive source:** Project-local hand-rolled components in `src/components/` (`Card`, `Badge`, `Button`, `Input`, `Modal`, `Layout`) styled directly with Tailwind utility classes against the CSS-variable token layer. No Radix/shadcn/other primitive engine is present.
- **Reasoning:** Existing system to preserve — per the skill's component-selection hierarchy, an established local system outranks introducing shadcn/Radix even though this is a fresh React/Tailwind stack that would otherwise default to shadcn. All new Logs UI is built from these existing primitives (`Card`, `CardHeader`, `CardBody`, `Badge`, `Button`, `Input`, `Modal`) plus one new bespoke component (`JsonViewer`) that has no existing local equivalent.
- **Utility/specialized registries in use:** none.

## 14. Data Visualization

- **Charting engine:** Not applicable — the Logs feature is a stream/table, not a chart. No charting library introduced.

## 15. Motion

- **Motion engine:** CSS transitions only (`transition-colors duration-100`, matching existing Button/nav hover states).
- **Default transition dynamic:** ~100-150ms, ease/linear — matches Precision Technical guidance and existing `duration-100` usage.
- **Reduced-motion compliance:** New log-row insertion and the JSON tree expand/collapse avoid any transform/opacity animation beyond the existing color-transition pattern, so no separate `prefers-reduced-motion` override was needed — nothing new is added that moves.

## 16. Responsive Behavior

- **Breakpoint scale:** Mobile 375px / Tablet 768px / Desktop 1280px+ (Tailwind defaults, matching the rest of the app which has no custom breakpoints defined).
- **Behavior:** Dashboard/Billing don't currently adapt navigation at narrow widths (fixed sidebar). The Logs page's own content (toolbar, table, inspector) reflows: the JSON inspector collapses from a side panel to a full-width panel below the stream under `md`, filter chips wrap, and the table hides the Service column under `sm` to keep Time/Severity/Message legible. See §20 re: the sidebar itself.

## 17. Accessibility

- **Target:** WCAG 2.2 AA (default).
- **Known accessibility debt, if inheriting an existing codebase:** none identified in the existing Dashboard/Billing pages during inspection (labeled inputs, visible focus ring via `*:focus-visible`, real `<table>` markup, real `<button>`s throughout).

## 18. Project-Specific Anti-Patterns (STRICT NEVER)

- Never introduce a second color-token system, icon library, or component primitive engine (shadcn/Radix/MUI/etc.) into this project — extend `src/index.css` and `src/components/` instead.
- Never use `--color-success` / `--color-warning` / `--color-danger` for anything other than genuine status/severity meaning (they must mean the same thing in a Dashboard health badge, a Billing invoice status, and a Logs severity badge).
- Never add a light theme.
- Never use raw hex/rgb colors in component `className`s — use the semantic Tailwind color utilities (`bg-bg-raised`, `text-danger`, etc.) generated from the token layer.

## 19. Component Sources & Exceptions

- **Primary primitives:** Local `src/components/*` (Card, Badge, Button, Input, Modal, Layout).
- **Utility registries:** none.
- **Charting engine:** none.
- **Documented exceptions:**
  - `JsonViewer` (`src/components/JsonViewer.tsx`) is a new bespoke component — no existing local equivalent covers a collapsible, syntax-aware JSON tree. Built from scratch using only existing tokens (no new colors), per component-selection hierarchy level 7 (bespoke implementation), because no primitive engine or registry is configured in this project and a generic registry component would need a full re-theme anyway.
  - `src/components/icons.tsx` — two hand-drawn 16px SVG icons (search, chevron) added because the project has no icon library; adding a full icon package for two glyphs would fail the bundle-budget heuristic for no real benefit.
  - Logs page uses `max-w-none` instead of the `max-w-5xl` container width used by Dashboard/Billing, because the log stream + inspector split needs the extra width; the page still opens with the same `px-6 py-6` outer padding.

## 20. Open Questions / Not Yet Decided

- The sidebar (`Layout.tsx`) does not collapse or adapt at narrow/mobile viewports; this predates the Logs feature and wasn't in scope to fix here, but it will limit how well any page (including Logs) works below ~640px width. Flagged for a future session.
- No pagination/virtualization strategy exists yet for very large log volumes (this build caps the in-memory buffer at 500 entries and drops the oldest); a production version would want server-side pagination or a virtualized list.

## 21. Design Decisions Log

- 2026-08-24: Initialized DESIGN.md for orbitctl by reverse-engineering the existing Dashboard/Billing/component code (no prior design memory existed).
- 2026-08-24: Added the Logs page — a developer observability log stream with severity filtering (INFO/WARN/ERROR reusing info/warning/danger tones), full-text search, a collapsible JSON payload inspector (new bespoke `JsonViewer` component), and real keyboard shortcuts (`/` focus search, `j`/`k` or arrows move selection, `Enter` open inspector, `Escape` close it, `1`/`2`/`3` toggle severity filters, `p` pause/resume the stream, `?` open a shortcuts reference modal). No new color tokens, no new primitive engine, no light theme.
