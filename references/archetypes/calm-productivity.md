# Archetype: Calm Productivity

## When this reasoning applies

The product is a tool for thinking, writing, planning, or organizing that the user returns to daily but isn't "operating" the way they'd operate an ops console: note-taking and knowledge tools, personal task/project management, writing apps, calm SaaS productivity tools, journaling/reflection apps, docs and wiki products. The defining quality is that the *content the user creates* is the product — the interface's job is to get out of the way of thinking, not to showcase itself.

## Design intent

Quiet confidence. The chrome should nearly disappear; the user's own content (text, tasks, notes) should be the most visually prominent thing on screen. Unlike Precision Technical (dense, high-stimulus, built for vigilance) this archetype actively reduces stimulus — fewer simultaneous colors, less competing chrome, more negative space around the content itself, even though information density needs can still be real (e.g., a task list with many items).

## Starting values (override freely in DESIGN.md)

- **Density**: Comfortable, tuned to content rather than chrome. The content area can hold plenty of information; the surrounding UI (toolbars, sidebars, menus) should be minimal and low-contrast so it recedes.
- **Spacing scale**: 8px grid, generous around content blocks (24–32px), tighter within tightly-related clusters (task + metadata: 8px).
- **Radius**: Soft but restrained (6–10px) — enough to feel warm, not enough to feel bouncy or consumer-gamified.
- **Typography**: A calm, highly legible body-first font (a humanist sans like Inter, Karla, or a soft serif for reading-heavy contexts) with a narrow, disciplined type scale — this archetype rarely needs display-sized headlines; hierarchy comes from weight and spacing more than size jumps.
- **Contrast**: Deliberately softened. Chrome elements (icons, secondary labels, dividers) sit at lower contrast against the background so the eye is drawn to content, not controls. Primary content text still meets 4.5:1 — "calm" is not an excuse to fail contrast requirements, it's a reason to differentiate *layers* of contrast (content vs. chrome) rather than flattening everything to high contrast.
- **Color**: A quiet, often near-monochrome neutral palette (warm or cool greys, off-white/off-black) with one soft accent color used sparingly for the primary action and for meaningful highlights (a due date, a mention, a selected state). Avoid saturated, attention-grabbing color for anything that isn't genuinely time-sensitive or important.
- **Surfaces**: Minimal separation — often no cards at all for primary content, just whitespace and subtle dividers. Reserve any elevation for genuinely floating UI (a command palette, a hover card).
- **Iconography**: Thin, quiet, small — icons support scanning but shouldn't compete with content for attention.

## Motion

Gentle and unobtrusive: soft fades, small easing on hover/focus states, no springs or bounce (that belongs to Playful Consumer, not here). Motion should feel like the interface is being considerate, not performing.

## Navigation tendencies

Often a collapsible sidebar (tree of pages/projects/notes) with a strong command palette / quick-switcher as the primary navigation method for power users. Avoid heavy top navigation chrome that competes with the content pane for vertical space.

## Common mistakes agents make with this archetype

- Confusing "calm" with "sparse to the point of unhelpful" — calm productivity tools can and should show real information density in the content area (a full task list, a populated note); the restraint applies to *chrome*, not to content.
- Introducing bright saturated accent colors or badges everywhere, which recreates visual noise this archetype exists to avoid.
- Over-using cards to separate every block of content, adding visual weight the archetype is trying to remove.
- Making chrome contrast so low it fails accessibility rather than just visually receding — there's a real difference between "quiet" and "invisible/illegible."

## When NOT to use this archetype

Skip it for monitoring/operational tools where vigilance and fast anomaly detection matter (Precision Technical is the better fit), for marketing/editorial surfaces trying to make a strong first impression (Editorial Premium), and for consumer products that need to compete on visual excitement (Playful Consumer).
