# ui-design-engineer

A portable Agent Skill that turns a capable coding agent into a design-system-aware UI/UX design engineer: it reasons about product intent, information architecture, and visual identity before touching components, resists generic "AI slop" output, preserves an existing codebase's established visual language instead of drifting from it, and closes the loop with rendered visual QA and WCAG 2.2 AA accessibility auditing.

Built from the *Architecture and Ecosystem Specification for a Portable AI UI/UX Agent Skill* research document, following its Builder Handoff as the implementation baseline.

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

## Compatibility notes

- **Reference stack**: React 19 + Tailwind CSS v4 + shadcn/ui (on Radix or Base UI) is the first-class, fully-worked implementation target — see `templates/adapters/react-tailwind/globals.css`.
- **Other stacks**: the design-intelligence layer (information architecture, visual hierarchy, color/typography reasoning, accessibility, anti-slop guidance, component selection *logic*) is framework-agnostic by construction — none of it assumes React. Vue/Nuxt, Svelte/SvelteKit, and vanilla HTML/CSS projects are fully supported for the reasoning layer; they just don't yet have a dedicated `templates/adapters/<stack>/` starter file the way React/Tailwind does. Add one following the pattern in `templates/adapters/react-tailwind/globals.css` — same semantic token names and roles, translated syntax — if your stack would benefit from it.
- **Existing non-shadcn design systems** (Mantine, MUI, Chakra, Fluent, Primer, custom/internal): explicitly and deliberately supported — `references/component-selection.md` instructs the agent to use and extend the existing system rather than introducing shadcn/Tailwind primitives alongside it. `scripts/check-ui-dependencies.js` flags it as a hard conflict if a second component system gets introduced anyway.
- **`scripts/*.js`**: plain Node.js, no dependencies, tested against Node's built-in module set. `scripts/visual-qa.js` is the one exception — it requires `playwright` and `axe-core` in the *target project* and fails with a specific, actionable error (not a silent skip or a crash) when they're missing.

## Known limitations

- `scripts/audit-hardcoded-colors.js` is a regex-based scanner, not a real CSS/JS parser — it can produce occasional false positives (e.g., a color value inside a string that isn't actually a class name) and won't catch every possible way a color could be hardcoded (computed template strings, for instance). Treat its findings as things to review, not an infallible gate.
- `scripts/check-ui-dependencies.js`'s "heavy dependency" list is a hand-maintained heuristic allowlist, not a real bundle analyzer — it doesn't know your project's actual tree-shaken bundle size. Use your bundler's own analyzer for real numbers; use this script to catch obvious category duplication and known-heavy packages early.
- `scripts/visual-qa.js` requires a dev server already running at the URL you give it — it does not start one for you, and does not know how to start an arbitrary project's dev server.
- There is currently only one framework adapter (`templates/adapters/react-tailwind/`). Non-React projects get the full design-reasoning layer but not a ready-made starter stylesheet.
- The five archetypes are a curated starting set, not an exhaustive taxonomy of every product type — real products should feel free to blend or deviate from them, and the skill explicitly instructs this.
- Automated accessibility scanning (axe-core) catches an estimated 30-40% of real accessibility issues. `checklists/accessibility-audit.md` exists precisely because of this gap — automated-pass alone should never be reported as "fully accessible."

## Architecture decisions & deviations from the source research

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
