<!--
  Project Design Memory & Engineering Specification (DESIGN.md)
  See ui-design-engineer skill for how this file is meant to be used and kept current.
-->

# Project Design Memory (DESIGN.md)

## 1. Product Intent

- **What is this product, in one or two sentences?** Plinth — a landing page for a high-end quarterly print/digital architecture publication. The page introduces the current issue, showcases a photography-led gallery of featured work, and converts visitors into newsletter subscribers.
- **What is the core job the user is doing on this screen?** Browsing and reading — a one-time or occasional visit to feel the publication's editorial voice and, if persuaded, subscribe. Not an operational task.
- **What does success feel like to the user?** Like landing on the homepage of a magazine they'd actually want on their coffee table — unhurried, considered, confident enough to let whitespace and photography do the work instead of selling hard.

## 2. Users & Usage Context

- **Who is the primary user?** Architecture/design-literate readers, practicing architects, students, and design-adjacent professionals browsing on desktop or mobile, often referred from social/editorial links.
- **How often and in what context do they use this?** Infrequent, unhurried browsing sessions — not a daily tool.
- **What's the cost of a mistake or a slow interaction here?** Low functional cost, high *brand* cost — a generic SaaS-template feel or a broken image instantly undercuts the "quiet, confident, print-inspired" premise this entire page exists to sell.

## 3. Visual Personality

- **In three adjectives:** Quiet, confident, considered.
- **References:** Print-magazine layout logic (Monocle, Kinfolk, real architecture journals like El Croquis / Domus) translated to the browser — full-bleed photography, asymmetric grids, typographic hierarchy carrying weight instead of boxes/icons/color blocks. Deliberately different from generic SaaS marketing templates (no gradient hero, no centered hero+3-card+CTA shape).

## 4. Archetype / Direction

- **Active archetype(s):** Editorial Premium.
- **Why this archetype fits:** The product is selling a feeling (editorial trust, craft, restraint) before a function. Content is browsed, not operated. See `references/archetypes/editorial-premium.md`.

## 5. Color & Semantic Tokens

Near-monochrome ink/paper system with a single warm clay accent — lets photography and typography carry visual weight instead of a decorative palette. No `--card` surface is actually used anywhere (flat sections, thin rule dividers per the archetype) — it's defined only to keep the semantic token set complete/documented, and its value equals `--background` by design.

### Light mode (the only mode — see note below)
```css
:root {
  --background: oklch(0.97 0.012 85);          /* warm paper */
  --foreground: oklch(0.18 0.01 70);            /* warm near-black ink */
  --card: oklch(0.97 0.012 85);                 /* unused — flat surfaces only, kept = background */
  --card-foreground: oklch(0.18 0.01 70);
  --primary: oklch(0.18 0.01 70);               /* ink — primary buttons are ink-filled */
  --primary-foreground: oklch(0.98 0.01 85);
  --muted: oklch(0.94 0.014 80);                /* alternating section wash */
  --muted-foreground: oklch(0.46 0.012 70);     /* secondary/caption text */
  --accent: oklch(0.53 0.15 42);                /* clay / terracotta */
  --accent-foreground: oklch(0.98 0.01 85);
  --border: oklch(0.83 0.014 75);               /* hairline rule dividers */
  --ring: oklch(0.53 0.15 42);                  /* = accent, verified ≥3:1 vs paper and vs ink */
  --status-success: oklch(0.6 0.12 145);
  --status-warning: oklch(0.75 0.13 80);
  --status-error: oklch(0.55 0.18 27);
  --status-info: oklch(0.55 0.1 250);
}
```

- **Does this product need a dark mode at all, and which is the default?** No. This is a single-theme editorial site — a persistent dark mode isn't a real user need here. The newsletter section is a deliberate *section-level* inversion (`bg-primary text-primary-foreground`, i.e. ink-on-paper reversed to paper-on-ink for one full-bleed block), not a theme toggle. Documented as an intentional exception, not a missed dark mode.

## 6. Typography

