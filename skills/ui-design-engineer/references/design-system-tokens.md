# Design System Tokens

How to translate a DESIGN.md's slots into an actual token system, and why each choice matters. This file is about *mechanics* — the archetype files are about *intent*. Read an archetype first to decide what the tokens should express; use this file to implement them correctly.

## Why semantic tokens, not raw values (Default)

Hardcoded utilities (`bg-blue-600`, `#1e293b`, `text-gray-500`) bake a single light-mode decision into every call site. When the product needs a dark mode, a rebrand, or a themeable variant, every call site has to be found and edited by hand — and inevitably some are missed, which is exactly how visual drift enters a codebase over time.

Semantic tokens (`bg-primary`, `text-muted-foreground`, `border-border`) separate the *role* a color plays from its *value*. The component says what role it needs; the token layer says what that role currently means. This is a Default, not an Invariant — a genuinely one-off, never-themed static site has less need for it — but it should be the strong starting assumption for any product interface, and it's a hard requirement whenever a project already has a token system (never bypass an existing one with raw values).

## Why OKLCH for new color systems (Default)

OKLCH (`oklch(L C H)`) encodes lightness, chroma, and hue as perceptually uniform values. This matters concretely:

- Generating a consistent dark-mode counterpart to a light-mode palette is a matter of adjusting L (lightness) while holding hue and chroma roughly constant — the two modes stay perceptually related instead of being two disconnected palettes.
- Interpolating or generating a tint/shade ramp (e.g., primary-100 through primary-900) produces visually even steps, unlike HSL or RGB ramps which often produce a muddy middle or an uneven jump in perceived brightness.
- Ensuring adequate contrast is more predictable — L roughly tracks perceived lightness, so you can reason about contrast between two tokens by comparing their L values before even rendering.

This is a Default, not an Invariant: if a project already has an established HSL- or hex-based token system, extend that system rather than migrating it to OKLCH mid-project — consistency with the existing codebase outranks the "better" color space in isolation.

## Core semantic token set

At minimum, a project's token system should define:

```
--background          canvas / page background
--foreground           primary text on background
--card                 structural surface (raised/grouped content)
--card-foreground      text on card surface
--primary              primary action color
--primary-foreground   text/icons on primary
--muted                subdued background (secondary surfaces, disabled states)
--muted-foreground     subdued text (captions, placeholders, secondary labels)
--accent               highlight/secondary emphasis color
--border               default border/divider color
--status-success       positive state
--status-warning       caution state
--status-error         destructive/error state
--status-info          neutral informational state (optional but common)
```

Extend this set as the product needs it (e.g., a `--ring` focus color, per-chart-series colors — see `data-visualization.md`), but avoid inventing a parallel token for something the core set already covers. If a component needs "a slightly darker card," that's very often `--muted`, not a new `--card-alt` token.

## Typography scale (Heuristic — tune per archetype)

Pick one modular scale ratio and apply it consistently rather than choosing font sizes ad hoc per component:

- **1.2 (Minor Third)** — tight, best for dense/technical archetypes where too much size variation costs vertical space.
- **1.25 (Major Third)** — a balanced general-purpose default.
- **1.333 (Perfect Fourth)** — more dramatic jumps, suits editorial/expressive archetypes where headline presence matters.

Whichever ratio is chosen, define it once (as CSS custom properties, a Tailwind `fontSize` theme extension, or a shared constants file) and reference it everywhere — don't let individual components pick their own font sizes.

**Tabular numbers** (`font-variant-numeric: tabular-nums`, or a monospace/tabular font family) are a near-Invariant for any numeric column that updates live or sits in a table: without fixed digit widths, updating numbers visibly jitter and columns of numbers don't align, which reads as broken even when the logic is correct.

## Spacing scale (Default)

Base spacing on a single grid unit — 4px for dense/technical work, 8px for most other contexts — and derive all spacing values as multiples of it (4, 8, 12, 16, 24, 32, 48, 64...). Arbitrary one-off spacing values (`pt-[13px]`, `margin: 17px`) are a strong signal something drifted from the system; they should be rare enough to be noticeable when they happen; the exception is genuine optical-alignment correction (nudging an icon 1px to visually center it), which is a legitimate, narrow use of arbitrary values.

## Radius (Project Decision, informed by archetype)

Pick a single `--radius` token and derive related values from it (e.g., `--radius-sm: calc(var(--radius) - 4px)`) rather than letting each component choose its own `rounded-*` class. This is the single highest-leverage token for making an interface feel like *one* coherent system rather than a component library grab-bag — see `anti-patterns-catalog.md` on unconstrained/inconsistent radii.

## Validating tokens

`scripts/validate-design-tokens.js` parses a project's DESIGN.md token section and checks that the corresponding CSS custom properties actually exist in the project's stylesheet (and vice versa — flagging stylesheet tokens that DESIGN.md doesn't document). `scripts/audit-hardcoded-colors.js` scans source files for raw hex colors and arbitrary Tailwind color utilities that bypass the token layer. Run both after establishing or modifying the token system, not just once at project setup — token drift accumulates silently over many small edits.

## Framework adapters

`templates/adapters/react-tailwind/globals.css` is the reference implementation of this token schema for Tailwind CSS v4's `@theme` syntax. Adapting to another stack (Vue/Nuxt with unstyled CSS variables, Svelte, vanilla CSS) means keeping the same semantic token *names and roles* and translating only the syntax that declares them — the token system itself is framework-agnostic by design.
