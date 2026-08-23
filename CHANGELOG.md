# Changelog

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
