# Accessibility — WCAG 2.2 AA

The default compliance target is **WCAG 2.2 AA** for everything this skill produces. This is the closest thing in this skill to a pure Invariant domain — nearly every rule below should hold regardless of archetype, product, or aesthetic direction. Where an archetype or a genuinely unusual product need seems to conflict with a rule here, that's a signal to find a way to satisfy both, not to quietly drop the accessibility requirement.

## Automated testing is one layer, not proof of completeness

Automated scanners like axe-core catch roughly 30-40% of real accessibility issues — they're excellent at detecting missing labels, insufficient contrast, and malformed ARIA, but structurally blind to things like "does this focus order make sense," "is this error message actually helpful to a screen reader user," or "can this whole flow be completed with a keyboard alone." **Zero axe-core violations is a necessary checkpoint, never sufficient evidence that an interface is accessible.** Always pair automated scanning (`scripts/visual-qa.js`, or an axe-core MCP if available) with the manual/structural checks below and with `checklists/accessibility-audit.md`.

## Semantic HTML first

Use the element that already carries the right semantics and behavior before reaching for ARIA to bolt it onto a `<div>`: `<button>` not a `<div onClick>`, `<nav>`/`<main>`/`<header>`/`<footer>` for page regions, `<table>` for genuinely tabular data, real heading levels (`<h1>`–`<h6>`) that reflect actual document structure rather than being chosen for their default font size. ARIA is for filling gaps semantic HTML can't cover, not a replacement for it — "No ARIA is better than bad ARIA."

## Keyboard navigation and focus

- **Everything interactive must be reachable and operable via keyboard alone** — every click handler needs an equivalent keyboard path, not just an implicit one from using a real `<button>`/`<a>`.
- **Focus order** must follow a logical, predictable sequence that matches the visual/reading order (WCAG 2.4.3). Avoid `tabindex` values greater than 0, which override natural order and create confusing jumps.
- **Focus Not Obscured (WCAG 2.2 — 2.4.11):** a focused element must not be hidden or partially covered by a sticky header, floating action bar, or non-modal overlay. If a sticky header exists, verify focused elements scroll into a position where they're fully visible beneath it, not just technically in the viewport.
- **Keyboard traps (WCAG 2.1.2):** the user must always be able to move focus away from any component using only the keyboard. Modals, drawers, and popovers should *intentionally* trap focus while open (Tab cycles within them, doesn't escape to the page behind) but must release that trap and return focus to the triggering element when dismissed, and must be dismissible via Escape.
- **Focus visibility (Invariant):** every interactive element needs a visible, high-contrast focus indicator when reached via keyboard (e.g., `ring-2 ring-primary ring-offset-2`, or an equivalent outline that clears 3:1 contrast against its background). Never remove the default focus outline (`outline: none`) without replacing it with an equally visible custom one — this is one of the single most common and most damaging accessibility regressions agents introduce while polishing visual design.

## Target size (WCAG 2.2 — 2.5.8)

All interactive targets — buttons, icon-only controls, checkboxes, links in dense text — need a minimum interactive area of 24×24px, with 44×44px strongly preferred wherever the interface is touch-primary (mobile, tablet). This is about the *interactive hit area*, not necessarily the visible icon/label size — a small visible icon can still have a larger invisible padding/hit area satisfying the requirement.

## Dragging alternatives (WCAG 2.2 — 2.5.7)

Any functionality that requires a drag gesture (reordering a list, a slider, a kanban card move) needs a single-pointer, non-drag alternative — explicit "Move up"/"Move down" buttons, a keyboard-operable reorder mode, or numeric input for a slider's value. Don't ship drag-only interactions.

## Forms and validation

- Every input needs an explicit, programmatically associated label (`<label for>` or `aria-label`/`aria-labelledby`) — a placeholder is not a label and disappears exactly when it would be most useful (once the user starts typing).
- Group related fields with `<fieldset>`/`<legend>` where appropriate (e.g., a radio group).
- Validation errors must be announced (not just visually indicated by a red border): associate the error message with its field via `aria-describedby`, and consider `aria-live` regions for errors that appear after async validation.
- Never rely on color alone to indicate an error or required state — pair color with an icon, text, or both.

## Dialogs and popovers

- Modal dialogs need `role="dialog"` (or `alertdialog` for interruptive confirmations), `aria-modal="true"`, and a label (`aria-labelledby` pointing at the dialog's heading).
- Focus should move into the dialog when it opens (typically to the first focusable element or the dialog container itself) and return to the trigger element when it closes.
- Non-modal popovers (tooltips, menus) should dismiss on Escape and on click/focus outside, without trapping focus the way a true modal does.

## Contrast (WCAG 1.4.3, 1.4.11)

- Body text and text-as-images: minimum 4.5:1 against its background.
- Large text (≥24px, or ≥18.66px bold): minimum 3:1.
- Non-text UI components and meaningful graphical objects (icon-only button boundaries, active input borders, chart data points that carry meaning): minimum 3:1 against adjacent colors.
- Verify contrast against the *actual* rendered background, not an assumed one — a token that looks fine against white can fail against the specific muted surface it's actually placed on. This is especially easy to get wrong with saturated brand colors used as backgrounds (see `playful-consumer.md`) — check them, don't assume boldness implies adequate contrast.

## Motion and vestibular safety

Covered in depth in `motion-microinteractions.md` — respecting `prefers-reduced-motion` for all non-essential spatial/parallax/auto-playing motion is treated as an Invariant here, not a nice-to-have.

## Screen readers

- Icon-only controls need an accessible name (`aria-label`, or visually-hidden text) — an icon alone communicates nothing to a screen reader unless it's purely decorative (in which case mark it `aria-hidden="true"` so it isn't announced as noise).
- Live regions (`aria-live="polite"` or `"assertive"`) for content that updates without a page reload and that the user needs to know about without having to notice it visually (a toast notification, a live-updating status, a form submission result).
- Images that carry meaning need alt text describing that meaning; purely decorative images get empty `alt=""` so screen readers skip them rather than announcing an unhelpful filename.

## The automated baseline

`scripts/visual-qa.js` should report **0 axe-core violations** as a required checkpoint before considering an implementation done, alongside the manual checks above and `checklists/accessibility-audit.md`. If Playwright/axe-core tooling isn't available in the current environment, fall back through the capability chain in SKILL.md — never skip the accessibility pass, and never claim an automated scan ran when it didn't.