- **Display font stack:** `"Fraunces", ui-serif, Georgia, "Times New Roman", serif` — a high-contrast, optical-size-variable editorial serif with real character (soft/wonk-capable, distinct swashes in italic). Used for all headlines, the pull quote, and the wordmark. Chosen specifically to avoid the "Inter for headlines" anti-pattern.
- **Body font stack:** `"Work Sans", ui-sans-serif, system-ui, sans-serif` — a clean, quiet humanist grotesque for body copy, labels, and UI text. Deliberately not Inter, to avoid font monoculture with every other AI-generated interface.
- **Code / data (monospace) font stack:** Not applicable — no code or tabular data on this page.
- **Scale ratio:** 1.333 (Perfect Fourth) — dramatic jumps appropriate to editorial headline presence. Implemented as fluid `clamp()` sizes in component code rather than a fixed Tailwind scale, since hero/section headlines need to respond continuously across viewport width, not jump at breakpoints.
- **Tabular numbers policy:** Not needed (no numeric tables/metrics).

## 7. Spacing

- **Spacing grid:** 8px, used generously — section rhythm in multiples of 24/32/48/64/96/128px rather than staying near the small end, per Editorial Premium density guidance.
- **Exceptions:** None yet.

## 8. Density

- **Layout density target:** Spacious.
  - Form control height: 52px (newsletter input/button) — generous but still a normal click/tap target.
  - Container max-width: 1440px outer bound, with a narrower ~1100px measure for text-heavy columns to keep line lengths at 60–75 characters.

## 9. Geometry

- **Global radius token (`--radius`):** `0px`. A fully sharp, architectural radius is the deliberate signature here — no `rounded-lg` defaults anywhere. The newsletter input/button carry the same `0px` (no exception).

## 10. Surfaces & Elevation

- **Elevation model:** Border rules only — thin 1px hairline dividers (`--border`) separate sections instead of cards/shadows. No drop-shadows anywhere on the page.
- **Glassmorphism policy:** Restricted to floating chrome — the sticky top nav uses a translucent backdrop-blur so it recedes over the hero photograph without a hard edge; nothing else uses blur/glass.

## 11. Iconography

- **Primary icon set:** None — no icon library dependency. The one interactive affordance that could've used a hamburger icon (mobile nav toggle) is instead two hand-drawn CSS bars that morph to an X, kept minimal on purpose per the archetype's "minimal or absent" iconography guidance.
- **Default stroke width:** N/A.
- **Label requirement:** Icon-only controls require an accessible name — the mobile menu toggle has `aria-label`/`aria-expanded`.

## 12. Navigation

