# Accessibility Audit Checklist (WCAG 2.2 AA)

Automated scanning (axe-core, via `scripts/visual-qa.js` or an accessibility MCP) catches roughly 30-40% of real accessibility issues. This checklist covers the automated baseline plus the structural/manual checks a scanner can't perform. Full reasoning for each item lives in `references/accessibility-wcag.md` — this file is the actionable pass/fail list.

## Automated baseline

- [ ] `scripts/visual-qa.js` (or equivalent MCP) reports **0 axe-core violations**, or the specific violations reported have been fixed and re-scanned.
- [ ] If no automated tooling was available in this environment, this is recorded explicitly — not silently skipped — and every item below was checked manually instead.

## Keyboard operability

- [ ] Every interactive element (buttons, links, form controls, custom widgets) can be reached via Tab and operated via Enter/Space without a mouse.
- [ ] Tab order follows the visual/logical reading order — no unexplained jumps, no positive `tabindex` values.
- [ ] No keyboard trap: focus can always be moved away from any component using the keyboard alone.
- [ ] Modals/drawers/popovers trap focus while open, close on Escape, and return focus to the trigger element on close.
- [ ] **Focus Not Obscured (2.4.11):** a focused element is never hidden behind a sticky header or floating overlay — scroll and verify, don't assume.

## Focus visibility

- [ ] Every interactive element shows a visible, high-contrast focus indicator on keyboard focus (not just on hover/click).
- [ ] The default browser outline was never removed (`outline: none`) without an equally visible custom replacement.

## Target size (2.5.8)

- [ ] All interactive targets have a minimum 24×24px hit area; 44×44px on touch-primary (mobile/tablet) viewports.
- [ ] Icon-only buttons in dense toolbars/tables were checked specifically — this is where target-size violations are most common.

## Dragging alternatives (2.5.7)

- [ ] Any drag-based interaction (reorder, slider, kanban) has a single-pointer, non-drag alternative (explicit move buttons, keyboard reorder, numeric input).

## Contrast

- [ ] Body text ≥ 4.5:1 against its actual rendered background (checked against the real token value, not assumed).
- [ ] Large text (≥24px, or ≥18.66px bold) ≥ 3:1.
- [ ] Non-text UI (borders, icon-only control boundaries, chart data points carrying meaning) ≥ 3:1 against adjacent color.
- [ ] Status/semantic colors were checked specifically, including on any saturated brand-color backgrounds (Playful Consumer contexts are the highest-risk case here).

## Forms

- [ ] Every input has a real, programmatically associated label (`<label for>` / `aria-label` / `aria-labelledby`) — not a placeholder standing in for a label.
- [ ] Related fields are grouped with `<fieldset>`/`<legend>` where semantically appropriate.
- [ ] Validation errors are associated with their field (`aria-describedby`) and not communicated by color alone.
- [ ] Async validation errors are announced via an appropriate `aria-live` region.

## Dialogs & popovers

- [ ] Modal dialogs have `role="dialog"`/`alertdialog`, `aria-modal="true"`, and a label pointing at the dialog's heading.
- [ ] Focus moves into the dialog on open and returns to the trigger on close.

## Screen reader support

- [ ] Icon-only controls have an accessible name; purely decorative icons/images are `aria-hidden`/`alt=""`.
- [ ] Dynamic content the user needs to notice without looking (toasts, live status) uses an appropriate `aria-live` region.
- [ ] Semantic HTML is used for structure (`<nav>`, `<main>`, real heading levels reflecting actual document hierarchy) rather than `<div>` soup with ARIA bolted on.

## Motion

- [ ] `prefers-reduced-motion: reduce` removes or substantially reduces all non-essential spatial/parallax/auto-playing motion, verified for both CSS transitions and any JS-driven animation library in use (checking a `useReducedMotion()`-style hook was actually wired in, not just the CSS media query).

## Reporting

State plainly which items passed automated scanning, which were manually verified, and which — if any — remain unresolved after the iteration safety cap (see SKILL.md's Visual QA loop). Never report "accessibility verified" when only the automated scan ran and this checklist wasn't worked through.
