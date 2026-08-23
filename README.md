# ui-design-engineer

**V1.1** · [MIT licensed](LICENSE) · [Changelog](CHANGELOG.md)

A portable Agent Skill that turns a capable coding agent into a design-system-aware UI/UX design engineer: it reasons about product intent, information architecture, and visual identity before touching components, resists generic "AI slop" output, preserves an existing codebase's established visual language instead of drifting from it, and closes the loop with rendered visual QA and WCAG 2.2 AA accessibility auditing.

Built from the *Architecture and Ecosystem Specification for a Portable AI UI/UX Agent Skill* research document, following its Builder Handoff as the implementation baseline. V1.1 is an engineering-robustness pass over that same architecture — see `CHANGELOG.md` for what changed and why.

## Installation

This is a standard [Agent Skill](https://github.com/anthropics/skills) — a `SKILL.md` with bundled reference files, templates, scripts, and checklists. To install it for Claude Code:

```bash
# Project-scoped (recommended — keeps the skill with the project that uses it)
mkdir -p .claude/skills
cp -r /path/to/ui-design-engineer .claude/skills/ui-design-engineer

# OR user-scoped (available across all your projects)
mkdir -p ~/.claude/skills
cp -r /path/to/ui-design-engineer ~/.claude/skills/ui-design-engineer
```

Other Open Agent Skills-compatible tools (Codex CLI, Cursor, OpenCode, Gemini CLI) that support the `SKILL.md` standard should discover it the same way — check that tool's own skill-directory convention. Nothing in this skill's `SKILL.md` body is Claude-specific; only the exact installation path differs per tool.

No `npm install` is required to use the skill itself — `SKILL.md`, everything in `references/`, `templates/`, and `checklists/` is plain markdown/CSS read directly by the agent. The scripts in `scripts/` run on plain Node.js (no dependencies) with one exception: `scripts/visual-qa.js` needs `playwright` and `axe-core` installed in *your project* (not the skill) to do automated rendering/accessibility scanning — see Compatibility Notes below for what happens when they're absent.

This repo's own root `package.json` (`playwright`, `axe-core` as devDependencies) is only for *this skill's own* CI and tests (`tests/run-playwright-integration.js`) — it's not something a project installing the skill needs to run, and it isn't copied along with `scripts/`, `references/`, etc. when you install the skill into a project.

## Usage

Once installed, the skill activates automatically when a request involves building, redesigning, or polishing a UI — dashboards, admin panels, settings screens, landing pages, forms, design systems, or general "make this look better" requests. You don't need to invoke it by name.

Typical first run on a project:

```
"Build a developer observability dashboard for API error monitoring."
```

Expected behavior: the agent inspects the repo (`scripts/inspect-project.js`), reasons about the user/task model and information architecture before picking a visual direction, selects (or proposes) an archetype from `references/archetypes/`, creates or reads `DESIGN.md` at the project root, follows the component selection hierarchy in `references/component-selection.md`, implements in the project's actual detected stack, renders and screenshots the result if a rendering capability is available, checks accessibility, critiques its own output against `checklists/`, and records new decisions back into `DESIGN.md`.

On a second run against the same project, the agent should read the now-existing `DESIGN.md` and match its established tokens/archetype rather than re-deriving a fresh direction — this is what prevents visual drift across sessions.

## MCP / optional tool integration

None of this is required. The skill is designed to degrade gracefully:

| Capability | If an MCP is configured | If not |
|---|---|---|
| Component discovery | shadcn MCP / 21st.dev MCP | Falls back to the project's existing registry config, then the static selection hierarchy in `references/component-selection.md` |
| Browser rendering & screenshots | A Playwright/browser MCP | Falls back to `node scripts/visual-qa.js --url <dev-server-url>` (requires local `playwright`), then to a static code review |
| Accessibility audit | An axe-core MCP | Falls back to `scripts/visual-qa.js`'s bundled axe-core run, then to the manual `checklists/accessibility-audit.md` pass |
| Design token extraction | A Figma MCP | Falls back to a supplied token JSON, then manual entry into `DESIGN.md` |

To enable the local Playwright fallback for automated multi-viewport rendering and axe-core scanning:

```bash
npm install --save-dev playwright axe-core
npx playwright install chromium
node scripts/visual-qa.js --url http://localhost:3000
```

**Streaming / real-time apps** (WebSockets, SSE, streaming LLM responses, live log viewers, polling dashboards): the default readiness mode (`--wait-until load`) plus `--wait-for <selector>` and a short `--settle-ms` is the recommended combination — `--wait-until networkidle` will time out on an app whose network never goes idle. See `node scripts/visual-qa.js --help` for all readiness flags, and `references/dashboard-architecture.md` / the observability-style evals (Tests B, C) for why this matters for this skill specifically.

**On the axe-core scan**: it's an automated scan of a documented subset of WCAG 2.x A/AA rules (axe-core's own documentation estimates automated tools catch ~30-40% of real accessibility issues), not a WCAG 2.2 AA conformance test. `visual-qa.js`'s `report.json` records exactly which rule tags ran and says so explicitly — zero violations means zero *automated* violations. `checklists/accessibility-audit.md` covers the manual/structural checks that are still required.

