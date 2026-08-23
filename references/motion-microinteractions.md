# Motion & Micro-interactions

Motion should communicate something — state changed, an action succeeded, focus moved — or it shouldn't exist. Unmotivated animation is a well-documented AI-slop tell (see `anti-patterns-catalog.md`): an entrance animation on every card, a hover-lift on every element, a fade-in on every section, applied uniformly regardless of whether it serves the moment.

## Ask what the motion is communicating

Before adding any transition, name what it's telling the user:

- **State change acknowledgment** — a button shows a pressed state, a toggle flips, a value updates. Should be fast (100–150ms) and simple.
- **Spatial relationship** — a panel slides in from where it will live, a dropdown grows from its trigger. Helps the user maintain a mental model of where things are.
- **Causality** — an action produces a visible, connected result (adding an item animates it into a list rather than having it silently appear, so the user's eye finds it).
- **Attention direction** — a genuinely important state (an error, a completed milestone) draws the eye briefly.
- **Delight** — a satisfying flourish on a meaningful completion (see `playful-consumer.md`). This is the *only* category where motion for its own sake is appropriate, and even here it should be reserved for moments that matter (a streak, a purchase, a milestone), not applied uniformly to routine actions.

If a proposed animation doesn't fit one of these, it's decoration, not communication — leave it out.

## Timing and easing (Default, tune per archetype)

- **Micro state changes** (hover, press, focus, toggle): 100–150ms, `ease-out`.
- **Layout transitions** (panel open/close, accordion expand, modal enter/exit): 150–250ms, `ease-out` on enter / `ease-in` on exit reads more natural than a single symmetric curve.
- **Page-level or section reveals** (scroll-triggered content in editorial contexts): 300–500ms, slower and more deliberate.
- **Spring physics** (Motion/Framer Motion springs): reserve for Playful Consumer contexts and for genuinely physical-feeling interactions (drag, swipe, elastic overscroll) — using springs for routine SaaS chrome (a dropdown, a tooltip) tends to read as slightly off rather than delightful.

These are starting points, not fixed values — an archetype file's "Motion" section should take precedence for a given project, and DESIGN.md should record the project's actual chosen values once decided.

## `prefers-reduced-motion` (Invariant)

Every non-essential animation — parallax, auto-playing motion, spatial slide/scale entrances, spring bounce, scroll-triggered reveals — must be removed or substantially reduced when the user has `prefers-reduced-motion: reduce` set. This is not optional and not archetype-dependent: it's a vestibular-disorder accessibility requirement, not a style preference.

The correct pattern is usually to keep the *state change* (the element still appears/disappears/updates) while removing the *motion* that got it there — swap a spatial slide-and-scale entrance for an instant appearance or a simple opacity crossfade, rather than disabling the interaction's outcome entirely. In CSS:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Framework-level motion libraries (Motion/Framer Motion) typically expose a hook (`useReducedMotion`) — use it to branch to simpler transitions rather than relying on the CSS override alone, since JS-driven transform animations aren't always caught by the CSS media query.

## Loading and transitional states

- Prefer skeleton states that mirror the actual layout about to load over a generic spinner, when the load is for structured content (a table, a card list) — it reduces perceived layout shift and gives the user a preview of what's coming.
- A spinner is appropriate for short, structure-agnostic waits (a button submitting).
- Never leave an indefinite loading state with no feedback beyond ~1 second — even a subtle pulsing skeleton beats silence.

## Common motion mistakes agents make

- Adding a fade/slide entrance animation to every card in a list, which becomes a distracting cascade on any list with more than a handful of items, and gets *worse* the longer the list grows.
- Applying hover-lift/shadow-grow to elements that aren't actually clickable, implying interactivity that isn't there.
- Using scroll-triggered reveal animations on dense/operational interfaces where the user needs to scan quickly, not watch content assemble.
- Forgetting to gate spatial motion behind `prefers-reduced-motion`, or gating it in CSS only while missing JS-driven animations from a motion library.
- Inconsistent timing/easing across the app (one component uses 200ms ease-out, another uses 400ms spring) — motion should feel like it came from one system, same as color and spacing.
