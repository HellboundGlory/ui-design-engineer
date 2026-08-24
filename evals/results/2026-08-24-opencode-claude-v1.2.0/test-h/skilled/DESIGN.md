<!--
  Project Design Memory & Engineering Specification (DESIGN.md)

  This file is a design CONTRACT, not a design textbook. It was instantiated retroactively
  by reading the existing, hand-built orbitctl codebase (src/index.css, src/components/*,
  src/pages/*) — no DESIGN.md existed before this. Every value below is inferred from what
  was actually shipped, not invented. Future sessions should extend this file, not silently
  drift from it.
-->

# Project Design Memory (DESIGN.md)

## 1. Product Intent

- **What is this product, in one or two sentences?** orbitctl — an internal API-ops dashboard for monitoring service health/throughput and managing account billing (plan, payment method, invoices, webhooks).
- **What is the core job the user is doing on this screen/product?** Operating and monitoring: scanning service status/metrics quickly, and occasionally administering account/billing configuration.
- **What does success feel like to the user?** Fast, unambiguous, no wasted motion — information reads at a glance, actions are where you'd expect them, nothing decorative gets in the way.

## 2. Users & Usage Context

- **Who is the primary user?** A technical operator/engineer (comfortable with monospace IDs, tabular data, API terminology like "webhook", "signing secret", "endpoint").
- **How often and in what context do they use this?** Likely checked frequently at a desk during a work session; billing/webhook config is an occasional, deliberate task rather than a daily one.
- **What's the cost of a mistake or a slow interaction here?** Moderate for billing (a wrong webhook endpoint silently breaks downstream integrations) — hence inline validation before save, and a visible secret/status rather than a silent no-op.

## 3. Visual Personality

- **In three adjectives:** precise, quiet, technical.
- **References:** Reads like a modern dark-mode developer tool (Stripe/Vercel/Linear-adjacent dashboard conventions) — neutral dark surfaces, one restrained accent blue, monospace reserved for identifiers/code rather than applied everywhere.

## 4. Archetype / Direction

- **Active archetype(s):** Precision Technical.
- **Why this archetype fits:** Dense operational data (service RPS, error rates, invoice tables), monospace treatment for IDs/secrets, tabular-nums for all numeric columns, minimal chrome, restrained single-accent color — all already present in the shipped code before this change.

## 5. Color & Semantic Tokens

Existing system uses hex custom properties (not OKLCH) defined once in `src/index.css` and re-exposed through Tailwind v4's `@theme` block. This is an established system — extended, not migrated, per component-selection.md guidance ("extend an existing HSL/hex system if one already exists rather than migrating it").

### Dark mode (the only mode — see below)
```css
:root {
  --color-bg: #0b0d12;            /* page canvas */
  --color-bg-raised: #12151c;     /* card/modal surface */
  --color-bg-sunken: #07080b;     /* inputs, recessed surfaces */
  --color-border: #22262f;        /* default hairline */
  --color-border-strong: #2e333e; /* modal border, emphasized dividers */

  --color-text: #e6e9ef;          /* primary text */
  --color-text-muted: #8b93a3;    /* secondary text, labels */
  --color-text-faint: #5b6270;    /* placeholder text */

  --color-accent: #5b8def;
  --color-accent-strong: #7ea2f2; /* hover state of accent */
  --color-accent-muted: #26355a;  /* accent-tinted background (active nav, info badge) */

  --color-success: #3fb87f;   --color-success-muted: #16311f;
  --color-warning: #d8a53d;   --color-warning-muted: #3a2f14;
  --color-danger: #e0596b;    --color-danger-muted: #3a1c22;
  --color-info: #5b8def;      /* == accent */
}
```

- **Does this product need a dark mode at all, and which is the default?** Dark-only by design — there are no light-mode tokens anywhere in the codebase, no theme toggle, no `prefers-color-scheme` branching. This is a deliberate Project Decision for a technical/ops tool (legitimate exception per anti-patterns-catalog.md's "Default dark SaaS aesthetic" entry: developer tools are named there as a case where dark-first is a real, common preference, not a reflex).

## 6. Typography

- **Display / body font stack:** `"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif` (`--font-sans`) — used for all UI text, headings, and body.
- **Code / data (monospace) font stack:** `"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace` (`--font-mono`) — reserved for identifiers (invoice IDs, service names, card brand tag, signing secrets), not applied broadly.
- **Scale ratio:** No formal modular scale in use; sizes are chosen directly from Tailwind's text scale (`text-xs` / `text-sm` / `text-lg` / `text-xl`) at a small number of fixed steps. Treat this as the existing convention rather than introducing a new ratio.
- **Tabular numbers policy:** Enforced via a `.tabular` utility class (`font-variant-numeric: tabular-nums`) on every numeric/dollar/date value in tables and stat tiles. Apply `.tabular` to any new numeric display.

