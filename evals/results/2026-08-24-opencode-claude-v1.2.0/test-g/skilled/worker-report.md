# Test G — Refactoring Legacy Interface (orbitctl servers page)

## Run Metadata
- Worker: opencode
- Mode: Skilled
- Skill: /ui-design-engineer
- Starting commit/branch: `4034d09`, branch `eval-test-g` (test-g-existing-design-system seed)
- Worktree: /home/james/orca/workspaces/ui-design-engineer-eval-seeds/eval-test-g
- Date/time: 2026-08-24, ~11:45–13:35 BST
- Framework: React 19 + Vite 8 + TypeScript, Tailwind CSS v4 (`@theme` token mapping), react-router-dom 7
- Tools available: skill scripts (inspect-project, validate-design-tokens, audit-hardcoded-colors, check-ui-dependencies, visual-qa), Playwright + axe-core installed as **test-only** `--no-save` packages (browser binaries already present in `~/.cache/ms-playwright`; `package.json`/`package-lock.json` untouched), system node 22
- MCPs available: none
- Browser/render capability: yes — visual-qa.js (Playwright/Chromium) after local install; custom Playwright probes for interaction/keyboard checks
- Accessibility capability: axe-core 4.13 via visual-qa.js + manual checklist pass + scripted keyboard/interaction probes

## Task
> "Refactor this unstyled HTML table and messy form controls into a cohesive, accessible modern interface matching our project tokens." The input to refactor is `legacy/report.html` (a plain, unstyled server-inventory table + a messy "Add Server" form) — turn it into a proper part of this React app, styled with this project's actual design system.

Repo/branch: ui-design-engineer-eval-seeds, branch `test-g-existing-design-system` ("orbitctl" with a real `DESIGN.md` and a bare legacy fixture at `legacy/report.html`).

## What I Built
A new **Servers** page (`/servers`, `src/pages/Servers.tsx`) that absorbs `legacy/report.html` into the orbitctl app:

- **Inventory table** — semantic `<table>` preserved and improved: `<thead>`/`<th scope="col">` (legacy had `td` header cells with `bgcolor`), sr-equivalent column naming via `aria-label` on the actions column, `caption` (sr-only), mono identifiers (`font-mono`), right-aligned `.tabular` CPU/Memory columns, status as `Badge` (`up`→success, `down`→danger — red used only for an error state, per §18), ghost `Edit` buttons matching the Billing row-action pattern. Presentational attributes (`border`, `cellpadding`, `bgcolor`, `#cccccc`) all removed.
- **Add server form** — every control programmatically labeled (the legacy form had zero `<label>` associations): `Label htmlFor` + `Input` (name), new `Select` (region), `Input` (IP), new `Checkbox` ×2 with real label association, new `Textarea` (notes), `Button` primary submit + secondary reset. Controlled React state; validation (required name, duplicate-name guard, IPv4 format) with `aria-invalid` + `aria-describedby` error wiring; `role="status"` live region announces successful adds; form resets after submit.
- **New primitives** — `Select`, `Textarea`, `Checkbox` hand-built in the existing component idiom (no registry/library — DESIGN.md §18 forbids a second system). `Label` gained optional `htmlFor`.
- **Navigation** — "Servers" added to nav; the sidebar is now a single DOM node that reflows into a top strip below `lg` (the previously-undecided narrow behavior, now logged in DESIGN.md §21).
- **Two contrast fixes** (both axe-flagged, both token-level, both logged in §21): new `--color-danger-strong` token for badge text on danger-muted (4.25→4.9:1); primary button label switched from `text-white` to `text-bg` (~3.2→6.5:1). Primary had no prior visual usage, so no existing screen changed appearance.
- **One pre-existing fix surfaced by regression QA**: `tabIndex={0}` on the shared `<main>` scroll container (`scrollable-region-focusable` on Dashboard at 375px; zero visual change).

