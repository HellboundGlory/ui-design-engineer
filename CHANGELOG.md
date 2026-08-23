# Changelog

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