- **Primary navigation model:** Thin top bar, translucent over the hero, that never fully disappears (kept persistently visible rather than hide-on-scroll, so the "Subscribe" wayfinding link stays reachable — a considered deviation from the archetype's "sometimes disappears on scroll" suggestion).
- **Narrow viewport adaptation:** Nav links collapse behind a text/bars toggle that opens a full-screen editorial-style overlay with large stacked links — a real workflow change, not just a reflow of the same horizontal bar.

## 13. Components

- **Primary component/primitive source:** None (bespoke). This is a mostly-static, single-form landing page — following `component-selection.md`'s selection hierarchy, no existing local components, no configured registry, and the one interactive surface (newsletter form) doesn't need Radix/shadcn primitives. Introducing shadcn here would mean a dependency and an unused primitive-engine surface for one text input and one button. Hand-built semantic HTML + Tailwind is the correct-weight choice (hierarchy level 7).
- **Reasoning:** See above — greenfield project, no registry configured, form is simple enough that native `<form>`/`<input>` with proper labeling covers the accessibility bar without Radix.
- **Utility/specialized registries in use:** None.

## 14. Data Visualization

- **Not applicable** — no charts or metrics on this page.

## 15. Motion

- **Motion engine:** CSS transitions, orchestrated by a small `useReveal` IntersectionObserver hook (no animation library dependency).
- **Default transition dynamic:** 480ms `cubic-bezier(0.22, 1, 0.36, 1)` ease-out, opacity + 16px upward translate on scroll-into-view — "a page turning, not an app responding," per archetype guidance. Applied once per section/image, not per individual child, to avoid unmotivated per-card animation.
- **Reduced-motion compliance:** Mandatory. `useReveal` checks `prefers-reduced-motion` and renders content fully visible with no transform/opacity animation when set; the global stylesheet also collapses all transition/animation durations under the media query as a backstop.
- **Reveal safety net:** `useReveal` also sets a 1.8s fallback timer that forces content visible even if the `IntersectionObserver` never fires. This was added after visual QA caught a real defect: below-the-fold sections rendered permanently blank in a full-page headless screenshot, because that capture method never triggers an actual scroll/intersection event. The fallback guarantees no content is ever permanently gated behind scroll-driven JS, while still preserving the intended progressive reveal for normal scrolling.

## 16. Responsive Behavior

- **Breakpoint scale:** Mobile 375px / Tablet 768px (`md:`) / Desktop 1280px (`lg:`) / Wide 1600px (`xl:` container cap), Tailwind defaults.
- **Deliberately unsupported viewports:** None — the page is designed fluidly from 375px up.

## 17. Accessibility

- **Target:** WCAG 2.2 AA.
- **Known accessibility debt:** None currently tracked as unresolved. Everything found during this build's QA loop (focus-obscured mobile-nav links, undersized tap targets, a broken mobile-nav focus trap, invisible-but-focusable overlay content, a below-the-fold reveal that could leave content permanently blank, insufficient hero/pull-quote text contrast against their photos, a skipped H1→H3 heading level) was fixed and re-verified — see `.eval/worker-report.md`'s "Skill Behavior Observed" and "Success Criteria" sections for the evidence trail. The 4 "zero-size visible interactive elements" `visual-qa.js` still reports on every run are a verified tool false positive (responsive `hidden`/`md:hidden` nav elements — genuinely `display:none`, not focusable), not real debt; see the worker report for the direct DOM verification.

## 18. Project-Specific Anti-Patterns (STRICT NEVER)

- Never introduce a purple/blue gradient anywhere on this page (hero or otherwise) — the entire brand premise is restraint over decoration.
- Never wrap a photograph or pull-quote in a bordered/shadowed card.
- Never center every section — at least the hero, the lede, and the feature pairs must stay asymmetric.
- Never use a system-font default for a headline — headlines are always `font-display` (Fraunces).

## 19. Component Sources & Exceptions

- **Primary primitives:** None (bespoke, see §13).
- **Utility registries:** None.
- **Charting engine:** N/A.
- **Documented exceptions:**
  - Nav stays visible rather than hiding on scroll (§12) — reachability over strict archetype purity.
  - `--card` token defined but unused (§5) — kept only for semantic-token-set completeness.
  - `src/components/Hero.tsx`'s scrim uses a raw 5-stop `rgba(0,0,0,…)` gradient instead of a semantic token. `audit-hardcoded-colors.js` correctly flags this — it's a deliberate, reviewed exception, not drift: it's a one-off photo-legibility treatment tuned against this specific image's actual pixel values (see §21, 2026-08-24 contrast fix entry), not a reusable brand color role, so a semantic token wouldn't add value here.

## 20. Open Questions / Not Yet Decided

- Whether a real newsletter backend (ESP integration) replaces the current client-side-only form submission — out of scope for this build; the form is fully functional up to a simulated submit (see worker-report.md).

## 21. Design Decisions Log

- 2026-08-24: Initialized DESIGN.md for Plinth. Selected Editorial Premium archetype, Fraunces/Work Sans pairing, ink/paper/clay token system, 0px radius, bespoke (no-registry) component strategy. Downloaded and curated 9 real architecture photographs (Unsplash CDN) to keep the page photography-led rather than illustration/gradient-led.
- 2026-08-24: Visual QA loop (3 rounds) surfaced and fixed real defects: (1) mobile-nav overlay links stayed focusable while visually hidden, causing WCAG 2.4.11 focus-obscured findings — fixed with `inert`/`aria-hidden` toggling; (2) several link/button tap targets were under the 24px minimum — added padding; (3) the mobile-nav overlay had a `top-16 bottom-0` height bug (computed to 0px) that made its content render overlapping the header — replaced with an explicit `h-[calc(100vh-4rem)]`; (4) mobile nav had no Escape-to-close, no background focus containment, and didn't return focus to its trigger — added all three; (5) `useReveal`'s scroll-triggered fade left below-the-fold sections permanently blank in a non-scrolling full-page capture — added an 1.8s visibility fallback; (6) pixel-sampled the hero and pull-quote photos directly and found real WCAG contrast failures (hero headline 2.55:1, hero eyebrow 1.37:1, pull-quote attribution 3.56:1, all below the required 3:1/4.5:1) — strengthened both scrims and re-verified all three now pass with margin; (7) FeatureRow headings were `h3` directly under the page's `h1` with no `h2` in between — changed to `h2`. All fixes re-verified via `visual-qa.js`, direct Playwright DOM/contrast inspection, and rebuilt screenshots — see `.eval/worker-report.md` for full evidence.
