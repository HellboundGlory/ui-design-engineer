# Changelog

## V1.2.1 — Evidence-driven QA/tooling patch

Framed explicitly as: an evidence-driven QA/tooling patch based on the first complete paired A–L evaluation (`evals/results/2026-08-24-opencode-claude-v1.2.0/RESULTS.md`, 12/12 tests, skilled vs. baseline). That evaluation's verdict was **EFFECTIVE** — the skill's measured value is turning good design behavior into a *systematic, repeatable* process (token discipline, DESIGN.md memory, multi-viewport QA, accessibility verification, honest tool-limitation reporting), not installing taste a capable baseline agent otherwise lacks. This patch addresses only the concrete engineering gaps that same evidence surfaced. It does **not** change: the design philosophy, the archetypes, DESIGN.md's architecture, the component-selection strategy, the accessibility invariant, or Tests A–L's own scoring semantics — no eval test definition, success/failure condition, or scoring area was altered to make any score look better.

- **`visual-qa.js`: multi-route / multi-state visual QA (the main fix).** Evidence: Test D's real, shipped table-overflow bug existed only on a settings page's non-default tab and was invisible to the tool's single-render pass — a worker that trusted a clean automated report alone, without separately driving the live app, would have shipped it undetected (see "Repeated Failure Patterns" #2 and the P1 recommendation in RESULTS.md). Two additive, backwards-compatible mechanisms close this:
  - `--route <path>` (repeatable) — resolved against `--url`, each navigated and captured as its own independent state.
  - `--scenario <path-to-json>` — a small JSON file of named interaction states (`click`/`waitFor`/`fill`/`press`/`select` actions only — deliberately not a general browser-automation DSL) for reaching tab-switched or otherwise stateful content that lives at one URL.
  - Neither flag is required. With neither, behavior and `report.json`'s shape are **byte-for-byte unchanged** (`mode: "single"`, the original flat `viewports[]` array) — existing single-page usage needs no changes and no scenario file.
  - With either flag, `report.json` switches to `mode: "multi-state"` with a `states[]` array, each carrying its own `viewports[]`, screenshots under `<out>/<state-name>/` (never overwriting another state's), and an explicit per-state `status` (`"ok"` / `"review"` / `"hard-failure"` / `"incomplete"`). A route/state that can't be reached (navigation failure or a timed-out scenario action) is recorded `"incomplete"` with a `reachError` and **always** causes a non-zero exit — QA that never reached a requested state is never reported as a clean pass.
  - `SKILL.md`'s Phase 10 gained one sentence: for SPAs, tabbed workspaces, settings areas, and other stateful interfaces, a clean default-route capture alone is not sufficient QA.
- **`check-ui-dependencies.js`: dependency-ecosystem normalization (reduces false positives).** Evidence: 5+ of 12 paired eval tests spent real (correctly-resolved, but avoidable) investigation time confirming that multiple `@radix-ui/*` packages, or a Mantine-family package, weren't actually competing engines (see "Repeated Failure Patterns" #3). Sibling packages from one namespace (`@radix-ui/react-dialog` + `@radix-ui/react-popover` + `@radix-ui/react-tooltip`, or `@mantine/core` + `@mantine/hooks` + `@mantine/form`) now normalize into a single detected ecosystem *before* any conflict decision — both the same-category duplicate check and the cross-system pairing check operate on ecosystem ids, not raw package names. A same-category or cross-system `CONFLICT` now only fires when **more than one distinct ecosystem** is actually present. Real conflicts (Mantine + Radix, MUI + shadcn, MUI + Radix, etc.) still fire exactly as before, and `--allow`/`ui-design-engineer.config.json` now also accept an ecosystem id directly. The pre-existing V1.1.1 Test K regression fixture (`existing-mui-with-shadcn/`) was re-run unchanged and still fails `--strict` — this is a false-positive fix, not a weakening of the conflict logic Test K depends on.
- **Test L evaluation-hygiene documentation (no skill-code change).** Evidence: the skilled Test L run's "no visual tooling available" premise was silently defeated by a stray shared cache (`/tmp/opencode/qa-deps`, left behind by an earlier, unrelated dispatch on the same machine) — the skill's own capability-fallback behavior was never at fault, but the eval's environment wasn't actually clean. `evals/evaluation-suite.md`'s Test L definition gained an explicit "Setup" checklist (verify `playwright`/`axe-core` are unresolvable from the target project, search for and clear any shared/global cache that could make them resolvable anyway, confirm no MCP is configured, and record the verified state) — written generically, citing `/tmp/opencode/qa-deps` as the one known example, not the only path that can cause this. `evals/README.md` cross-references it.
- **Regression coverage for both fixes, exercised in a real browser where relevant:**
  - New `tests/fixtures/tabbed-app/` (+ `tests/run-multistate-integration.js`, 15 assertions): proves legacy single-page usage is unaffected, proves a `--scenario`-reached tab's real defect is caught, proves an unreachable state is reported incomplete with a non-zero exit, and proves `--route` captures multiple routes without overwriting screenshots.
  - New `tests/fixtures/dependency-radix-siblings/`, `dependency-mantine-siblings/`, `dependency-mantine-with-radix/` (+ 5 new assertions in `tests/run-fixtures.js`, 33 → 38): prove sibling-package normalization removes the false positive while a genuine cross-system pairing still conflicts, and re-confirm the existing MUI+shadcn+Radix (Test K) fixture is unweakened.
- **Incidental fix found during this pass, unrelated to the eval evidence above**: `tests/validate-repo.js`'s internal-link checker was tripping on bare `scripts/foo.js`-style mentions inside `evals/results/**/*.md` (recorded worker-report/DESIGN.md artifacts from past eval runs, which — like `evaluation-suite.md` itself — describe what an agent typed/read from its own perspective, not a repo-navigation pointer). Extended the existing single-file exclusion to a directory-prefix exclusion covering `evals/results/`, so `npm test` passes without weakening the check for any file it's actually meant to validate.
- **Also corrected while implementing the multi-route/state work**: `visual-qa.js`'s two run modes now return an exit code to `main()` instead of calling `process.exit()` directly, so `await browser.close()` (in `main()`'s `finally`) always runs first — an early `process.exit()` from inside a mode function would otherwise leak a detached Chromium subprocess. No externally-visible behavior change; caught during this release's own real-browser test runs.
- **Documentation**: `README.md` gained a multi-route/multi-state usage note, a dependency-ecosystem-normalization note, and a "V1.2.1 validation" section; `--help` output for both `visual-qa.js` and `check-ui-dependencies.js` documents the new flags/behavior with examples.