## Compatibility notes

- **Reference stack**: React 19 + Tailwind CSS v4 + shadcn/ui (on Radix or Base UI) is the first-class, fully-worked implementation target — see `templates/adapters/react-tailwind/globals.css`.
- **Other stacks**: the design-intelligence layer (information architecture, visual hierarchy, color/typography reasoning, accessibility, anti-slop guidance, component selection *logic*) is framework-agnostic by construction — none of it assumes React. Vue/Nuxt, Svelte/SvelteKit, and vanilla HTML/CSS projects are fully supported for the reasoning layer; they just don't yet have a dedicated `templates/adapters/<stack>/` starter file the way React/Tailwind does. Add one following the pattern in `templates/adapters/react-tailwind/globals.css` — same semantic token names and roles, translated syntax — if your stack would benefit from it.
- **Existing non-shadcn design systems** (Mantine, MUI, Chakra, Fluent, Primer, custom/internal): explicitly and deliberately supported — `references/component-selection.md` instructs the agent to use and extend the existing system rather than introducing shadcn/Tailwind primitives alongside it. `scripts/check-ui-dependencies.js` reports it as `CONFLICT` if a second component system gets introduced anyway; by default that's a strong warning, not a blocking failure (see below), because legitimate migrations look the same from the outside as accidental drift — run with `--strict` to gate on it, or `--allow <package>` (or a `ui-design-engineer.config.json`) to mark a specific one as a reviewed exception.
- **Mature/existing projects and `validate-design-tokens.js`**: default mode only checks that the tokens DESIGN.md documents are actually implemented in the stylesheet — it does NOT require every CSS custom property in the app to be documented in DESIGN.md. Real projects have plenty of legitimately unmanaged tokens (`--sidebar-width`, `--toast-z-index`, component-local variables) that were never meant to be part of the design-token contract. Use `--strict` for the exhaustive two-way comparison.
- **Stylesheet scanning**: `scripts/audit-hardcoded-colors.js` scans component source (`.tsx`/`.ts`/`.jsx`/`.js`/`.vue`/`.svelte`) *and* stylesheets (`.css`/`.scss`, including CSS/Sass modules) by default — a Sass-based or plain-CSS project gets the same audit coverage as a Tailwind one.
- **`scripts/*.js`**: plain Node.js, no dependencies, tested against Node's built-in module set. `scripts/visual-qa.js` is the one exception — it requires `playwright` and `axe-core` in the *target project* and fails with a specific, actionable error (not a silent skip or a crash) when they're missing. Every script accepts `--help` and is meant to be called as a black-box tool — see `SKILL.md`'s "Deterministic checks" section.

## Continuous integration

`.github/workflows/ci.yml` runs on every push/PR to `main`, in two jobs:

