# Anti-Pattern Catalog ("AI Slop")

These are the recognizable clichés that immediately mark an interface as AI-generated rather than designed. Each entry explains *why* an LLM tends to produce it (usually: it's the statistical center of training data — the default from a thousand basic tutorials and unstyled template scaffolds) so the reasoning generalizes past this exact list, plus legitimate exceptions where the pattern is actually the right call. These are prevention directives, not absolute bans — the goal is avoiding *generic* AI design, not replacing it with a different set of rigid rules that becomes its own recognizable "ui-design-engineer" aesthetic. When a genuine, considered reason exists to use one of these patterns, use it and note the reasoning in DESIGN.md's exceptions section.

## Color

**Purple/blue gradient monoculture.** `bg-gradient-to-r from-purple-600 to-blue-500` (or close variants) on hero text, buttons, borders, and backgrounds. Root cause: this exact gradient dominates generic SaaS marketing templates in training data, so it's the default output absent a specific brand direction. Prevention: pick a palette that says something specific about *this* product (see the relevant archetype file) — solid neutral fills with one considered accent color, or a genuinely brand-specific gradient chosen for a reason, not lifted wholesale. Legitimate exception: Web3/crypto and creative-showcase landing pages where this palette has become a recognized genre convention, if that's actually the intended audience signal.

**Default dark SaaS aesthetic.** Near-black background (`#09090b`-ish), single accent color, glowing borders — applied by default without the product's audience or brand actually calling for it. Root cause: this look dominates recent component registry examples and demo sites. Prevention: choose light/dark as a genuine Project Decision informed by the archetype and audience (see `archetypes/`), not a reflex. Legitimate exception: developer tools and technical products where a dark-first default is a real, common user preference.

**Font monoculture.** Every text element — headline, body, label, button — set in the same default system font (usually Inter or `system-ui`) with no pairing or hierarchy. Root cause: Tailwind/shadcn scaffolds ship this as a placeholder default, and it's rarely revisited. Prevention: choose a deliberate display/body pairing appropriate to the archetype (see `design-system-tokens.md` typography section). Legitimate exception: native OS-utility-style tools where the product explicitly wants to blend into the platform's own typography.

## Structure and layout

**Card fatigue / container overuse.** Every piece of text, every metric, every button wrapped in its own bordered, shadowed, rounded card — "cards inside cards inside cards." Root cause: cards are an easy, low-risk way to establish visual separation without reasoning about spatial hierarchy, whitespace, or typography weight. Prevention: reserve cards for genuinely distinct entities; use whitespace, typographic hierarchy, and thin rule-dividers for internal grouping instead (see `dashboard-architecture.md`). Legitimate exception: a dense grid of genuinely independent, individually-selectable items (a media library, a product catalog).

**Generic three-column KPI dashboard.** Row of near-identical metric cards, followed by two chart cards, followed by a table card, regardless of what the data actually needs. Root cause: this is the most common dashboard shape in tutorials and starter templates. Prevention: derive layout from the actual monitoring/analysis task — see `dashboard-architecture.md`. Legitimate exception: none really — if this shape is genuinely correct for the data, it should be arrived at through that reasoning, not defaulted into.

**Excessive pills.** Rounded-full badges/chips applied to everything — nav items, filters, tags, status indicators, buttons — until pill shape stops meaning anything. Root cause: pills read as "modern" in isolation, so they get over-applied. Prevention: reserve full-round pills for a specific role (tags/filters, or a chosen button style per DESIGN.md) and keep it consistent; don't let every rounded element converge on the same shape regardless of function.

**Unconstrained/inconsistent radii.** Every component picks its own `rounded-*` value with no shared system — a card at `rounded-lg`, a button at `rounded-xl`, a modal at `rounded-2xl`, an input at `rounded-md`. Root cause: components are generated independently without referencing a shared radius token. Prevention: a single `--radius` token, derived values for related sizes, applied everywhere (see `design-system-tokens.md`). Legitimate exception: a deliberately mixed-radius system as an actual design choice, recorded in DESIGN.md, not an accident.

**Random floating navigation.** A pill-shaped nav bar floating with margin on all sides for no functional reason, disconnected from any edge of the viewport. Root cause: this specific pattern is heavily represented in template marketplaces. Prevention: default to edge-anchored navigation (top bar flush to viewport top, sidebar flush to left) unless there's a specific reason (an archetype calling for it, a deliberate "floating chrome" identity) to detach it.

**Overuse of centered layouts.** Every section — hero, features, testimonials, footer CTA — centered with the same max-width container, producing a monotonous vertical stack with no visual rhythm. Root cause: centering is the "safe" default with no layout reasoning behind it. Prevention: especially in Editorial Premium contexts, use asymmetry, offset image/text pairing, and full-bleed breaks (see `editorial-premium.md`).

**Repetitive icon+heading+paragraph sections.** A 3-up or 4-up grid of `[icon] [bold heading] [one paragraph]` repeated for every "features" section on a landing page. Root cause: this is the single most common marketing-site scaffold in template libraries. Prevention: vary the content presentation across sections — a stat, a screenshot, a quote, a comparison — rather than repeating the same block shape for every idea.

## Data and content

**Fake charts and decorative sparklines.** Static SVG paths that look like a chart but aren't connected to any dataset, or a sparkline with no way to see the numbers behind it. Root cause: placeholder visual generation without wiring an actual charting engine or data source. Prevention: never render a chart without real (even if mocked-for-dev) dynamic data behind it — see `data-visualization.md`. Legitimate exception: an explicitly abstract decorative background graphic in a marketing context, clearly not presented as a data visualization.

**Meaningless analytics.** Metrics and charts included because a dashboard "should have some," not because they answer a real question the user has. Root cause: filling perceived layout gaps rather than deriving content from the task model. Prevention: every metric on screen should trace back to a real user question — see `dashboard-architecture.md`'s "start from the task" section.

**Generic stock illustrations.** Interchangeable flat-style illustrations (people at laptops, abstract blob shapes) that could belong to any product. Root cause: cheap, genre-generic placeholder assets are heavily represented in template sources. Prevention: prefer real product screenshots, considered photography, or a custom/specific illustration approach tied to the actual brand — or simply no illustration, letting typography and layout carry the section instead.

## Interaction and motion

**Unmotivated animations.** Entrance animations on every card, hover-lift on non-interactive elements, scroll-triggered reveals applied uniformly regardless of context. Root cause: motion libraries make animation trivial to add everywhere, and it "looks polished" in isolation without regard to cumulative effect. Prevention: every animation should communicate something specific — see `motion-microinteractions.md`.

**Non-functional hover/active states.** Buttons and controls that visually look interactive but have no real hover, active, disabled, or loading state implemented — or worse, states that exist in the design but aren't wired to actual component logic. Prevention: implement every interaction state a control visually implies, and verify in the rendered output, not just in the code.

## Spacing and density

**Low density / excessive padding.** 64px of padding around a single 12px metric label inside a dashboard widget; consumer-app-scale whitespace applied to an operational tool. Root cause: defaulting to generous mobile-first responsive padding scales even on dense desktop SaaS layouts. Prevention: match density to context — see the relevant archetype file and `dashboard-architecture.md`. Legitimate exception: Editorial Premium and other browsing-not-operating contexts where generous whitespace is the correct choice.

## Systemic

**Visual drift from an existing system.** New pages/features/components that don't match the color, radius, spacing, or component conventions already established elsewhere in the same product. Root cause: implementing a new feature in isolation without first inspecting and normalizing against what already exists. Prevention: always run `scripts/inspect-project.js`, read the project's DESIGN.md, and run the component normalization pipeline (`component-selection.md`) before writing new UI. This is arguably the single highest-value anti-pattern to prevent, since it's the failure mode most visible to real users of an evolving product — see Test H in `evals/`.

## The meta-rule

None of the above is an absolute ban. Every entry has a legitimate context where it's the right choice. The actual failure mode being prevented is *unconsidered default-reaching* — using a pattern because it's the statistical center of training data rather than because it's the right answer for this specific product, this specific archetype, and this specific user. When in doubt, the test is: "did I choose this, or did I just not choose anything?"
