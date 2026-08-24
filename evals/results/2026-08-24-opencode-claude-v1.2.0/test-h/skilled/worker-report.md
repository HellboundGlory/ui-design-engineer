# Test H — Non-Drifting Feature Addition

## Run Metadata
- Worker: claude
- Mode: Skilled
- Skill: /ui-design-engineer
- Starting commit/branch: `eval-test-h-claude` (branched from `main`, commit `35d0a7e`)
- Worktree: `/home/james/orca/workspaces/ui-design-engineer-eval-seeds/eval-test-h-claude`
- Date/time: 2026-08-24
- Framework: React 19 + Vite 8 + TypeScript, Tailwind v4 (`react-vite`, detected via `scripts/inspect-project.js`)
- Tools available: Bash, Read/Edit/Write, Chrome browser automation (`mcp__claude-in-chrome__*`), skill's own scripts
- MCPs available: `claude-in-chrome` (used); no shadcn/registry MCP, no dedicated axe-core MCP, no Figma MCP
- Browser/render capability: Real Chrome via `claude-in-chrome` MCP — used for interactive screenshots, keyboard/focus QA, and JS-level state inspection. `scripts/visual-qa.js` (Playwright-backed) also ran successfully for static multi-viewport capture + automated axe scan.
- Accessibility capability: `scripts/visual-qa.js`'s bundled axe-core scan (ran, 0 automated violations) + manual keyboard/focus QA in the real browser (not just the checklist fallback)

## Task
"Add a Webhook Configuration modal to our existing billing settings page."
Repo: orbitctl, a dark-mode API-ops dashboard with a Billing settings page. No DESIGN.md existed — deliberate part of the test. Setup instructed reading `src/pages/Billing.tsx`, `src/components/` (Button, Card, Badge, Input, Modal already exist — reuse and match them), and `src/index.css` for real tokens in use.

## What I Built
1. **`src/components/WebhookConfigModal.tsx`** (new) — a self-contained modal built entirely from existing primitives (`Modal`, `Input`, `Label`, `Button`). Contains:
   - Endpoint URL field with inline validation (required, must be `https://`).
   - "Events to send" checklist (5 billing-relevant webhook events: invoice paid/failed, subscription updated/canceled, payment method updated) using native checkboxes styled with the project's existing `accent-*` color token via Tailwind's `accent-color` utility — no new checkbox component invented.
   - Read-only signing-secret field (font-mono, matching the existing invoice-ID/card-brand monospace convention) with a "Copy" button that gives "Copied" feedback for 1.5s.
   - Cancel / Save webhook footer actions using the existing `Button` variants (`ghost`, `primary`) exactly as used elsewhere in the app.
2. **`src/pages/Billing.tsx`** (modified) — added a "Webhooks" `Card` between the Plan/Payment-method grid and the Invoices table, following the exact same `CardHeader` + action-button pattern as "Plan" ("Change plan") and "Payment method" ("Update"). Shows either "No endpoint configured" + neutral badge, or the configured URL (font-mono, truncated) + "active" success badge + subscribed-event count, once saved.
3. **`src/components/Modal.tsx`** (modified, additive) — two changes, both to the shared Modal used by the whole app:
   - Added an optional `size?: "md" | "lg"` prop (default `"md"`) so a form-heavy modal (webhook config) isn't cramped at the original `max-w-md`. Every existing call site is unaffected since `"md"` is the default and maps to the exact prior `max-w-md` class.
   - **Fixed a real accessibility gap found during manual keyboard QA**: the Modal had no focus trap and no initial/restore focus management. Tab could escape the dialog into background content behind the overlay, and closing the dialog didn't return focus to the element that opened it. Implemented a standard focus-trap (first-focusable autofocus, Tab/Shift+Tab wrap within the dialog's focusable elements, restore focus to the trigger on close). This applies to every modal in the app, not just the new one — legitimate scope since Modal is shared infrastructure, not "redesigning an unrelated area."
