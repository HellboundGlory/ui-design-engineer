# Visual QA Critique Checklist

Use this after rendering the interface (via `scripts/visual-qa.js`, a browser automation MCP, or manually if neither is available — see SKILL.md's capability fallback chain). Work through it at each viewport that matters for this product; don't skip narrower viewports just because the desktop view looks right.

**Never claim these checks ran against a real screenshot if none was captured.** If no rendering capability was available, say so explicitly and work through this checklist as a static code review instead — the questions still apply, but the answer confidence is lower and should be reported as such.

## Reference viewports

375×812 (mobile) · 768×1024 (tablet) · 1440×900 (desktop) · 1920×1080 (ultrawide) — adapt to the project's actual breakpoint strategy if it differs (see `references/responsive-ux-patterns.md`).

## 1. Hierarchy & focal point

- Is there one clear thing the eye lands on first, matching what's actually most important on this screen?
- Does secondary content read as clearly secondary (size, weight, color, position) rather than competing with the primary focal point?
- Scan the screenshot for 3 seconds, then look away — can you say what the page is for and what the primary action is?

## 2. Spatial grid & alignment

- Do elements align to a consistent grid, or are there stray few-pixel misalignments between nominally-related elements (e.g., a card's padding not matching its neighbor's)?
- Is spacing between elements consistent with the project's spacing scale — no arbitrary one-off gaps?
- Are related elements grouped with tighter spacing than unrelated elements (proximity communicating relationship)?

## 3. Density & containment

- Does information density match the archetype and context (see the relevant `references/archetypes/` file) — not too sparse for an operational tool, not too dense for a browsing/reading context?
- Is content contained within a sensible max-width at wide viewports, or does it stretch uncomfortably across 1920px+?
- At narrow viewports, is anything cramped to the point of being hard to read or tap accurately?

## 4. Contrast & legibility

- Does body text look comfortably readable against its background, not just technically passing?
- Do interactive elements (buttons, links, inputs) look distinguishable from static content at a glance?
- Are status/semantic colors (success, warning, error) each recognizably different from one another, not just recognizable in isolation?

## 5. Non-slop / visual identity check

Cross-reference `references/anti-patterns-catalog.md` directly against the screenshot:
- Any purple/blue gradient monoculture that wasn't a deliberate choice?
- Card fatigue — is every piece of content boxed regardless of whether it's a distinct entity?
- Unconstrained/inconsistent border radii across components?
- A generic three-column KPI dashboard shape where the actual data didn't call for it?
- Any fake/decorative chart or sparkline with no real data path?
- Does the typography look like a deliberate pairing, or a single default font used everywhere?

## 6. Responsive adaptation (per `responsive-ux-patterns.md`)

- Zero horizontal scroll at the page level on mobile?
- Did navigation genuinely adapt (not just shrink) at narrow viewports?
- Do tables/dense data have a real narrow-viewport strategy (stacked cards, contained scroll, column picker) rather than just squeezing?
- Do touch targets look adequately sized at mobile/tablet viewports (see §7)?

## 7. Interaction affordance

- Do interactive elements have visible hover/focus/active/disabled states, and were they actually exercised during review (not just assumed from the code)?
- Do icon-only controls have a way to know what they do (label, tooltip) without guessing?
- Are loading and empty states designed, not left as a blank flash or a raw "undefined"?

## Composite judgment

After working through 1-7, state a plain critique: what's the single biggest weakness in this screen right now, and is it worth another refinement pass or within the acceptable range for this stage of the work? Don't let a passing checklist substitute for an honest "this still doesn't look right because X" if that's true — the checklist supports critique, it doesn't replace it.
