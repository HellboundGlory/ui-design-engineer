# Archetype: Editorial Premium

## When this reasoning applies

The product is selling a feeling before it's selling a function: high-end consumer brands, publications and magazines, architecture/design/fashion portfolios, premium hospitality or real estate, agency and studio sites, thought-leadership content, luxury goods. The user is browsing or reading, not operating a tool. Trust is built through restraint, craft, and typographic confidence — the opposite of "look how much we can fit on screen."

## Design intent

The interface should feel edited, not generated. Every section earns its whitespace. Typography carries the hierarchy — not boxes, not icons, not color blocks. The overall impression should be closer to a print magazine layout translated to the browser than to a SaaS product.

## Starting values (override freely in DESIGN.md)

- **Density**: Spacious. Generous vertical rhythm between sections (96–160px), comfortable line lengths (60–75 characters for body copy).
- **Spacing scale**: 8px grid, but used generously — multiples of 24/32/48/64 rather than staying near the small end.
- **Radius**: Either near-zero (sharp, architectural) or a single deliberate signature radius used consistently — avoid a default `rounded-lg` everywhere; the radius choice should feel like an art-direction decision, not a Tailwind default.
- **Typography**: This is where the archetype lives or dies. Pair a distinctive display serif or high-contrast serif (e.g., a modern editorial serif, or a striking grotesque used at large scale) for headlines with a legible, quieter body face. Large type sizes for headlines (48–96px+), generous tracking on small caps/labels, real typographic scale (1.333 Perfect Fourth or larger) rather than a compressed UI scale. Avoid defaulting to Inter for headlines — Inter is a UI workhorse font, not an editorial display face.
- **Contrast**: Can be lower/softer than operational interfaces — off-black on off-white, muted ink tones — because reading comfort over long passages matters more than instant scannability.
- **Color**: A restrained, often near-monochrome palette (ink, paper, one accent) that lets photography and typography carry the visual weight. Resist the pull toward a decorative gradient hero — a strong photograph or a confident type composition outperforms it here.
- **Surfaces**: Flat. No cards nesting content that doesn't need a boundary. Use whitespace and rule lines (thin 1px dividers) to separate sections instead of bordered containers.
- **Iconography**: Minimal or absent. When icons appear, they should be custom or carefully selected, not generic outline-icon-library defaults — a stray Lucide icon can break an otherwise considered composition.

## Layout

Break from centered-single-column monotony. Asymmetric grids, offset image/text pairings, full-bleed imagery interrupting a contained text column, and varied section rhythm (not every section is a 3-up icon grid) are what separate this from a generic marketing template. Look at the content and let its own logic suggest the layout instead of reaching for a default hero+features+footer template.

## Motion

Subtle and confident: fades and gentle upward reveals on scroll, slow deliberate easing (300–500ms), no bounce, no spring. Motion should feel like a page turning, not an app responding.

## Navigation tendencies

Simple, often a thin top bar that recedes, sometimes disappearing on scroll to let content breathe. Mega-menus only if the content catalog genuinely requires it — otherwise keep navigation minimal and let content be the product.

## Common mistakes agents make with this archetype

- Defaulting to a generic "hero + 3 feature cards + testimonials + CTA" SaaS template structure regardless of content.
- Using a system/UI font for headlines instead of committing to a real display face.
- Centering every section instead of using asymmetry and full-bleed breaks.
- Adding a purple/blue gradient hero background "to look modern," which clashes badly with editorial restraint.
- Wrapping every image or pull-quote in a card with a shadow.

## When NOT to use this archetype

Skip it for high-frequency operational tools, data-dense admin panels, or anything the user will use dozens of times a day for a task — the generous pacing that reads as "premium" for a one-time browse becomes friction for a repeated workflow.
