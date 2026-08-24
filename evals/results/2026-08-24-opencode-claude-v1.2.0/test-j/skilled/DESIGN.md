# Project Design Memory (DESIGN.md)

## 1. Product Intent

This repository is a **design-direction comparison build**: one component — a User Profile Card — implemented twice as independent, fully-resolved designs so the two directions can be viewed and compared directly.

- **Direction A — "Relay"**: a profile card inside *Relay*, a fictional infrastructure access-control console used by platform and IT operations teams to review human and service identities.
- **Direction B — "Tend"**: a member profile card inside *Tend*, a fictional neighborhood plant-swap community app where members browse each other before arranging swaps.

- **Core job on screen:** A — verify an identity and what it can access, fast, without leaving the card. B — decide "is this person someone I'd swap plants with?", then start a conversation.
- **Success feels like:** A — "I confirmed scope, MFA status, and last activity in five seconds." B — "This person seems warm and trustworthy; I'll say hello."

## 2. Users & Usage Context

- **Relay:** platform/IT operators, expert fluency, many sessions daily, often during audits or incidents at all hours. Mistake cost is high (wrong access grant). Density and scan-ability outrank charm.
- **Tend:** general consumers, occasional use, overwhelmingly mobile. Mistake cost ≈ zero. Emotional resonance and trust-through-warmth drive engagement.

## 3. Visual Personality

- **Relay:** precise, quiet, accountable. Feels similar to Linear/Graphite-grade ops tooling; deliberately different from marketing-site softness.
- **Tend:** warm, tactile, neighborly. Feels like a well-loved community noticeboard, not a growth-startup template; deliberately avoids generic violet-gradient consumer styling.

## 4. Archetype / Direction