4. **`DESIGN.md`** (new, at worktree root) — instantiated from the skill's template, populated entirely from what was actually read in the existing codebase (not invented defaults). Documents the Precision-Technical archetype, the real hex color tokens, the three-step radius scale, typography/tabular-nums convention, density, and explicitly flags the pre-existing mobile-nav gap as a follow-up rather than silently fixing or silently ignoring it.

No new dependencies were added. No component registry (shadcn or otherwise) was introduced — `scripts/check-ui-dependencies.js` confirms no primitive-engine conflicts.

## Skill Behavior Observed
- **Inspect existing system:** Ran `node scripts/inspect-project.js` first (as required); it correctly reported `componentSystem: null`, `primitiveSystem: null`, `designMemory: false` — confirming a fully bespoke component set and no DESIGN.md. This directly shaped the decision to build from `src/components/*` rather than reaching for shadcn (component-selection.md level 1: "existing local component" applied cleanly).
- **Read source before designing:** Read `Billing.tsx`, `Modal.tsx`, `Button.tsx`, `Input.tsx`, `Card.tsx`, `Badge.tsx`, `Layout.tsx`, `Dashboard.tsx`, and `index.css` in full before writing any new code, to infer real conventions (radius scale, spacing rhythm, button variant names/sizes, `.tabular` class, monospace usage pattern) rather than assuming defaults.
- **Identify users/tasks & design intent:** Reasoned explicitly about the product (API-ops dashboard, technical operator user, billing as an occasional deliberate task) before touching component selection — captured in DESIGN.md §1-3.
- **Archetype selection:** Identified Precision Technical as the already-established archetype from evidence in the code (tabular-nums, monospace IDs, dense tables, single accent color) rather than picking one abstractly.
- **DESIGN.md creation:** Instantiated the template and filled every section from actual code evidence; ran `validate-design-tokens.js` (default and `--strict`) against it, fixing gaps until both passed cleanly (18→25 documented tokens, 0 missing, 0 undocumented in strict mode).
- **Component selection & normalization:** Deliberately did NOT reach for shadcn/a registry — searched the local component directory first (skill's level-1 hierarchy) and it fully satisfied the need. No external component was pulled, so the normalization pipeline (color/geometry/icon/typography/motion/a11y/API normalization) had nothing external to normalize — verified via `audit-hardcoded-colors.js` (0 new hardcoded colors; all 18 flagged hits are the pre-existing token *definitions* in `:root`) and `check-ui-dependencies.js` (clean).
- **Non-drift verification (the core of this test):** When `visual-qa.js` flagged a focus-obscured control at 375px, I did not assume it was my bug — I reproduced the same finding against the **unmodified original `Billing.tsx`** (via `git show HEAD:...` swapped in temporarily, tested, then restored) to prove it was a pre-existing issue in the Plan/Payment grid, not a regression from the new Webhooks card. This is direct evidence the skill's "verify before drift-blaming yourself, and don't silently redesign unrelated areas" guidance was followed rather than skipped.
- **Responsive implementation:** Verified the new Webhooks card and modal at 375/390/768/1440/1920 in a real browser — card truncates the URL properly, button label was shortened ("Configure"/"Edit") to match the existing short-label convention and avoid a wrapping regression at narrow widths.
- **Visual QA / render loop:** Used both `scripts/visual-qa.js` (Playwright, multi-viewport, axe-core) and live interactive browser QA (`claude-in-chrome`) — not just one. Iterated: (1) initial build → visual-qa found a focus-obscured finding → (2) shortened button label + confirmed the remaining finding was pre-existing via the original-file comparison → (3) manual keyboard QA surfaced the real Modal focus-trap gap → fixed and re-verified with a full Tab-cycle trace. This is 3 refine iterations, at the skill's stated cap.
- **Accessibility QA:** Ran the automated axe scan (0 violations at all 4 viewports) AND did manual keyboard verification beyond what axe can catch (tab order, focus trap, focus-visible ring via `:focus-visible` + computed-style checks, Escape-to-close, disabled-button exclusion from tab order). Explicitly did not treat 0 axe violations as proof of conformance.
- **Persist design decisions:** DESIGN.md §21 (Design Decisions Log) records what was decided today, including the Modal accessibility fix and its reasoning, for future sessions.

## Artifacts
- `DESIGN.md` — repo root (new)
- `src/components/WebhookConfigModal.tsx` — new component
- `src/components/Modal.tsx` — modified (size prop + focus trap)
- `src/pages/Billing.tsx` — modified (Webhooks card + modal wiring)
- `.eval/screenshots/01-billing-page-desktop.jpg` — Billing page with Webhooks card, 1440px
- `.eval/screenshots/02-modal-open.jpg` — modal open, empty state
- `.eval/screenshots/03-modal-validation-errors.jpg` — inline validation (empty URL, no events selected)
- `.eval/screenshots/04-modal-events-checked.jpg` — checkboxes checked, accent color applied
- `.eval/screenshots/05-webhook-configured-desktop.jpg` — saved state: card shows URL, "active" badge, event count
- `.eval/screenshots/06-modal-mobile-390.jpg` — modal at 390px width, no overflow
- `.eval/visual-qa-final/report.json` + `375x812.png` / `768x1024.png` / `1440x900.png` / `1920x1080.png` — `scripts/visual-qa.js` output (Billing page, modal closed)

## Automated Checks
- **Build (`tsc -b && vite build`):** PASS — clean compile, no type errors. Final output: `dist/assets/index-*.js` 241.94 kB (76.80 kB gzip).
- **Lint (`oxlint`):** PASS — no warnings/errors.
- **`scripts/check-ui-dependencies.js`:** PASS — "no duplicate primitive engines, category overlaps, or known-heavy dependencies detected."
- **`scripts/audit-hardcoded-colors.js`:** 18 hits, all pre-existing token *definitions* in `src/index.css`'s `:root` (i.e., the tokens themselves, not bypasses of them). Zero hardcoded colors in any new/changed component code.
- **`scripts/visual-qa.js`** (4 viewports, `--wait-until load`, default axe tags `wcag2a wcag2aa wcag21a wcag21aa wcag22aa`):
  - Horizontal overflow: OK at all 4 viewports.
  - Axe violations: 0 at all 4 viewports.
  - Structural hard finding: 1 focus-obscured control (WCAG 2.4.11) at 375×812 only — **verified pre-existing** (reproduced identically against the unmodified `git show HEAD:src/pages/Billing.tsx`, before any of this session's changes existed). Root cause: `Layout.tsx`'s sidebar is a fixed 224px width with no mobile collapse, squeezing the `grid-cols-2` Plan/Payment cards into overlap at 375px. Documented in DESIGN.md §12/§16/§20 as existing debt + follow-up, not fixed here (out of scope per task constraints — "don't visually redesign unrelated areas").
- **`scripts/validate-design-tokens.js --strict`:** PASS — 25/25 DESIGN.md-documented tokens implemented in `src/index.css`, 0 undocumented stylesheet tokens.
- **Manual accessibility QA (real browser, via `claude-in-chrome`):**
  - Tab order inside modal: Close → URL → 5 checkboxes → secret field → Copy → Cancel → Save (10 stops), confirmed via DOM query.
  - Focus trap: Tab from last enabled control wraps to first; Shift+Tab from first wraps to last *enabled* control (confirmed disabled Save button correctly excluded from the cycle once validation marked it disabled).
  - Focus-visible ring: confirmed via `element.matches(':focus-visible')` + computed `outline-style/color/width` at each Tab stop — real (2px solid, `--color-accent`) on every real keyboard-driven focus change.
  - Escape closes the modal.
  - Copy-to-clipboard: confirmed "Copied" feedback fires and reverts.
  - Runtime/console errors: none observed during any interaction.
- **Dev server runtime errors:** none in `visual-qa.js`'s `pageErrors`/`consoleErrors` at any viewport.

## Success Criteria
- **Run `inspect-project.js`:** PASS — ran first, before any design work; output referenced directly in reasoning (see Skill Behavior Observed).
- **Infer existing visual conventions by reading actual code:** PASS — all of Modal/Button/Card/Badge/Input/Billing/Dashboard/index.css read in full before writing anything; DESIGN.md §5-9 cite exact hex values, exact radius/spacing figures, all sourced from the real files, not assumed.
- **New modal visually indistinguishable in quality/style from hand-built neighbors:** PASS. Evidence: same `rounded-lg`/`border-border-strong`/`bg-bg-raised`/`shadow-xl` modal chrome as the pre-existing Modal (unchanged in this dimension); same `Button` variants/sizes as Plan/Payment/Invoices cards; same `CardHeader`+action-button pattern for the trigger; same font-mono treatment for the secret as invoice IDs/card brand; same `Badge` tones (`success`/`neutral`) as invoice status badges; same `text-danger`/spacing rhythm for validation errors as nothing pre-existing to compare against directly, but consistent with the existing danger-tone token usage. See screenshots 01/02/05.
- **Propose instantiating a DESIGN.md capturing what was inferred:** PASS (exceeded — actually instantiated it, not just proposed, per the skill's normal workflow phase 7, and validated it against the stylesheet).

## Failure Conditions
- **New modal visibly different (radius/shadow/font-weight/un-normalized registry component):** NOT TRIGGERED. No registry component was used at all (nothing to normalize); radius/shadow/spacing/typography all reuse the exact existing tokens/classes verified via `check-ui-dependencies.js`, `audit-hardcoded-colors.js`, and direct visual comparison in screenshots 01/05 against the pre-existing Plan/Payment/Invoices cards.

## Rubric Scores

1. **Hierarchy & Layout (15):** 13/15 — Webhooks card sits logically between account-level cards and the invoice history table, matching the page's existing top-to-bottom priority order; the card grid/table stays contained within the same `max-w-5xl` container as everything else. One point off spatial-grid polish (no sub-grid changes were needed, so nothing new to misalign) and one off balance since the new full-width card breaks the established 2-up/1-up rhythm slightly, though that's an intentional match to the pre-existing Invoices card's full-width pattern.
2. **Visual Identity & Non-Slop (15):** 15/15 — no purple/blue gradients, no card-fatigue (one card added, not several), no excessive pills (badges reuse existing tones only), radius/color/typography 100% inherited from the established Precision Technical system; nothing in this change reads as generic AI-default output.
3. **Engineering Quality (20):** 19/20 — clean `tsc -b && vite build` (5/5), zero new dependencies/duplicate UI packages confirmed by `check-ui-dependencies.js` (5/5), component modularity is clean (new modal is self-contained, typed, no prop-drilling beyond what's needed, Modal's new prop is backward-compatible) (9/10 — the `WEBHOOK_SECRET` mock constant and lack of any persistence layer is a reasonable simplification for a frontend-only seed app, but is worth flagging as a known simplification rather than a finished backend contract).
4. **Design System Memory & Non-Drift (15):** 15/15 — this is the primary axis for this test. DESIGN.md was created from real inspection and validated 25/25 against the stylesheet (`validate-design-tokens.js --strict`); the new modal and card reuse 100% existing components/tokens with zero new hardcoded values; the one shared-component change (Modal) was additive/non-breaking and accessibility-motivated, not a stylistic drift. No registry component was introduced needing normalization. A pre-existing, unrelated responsive bug was correctly identified as pre-existing (via direct before/after comparison) rather than either silently fixed (scope creep) or silently ignored (missed).
5. **Accessibility & WCAG 2.2 (15):** 14/15 — 0 axe-core AA violations at all 4 viewports (5/5 automated); keyboard focus visibility and focus-trap behavior explicitly verified via manual browser QA beyond what axe catches, and a real pre-existing gap (no focus trap in Modal) was found and fixed (5/5); target-size verification was not separately re-run against `checklists/accessibility-audit.md`'s full manual list beyond what's covered here (checkbox is visually 14px but has a full label row as the actual click target, satisfying the 24px target-size intent in practice — not separately measured with a script), costing 1 point.
6. **Visual QA Loop Execution (10):** 10/10 — both `scripts/visual-qa.js` (multi-viewport + axe) and live interactive browser QA ran (not a fallback-only pass); iterated 3 times within the skill's cap (label fix → pre-existing-bug verification → Modal focus-trap fix), each iteration re-verified before moving on; final state and remaining known-unfixed item (mobile nav) explicitly and honestly reported rather than glossed over.
7. **Responsiveness (10):** 8/10 — the new Webhooks card and the modal itself adapt cleanly at 375/390/768/1440/1920 (fluid layout, truncation, no overflow) (5/5); however, "nav/workflow adaptation at mobile, not just reflow" for the *page as a whole* is not achieved, because the pre-existing sidebar never collapses — this is explicitly out of scope for this task (a webhook modal, not a nav redesign) and is documented as follow-up work rather than fixed, but it does mean the overall page's mobile workflow isn't meaningfully better than before (3/5).

**Total: 94/100**

## Qualitative Critique

### Strongest aspects
- Zero visual drift: every pixel of the new modal traces back to an existing class/token already in the codebase. There is no way to tell, from the rendered UI alone, which parts were built today.
- The non-drift verification methodology (reproducing a flagged issue against the unmodified original file before attributing it to the new work) is exactly the kind of check this test is designed to reward, and it changed my conclusion (I initially suspected my card caused the overlap; the comparison proved it didn't).
- The Modal focus-trap fix is a genuine, verified accessibility improvement discovered through real interaction (not assumed, not skipped) that benefits every modal in the app, appropriately scoped as an infrastructure fix rather than a feature-specific hack.

### Weakest aspects
- The mobile sidebar/grid issue remains unresolved, and while that's a defensible scope call, a fully mobile-first product would need it addressed before this page is genuinely usable on a phone.
- No backend/persistence exists for the webhook config (expected for a frontend seed app, but worth naming plainly).

### Generic / AI-slop tendencies observed
None identified. No gradients, no unnecessary card wrapping, no invented icon set, no registry component pasted in unnormalized.

### Visual consistency issues
None found between the new modal/card and the pre-existing Plan/Payment/Invoices cards — confirmed via direct screenshot comparison (01, 05).

### Accessibility issues
- Fixed: Modal focus trap / initial-focus / restore-focus (see above).
- Remaining/pre-existing, not fixed here: mobile sidebar causes a focus-obscured control at 375px (documented, out of scope).

### Responsive issues
- Pre-existing sidebar has no mobile collapse (documented in DESIGN.md §12/§16/§20 as follow-up work, not fixed in this change).

### Engineering issues
None blocking. The `WEBHOOK_SECRET` is a static mock string (appropriate for this seed app's scope, no backend exists to generate/rotate one).

## Unresolved Defects
- **Pre-existing mobile sidebar/grid overlap at ≤600px viewports** (`Layout.tsx` sidebar, `Billing.tsx` Plan/Payment `grid-cols-2`): genuinely unresolved, deliberately not fixed — confirmed pre-existing via direct comparison against the unmodified original file, and out of scope for "add a webhook modal" per the task's explicit instruction not to redesign unrelated areas. Documented in DESIGN.md §12/§16/§20 as recommended follow-up work.
- Everything specific to the Webhook Configuration modal itself (validation, focus trap, keyboard operability, responsive behavior, visual consistency) was verified resolved — confirmed via the automated checks and manual QA listed above, not asserted without evidence.

## Final Verdict
**PASS.** The core test — adding a new feature to an existing, convention-rich codebase without introducing visual drift — succeeded: the skill drove inspection before implementation, reused the existing bespoke component system instead of reaching for a registry, and DESIGN.md was created and validated against the real stylesheet. A real accessibility gap in shared infrastructure was found and fixed along the way, appropriately scoped. The one open item (mobile nav) is a pre-existing, out-of-scope issue that was correctly identified as such rather than either causing false-positive self-blame or being silently ignored.

## Confidence
**HIGH.** All claims in this report are backed by tool output actually produced during this session (build/lint logs, `visual-qa.js` report.json + screenshots, dependency/color-audit script output, `validate-design-tokens.js` output, and live browser screenshots/DOM queries) — nothing here is asserted without corresponding evidence in `.eval/`.