## Skill Behavior Observed
- **Bridge command**: `/ui-design-engineer` was invoked as directed; `.opencode/command/ui-design-engineer.md` exists and its content (SKILL.md path + workflow instructions + `$ARGUMENTS`) is exactly what I received and followed. No fallback needed.
- **Inspect existing system**: ran `inspect-project.js` first (react-vite, tailwind-v4, no component system, `designMemory: true` → DESIGN.md). Read every existing component/page before writing anything.
- **Users/tasks**: taken from DESIGN.md §1–2 (infra engineers, multi-daily, mistake cost = incident time/money); drove density and table-first IA.
- **IA / design intent**: table = primary scan surface, form = secondary card below; intent "precise, quiet operational clarity" (§3) — no new direction invented.
- **Read DESIGN.md**: yes — governed everything (tokens, density `px-4 py-2.5` rows / `h-9` controls, radius, mono-for-identifiers, `.tabular`, no-shadcn rule).
- **Preserve existing language**: reused Button/Card/Badge/Input/Label as-is; extended, didn't replace; matched page scaffolding (`max-w-5xl px-6 py-6`, `text-lg` title, CardHeader/CardBody, table cell classes copied from sibling pages).
- **Component selection**: hierarchy level 1 (existing local) for everything available; level 7 bespoke for Select/Textarea/Checkbox rather than any registry — justified by §18's strict-never on second systems.
- **Responsive**: DESIGN.md §16/§20 explicitly deferred narrow behavior; I made the decision *and logged it in §21 before shipping* (top-strip nav at `<lg`, contained table scroll, form grid reflow), per the reference's "record the breakpoint strategy once decided".
- **Visual QA loop**: ran visual-qa.js at 375/768/1440/1920; first run found 4 issue classes (mobile overflow, 2 contrast violations, 3 phantom zero-size controls, 2 undersized targets); diagnosed each (Playwright probe for the overflow: an absolutely-positioned `sr-only` span escaping the scroll wrapper; duplicate display:none nav for the phantom controls), fixed, re-ran to 0/0/0. Iterated twice total (within the ~3 cap).
- **Accessibility QA**: axe scan + scripted keyboard/interaction probes (tab order, focus ring computed style, checkbox hit-box, error/live-region behavior) + manual checklist; also chased a focus-ring-color false alarm to its real cause (Tailwind v4 `transition-colors` animates `outline-color`; ring settles to accent in 100ms — verified, not a defect).
- **Persist memory**: DESIGN.md §21 gained 7 dated entries; §5/§12/§13/§16/§17/§19/§20 updated to stay truthful.

## Artifacts
- `.eval/report.json` — final visual-qa run (4 viewports, axe 4.13, 0 violations)
- `.eval/{375x812,768x1024,1440x900,1920x1080}.png` — final Servers page renders
- `.eval/screenshots/error-state.png` — validation error state (danger text, wired field)
- `.eval/screenshots/focus-ring.png` — keyboard focus ring on nav (settled, accent)
- `.eval/screenshots/other-routes/{dashboard,billing}/` — regression renders + reports after nav/main changes
- Implementation: `src/pages/Servers.tsx`, `src/components/{Select,Textarea,Checkbox}.tsx` (new), `src/components/{Input,Button,Badge,Layout}.tsx` (modified), `src/main.tsx` (route), `src/index.css` (+1 token), `DESIGN.md` (memory updates)
- Legacy input (unchanged, for reference): `legacy/report.html`