### Unchanged in V1.2.1

The 13-phase design workflow (Phase 10 gained one sentence, not a restructure), the four-tier governance model, all `references/` including the five archetypes, `templates/DESIGN.md`'s neutral slot structure, `checklists/`, the managed-token-by-default / `--strict`-opt-in posture of `validate-design-tokens.js` (deliberately NOT made stricter by default — the evaluation's evidence supports consistency, not additional strictness), the non-drift invariant (no automatic-fix behavior was added for the shared-responsive-shell issue B/H/I's baselines and skilled runs both found — it remains something to record and surface, not silently fix), and `evals/evaluation-suite.md`'s Tests A–L success/failure conditions and scoring semantics (Test L gained a Setup checklist; no test's pass/fail bar changed). No new archetypes, no new component libraries, no new generic design rules, and no change to core philosophy.

## V1.2 — Plugin marketplace packaging

Pure repackaging release — no change to the skill's design philosophy, architecture, references, templates, scripts' behavior, checklists, or Tests A–L. Everything here is about *how the skill is distributed*, not what it does.

- **The skill's content now lives under `skills/ui-design-engineer/`** (`SKILL.md`, `references/`, `templates/`, `scripts/`, `checklists/`), instead of at the repository root. This is the layout Claude Code expects inside an installable plugin — a skill's files live at `skills/<skill-name>/` relative to the plugin root. `tests/` and `evals/` stay at the repo root, since they're this repository's own testing/documentation, not part of what gets installed.
- **Added `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`**, so this repository can be added directly as a Claude Code plugin marketplace:
  ```
  /plugin marketplace add HellboundGlory/ui-design-engineer
  /plugin install ui-design-engineer@ui-design-engineer-marketplace
  ```
  The manual-copy installation method (`cp -r .../skills/ui-design-engineer ...`) documented in `README.md` still works as an alternative — nothing about how the skill itself is discovered or used by an agent changed, only where its files live in this source repository.
- **Updated all internal and documentation cross-references** to the new layout: `tests/validate-repo.js`'s link-integrity checker now understands two path bases (skill-internal mentions resolve relative to `skills/ui-design-engineer/`; root-level doc mentions resolve relative to the repo root) and recognizes literal `node scripts/...` command examples as intentionally skill-relative rather than repo-root-relative. `README.md`'s doc-navigation mentions gained the `skills/ui-design-engineer/` prefix; its actual copy-paste command examples were deliberately left bare, matching how `SKILL.md` itself refers to its own bundled scripts. `CHANGELOG.md`'s historical entries (V1.1, V1.1.1 below) were deliberately left unchanged, since they correctly described paths as they were at the time each was written.
- **No functional changes** to any script, reference, template, or checklist. `tests/run-fixtures.js` (33 assertions) and `tests/run-playwright-integration.js` (21 assertions) both pass unchanged in substance, just pointed at the new location.

## V1.1.1 — Correctness patch

Small, narrow patch over V1.1 — same architecture, philosophy, references, templates, checklists, and Tests A–L. No new archetypes, libraries, or MCP integrations.

- **Cross-system UI architecture detection (the main fix — protects Test K).** `check-ui-dependencies.js` previously checked component systems (MUI, Mantine, Chakra, Fluent, Primer, Ant Design) and primitive engines (Radix, Base UI, React Aria, Headless UI) as separate categories, each only flagged when it had *more than one* package present in that same category. A project with exactly one of each — e.g. an existing MUI app that also picked up `components.json` (shadcn) and `@radix-ui/react-popover` — had one package per category and was invisible to that check. Added an explicit cross-system compatibility model: shadcn + Radix/Base UI is the expected, compatible pairing (never flagged); any monolithic component system (MUI/Mantine/Chakra/Fluent/Primer/Ant Design) paired with shadcn, or with any headless primitive engine, is now reported as `CONFLICT`. `--strict`, `--allow <system-or-package>`, and `ui-design-engineer.config.json` all work the same way against these findings as they already did for same-category ones.
- **`inspect-project.js` now reports every detected system, not just the first match.** Added `componentSystems`/`primitiveSystems` arrays alongside the existing `componentSystem`/`primitiveSystem` singular fields (kept for backwards compatibility, representing the primary/first match). A project with both MUI and shadcn present now shows both in `componentSystems`.
- **Undersized (<24px) interactive targets are now advisory (REVIEW), not a hard QA failure.** `visual-qa.js`'s target-size heuristic can't evaluate WCAG 2.2 2.5.8's real exceptions (inline text links, equivalent nearby targets, essential sizing), so it no longer fails the run on its own — it's reported for review. Cheaply excludes plain inline prose links (`<a>` at default `display: inline`) from the check. Other structural findings (broken images, missing alt, zero-size interactive elements, focus-obscured controls) remain hard failures.
- **A failed structural-check run is now reported as incomplete, never as a clean pass.** Previously, if the structural-check `page.evaluate()` call itself threw, the error was recorded in `report.json` but didn't affect the exit code or the "OK, no defects found" success message — a detector that couldn't run was indistinguishable from a detector that ran and found nothing. `report.json`'s `structural` block now carries an explicit `status: "ok" | "failed"`; a `"failed"` status is a hard failure (non-zero exit) and the success message is never printed alongside it.
- **Uncaught page runtime errors are now surfaced and fail QA.** `visual-qa.js` already captured Playwright's `pageerror` events but only wrote them to `report.json`; they're now printed in the CLI summary (bounded to the first 3, with a count of any remainder) and count as a hard failure. Console errors remain a softer, non-failing category (often noisy third-party output unrelated to the app's own defects).
- **Fixed misleading streaming-readiness wording in `SKILL.md`.** Phase 10 referred to "the default readiness mode's `networkidle` option," implying `networkidle` was still the default after V1.1 changed it to `load`. Reworded to state the default plainly and match `visual-qa.js --help`'s wording exactly.
- **Deterministic CI installs.** Added a committed `package-lock.json` for this repo's own test/CI dependencies (`playwright`, `axe-core`) and switched the `playwright-integration` CI job from `npm install` to `npm ci`. This doesn't change anything about using the skill itself — most scripts still run on Node's standard library alone, and `package.json`/`package-lock.json` exist only for this repository's own testing.
- **Regression coverage for all of the above**, including a new `tests/fixtures/existing-mui-with-shadcn/` fixture (protects the cross-system fix specifically) and three new routes on the Playwright integration fixture app (`/small-target-only`, `/page-error`, `/broken-structural-checks`) that deterministically exercise the target-size, page-error, and structural-check-failure paths in a real browser — not just argument parsing. `tests/run-fixtures.js` grew from 24 to 33 assertions; `tests/run-playwright-integration.js` grew from 9 to 21.

## V1.1 — Engineering robustness pass

Same design philosophy, architecture, and file structure as V1.0 (Product Context → User & Task Model → Information Architecture → Design Intent → Art Direction → Design System/DESIGN.md → Component Strategy → Implementation → Render → Accessibility + Visual Critique → Refine → Persist Design Memory; the Invariants/Defaults/Heuristics/Project Decisions governance; Tests A–L). This release strengthens the deterministic tooling underneath it — it does not redesign what the skill does.

### `scripts/visual-qa.js`

- Added configurable render readiness: `--wait-until load|domcontentloaded|networkidle` (default: `load`), `--wait-for <selector>`, and `--settle-ms <n>` (default: 300). Previously the script only used `networkidle`, which hangs/times out on apps with WebSockets, SSE, streaming responses, live logs, or polling — the network never goes idle. Default behavior no longer assumes a mostly-static page.
- axe-core scan is now scoped to explicit rule tags (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`) and `report.json` records the axe version, tags used, and an explicit disclaimer that this is an automated scan of a rule subset, not a WCAG 2.2 AA conformance test. Console output no longer reads as "0 axe violations = compliant."
- Added deterministic structural checks (separate from axe, separate from design-quality judgment): broken images, images missing `alt`, zero-size visible interactive elements, undersized (<24px) interactive hit targets, and focus-obscured controls (WCAG 2.4.11 — an element covered by something else, like a sticky header, at its own focus point).
- Added `--help` with full usage, options, exit codes, and streaming-app guidance.
- Exit codes clarified: `2` for invalid arguments, `3` for missing `playwright`/`axe-core`, `4` for a genuine crash (previously `2`/`3`/`4` were less consistently distinguished).

### `scripts/validate-design-tokens.js`

- Default mode now only validates that tokens DESIGN.md documents are implemented in the stylesheet ("managed tokens"). It no longer requires every CSS custom property in the app to be documented in DESIGN.md — that produced false positives on mature projects with legitimately unmanaged tokens (`--sidebar-width`, `--toast-z-index`, etc.).
- Added `--strict` for the previous exhaustive two-way comparison.
- Added token category classification (color/typography/spacing/radius/surface/status/chart/motion/other) for grouped, readable output, and an optional `--category <list>` filter.
- Added `--help`.

### `scripts/check-ui-dependencies.js`

- Findings are now labeled `OK` / `REVIEW` / `CONFLICT` / `ALLOWED EXCEPTION`. A detected component-system or primitive-engine conflict prints as `CONFLICT` but no longer fails the run by default — legitimate migrations, isolated legacy modules, and specialist functionality produce the same dependency shape as accidental drift, and treating all of them as a hard failure was too blunt.
- Added `--strict` (fails on an unresolved `CONFLICT`) for a CI gate, `--allow <package>` for an inline exception, and an optional `ui-design-engineer.config.json` (`allowUiDependencies: [{ name, reason }]`) for a persistent, reasoned exception.
- Primitive-engine detection is now namespace/prefix-aware (any `@radix-ui/*` package, not just `@radix-ui/react-dialog`) instead of keying off one representative package — a project using `@radix-ui/react-popover` alongside `@headlessui/react` is now correctly detected as a conflict, matching what `inspect-project.js` already did.
- Added `--help`.

### `scripts/audit-hardcoded-colors.js`

- Default scan now includes stylesheets (`.css`, `.scss`, and their `.module.*` variants) alongside component source (`.tsx`/`.ts`/`.jsx`/`.js`/`.vue`/`.svelte`) — a Sass-based or plain-CSS project gets the same audit coverage as a Tailwind-heavy one.
- Expanded the token/theme-file skip list (variables/palette files in addition to globals/theme/tokens files).
- Added `--help`, with an explicit documented limitation: this is a regex scan, not an AST/CSS parser, and cannot reliably distinguish a color inside a comment or string from one that's actually applied as a style.

### `scripts/inspect-project.js`

- Added `--help`. Detection logic (including prefix-based Radix detection) was already correct and is unchanged.

### New: `scripts/lib/cli-help.js`

Shared `--help` formatter used by all five scripts, so `node scripts/<name>.js --help` gives a consistent purpose/usage/options/exit-codes/examples format across the board — reinforcing the "call scripts as black-box tools, don't read their source" design.

### New: CI and tests

- `.github/workflows/ci.yml`: a fast `validate` job (script syntax, repo link/frontmatter checks, fixture-based script tests — no browser download) and a separate `playwright-integration` job (installs Chromium, runs a real end-to-end test against a streaming-app fixture).
- `tests/validate-repo.js`: SKILL.md frontmatter validity, internal link integrity across all markdown, DESIGN.md/adapter token consistency.
- `tests/run-fixtures.js`: 24 assertions exercising `inspect-project.js`, `check-ui-dependencies.js`, `audit-hardcoded-colors.js`, `validate-design-tokens.js`, and `visual-qa.js`'s argument handling against `tests/fixtures/`.
- `tests/run-playwright-integration.js` + `tests/fixtures/streaming-app/`: a real browser test proving the streaming-readiness fix actually works (not just that the flags parse) and that the new structural checks catch real, deliberately planted defects.
- Root `package.json` added (for this repo's own CI/test devDependencies only — not required to use the skill).

### New: `evals/results/`

Scaffold and template (`README.md`, `score-template.md`) for recording real A/B evaluation runs against `evals/evaluation-suite.md`'s Tests A–L. Starts empty — no runs have been performed or scored yet.

### Licensing

Added `LICENSE` (MIT) and a `license: MIT` field in `SKILL.md`'s frontmatter.

### Unchanged in V1.1

The 12-phase design workflow, the four-tier governance model, all `references/` (including the five archetypes), `templates/DESIGN.md`'s neutral slot structure, `templates/adapters/react-tailwind/globals.css`, `checklists/`, and `evals/evaluation-suite.md`'s Tests A–L are unchanged from V1.0. No new archetypes, no new UI library dependencies, no new MCP requirements, and shadcn's role (a reference-stack default for greenfield React, never mandatory, never introduced into an existing non-shadcn system) is unchanged.

## V1.0 — Initial release

Initial build from the *Architecture and Ecosystem Specification for a Portable AI UI/UX Agent Skill* research document. See `README.md`'s "Architecture decisions & deviations from the source research" section for what was built and where the implementation deviated from the source research, and why.