- **`validate`** (fast, no browser download): script syntax (`node --check`), `tests/validate-repo.js` (SKILL.md frontmatter, internal link integrity, DESIGN.md/adapter token consistency), and `tests/run-fixtures.js` (fixture-based tests for `inspect-project.js`, `check-ui-dependencies.js`, `audit-hardcoded-colors.js`, `validate-design-tokens.js`, and `visual-qa.js`'s argument validation / missing-dependency behavior — no browser required).
- **`playwright-integration`** (separate, slower job): installs Playwright + Chromium and runs `tests/run-playwright-integration.js` against `tests/fixtures/streaming-app/` — a tiny fixture app that polls continuously (never goes network-idle) and has several deliberately planted defects. This is what proves, on every CI run, that `--wait-until networkidle` actually fails on a streaming app and that the recommended `--wait-until load --wait-for <selector>` combination actually succeeds and actually catches the planted defects — not just that the code compiles.

Run either locally: `npm test` (fast job) or `npm run test:playwright` (needs `npm install` + `npx playwright install chromium` first).

`tests/` (deterministic-machinery correctness) and `evals/` (design-quality benchmarking) test different things — see `evals/README.md`'s closing section for why both are kept, and why neither replaces the other.

## Known limitations

- `scripts/audit-hardcoded-colors.js` is a regex-based scanner, not a real CSS/JS parser — it can produce occasional false positives (e.g., a color value inside a comment or string that isn't actually applied as a style) and won't catch every possible way a color could be hardcoded (computed template strings, CSS-in-JS interpolation). Treat its findings as things to review, not an infallible gate.
- `scripts/check-ui-dependencies.js`'s "heavy dependency" list is a hand-maintained heuristic allowlist, not a real bundle analyzer — it doesn't know your project's actual tree-shaken bundle size. Use your bundler's own analyzer for real numbers; use this script to catch obvious category duplication and known-heavy packages early. Its CONFLICT/exception mechanism trusts `--allow` and `ui-design-engineer.config.json` entries at face value — it doesn't (and can't) verify the stated reason is actually true, only that someone documented one.
- `scripts/validate-design-tokens.js`'s category classification (color/typography/spacing/radius/surface/status/chart/motion/other) is a naming-pattern heuristic for readable grouping, not a schema — it doesn't gate which tokens count as "managed" (DESIGN.md actually documenting a token is what does that).
- `scripts/visual-qa.js` requires a dev server already running at the URL you give it — it does not start one for you, and does not know how to start an arbitrary project's dev server. Its focus-obscured check samples up to 40 focusable elements per viewport (bounded for runtime) rather than every one on a very large page.
- There is currently only one framework adapter (`templates/adapters/react-tailwind/`). Non-React projects get the full design-reasoning layer but not a ready-made starter stylesheet.
- The five archetypes are a curated starting set, not an exhaustive taxonomy of every product type — real products should feel free to blend or deviate from them, and the skill explicitly instructs this.
- Automated accessibility scanning (axe-core) catches an estimated 30-40% of real accessibility issues. `checklists/accessibility-audit.md` exists precisely because of this gap — automated-pass alone should never be reported as "fully accessible," and `visual-qa.js` no longer implies otherwise (see `report.json`'s `axe.disclaimer` field).
- `evals/results/` is an empty scaffold as of V1.1 — no real A/B evaluation runs have been recorded yet. Nothing in this repository should be read as a claim that the skill has been proven to improve output until real runs are stored there.

## Architecture decisions & deviations from the source research

This section documents the original V1.0 build against the source research; see `CHANGELOG.md` for what V1.1's engineering-robustness pass changed and why — V1.1 deliberately kept the architecture, philosophy, and file structure below intact and only strengthened the deterministic tooling.

The research document (Builder Handoff) is the baseline. Deviations made during implementation, and why:

- **Added `evals/` (not in the original directory listing).** The research's own "Agent Skill Evaluation Suite" and "Quantitative 100-Point Scoring Rubric" sections describe a full benchmark suite (Tests A–L) as a core deliverable, but the Builder Handoff's directory tree omitted a location for it. Added `evals/evaluation-suite.md` (all 12 tests) and `evals/README.md` (the rubric plus how to run it) rather than leaving this content undelivered or folding it awkwardly into `SKILL.md`, which would have bloated the always-loaded router file.
- **Added a root `README.md`** (this file) for installation/usage/compatibility/limitations documentation. `SKILL.md` is deliberately kept lean as an in-context router per the progressive-disclosure architecture; human-facing setup documentation doesn't belong in the same file competing for the same token budget.
- **DESIGN.md template gained `--accent-foreground`, `--ring`, and `--status-info` tokens** beyond the research's literal DESIGN.md v2 schema listing, to match the token set actually used in `templates/adapters/react-tailwind/globals.css`. This was caught by running `scripts/validate-design-tokens.js` against the template pair during self-verification — the tool doing its job. Kept the fix rather than leaving a known mismatch between the reference template and reference adapter.
- **Scripts are dependency-free by default, with `visual-qa.js` as the sole opt-in exception.** The research specifies Node.js scripts without mandating a dependency posture; making `inspect-project.js`, `validate-design-tokens.js`, `check-ui-dependencies.js`, and `audit-hardcoded-colors.js` run on Node's standard library alone (no `npm install` required to use the skill) directly serves the "must work without MCP servers" and portability requirements — a skill that needs its own `npm install` before its first script even runs would undercut that goal.

## Validation performed

Before treating this build as complete, the following was checked directly (not assumed):

- **File completeness**: every file in the Builder Handoff's directory listing exists, plus the `evals/` and root `README.md` additions noted above (verified via `find . -type f`).
- **Link integrity**: every `references/`, `templates/`, `scripts/`, `checklists/`, and `evals/` path mentioned anywhere in the skill's markdown was extracted and confirmed to resolve to a real file — zero broken references found.
- **YAML frontmatter**: `SKILL.md`'s frontmatter was parsed with a YAML parser to confirm it's valid (`name` + `description` present, no syntax errors).
- **SKILL.md conciseness**: 76 lines, well under the ~150-200 line target — detailed knowledge lives in `references/`, not the router.
- **Script correctness**: all five scripts pass `node --check` (syntax validity) and were each executed against a synthetic test case:
  - `inspect-project.js` — run against this repo, correctly reports no framework detected (accurate, since this is the skill's own source, not a target app).
  - `validate-design-tokens.js` — run against `templates/DESIGN.md` + `templates/adapters/react-tailwind/globals.css`, correctly identified the token mismatch described above.
  - `check-ui-dependencies.js` — run against a synthetic `package.json` with deliberate MUI+Chakra and date-fns+dayjs+moment conflicts; correctly flagged both as CONFLICT/REVIEW and exited non-zero.
  - `audit-hardcoded-colors.js` — run against a synthetic component with a hardcoded hex color and Tailwind palette utility; correctly flagged both and correctly left a semantic-token line unflagged.
  - `visual-qa.js` — run with no `playwright`/`axe-core` installed; correctly failed with a specific, actionable message and the documented fallback instructions rather than crashing or pretending to succeed.
- **Governance separation**: Invariants, Defaults, Heuristics, and Project Decisions are labeled explicitly and consistently across `SKILL.md` and the reference files, rather than collapsed into one undifferentiated rule list.
- **Non-shadcn preservation (Test K)**: `references/component-selection.md` explicitly instructs against introducing shadcn/Tailwind primitives into an existing Mantine/MUI/Chakra/Fluent/Primer/custom system, `SKILL.md` step 2 reinforces it during the inspection phase, and `check-ui-dependencies.js` mechanically flags a resulting conflict if it happens anyway.
- **MCP independence (Test L)**: the capability table in `SKILL.md` and this README defines a complete fallback chain for every capability, and `visual-qa.js`'s no-dependency failure mode was actually executed (not just described) to confirm it degrades honestly.
- **Self-critique against the research's own eval suite** (Tests A, H, J, K, L) was reasoned through explicitly against the finished reference files rather than skipped — see the design decisions above for the one fix this pass produced.

### V1.1 validation (engineering-robustness pass)

- **Real end-to-end proof, not just argument parsing**: `tests/run-playwright-integration.js` starts an actual fixture app (`tests/fixtures/streaming-app/`) that polls continuously and never goes network-idle, then runs `visual-qa.js` against it twice — confirming `--wait-until networkidle` genuinely times out on it, and confirming the new default (`load` + `--wait-for` + `--settle-ms`) genuinely succeeds *and* catches five deliberately planted defects (a broken image, a missing-alt image, a zero-size interactive element, an undersized hit target, and a focus-obscured control). This ran with a real Playwright + Chromium install, not a mock.
- **24 fixture-based assertions** (`tests/run-fixtures.js`) cover `inspect-project.js`'s stack detection, `check-ui-dependencies.js`'s OK/REVIEW/CONFLICT/ALLOWED-EXCEPTION behavior (including the `@radix-ui/react-popover` + `@headlessui/react` case — prefix-based Radix detection catching a conflict the old single-representative-package check would have missed), `audit-hardcoded-colors.js` across `.tsx`/`.module.scss` with correct skip behavior on token files, and `validate-design-tokens.js`'s lenient-vs-`--strict` split — all passing.
- **3 repo-level checks** (`tests/validate-repo.js`) confirm SKILL.md frontmatter validity, zero broken internal links, and DESIGN.md/adapter token consistency.
- **CI wired and green**: both GitHub Actions jobs (`validate`, `playwright-integration`) pass on this repository.
