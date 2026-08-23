# Archetype: Playful Consumer

## When this reasoning applies

The product is a consumer app competing for attention and affection, not just function: social apps, gaming and gamified experiences, fitness/wellness apps, creator tools, youth-oriented products, hobbyist/community apps, mobile-first onboarding flows. The user chose this app among many alternatives and can leave in one tap — delight and personality are part of the value proposition, not decoration on top of it.

## Design intent

The interface should feel alive and a little bit fun without becoming cluttered or juvenile. Personality comes through color, shape language, and motion — a product should feel like it has a specific character (like a mascot or brand voice would), not "cheerful in the same way every AI-generated consumer app is cheerful." This is the archetype most at risk of collapsing into "AI slop" if approached lazily — see the anti-patterns catalog before starting.

## Starting values (override freely in DESIGN.md)

- **Density**: Comfortable to spacious. Touch targets generous (44px+ minimum), padding generous (16–24px), single clear focal action per screen rather than dense information.
- **Spacing scale**: 8px grid.
- **Radius**: Larger and more expressive (12–24px on cards, full pill on buttons/tags) — but choose radii deliberately per element type and stay consistent; don't let every element get its own random radius.
- **Typography**: A friendly, characterful sans with real personality (Poppins-adjacent rounded sans, Outfit, or a distinctive geometric sans) rather than a neutral UI workhorse. Larger type overall, generous line-height, less reliance on all-caps micro-labels than the technical archetypes.
- **Contrast**: Can be playful with contrast — bold color blocks — but text-on-color combinations must still clear WCAG 4.5:1; verify actual saturated brand colors against their pairings rather than assuming a bright palette is automatically accessible.
- **Color**: This is the one archetype where a genuinely bold, saturated, brand-driven palette is appropriate — but "bold and specific" is not the same as "the same purple-to-blue gradient every AI generator defaults to." Pick a palette that says something about *this* product's character: warm citrus tones for an energetic fitness app, a specific duotone for a creative tool, a distinct saturated primary + one complementary accent for a social app. Avoid defaulting to violet/indigo gradients purely because they read as "AI app" at this point.
- **Surfaces**: Soft shadows and colored surfaces are welcome here (this is one of the few archetypes where a gentle elevation shadow reads as friendly rather than "generic SaaS card"). Illustration and color-blocked sections are appropriate.
- **Iconography**: Rounded, friendly icon sets (Phosphor's rounded weight, custom icon sets, or a duotone treatment) rather than thin technical outlines. Icons can carry more personality/weight here than in operational archetypes.

## Motion

This is the archetype where motion earns its keep: spring-based transitions (Motion/Framer Motion spring physics, not linear easing), satisfying micro-interactions on completion states (a like button, a streak counter, a success checkmark), playful loading states. Motion should still be *purposeful* — celebrating a real action, not animating everything just because it can. Always gate spatial/bouncy motion behind `prefers-reduced-motion`, substituting a simple opacity crossfade.

## Navigation tendencies

Bottom tab bars on mobile, large touch-friendly primary actions (often a prominent FAB or bottom-anchored CTA), swipeable/gesture-driven patterns where they add real value. Avoid over-relying on hamburger menus for primary navigation — surface the 3-5 things users do most as visible tabs.

## Common mistakes agents make with this archetype

- Confusing "playful" with "generic AI startup app" — landing on the same violet gradient, the same rounded card grid, the same bouncy-for-no-reason animation every other AI-generated consumer app uses. Playful should be *specific* to this product's character, not a genre default.
- Sacrificing accessibility for cuteness (low-contrast pastel text, touch targets under 44px, disabling zoom).
- Over-animating so heavily that repeat users find the app slow or tiring after the tenth use.
- Using stock illustrations that could belong to any app instead of a considered, specific visual identity.

## When NOT to use this archetype

Skip it for professional tools, anything handling money/health/legal data where users expect sober seriousness over a certain threshold of stakes, and B2B software where the buyer (not the daily user) associates "playful" with "not serious enough to trust with our data."