- **Active archetype(s):** Relay = **Precision Technical**; Tend = **Playful Consumer**. No blend — each direction commits fully to its archetype because divergence-with-coherence is the product goal of this repo.
- **Why it fits:** Relay serves technical operators under time pressure (precision-technical's exact audience). Tend is a low-stakes consumer social experience where personality is the value proposition.

## 5. Color & Semantic Tokens

Both directions use the same semantic token *names* with entirely different values, scoped by theme class (`.theme-relay`, `.theme-tend`) so components consume roles, never raw colors. New system → OKLCH per default.

### Direction A — Relay (dark-default instrument panel)

```css
.theme-relay {
  --background: oklch(0.17 0.018 235);
  --foreground: oklch(0.93 0.006 230);
  --card: oklch(0.205 0.02 235);
  --card-foreground: oklch(0.93 0.006 230);
  --primary: oklch(0.82 0.11 200);
  --primary-foreground: oklch(0.18 0.03 220);
  --muted: oklch(0.25 0.02 235);
  --muted-foreground: oklch(0.68 0.015 232);
  --accent: oklch(0.82 0.11 200);
  --accent-foreground: oklch(0.18 0.03 220);
  --border: oklch(0.32 0.02 233);
  --ring: oklch(0.82 0.11 200);
  --status-success: oklch(0.75 0.14 155);
  --status-warning: oklch(0.8 0.14 85);
  --status-error: oklch(0.68 0.19 25);
  --status-info: oklch(0.72 0.1 240);
}
```

Dark-first is a genuine Project Decision here (ops consoles are used during all-hours incident response; the precision-technical archetype names this audience explicitly) — not a reflexive "dark SaaS" default.

### Direction B — Tend (light-only warm canvas)

```css
.theme-tend {
  --background: oklch(0.97 0.025 95);
  --foreground: oklch(0.3 0.05 60);
  --card: oklch(0.99 0.012 95);
  --card-foreground: oklch(0.3 0.05 60);
  --primary: oklch(0.52 0.17 35);
  --primary-foreground: oklch(0.98 0.01 80);
  --muted: oklch(0.93 0.04 90);
  --muted-foreground: oklch(0.47 0.045 65);
  --accent: oklch(0.55 0.13 150);
  --accent-foreground: oklch(0.98 0.02 120);
  --highlight: oklch(0.9 0.09 95);
  --highlight-foreground: oklch(0.35 0.06 70);
  --border: oklch(0.88 0.05 85);
  --ring: oklch(0.42 0.15 38);
  --status-success: oklch(0.55 0.13 150);
  --status-warning: oklch(0.68 0.14 75);
  --status-error: oklch(0.52 0.19 27);
  --status-info: oklch(0.55 0.1 245);
}
```

`--highlight` (butter yellow) is an extension of the core set specific to Tend's color-blocked surfaces; it has no Relay counterpart by design. Tend additionally defines `--accent-strong` (a darkened leaf-green for small text on green tints, where the base accent fails 4.5:1) and four component-local illustration tokens (`--portrait-skin`, `--portrait-skin-deep`, `--portrait-hair`, `--portrait-leaf`) used only inside `MayaPortrait.tsx`; these keep the card's palette inside the token layer rather than as raw hex fills.

- **Dark mode:** Relay ships dark-only for now. Tend ships light-only. Neither has a counterpart mode yet (see §20).

## 6. Typography

| | Relay | Tend |
|---|---|---|
| Display/UI font | IBM Plex Sans (400/500/600) | Baloo 2 (500–700) for display & numbers |
| Data font | JetBrains Mono (400/500) — IDs, timestamps, scopes, emails | Nunito (400–800) for body/UI |
| Scale ratio | 1.2 Minor Third (dense work) | 1.25 Major Third |
| Tabular figures | Mandatory wherever numbers render (`tabular-nums`; mono already fixed-width) | Not needed |

Micro-labels: Relay uses uppercase 10px letterspaced labels as a structural device; Tend does not rely on all-caps micro-labels at all.

## 7. Spacing

- **Relay:** 4px grid. Card padding 12px, section gaps 8–12px, row heights ~28–32px.
- **Tend:** 8px grid. Card padding 24px, section gaps 16–24px.
- Exceptions: Relay identicon nudges −1px vertically for optical centering inside its 36px frame (legitimate optical correction).

## 8. Density

| | Relay (Compact) | Tend (Spacious) |
|---|---|---|
| Row height | 28–32px | n/a (no table rows) |
| Control height | 28px desktop / 36px touch viewports | 44–48px always |
| Card padding | 12px | 24px |
| Container max-width | card 420px in comparison pane | card 380px in comparison pane |

## 9. Geometry

- **Relay `--radius`:** 3px base; sm 2px (badges), md 3px (inputs/buttons), lg 4px (card). Rounded corners exist to soften edges, not to signal friendliness.
- **Tend `--radius`:** 24px cards, 999px pills (buttons/chips/pronoun badge), full-round avatar. Radius is expressive but element-consistent: three values only, each tied to an element role.
- Avatars: Relay = square identicon frame (radius-sm); Tend = circular illustrated portrait. The contrast is deliberate.

## 10. Surfaces & Elevation

- **Relay:** border-based separation only. Zero drop shadows on static surfaces; elevation reserved for future floating chrome (menus/popovers).
- **Tend:** soft warm shadow + hairline border on the card; gentle shadow lift on primary button hover. Glassmorphism: forbidden in both directions.

## 11. Iconography

- **Primary icon set:** Lucide React — one icon engine across both themes (deliberate exception, see §19).
- **Stroke width:** Relay 1.75 @ 14px; Tend 2.5 @ 16–18px (heavier stroke reads friendlier; personality expressed through weight, not a second icon family).
- Label requirement: icon-only controls carry `aria-label` (invariant).

## 12. Navigation

Comparison shell only: a neutral segmented control (`<a>` links with `aria-current="page"`, hash routes `#/technical`, `#/playful`, `#/compare`). It stays quiet so the two cards speak. At mobile widths the control remains visible and wraps — no hamburger anywhere.

## 13. Components

- **Primary source:** bespoke hand-built components (semantic HTML + Tailwind utilities + scoped CSS component classes). No shadcn/Radix/registry pull.
- **Reasoning:** greenfield with zero existing primitive engine; the two cards need buttons, badges, definition lists and links — primitives too trivial to justify importing a registry. Level-7 bespoke beats level-5 registry here; recorded as an exception to the greenfield-shadcn default in §19.
- **Registries in use:** none.

## 14. Data Visualization

Not applicable — neither card contains charts. Relay's "activity" data renders as text telemetry (tabular figures), which is the honest treatment at this data volume.

## 15. Motion

- **Engine:** CSS transitions only (no motion library — nothing present needs spring physics from JS).
- **Relay:** 100ms ease-out state changes (hover/border/copy feedback). Nothing decorative. Reduced-motion: transitions collapse to instant.
- **Tend:** 180–220ms cubic-bezier(0.34, 1.56, 0.64, 1) (soft overshoot) on interactive elements — hover lift on CTA, press squash, chip nudge. One delight moment maximum per interaction. Reduced-motion: transforms removed globally via media query, opacity-only fallbacks.
- Reduced-motion compliance is mandatory (invariant), implemented once globally in `globals.css`.

## 16. Responsive Behavior

- Reference viewports: 375 / 768 / 1440 / 1920.
- Comparison layout: side-by-side ≥1024px, stacked below.
- Relay is a desktop-first ops tool by audience, but the demo still adapts honestly at 375px: key/value grid stays two-column (it fits), scope rows wrap, footer actions go full-width, control heights rise to 36px.
- Tend is mobile-native proportions; its pane centers and constrains the card at desktop rather than stretching it.
- Page-level horizontal overflow at any viewport is a hard failure.

## 17. Accessibility

- Target: WCAG 2.2 AA. Verified via visual-qa.js bundled axe-core run + manual checklist pass (`checklists/accessibility-audit.md`) — axe covers a rule subset, not proof of conformance.
- Commitments beyond baseline: focus-visible rings in every theme clear 3:1 against adjacent colors; all text/background pairs verified against axe color-contrast results; decorative SVGs `aria-hidden`, meaningful portraits get descriptive alt text.

## 18. Project-Specific Anti-Patterns (STRICT NEVER)

- Never let the two themes share visual DNA to make maintenance easier — divergence is this repo's product.
- Never introduce a second icon engine next to lucide-react.
- Never ship raw hex/rgb in component source; every color flows through semantic tokens.
- Never add motion that isn't a state acknowledgment, spatial cue, causality link, attention direction, or earned delight moment.

## 19. Component Sources & Exceptions

- **Primary primitives:** bespoke (see §13).
- **Utility registries:** none. **Charting engine:** none.
- **Documented exceptions:**
  1. *Two cohabiting theme systems in one app.* Normally a drift red flag; here it IS the product — a deliberate, labeled A/B design comparison. Enforced separation: each card renders only inside its own `.theme-*` scope; the shell stays neutral.
  2. *No shadcn/Radix despite greenfield React/Tailwind.* Selection-hierarchy deviation: needed primitives (button, badge, dl) are trivial; a registry import would add an unneeded dependency and someone else's aesthetic. Bespoke chosen deliberately (§13).
  3. *Single icon engine across two divergent themes.* Lucide everywhere; archetype personality carried by stroke weight (1.75 vs 2.5) instead of a second icon family, avoiding a duplicate-dependency conflict.
  4. *Dark-only Relay / light-only Tend.* Each direction commits to the mode its archetype justifies; cross-mode theming is out of scope for this comparison (tracked §20).

## 20. Open Questions / Not Yet Decided

- Light mode for Relay and dark mode for Tend (would prove token architecture scales both ways).
- Real backend wiring for stub affordances (audit-log/manage-access navigation, message action).
- Whether the comparison shell should grow into a permanent design-review page or be replaced by routing into real products.

## 21. Design Decisions Log

- [2026-08-24]: Initialized DESIGN.md for the profile-card direction-comparison build.
- [2026-08-24]: Committed to full-commitment dual-archetype strategy (Precision Technical vs Playful Consumer) over a blended middle — divergence with internal coherence is the explicit product goal.
- [2026-08-24]: Chose OKLCH scoped-token architecture: identical token names, divergent values per `.theme-relay`/`.theme-tend`; components reference roles only.
- [2026-08-24]: Typography pairings locked: IBM Plex Sans + JetBrains Mono (Relay), Baloo 2 + Nunito (Tend), self-hosted via Fontsource.
- [2026-08-24]: Bespoke component strategy over registry imports (exception logged §19.2); lucide-react as sole icon engine (§19.3).
- [2026-08-24]: Visual QA round 1 surfaced two defects, both fixed: (1) Tend hero arch escaped the card causing 22px page overflow at 375px → card set to `overflow: hidden` (arch was always meant to sit flush inside the rounded card); (2) axe color-contrast violation on `.tend-since` → introduced `--accent-strong` (§5) for small green text on green tints.
- [2026-08-24]: Visual QA round 2 (screenshot inspection) surfaced a third defect: Relay `JOINED` date broke mid-value at 375px → `whitespace-nowrap` policy for atomic mono values (IDs, timestamps, dates); free-text values (team, location) may still wrap.
- [2026-08-24]: Interaction verification (Playwright, `.eval/interaction-check.mjs`): focus rings visible in both themes (2px `--ring` outline), Enter/Space activation works, CTA hover lift = −2px, copy feedback flips aria-label for 1.6s with `aria-live` announcement, `prefers-reduced-motion: reduce` collapses all transitions to ~0s in both themes, tab order follows reading order (nav → relay actions → tend actions).
- [2026-08-24]: Final state: 3 routes × 4 viewports render with zero overflow, zero axe violations, zero page errors; `tsc -b && vite build` clean; token/dependency/color audits clean.
