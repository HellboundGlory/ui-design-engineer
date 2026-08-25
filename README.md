# ui-design-engineer

**V1.2.1** · [MIT licensed](LICENSE) · [Changelog](CHANGELOG.md)

A portable Agent Skill that turns a capable coding agent into a design-system-aware UI/UX design engineer: it reasons about product intent, information architecture, and visual identity before touching components, resists generic "AI slop" output, preserves an existing codebase's established visual language instead of drifting from it, and closes the loop with rendered visual QA and WCAG 2.2 AA accessibility auditing.

Built from the *Architecture and Ecosystem Specification for a Portable AI UI/UX Agent Skill* research document, following its Builder Handoff as the implementation baseline. V1.1 was an engineering-robustness pass; V1.1.1 was a small correctness patch (most notably closing a gap where an existing MUI/Mantine/Chakra/etc. project that also picked up shadcn + Radix wasn't being flagged as a cross-system conflict); V1.2 repackaged the skill's content into `skills/ui-design-engineer/` so this repository is also installable as a Claude Code plugin marketplace; V1.2.1 is a small, evidence-driven QA/tooling patch based on the first complete paired A–L evaluation run (multi-route/multi-state visual QA, dependency-ecosystem normalization) — see `CHANGELOG.md` for the full history and `evals/results/2026-08-24-opencode-claude-v1.2.0/RESULTS.md` for the evidence.

## Installation

This is a standard [Agent Skill](https://github.com/anthropics/skills) — a `SKILL.md` with bundled reference files, templates, scripts, and checklists, packaged as a self-contained subdirectory (`skills/ui-design-engineer/`) so this same repository also works as a Claude Code plugin marketplace (see below).

### Option A — Claude Code plugin marketplace

```
/plugin marketplace add HellboundGlory/ui-design-engineer
/plugin install ui-design-engineer@ui-design-engineer-marketplace
```

This reads `.claude-plugin/marketplace.json` and `.claude-plugin/plugin.json` at the repo root and installs the skill for you — no manual file copying.

### Option B — manual copy

```bash
# Project-scoped (recommended — keeps the skill with the project that uses it)
mkdir -p .claude/skills
cp -r /path/to/ui-design-engineer/skills/ui-design-engineer .claude/skills/ui-design-engineer

# OR user-scoped (available across all your projects)
mkdir -p ~/.claude/skills
cp -r /path/to/ui-design-engineer/skills/ui-design-engineer ~/.claude/skills/ui-design-engineer
```

Copy the **nested** `skills/ui-design-engineer/` directory, not the whole repo — everything else (`tests/`, `evals/`, this README, CI config) is this repository's own development/testing scaffolding, not part of the skill itself.

Other Open Agent Skills-compatible tools (Codex CLI, Cursor, OpenCode, Gemini CLI) that support the `SKILL.md` standard should discover it the same way — check that tool's own skill-directory convention. Nothing in this skill's `SKILL.md` body is Claude-specific; only the exact installation path/mechanism differs per tool.

### A note on paths in this README

Everywhere below, a path like `skills/ui-design-engineer/scripts/visual-qa.js` means "relative to this repository's root" (useful for browsing the source or running the repo's own test suite). Once the skill is **installed**, its own scripts/references/templates/checklists live directly under wherever it was installed — e.g. `.claude/skills/ui-design-engineer/scripts/visual-qa.js` — without an extra nested `skills/ui-design-engineer/` layer. Shell command examples in this README that an agent would actually run (not just doc pointers) are written relative to the skill's own directory, matching how `SKILL.md` itself refers to its bundled scripts.

No `npm install` is required to use the skill itself — `SKILL.md`, everything in `skills/ui-design-engineer/references/`, `skills/ui-design-engineer/templates/`, and `skills/ui-design-engineer/checklists/` is plain markdown/CSS read directly by the agent. The scripts in `skills/ui-design-engineer/scripts/` run on plain Node.js (no dependencies) with one exception: `skills/ui-design-engineer/scripts/visual-qa.js` needs `playwright` and `axe-core` installed in *your project* (not the skill) to do automated rendering/accessibility scanning — see Compatibility Notes below for what happens when they're absent.

This repo's own root `package.json` (`playwright`, `axe-core` as devDependencies) is only for *this skill's own* CI and tests (`tests/run-playwright-integration.js`) — it's not something a project installing the skill needs to run, and it isn't copied along with `skills/ui-design-engineer/scripts/`, `skills/ui-design-engineer/references/`, etc. when you install the skill into a project.

## Usage

Once installed, the skill activates automatically when a request involves building, redesigning, or polishing a UI — dashboards, admin panels, settings screens, landing pages, forms, design systems, or general "make this look better" requests. You don't need to invoke it by name.

Typical first run on a project:

```
"Build a developer observability dashboard for API error monitoring."
```

Expected behavior: the agent inspects the repo (`skills/ui-design-engineer/scripts/inspect-project.js`), reasons about the user/task model and information architecture before picking a visual direction, selects (or proposes) an archetype from `skills/ui-design-engineer/references/archetypes/`, creates or reads `DESIGN.md` at the project root, follows the component selection hierarchy in `skills/ui-design-engineer/references/component-selection.md`, implements in the project's actual detected stack, renders and screenshots the result if a rendering capability is available, checks accessibility, critiques its own output against `skills/ui-design-engineer/checklists/`, and records new decisions back into `DESIGN.md`.

On a second run against the same project, the agent should read the now-existing `DESIGN.md` and match its established tokens/archetype rather than re-deriving a fresh direction — this is what prevents visual drift across sessions.

## MCP / optional tool integration

None of this is required. The skill is designed to degrade gracefully:

| Capability | If an MCP is configured | If not |
|---|---|---|
| Component discovery | shadcn MCP / 21st.dev MCP | Falls back to the project's existing registry config, then the static selection hierarchy in `skills/ui-design-engineer/references/component-selection.md` |
| Browser rendering & screenshots | A Playwright/browser MCP | Falls back to `node scripts/visual-qa.js --url <dev-server-url>` (requires local `playwright`), then to a static code review |
| Accessibility audit | An axe-core MCP | Falls back to `skills/ui-design-engineer/scripts/visual-qa.js`'s bundled axe-core run, then to the manual `skills/ui-design-engineer/checklists/accessibility-audit.md` pass |
| Design token extraction | A Figma MCP | Falls back to a supplied token JSON, then manual entry into `DESIGN.md` |

To enable the local Playwright fallback for automated multi-viewport rendering and axe-core scanning:

```bash
npm install --save-dev playwright axe-core
npx playwright install chromium
node scripts/visual-qa.js --url http://localhost:3000
```

**Streaming / real-time apps** (WebSockets, SSE, streaming LLM responses, live log viewers, polling dashboards): the default readiness mode (`--wait-until load`) plus `--wait-for <selector>` and a short `--settle-ms` is the recommended combination — `--wait-until networkidle` will time out on an app whose network never goes idle. See `node scripts/visual-qa.js --help` for all readiness flags, and `skills/ui-design-engineer/references/dashboard-architecture.md` / the observability-style evals (Tests B, C) for why this matters for this skill specifically.

**On the axe-core scan**: it's an automated scan of a documented subset of WCAG 2.x A/AA rules (axe-core's own documentation estimates automated tools catch ~30-40% of real accessibility issues), not a WCAG 2.2 AA conformance test. `visual-qa.js`'s `report.json` records exactly which rule tags ran and says so explicitly — zero violations means zero *automated* violations. `skills/ui-design-engineer/checklists/accessibility-audit.md` covers the manual/structural checks that are still required.

**On `visual-qa.js`'s structural findings**: broken images, missing alt text, zero-size interactive elements, and focus-obscured controls (WCAG 2.4.11) are hard failures. Undersized (<24px) interactive hit targets are reported as an advisory `REVIEW` finding, not a hard failure — WCAG 2.2's target-size criterion (2.5.8) has real exceptions (inline text links, an equivalent nearby target, essential sizing) that a DOM-size heuristic can't fully evaluate, so an undersized target alone never fails the run. Uncaught page runtime errors are surfaced in the CLI summary and are a hard failure; console errors stay a softer, non-failing category since apps often emit noisy third-party console output unrelated to their own defects. If the structural-check step itself fails to run, that's reported as an incomplete QA pass (non-zero exit) — never as "no defects found."

**On multi-route / multi-state coverage (V1.2.1)**: a single render at one URL structurally cannot see a defect that only exists on a second tab, route, or interaction state of a client-rendered SPA — this is a real, evidenced gap (see `evals/results/2026-08-24-opencode-claude-v1.2.0/RESULTS.md`'s Test D). `node scripts/visual-qa.js --url <url> --route / --route /settings --route /settings/billing` navigates and captures each route independently; `--scenario <file>` (a small JSON list of named `click`/`waitFor`/`fill`/`press`/`select` states — deliberately not a general browser-automation DSL) reaches interaction states that live at one URL, like a tab-switched settings page. Either flag switches `report.json` to a `states[]`-grouped shape (`mode: "multi-state"`) with per-state screenshots under `<out>/<state-name>/`; a route/state that can't be reached is recorded `"incomplete"` and always causes a non-zero exit — QA that never reached a requested state is never a clean pass. Neither flag is required: plain `--url` usage is unchanged (`mode: "single"`, the original flat `viewports[]` report shape). See `node scripts/visual-qa.js --help` for the scenario file schema.

## Compatibility notes

- **Reference stack**: React 19 + Tailwind CSS v4 + shadcn/ui (on Radix or Base UI) is the first-class, fully-worked implementation target — see `skills/ui-design-engineer/templates/adapters/react-tailwind/globals.css`.
- **Other stacks**: the design-intelligence layer (information architecture, visual hierarchy, color/typography reasoning, accessibility, anti-slop guidance, component selection *logic*) is framework-agnostic by construction — none of it assumes React. Vue/Nuxt, Svelte/SvelteKit, and vanilla HTML/CSS projects are fully supported for the reasoning layer; they just don't yet have a dedicated `skills/ui-design-engineer/templates/adapters/<stack>/` starter file the way React/Tailwind does. Add one following the pattern in `skills/ui-design-engineer/templates/adapters/react-tailwind/globals.css` — same semantic token names and roles, translated syntax — if your stack would benefit from it.
- **Existing non-shadcn design systems** (Mantine, MUI, Chakra, Fluent, Primer, Ant Design, custom/internal): explicitly and deliberately supported — `skills/ui-design-engineer/references/component-selection.md` instructs the agent to use and extend the existing system rather than introducing shadcn/Tailwind primitives alongside it. `skills/ui-design-engineer/scripts/check-ui-dependencies.js` reports it as `CONFLICT` if a second component system gets introduced anyway — including a **cross-system** conflict where an existing monolithic system (MUI, Mantine, Chakra, Fluent, Primer, Ant Design) picks up shadcn and/or a headless primitive engine (Radix, Base UI, React Aria, Headless UI) alongside it, even though each side has only one package and so wouldn't trip a same-category duplicate check on its own. shadcn built on Radix or Base UI — the pairing it's actually designed for — is never flagged. By default a conflict is a strong warning, not a blocking failure (see below); run with `--strict` to gate on it, or `--allow <system-or-package>` (or a `ui-design-engineer.config.json`) to mark a specific one as a reviewed exception. `skills/ui-design-engineer/scripts/inspect-project.js` reports every detected system in `componentSystems`/`primitiveSystems` arrays (not just the first match) so this is visible before it becomes a conflict.
- **Dependency-ecosystem normalization (V1.2.1)**: `check-ui-dependencies.js` now normalizes sibling packages from one namespace (`@radix-ui/react-dialog` + `@radix-ui/react-popover` + `@radix-ui/react-tooltip`, or `@mantine/core` + `@mantine/hooks` + `@mantine/form`) into a single detected ecosystem *before* deciding whether there's a conflict — the paired evaluation found this was the single most common source of wasted "investigate a false alarm" work (5+ of 12 tests). A same-category finding now only fires when **more than one distinct ecosystem** is present; a real cross-system pairing (Mantine + Radix, MUI + shadcn, etc.) still fires exactly as before — this is a false-positive fix, not a weakening of the conflict logic Test K depends on.
- **Mature/existing projects and `validate-design-tokens.js`**: default mode only checks that the tokens DESIGN.md documents are actually implemented in the stylesheet — it does NOT require every CSS custom property in the app to be documented in DESIGN.md. Real projects have plenty of legitimately unmanaged tokens (`--sidebar-width`, `--toast-z-index`, component-local variables) that were never meant to be part of the design-token contract. Use `--strict` for the exhaustive two-way comparison.
- **Stylesheet scanning**: `skills/ui-design-engineer/scripts/audit-hardcoded-colors.js` scans component source (`.tsx`/`.ts`/`.jsx`/`.js`/`.vue`/`.svelte`) *and* stylesheets (`.css`/`.scss`, including CSS/Sass modules) by default — a Sass-based or plain-CSS project gets the same audit coverage as a Tailwind one.
- **`skills/ui-design-engineer/scripts/*.js`**: plain Node.js, no dependencies, tested against Node's built-in module set. `skills/ui-design-engineer/scripts/visual-qa.js` is the one exception — it requires `playwright` and `axe-core` in the *target project* and fails with a specific, actionable error (not a silent skip or a crash) when they're missing. Every script accepts `--help` and is meant to be called as a black-box tool — see `SKILL.md`'s "Deterministic checks" section.

## Continuous integration

`.github/workflows/ci.yml` runs on every push/PR to `main`, in two jobs:

- **`validate`** (fast, no browser download): script syntax (`node --check`), `tests/validate-repo.js` (SKILL.md frontmatter, internal link integrity, DESIGN.md/adapter token consistency), and `tests/run-fixtures.js` (fixture-based tests for `inspect-project.js`, `check-ui-dependencies.js`, `audit-hardcoded-colors.js`, `validate-design-tokens.js`, and `visual-qa.js`'s argument validation / missing-dependency behavior — no browser required).
- **`playwright-integration`** (separate, slower job): installs Playwright + Chromium via `npm ci` (deterministic — resolved against the committed `package-lock.json`, not a fresh `npm install` each run) and runs `tests/run-playwright-integration.js` against `tests/fixtures/streaming-app/`'s several routes, then `tests/run-multistate-integration.js` against `tests/fixtures/tabbed-app/`. The first proves, in a real browser, that `--wait-until networkidle` actually fails on a streaming app and `load` + `--wait-for` succeeds; that a genuinely undersized target alone doesn't fail the run while broken images/missing alt/zero-size/focus-obscured controls do; that an uncaught page error fails the run; and that a failed structural-check run is reported as incomplete rather than a false "OK." The second proves the V1.2.1 multi-route/multi-state fix: legacy single-page usage is byte-for-byte unchanged, a `--scenario`-reached tab's real defect is caught even though it's invisible to a default-tab-only capture, `--route` captures multiple routes without overwriting each other's screenshots, and an unreachable requested state is reported incomplete with a non-zero exit rather than silently passing.

Run either locally: `npm test` (fast job) or `npm run test:playwright` (needs `npm ci` + `npx playwright install chromium` first).

`tests/` (deterministic-machinery correctness) and `evals/` (design-quality benchmarking) test different things — see `evals/README.md`'s closing section for why both are kept, and why neither replaces the other.

## Known limitations

- `skills/ui-design-engineer/scripts/audit-hardcoded-colors.js` is a regex-based scanner, not a real CSS/JS parser — it can produce occasional false positives (e.g., a color value inside a comment or string that isn't actually applied as a style) and won't catch every possible way a color could be hardcoded (computed template strings, CSS-in-JS interpolation). Treat its findings as things to review, not an infallible gate.
- `skills/ui-design-engineer/scripts/check-ui-dependencies.js`'s "heavy dependency" list is a hand-maintained heuristic allowlist, not a real bundle analyzer — it doesn't know your project's actual tree-shaken bundle size. Use your bundler's own analyzer for real numbers; use this script to catch obvious category duplication and known-heavy packages early. Its CONFLICT/exception mechanism trusts `--allow` and `ui-design-engineer.config.json` entries at face value — it doesn't (and can't) verify the stated reason is actually true, only that someone documented one.
- `skills/ui-design-engineer/scripts/validate-design-tokens.js`'s category classification (color/typography/spacing/radius/surface/status/chart/motion/other) is a naming-pattern heuristic for readable grouping, not a schema — it doesn't gate which tokens count as "managed" (DESIGN.md actually documenting a token is what does that).
- `skills/ui-design-engineer/scripts/visual-qa.js` requires a dev server already running at the URL you give it — it does not start one for you, and does not know how to start an arbitrary project's dev server. Its focus-obscured check samples up to 40 focusable elements per viewport (bounded for runtime) rather than every one on a very large page.
- There is currently only one framework adapter (`skills/ui-design-engineer/templates/adapters/react-tailwind/`). Non-React projects get the full design-reasoning layer but not a ready-made starter stylesheet.
- The five archetypes are a curated starting set, not an exhaustive taxonomy of every product type — real products should feel free to blend or deviate from them, and the skill explicitly instructs this.
- Automated accessibility scanning (axe-core) catches an estimated 30-40% of real accessibility issues. `skills/ui-design-engineer/checklists/accessibility-audit.md` exists precisely because of this gap — automated-pass alone should never be reported as "fully accessible," and `visual-qa.js` no longer implies otherwise (see `report.json`'s `axe.disclaimer` field).
- `evals/results/2026-08-24-opencode-claude-v1.2.0/RESULTS.md` holds the first complete, paired (skilled vs. baseline) run of all 12 tests, against skill V1.2.0. V1.2.1's changes are a direct response to that evidence — see `CHANGELOG.md`. Treat it as a single evaluation session's worth of evidence, not a large-sample trend (see the results file's own framing); nothing in this repository should be read as a claim beyond what that document itself supports.

## Architecture decisions & deviations from the source research

This section documents the original V1.0 build against the source research; see `CHANGELOG.md` for what V1.1's engineering-robustness pass changed and why — V1.1 deliberately kept the architecture, philosophy, and file structure below intact and only strengthened the deterministic tooling.

The research document (Builder Handoff) is the baseline. Deviations made during implementation, and why:

- **Added `evals/` (not in the original directory listing).** The research's own "Agent Skill Evaluation Suite" and "Quantitative 100-Point Scoring Rubric" sections describe a full benchmark suite (Tests A–L) as a core deliverable, but the Builder Handoff's directory tree omitted a location for it. Added `evals/evaluation-suite.md` (all 12 tests) and `evals/README.md` (the rubric plus how to run it) rather than leaving this content undelivered or folding it awkwardly into `SKILL.md`, which would have bloated the always-loaded router file.
- **Added a root `README.md`** (this file) for installation/usage/compatibility/limitations documentation. `SKILL.md` is deliberately kept lean as an in-context router per the progressive-disclosure architecture; human-facing setup documentation doesn't belong in the same file competing for the same token budget.
- **DESIGN.md template gained `--accent-foreground`, `--ring`, and `--status-info` tokens** beyond the research's literal DESIGN.md v2 schema listing, to match the token set actually used in `skills/ui-design-engineer/templates/adapters/react-tailwind/globals.css`. This was caught by running `skills/ui-design-engineer/scripts/validate-design-tokens.js` against the template pair during self-verification — the tool doing its job. Kept the fix rather than leaving a known mismatch between the reference template and reference adapter.
- **Scripts are dependency-free by default, with `visual-qa.js` as the sole opt-in exception.** The research specifies Node.js scripts without mandating a dependency posture; making `inspect-project.js`, `validate-design-tokens.js`, `check-ui-dependencies.js`, and `audit-hardcoded-colors.js` run on Node's standard library alone (no `npm install` required to use the skill) directly serves the "must work without MCP servers" and portability requirements — a skill that needs its own `npm install` before its first script even runs would undercut that goal.

## Validation performed

Before treating this build as complete, the following was checked directly (not assumed):

- **File completeness**: every file in the Builder Handoff's directory listing exists, plus the `evals/` and root `README.md` additions noted above (verified via `find . -type f`).
- **Link integrity**: every `skills/ui-design-engineer/references/`, `skills/ui-design-engineer/templates/`, `skills/ui-design-engineer/scripts/`, `skills/ui-design-engineer/checklists/`, and `evals/` path mentioned anywhere in the skill's markdown was extracted and confirmed to resolve to a real file — zero broken references found.
- **YAML frontmatter**: `SKILL.md`'s frontmatter was parsed with a YAML parser to confirm it's valid (`name` + `description` present, no syntax errors).
- **SKILL.md conciseness**: 76 lines, well under the ~150-200 line target — detailed knowledge lives in `skills/ui-design-engineer/references/`, not the router.
- **Script correctness**: all five scripts pass `node --check` (syntax validity) and were each executed against a synthetic test case:
  - `inspect-project.js` — run against this repo, correctly reports no framework detected (accurate, since this is the skill's own source, not a target app).
  - `validate-design-tokens.js` — run against `skills/ui-design-engineer/templates/DESIGN.md` + `skills/ui-design-engineer/templates/adapters/react-tailwind/globals.css`, correctly identified the token mismatch described above.
  - `check-ui-dependencies.js` — run against a synthetic `package.json` with deliberate MUI+Chakra and date-fns+dayjs+moment conflicts; correctly flagged both as CONFLICT/REVIEW and exited non-zero.
  - `audit-hardcoded-colors.js` — run against a synthetic component with a hardcoded hex color and Tailwind palette utility; correctly flagged both and correctly left a semantic-token line unflagged.
  - `visual-qa.js` — run with no `playwright`/`axe-core` installed; correctly failed with a specific, actionable message and the documented fallback instructions rather than crashing or pretending to succeed.
- **Governance separation**: Invariants, Defaults, Heuristics, and Project Decisions are labeled explicitly and consistently across `SKILL.md` and the reference files, rather than collapsed into one undifferentiated rule list.
- **Non-shadcn preservation (Test K)**: `skills/ui-design-engineer/references/component-selection.md` explicitly instructs against introducing shadcn/Tailwind primitives into an existing Mantine/MUI/Chakra/Fluent/Primer/custom system, `SKILL.md` step 2 reinforces it during the inspection phase, and `check-ui-dependencies.js` mechanically flags a resulting conflict if it happens anyway.
- **MCP independence (Test L)**: the capability table in `SKILL.md` and this README defines a complete fallback chain for every capability, and `visual-qa.js`'s no-dependency failure mode was actually executed (not just described) to confirm it degrades honestly.
- **Self-critique against the research's own eval suite** (Tests A, H, J, K, L) was reasoned through explicitly against the finished reference files rather than skipped — see the design decisions above for the one fix this pass produced.

### V1.1 validation (engineering-robustness pass)

- **Real end-to-end proof, not just argument parsing**: `tests/run-playwright-integration.js` starts an actual fixture app (`tests/fixtures/streaming-app/`) that polls continuously and never goes network-idle, then runs `visual-qa.js` against it twice — confirming `--wait-until networkidle` genuinely times out on it, and confirming the new default (`load` + `--wait-for` + `--settle-ms`) genuinely succeeds *and* catches five deliberately planted defects (a broken image, a missing-alt image, a zero-size interactive element, an undersized hit target, and a focus-obscured control). This ran with a real Playwright + Chromium install, not a mock.
- **24 fixture-based assertions** (`tests/run-fixtures.js`) cover `inspect-project.js`'s stack detection, `check-ui-dependencies.js`'s OK/REVIEW/CONFLICT/ALLOWED-EXCEPTION behavior (including the `@radix-ui/react-popover` + `@headlessui/react` case — prefix-based Radix detection catching a conflict the old single-representative-package check would have missed), `audit-hardcoded-colors.js` across `.tsx`/`.module.scss` with correct skip behavior on token files, and `validate-design-tokens.js`'s lenient-vs-`--strict` split — all passing.
- **3 repo-level checks** (`tests/validate-repo.js`) confirm SKILL.md frontmatter validity, zero broken internal links, and DESIGN.md/adapter token consistency.
- **CI wired and green**: both GitHub Actions jobs (`validate`, `playwright-integration`) pass on this repository.

### V1.1.1 validation (correctness patch)

- **The Test K gap is closed and directly tested**: `tests/fixtures/existing-mui-with-shadcn/` (MUI + shadcn's `components.json` + `@radix-ui/react-popover`) confirms `inspect-project.js` reports both `mui` and `shadcn` in `componentSystems` and `radix` in `primitiveSystems`, and `check-ui-dependencies.js` reports both cross-system pairings as `CONFLICT` — non-blocking by default, exits 1 with `--strict`, resolves to `ALLOWED EXCEPTION` with `--allow mui`. A separate assertion confirms shadcn+Radix alone (the expected pairing) is never flagged, on both this fixture and the pre-existing greenfield one.
- **The three visual-qa.js behavior changes were each proven in a real browser**, not just by reading the code: a genuinely undersized target with no other defects exits 0 (advisory only); an uncaught page error is surfaced in the CLI output and exits 1; a structural-check run forced to throw (by overriding `document.querySelectorAll` for exactly one call, isolated so it doesn't also break axe's own internal DOM scan) is reported as incomplete and exits 1, never printing the clean-pass message.
- `tests/run-fixtures.js` grew from 24 to 33 assertions; `tests/run-playwright-integration.js` grew from 9 to 21 — all passing, alongside the full pre-existing V1.1 suite (no regressions).
- **CI wired and green on this patch too**: both jobs pass with the new `npm ci` install step against the committed `package-lock.json`.

### V1.2.1 validation (evidence-driven QA/tooling patch)

- **The Test D gap is closed and directly tested, in a real browser**: `tests/run-multistate-integration.js` against `tests/fixtures/tabbed-app/` (a clean default "Account" tab; a "Billing" tab, reached only via a scenario click, that overflows horizontally) confirms legacy single-page usage never sees the Billing tab's defect (reproducing the exact blind spot Test D's evaluation found), while `--scenario` reaches it and reports it as a hard failure with a non-zero exit; a deliberately unreachable scenario state is reported `"incomplete"` (never a silent pass); `--route` captures two independent routes into non-overwriting screenshot files.
- **The dependency-ecosystem fix was proven against both the false-positive and the real-conflict cases**: new fixtures (`dependency-radix-siblings/`, `dependency-mantine-siblings/`, `dependency-mantine-with-radix/`) confirm three `@radix-ui/*` (or `@mantine/*`) sibling packages normalize to one ecosystem and never conflict, even with `--strict`, while a genuine cross-system pairing (Mantine + Radix) still reports `CONFLICT` and still fails `--strict`. The pre-existing V1.1.1 Test K regression fixture (`existing-mui-with-shadcn/`) was re-run unchanged and still fails `--strict` exactly as before — the false-positive fix does not weaken the real-conflict gate.
- `tests/run-fixtures.js` grew from 33 to 38 assertions; a new `tests/run-multistate-integration.js` (15 assertions, real-browser) joins `tests/run-playwright-integration.js` (21 assertions, unchanged) under `npm run test:playwright` — all passing, no regressions in the pre-existing suite.
- **`process.exit()` ordering was corrected** during this pass: `visual-qa.js`'s two run modes now return an exit code to `main()` rather than calling `process.exit()` directly, so the browser is always closed (`await browser.close()`) before the process exits in every mode — avoiding a detached Chromium subprocess leak that an early `process.exit()` inside a mode function would otherwise cause.
- **CI wired and green on this patch too**: both jobs pass, with `playwright-integration` now running both integration suites.
