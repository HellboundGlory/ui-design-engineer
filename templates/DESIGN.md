<!--
  Project Design Memory & Engineering Specification (DESIGN.md)

  This file is a design CONTRACT, not a design textbook. It records the decisions
  this specific project has made so that every future session — human or agent —
  builds on the same visual system instead of drifting from it.

  How to fill this in:
  - Answer the decision questions in your own words; don't leave brackets in place.
  - "Suggested starting values" are Defaults or Heuristics from the ui-design-engineer
    skill's reference files, not requirements — override anything that doesn't fit.
  - It's fine to leave a section as "Not yet decided" early in a project. Come back
    and fill it in once the decision is actually made, and log it in section 21.
  - This template is intentionally archetype-neutral. Do not treat any suggested
    value here as "the correct default" — read references/archetypes/ and pick the
    reasoning framework (or blend of frameworks) that actually fits this product.
-->

# Project Design Memory (DESIGN.md)

## 1. Product Intent

- **What is this product, in one or two sentences?**
- **What is the core job the user is doing on this screen/product?** (operating, monitoring, browsing, reading, deciding, processing records...)
- **What does success feel like to the user?**

## 2. Users & Usage Context

- **Who is the primary user?** (role, technical fluency, familiarity with the domain)
- **How often and in what context do they use this?** (many times a day at a desk / occasionally on a phone / a one-time onboarding flow...)
- **What's the cost of a mistake or a slow interaction here?** (This shapes density, motion, and how much "friction" is acceptable.)

## 3. Visual Personality

- **In three adjectives, how should this feel?** (e.g., "precise, quiet, trustworthy" vs. "warm, energetic, playful")
- **Any explicit references or products this should feel similar to / deliberately different from?**

## 4. Archetype / Direction

- **Active archetype(s):** [ Precision Technical | Editorial Premium | Dense Enterprise | Playful Consumer | Calm Productivity | Custom blend — describe ]
- **Why this archetype (or blend) fits this product:**
- Read `references/archetypes/<archetype>.md` for the full reasoning framework before filling in sections 5-15 below — the suggested values there should inform, not replace, the decisions here.

## 5. Color & Semantic Tokens

Define semantic tokens, not raw hex values (see `references/design-system-tokens.md`). New token systems default to OKLCH; extend an existing HSL/hex system if one already exists rather than migrating it.

### Light mode
```css
:root {
  --background: [oklch(L C H)];        /* canvas background */
  --foreground: [oklch(L C H)];        /* primary text */
  --card: [oklch(L C H)];              /* structural surface */
  --card-foreground: [oklch(L C H)];
  --primary: [oklch(L C H)];           /* primary action */
  --primary-foreground: [oklch(L C H)];
  --muted: [oklch(L C H)];
  --muted-foreground: [oklch(L C H)];
  --accent: [oklch(L C H)];
  --accent-foreground: [oklch(L C H)];
  --border: [oklch(L C H)];
  --ring: [oklch(L C H)];             /* focus ring — must clear 3:1 contrast, see accessibility-wcag.md */
  --status-success: [oklch(L C H)];
  --status-warning: [oklch(L C H)];
  --status-error: [oklch(L C H)];
  --status-info: [oklch(L C H)];
}
```

### Dark mode
```css
.dark {
  --background: [oklch(L C H)];
  --foreground: [oklch(L C H)];
  --card: [oklch(L C H)];
  --card-foreground: [oklch(L C H)];
  --primary: [oklch(L C H)];
  --primary-foreground: [oklch(L C H)];
  --muted: [oklch(L C H)];
  --muted-foreground: [oklch(L C H)];
  --accent: [oklch(L C H)];
  --accent-foreground: [oklch(L C H)];
  --border: [oklch(L C H)];
  --ring: [oklch(L C H)];
  --status-success: [oklch(L C H)];
  --status-warning: [oklch(L C H)];
  --status-error: [oklch(L C H)];
  --status-info: [oklch(L C H)];
}
```

- **Does this product need a dark mode at all, and which is the default?**

## 6. Typography