```css
:root {
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
  --font-family-sans: var(--font-sans);
  --font-family-mono: var(--font-mono);
}
```

## 7. Spacing

- **Spacing grid:** Tailwind's default 4px scale, used directly (`px-4`, `py-3.5`, `gap-3`, etc.) — no custom spacing tokens.
- **Section-specific conventions:** Card header padding `px-4 py-3` (or `px-5 py-3.5` in modals); card body padding `px-4 py-4` (or `px-5 py-4` in modals); page container `mx-auto max-w-5xl px-6 py-6`; vertical rhythm between page sections is `mb-5`.

## 8. Density

- **Layout density target:** Compact — this is an operational dashboard, not a browsing surface.
  - Table row height: `py-2.5` per cell (~36px row).
  - Form control height: `h-9` (inputs, medium buttons), `h-7` (small buttons).
  - Card/widget internal padding: `px-4 py-4` body, `px-4 py-3` header.
  - Container max-width: `max-w-5xl`, centered.

## 9. Geometry

- **Global radius scale:** three-step token system, all present in `:root`:
  - `--radius-sm: 4px` — badges, small inline chips (card-brand tag).
  - `--radius-md: 6px` — buttons, inputs, nav items (applied via Tailwind's `rounded-md`, which this project's `@theme` maps to the same scale as Tailwind's default `--radius-md`).
  - `--radius-lg: 10px` — cards, modals (`rounded-lg`).
- **No per-element exceptions** — every bordered surface picks one of these three, consistently. Do not introduce a fourth radius value or an arbitrary `rounded-xl`/`rounded-2xl` for a new component.

```css
:root {
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 10px;
}
```

## 10. Surfaces & Elevation

- **Elevation model:** Border rules, not shadows, for in-flow surfaces (cards use `border border-border` only, no box-shadow). The one exception is the Modal, which is the only surface that visually elevates above page content, and uses `shadow-xl` plus a `bg-black/60` backdrop — consistent with it being the sole overlay-type surface in the app.
- **Glassmorphism policy:** Not used anywhere; forbidden by omission — don't introduce blur/glass effects.

## 11. Iconography

- **Primary icon set:** None in active UI use. `public/icons.svg` contains a small sprite of brand/social icons (GitHub, X, Discord, etc.) that don't appear referenced by any current page — likely scaffold leftovers, not an adopted icon system. No Lucide/Heroicons/etc. dependency exists.
- **Convention observed instead:** plain Unicode glyphs for the rare icon need (Modal's close button uses `✕` as literal text, not an SVG icon).
- **Guidance for future icon needs:** if a real icon requirement arises, pick one lightweight, stroke-consistent set (Lucide is a reasonable default for this stack) rather than mixing Unicode glyphs and a sprite of unrelated brand marks. Not yet decided as a hard system — flagged in §20.

## 12. Navigation

- **Primary navigation model:** Persistent left sidebar (`w-56`, edge-anchored, flush to viewport left and top — no floating/pill nav), with `NavLink`-driven active state (`bg-accent-muted text-accent-strong`).
- **How does navigation adapt at narrow viewports?** It currently does not — the sidebar renders at a fixed 224px width at every viewport, including mobile (375px), which leaves very little room for main content and is a **pre-existing responsive gap**, not something introduced by this change. See §18 and the worker report's Failure Conditions section for verification evidence. Out of scope for this webhook-modal task; flagged as follow-up work in §20.

## 13. Components

- **Primary component/primitive source:** None — fully bespoke, hand-built components in `src/components/` (`Button`, `Card`/`CardHeader`/`CardBody`, `Badge`, `Input`/`Label`, `Modal`, `Layout`). No shadcn/Radix/Mantine/MUI or any other registry or primitive engine is installed (`package.json` confirms only `react`, `react-dom`, `react-router-dom`).
- **Reasoning:** Existing, deliberate bespoke system to preserve — per `component-selection.md`'s selection hierarchy, level 1 ("existing local component") applies directly. This is not a case that calls for shadcn or any registry.
- **Utility/specialized registries in use:** None.

## 14. Data Visualization

- **Charting engine:** Not applicable — Dashboard.tsx uses plain stat tiles and a table, no chart library.

## 15. Motion

- **Motion engine:** CSS transitions only (`transition-colors duration-100` on Button, `transition-colors` on nav items). No animation library.
- **Default transition dynamic:** 100ms color transitions, default easing (no custom cubic-bezier declared).
- **Reduced-motion compliance:** No motion beyond color transitions exists, so there is nothing to gate behind `prefers-reduced-motion` today; if entrance/exit motion is added later (e.g. modal fade), it must respect `prefers-reduced-motion` per the accessibility invariant.

## 16. Responsive Behavior

- **Breakpoint scale:** Not formally documented anywhere in code; no `sm:`/`md:`/`lg:` Tailwind variants appear in any existing page or component. Treat 375/768/1440/1920 (this skill's default visual-qa viewports) as the working set until a real breakpoint scale is decided.
- **Known gap:** the sidebar (see §12) and the Plan/Payment method two-column grid (`grid grid-cols-2`, no responsive variant) do not adapt below ~600px, causing card overlap at 375px. Verified pre-existing (reproduced on the unmodified `main` branch's `Billing.tsx` before this change) — not a regression from the webhook modal work. See §20.

## 17. Accessibility

- **Target:** WCAG 2.2 AA (default).
- **Known accessibility debt, if inheriting an existing codebase:**
  - Pre-existing: no responsive sidebar collapse at mobile widths (see §12/§16) — causes a focus-obscured control at 375px unrelated to this change.
  - Fixed in this change: `Modal.tsx` previously had no focus trap and no initial-focus management — Tab could escape the dialog to background content, and closing didn't restore focus to the triggering element. Both fixed (see §21) since the new Webhook modal made this gap immediately visible, and the fix applies to every modal in the app, not just the new one.

## 18. Project-Specific Anti-Patterns (STRICT NEVER)

- Never introduce a component registry (shadcn, Mantine, MUI, etc.) — this project is intentionally bespoke; see §13.
- Never add a fourth radius value — stay within `--radius-sm` (4px) / `--radius-md` (6px) / `--radius-lg` (10px).
- Never add box-shadow to an in-flow surface (cards) — shadows are reserved for the Modal overlay only.
- Never mix icon sets — if icons are introduced, pick one set project-wide (see §11).
- Never hardcode a color — every color in a new component must resolve through the existing `--color-*` custom properties / their Tailwind utility equivalents (`bg-bg-raised`, `text-text-muted`, `border-border`, etc.).

## 19. Component Sources & Exceptions

- **Primary primitives:** Bespoke (`src/components/*`) — see §13.
- **Utility registries:** None.
- **Charting engine:** None.
- **Documented exceptions to any rule above, with reasoning:**
  - `Modal` gained an optional `size?: "md" | "lg"` prop (default `"md"`, preserving every existing call site's exact prior appearance) so the Webhook Configuration modal — which holds a URL field, five checkboxes, and a secret row — has enough width without cramping. This is additive and non-breaking; no existing modal usage changed visually.

## 20. Open Questions / Not Yet Decided

- Mobile navigation pattern: the sidebar has no collapse/drawer behavior at narrow viewports (see §12, §16). Recommend a follow-up task to design a mobile nav pattern (e.g., collapsible drawer or bottom tabs) rather than folding it into an unrelated feature change.
- The Plan/Payment method `grid grid-cols-2` on `Billing.tsx` should get a responsive variant (e.g. `sm:grid-cols-2 grid-cols-1`) as part of that same mobile-nav follow-up.
- No formal icon system has been chosen (see §11) — decide before the first feature that actually needs icons.

## 21. Design Decisions Log

- 2026-08-24: Initialized DESIGN.md for orbitctl by reading the existing codebase (no prior DESIGN.md existed). All values in §1-19 are inferred from shipped code, not newly chosen.
- 2026-08-24: Added Webhook Configuration modal to Billing settings, built entirely from existing primitives (`Card`, `CardHeader`, `CardBody`, `Button`, `Badge`, `Input`, `Label`, `Modal`) — no new dependencies, no new colors, no new radius values. New `WebhookConfigModal` component at `src/components/WebhookConfigModal.tsx`.
- 2026-08-24: Extended `Modal` with an optional `size` prop (`"md"` default / `"lg"`) — additive, non-breaking, documented as an exception in §19.
- 2026-08-24: Fixed `Modal` to trap focus within the dialog and manage initial/restore focus (previously Tab could escape to background content, and closing didn't return focus to the trigger). Applies to every modal in the app. See Skill Behavior Observed / Automated Checks in `.eval/worker-report.md` for how this was found (manual keyboard QA in the browser) and verified (via `document.activeElement` / `:focus-visible` checks and a full Tab-cycle trace).
