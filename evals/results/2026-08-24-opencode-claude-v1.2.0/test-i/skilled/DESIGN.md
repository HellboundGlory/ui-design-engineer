<!--
  Project Design Memory & Engineering Specification (DESIGN.md)
  This file is a design CONTRACT recording decisions already embodied in the codebase
  (src/index.css, src/components/*) plus new decisions made for later additions.
-->

# Project Design Memory (DESIGN.md)

## 1. Product Intent

- **What is this product, in one or two sentences?** orbitctl — an internal API-operations dashboard: service health, request/error/latency stats, and account/billing administration for the team running the API platform.
- **What is the core job the user is doing on this screen/product?** Monitoring live service health and operational queues, and occasionally administering billing. This is an operating/monitoring tool, not a content-browsing or marketing surface.
- **What does success feel like to the user?** "I can see the state of the system and anything needing my attention at a glance, without hunting."

## 2. Users & Usage Context

- **Who is the primary user?** Platform/on-call engineers and technical ops staff — high technical fluency, deep familiarity with the domain.
- **How often and in what context do they use this?** Many times a day, at a desk, often during incidents.
- **What's the cost of a mistake or a slow interaction here?** High — a missed or slow-to-notice incident/escalation costs real time-to-resolution. Density and legibility matter more than visual warmth.

## 3. Visual Personality

- **In three adjectives:** precise, quiet, instrumented.
- **References:** Cockpit/console tools (Grafana, Datadog, Linear's dense views) — deliberately not warm/editorial consumer software.

## 4. Archetype / Direction

- **Active archetype(s):** Precision Technical.
- **Why this archetype fits:** The existing codebase already embodies it — near-black surfaces, restrained single accent, disciplined status palette, border-based card separation, Inter for UI text, JetBrains Mono for tabular/numeric data, tight 4–10px radii. New work extends this rather than introducing a second language.

## 5. Color & Semantic Tokens

This project uses an existing hex-based token system in `src/index.css` (not OKLCH) — extended as-is per the skill's guidance to respect an established system rather than migrate it.

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
  --color-info: #5b8def;
}
```

- **Dark mode:** this is the only mode; product is dark-by-default with no light theme currently implemented.
- **Reference screenshot note:** an external reference screenshot (`reference/screenshot.jpg`, a warm/cream "Support Queue" panel) was used for *layout and composition only* — its literal cream/tan palette, warm status-pill colors, and serif type were deliberately **not** ported. All colors in any component built from it map to the tokens above (`bg-bg-raised`, `text-text`, `text-text-muted`, `bg-warning-muted`/`text-warning`, `bg-success-muted`/`text-success`, etc.).

## 6. Typography

- **Display/UI font stack:** `--font-sans`: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif.
- **Code / data (monospace) font stack:** `--font-mono`: "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace — used for service names, IDs, invoice numbers.
- **Scale ratio:** small, discrete Tailwind text sizes (`text-xs`/`text-sm`/`text-lg`/`text-xl`) rather than a formal modular scale — consistent with existing pages.
- **Tabular numbers policy:** enforced on numeric/live values via the existing `.tabular` utility class (`font-variant-numeric: tabular-nums`).

## 7. Spacing

- **Spacing grid:** 4px-based Tailwind spacing, used at compact increments (`px-4 py-3.5`, `gap-3`, `px-2.5 py-1.5`).

## 8. Density

- **Layout density target:** Compact.
  - Table/list row height: ~36–40px (`py-2.5`–`py-3` content rows).
  - Form control height: 32–36px (`h-7`/`h-9`).
  - Card/widget internal padding: `px-4 py-3.5` (stat cards), `px-4 py-4` (CardBody default).
  - Container max-width: `max-w-5xl`, centered (`mx-auto px-6 py-6`) — matches Dashboard and Billing.

## 9. Geometry

- **Global radius tokens:** `--radius-sm: 4px`, `--radius-md: 6px`, `--radius-lg: 10px`. Cards use `rounded-lg`, buttons/inputs `rounded-md`, badges `rounded-sm`.
- **No exceptions.**

## 10. Surfaces & Elevation

- **Elevation model:** Border rules. Cards are `border border-border bg-bg-raised` with no drop shadow; the one shadow in the system (`shadow-xl`) is reserved for the floating Modal.
- **Glassmorphism policy:** Forbidden — none present in the codebase.

## 11. Iconography

- **Primary icon set:** None in use yet (no icon library installed). Status is currently communicated via the `Badge` component's color + text, not icons.
- **Label requirement:** any icon-only control added must carry `aria-label` or visually-hidden text.

## 12. Navigation

- **Primary navigation model:** Persistent left sidebar (`Layout.tsx`), fixed 224px wide, always visible — desktop-first, technical-operator tool.
- **How does navigation adapt at narrow viewports?** Currently does not collapse; sidebar nav labels are short and the product is used primarily at a desk. New pages built under this layout inherit this behavior — not changed as part of this task.

## 13. Components

- **Primary component/primitive source:** Internal design system — hand-rolled `Card`/`CardHeader`/`CardBody`, `Badge`, `Button`, `Input`/`Label`, `Modal` in `src/components/`. No shadcn/Radix/MUI/etc. installed.
- **Reasoning:** Existing system to preserve — `scripts/inspect-project.js` confirms no primitive/component library dependency exists. New UI is built from these existing primitives rather than introducing an external registry, per the component-selection hierarchy's "prefer the project's own system" rule.

## 14. Data Visualization

- **Charting engine:** Not applicable — no charts in the product yet.

## 15. Motion

- **Motion engine:** CSS transitions only (`transition-colors duration-100` on interactive elements).
- **Default transition dynamic:** ~100ms, default easing — fast, functional, no springs/bounce, matching Precision Technical guidance.
- **Reduced-motion compliance:** mandatory; current transitions are simple color transitions with no motion to disable beyond what `prefers-reduced-motion` already covers by convention.

## 16. Responsive Behavior

- **Breakpoint scale:** Tailwind defaults — `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px. New multi-column layouts collapse to a single column below `lg` (1024px) since the composed grid + sidebar needs the extra width to stay legible; stat-card pairs within a sidebar use a 2-up mobile grid before stacking under the list on desktop.
- **Any viewport this product deliberately does not support?** None declared as unsupported; the product is desktop-first but pages must not break/overflow at 375px.

## 17. Accessibility

- **Target:** WCAG 2.2 AA (default).
- **Known accessibility debt, if inheriting an existing codebase:** No icon-only controls with missing labels found in the existing three components reviewed (Modal's close button has `aria-label="Close"`). Focus-visible ring is globally defined (`*:focus-visible` in `index.css`) and was not modified.

## 18. Project-Specific Anti-Patterns (STRICT NEVER)

- Never hardcode literal hex/rgb colors sampled from an external reference (mockup, screenshot, competitor site) — always map to `--color-*` tokens.
- Never introduce a second component-primitive system (e.g., shadcn) alongside the existing hand-rolled one without an explicit, documented reason.
- Never use warm/cream/serif styling anywhere in this product — it is a dark, sans/mono, technical-operator tool by established convention.

## 19. Component Sources & Exceptions

- **Primary primitives:** `src/components/{Card,Badge,Button,Input,Modal,Layout}.tsx`.
- **Utility registries:** None.
- **Charting engine:** None.
- **Documented exceptions:** None yet.

## 20. Open Questions / Not Yet Decided

- No light theme exists; if one is ever requested, token pairs need to be authored from scratch (current tokens are dark-only).
- No formal icon library chosen yet — introduce one only when a screen genuinely needs icon affordances, and normalize stroke width/size at that point.

## 21. Design Decisions Log

- [2026-08-24]: Initialized DESIGN.md for orbitctl by reverse-documenting the existing dark Precision Technical system already implemented in `src/index.css` and `src/components/` (no prior DESIGN.md existed).
- [2026-08-24]: Added an "Incident Queue" page (`src/pages/IncidentQueue.tsx`, route `/incidents`) recreating the layout/composition of an external reference screenshot (a warm/cream "Support Queue" panel) — 2-column grid: a list panel of item rows (title/subtitle/status pill) plus a narrower sidebar of two stat cards. Colors were remapped entirely to this project's existing dark tokens (no cream/tan hex values carried over); content was renamed from generic e-commerce "Support Queue" copy to "Incident Queue" copy consistent with this product's API-ops domain (service names, ack times, incident status) rather than literally reproducing customer-support terminology. Built entirely from existing `Card`/`Badge` primitives — no new primitives or dependencies introduced. Responsive: collapses from the 2-column grid to a single column below `lg` (1024px); the two sidebar stat cards go 2-up on narrow/medium viewports before stacking under the list in the sidebar column at `lg`+.