- **Display font stack:**
- **Body font stack:**
- **Code / data (monospace) font stack:**
- **Scale ratio:** [ 1.2 Minor Third | 1.25 Major Third | 1.333 Perfect Fourth | Custom ]
- **Tabular numbers policy:** [ Enforced everywhere numeric | Enforced in tables/dashboards only | Not needed ]

## 7. Spacing

- **Spacing grid:** [ 4px | 8px | Custom ]
- **Any section- or component-specific spacing exceptions worth recording?**

## 8. Density

- **Layout density target:** [ Compact | Comfortable | Spacious ]
  - Table row height: [ ]
  - Form control height: [ ]
  - Card/widget internal padding: [ ]
  - Container max-width: [ ]

## 9. Geometry

- **Global radius token (`--radius`):** [ 2px | 4px | 8px | 12px | 16px | 9999px | Custom ]
- **Any per-element radius exceptions (e.g., avatars always full-round, cards always sharp)?**

## 10. Surfaces & Elevation

- **Elevation model:** [ Border rules | Tonal contrast | Soft drop-shadows | Glassmorphic blur | Mixed — describe ]
- **Glassmorphism policy:** [ Forbidden | Restricted to floating chrome (nav, command palette) | Allowed broadly ]

## 11. Iconography

- **Primary icon set:**
- **Default stroke width:**
- **Label requirement:** icon-only controls require an accessible name (`aria-label` or visually-hidden text) — always true, not a project choice.

## 12. Navigation

- **Primary navigation model:** [ Persistent sidebar | Top bar | Bottom tabs (mobile) | Command-palette-first | Mixed ]
- **How does navigation adapt at narrow viewports?** (See `references/responsive-ux-patterns.md`.)

## 13. Components

- **Primary component/primitive source:** [ shadcn/ui | Radix | Base UI | React Aria | Mantine | Chakra | MUI | Fluent | Primer | Internal design system | Vue/Svelte equivalent | Custom ]
- **Reasoning:** (Existing system to preserve? Greenfield choice? See `references/component-selection.md`'s selection hierarchy.)
- **Utility/specialized registries in use, if any:**

## 14. Data Visualization

- **Charting engine:** [ Recharts | Visx | Observable Plot | ECharts | Project-existing | Not applicable ]
- **Max simultaneous chart series before aggregating to "Other":** [ 5 (default) | Custom ]

## 15. Motion

- **Motion engine:** [ CSS transitions | Motion/Framer Motion | None | Project-existing ]
- **Default transition dynamic:** (easing curve or spring parameters)
- **Reduced-motion compliance:** mandatory — see `references/motion-microinteractions.md`. Not a project choice.

## 16. Responsive Behavior

- **Breakpoint scale:** [ Mobile 375px | Tablet 768px | Desktop 1280px | Wide 1600px | Project-custom ]
- **Any viewport this product deliberately does not support (and why)?**

## 17. Accessibility

- **Target:** WCAG 2.2 AA (default — see `references/accessibility-wcag.md`). Note any project-specific accessibility commitments beyond the baseline here.
- **Known accessibility debt, if inheriting an existing codebase:**

## 18. Project-Specific Anti-Patterns (STRICT NEVER)

List anything specific to *this* product that should never happen, beyond the general catalog in `references/anti-patterns-catalog.md` — e.g., "never use red for anything but destructive actions," "never introduce a second date library," "never use full-bleed images inside the admin panel."

-

## 19. Component Sources & Exceptions

- **Primary primitives:**
- **Utility registries:**
- **Charting engine:**
- **Documented exceptions to any rule above, with reasoning:** (Every deliberate deviation from a Default or Heuristic belongs here — this is what lets a future agent tell "considered exception" apart from "drift.")

## 20. Open Questions / Not Yet Decided

Track anything genuinely undecided here rather than guessing silently — future sessions should know what's still open.

-

## 21. Design Decisions Log

Append-only. Each entry: date, what was decided, why, and what (if anything) it overrides.

- [YYYY-MM-DD]: Initialized DESIGN.md for [Product Name].