## Automated Checks
- **Build** (`tsc -b && vite build`): PASS, no type errors, 34 modules.
- **Lint** (`oxlint`): PASS, no output.
- **visual-qa** (final): PASS — 4/4 viewports rendered; overflow ok; 0 structural defects; 0 pageErrors; **axe: 0 violations** at 375/768/1440/1920.
- **axe (first run, for the record)**: 2× color-contrast [serious] (`.bg-danger-muted`, `.bg-accent`) → both fixed, re-scanned to 0. Dashboard regression scan found 1× `scrollable-region-focusable` (pre-existing, on `<main>`) → fixed with `tabIndex={0}`, re-scanned to 0.
- **Overflow**: first run had page-level OVERFLOW at 375 (scrollWidth 599 vs 375, caused by `sr-only` span escaping the scroll wrapper) → fixed; final run 0 horizontal overflow at all viewports.
- **Token validator** (`validate-design-tokens.js`): OK — every token DESIGN.md documents is implemented. (INFO: 7 stylesheet vars undocumented — pre-existing radius/font vars documented in DESIGN.md prose, not drift; default mode correctly doesn't fail.)
- **Color audit** (`audit-hardcoded-colors.js`): 19 findings, **all** are the token *definition lines* in `src/index.css` `:root` (18 pre-existing + the new `--color-danger-strong`). Zero hardcoded colors in any `.tsx` component. No new bypasses introduced.
- **Dependency checker** (`check-ui-dependencies.js`): OK — no duplicate primitive engines, no category overlap. No runtime dependencies added; playwright/axe-core installed `--no-save` (dev tooling only, manifests clean — verified via `git diff`).
- **Tests**: N/A — repo has no test suite (no test runner configured).
- **Runtime errors**: 0 pageErrors, 0 consoleErrors (visual-qa report).

## Success Criteria
1. **Uses the project's actual tokens (not a fresh palette)** — PASS. All styling uses the documented Tailwind-v4 token utilities; token validator OK; color audit shows zero component-level hex/arbitrary colors; the one new value (`--color-danger-strong`) is a *token added to the system* and documented in DESIGN.md §5/§21, not a bypass. Screenshots match sibling pages' visual language exactly.
2. **Semantic HTML preserved/improved (no div soup)** — PASS. Real `<table>` with `<thead>`, `th[scope=col]`, caption; real `<form>` with native controls; heading hierarchy h1→(CardHeader h3)→(Modal-style h2 n/a here). No div-grid conversion anywhere.
3. **Accessibility improved, not just modernized** — PASS. Legacy defects fixed: unlabeled inputs → `Label htmlFor` on all 5 controls (incl. the unlabeled `<select>`); unassociated checkboxes → real label association + 24×24 targets; `td` header row → `th scope="col"`; added `aria-invalid`/`aria-describedby` error wiring, `role="status"` announcement, keyboard-visible accent focus ring (verified computed style), logical tab order (probed). axe: 0 violations; legacy page would fail dozens.

## Failure Conditions
1. **New hardcoded colors instead of project tokens** — NOT TRIGGERED. Audit evidence above; the only new hex lives in the token definition itself and is documented in DESIGN.md.
2. **Loses semantic structure (table → div grid) without good reason** — NOT TRIGGERED. Table semantics strengthened; narrow-viewport strategy is contained scroll, not div reflow.
3. **Accessibility regressions during modernization** — NOT TRIGGERED. Net effect strictly positive on the new page and on the shared app (2 contrast fixes, 1 scroll-region fix); Dashboard/Billing re-scanned clean after shared-component changes.

## Rubric Scores
1. **Hierarchy & Layout (15) — 13.** Focal point is the inventory table, form clearly secondary (5→4: two same-weight stacked cards is slightly flat at desktop); strict 4px-grid/max-w-5xl alignment matching sibling pages (5); contained at 1920, no stray widths (4 — generous empty lower canvas at 900px-tall viewports is inherent to the seed layout).
2. **Visual Identity & Non-Slop (15) — 14.** Committed precision-technical execution (mono identifiers, tabular numerals, tight radii, no gradients/pills/shadows) (5); zero catalog anti-patterns present (5); typography is the project's deliberate Inter+JetBrains Mono pairing, not default-everywhere slop (4 — pairing inherited, not re-derived).
3. **Engineering Quality (20) — 18.** Clean tsc/vite/oxlint (5); zero new runtime deps, test-only install left manifests clean (5); modular primitives with prop spreading + useId, typed data model, real validation/state (8 — not 10: form logic lives in the page rather than a hook; acceptable at this scale).
4. **Design System Memory & Non-Drift (15) — 15.** Every token/density/geometry/component decision traceable to DESIGN.md; validator + audit clean; deviations (danger-strong token, dark-on-accent label) made *through* the system's own decision log. Gating dimension: non-drift held.
5. **Accessibility & WCAG 2.2 (15) — 13.** 0 axe AA violations + honest scope note that axe ≈ 30–40% of WCAG (10→9: automated baseline clean, manual checklist done but not against a live SR); keyboard focus visibility verified programmatically + screenshot; checkbox targets 24×24 verified via bounding box (4 — Edit/nav targets ≥24px but below the 44px touch-ideal on mobile).
6. **Visual QA Loop Execution (10) — 10.** Real 4-viewport render pass with screenshots; found real defects; 2 diagnose→fix→re-verify iterations; residual nits reported honestly rather than claimed resolved.
7. **Responsiveness (10) — 9.** Fluid 3→2→1 form reflow, contained table scroll, zero page overflow at 375 (5); nav genuinely adapts (sidebar↔strip, same interaction styles) rather than shrinking (4 — mobile table requires horizontal scrolling rather than column prioritization; defensible for this audience, logged as a decision).

**Total: 92/100.**

## Qualitative Critique
### Strongest aspects
- Indistinguishable from the seed pages' design language — table cell classes, card scaffolding, badge usage and density are the house patterns, not approximations of them.
- The a11y work is structural (label association, scope, describedby, live region, target size), not cosmetic.
- The QA loop caught and fixed four genuinely subtle defects (including an `sr-only`-escapes-overflow bug and a transition-based focus-ring false alarm correctly ruled *not* a bug).
### Weakest aspects
- Desktop composition is safe: two full-width stacked cards; a side-by-side split could tighten the fold, at some cost to the form's breathing room.
- Mobile table UX leans on horizontal scroll; column prioritization (hide Memory first) would be kinder, but contradicts "columns keep integrity" for an ops audience — a real trade-off, currently resolved conservatively.
### Generic / AI-slop tendencies observed
- None material. The one risk area — a generic "table card + form card" shape — is what the seed's own pages already establish as the product pattern, so following it *is* the non-drift choice.
### Visual consistency issues
- Native 24px checkboxes read slightly heavier than the surrounding 14px text; consistent cross-browser, acceptable, noted.
- `--color-danger-strong` badge text vs `--color-danger` inline error text are two near-identical reds by design (different backgrounds); could confuse future contributors if §5 isn't read.
### Accessibility issues
- axe covers a subset; no live screen-reader pass was performed (no SR tooling in environment) — manual checklist substituted.
- Touch-ideal 44px targets not met for nav/Edit buttons (28–36px); ≥24px AA minimum met everywhere.
### Responsive issues
- Table scroll region has a partial-column affordance but no explicit scroll hint/shadow.
### Engineering issues
- Form state in-component; would extract a hook if the form grew.
- `useId` object-literal pattern is valid but slightly unconventional.

## Unresolved Defects
- No live screen-reader (NVDA/VoiceOver) verification was possible in this environment; SR behavior is inferred from semantics + axe + manual checklist, not heard.
- 44px touch-ideal target sizes on dense nav/table actions not raised to 44px (AA 24px minimum met); changing them would alter the seed's established compact density, so I chose non-drift.
- Mobile table scroll has no progressive-disclosure/column-priority treatment (see critique).
None of these are regressions; all are recorded for future sessions in DESIGN.md where relevant.

## Final Verdict
**PASS.** The legacy fixture is now a native, token-pure, semantically stronger, axe-clean part of the app; design-system non-drift held (the gating dimension), accessibility strictly improved, and all deterministic checks are green.

## Confidence
**HIGH** for all automated claims (every tool result quoted above actually ran, with artifacts on disk) and for visual/non-drift judgments (screenshots reviewed at all four viewports). **MEDIUM** overall only because screen-reader UX and 44px touch ergonomics couldn't be verified with real AT hardware/tooling in this environment.
