# Handoff: V1.2.1 retest plan (read this cold, no prior context needed)

**Status as of 2026-08-25: NOT STARTED.** V1.2.1 shipped (commit history on `main`, `CHANGELOG.md`'s "V1.2.1 — Evidence-driven QA/tooling patch" entry) with full deterministic-test coverage (`npm test` + `npm run test:playwright`, all green — see that changelog entry for exact counts). What has **not** happened yet is re-running the three affected evals live, against a real dispatched worker, one at a time, in a genuinely clean environment. This file is the pickup point for that work in a fresh session with no memory of the implementation session.

## Why this file exists

`evals/results/2026-08-24-opencode-claude-v1.2.0/RESULTS.md` is the evidence base V1.2.1 was built from (read it first if you haven't — especially "Recommended Skill Changes" P1/P2 and the Test D/K/L sections). It recommends re-testing exactly three things after a patch like this, not a full A–L rerun (see that file's own "Next Evaluation Recommendation" #5 and the mission brief this session worked from, §14):

1. **Test D** (or a dedicated multi-state regression) — does `visual-qa.js --route`/`--scenario` actually help a *live worker* catch the tab-overflow-class bug, not just the deterministic fixture test (`tests/run-multistate-integration.js`, which already proves the mechanism works in isolation — this is about whether a worker actually reaches for it unprompted, or needs the new SKILL.md Phase 10 sentence to notice).
2. **Test K** / dependency-conflict checks — confirm the ecosystem-normalization fix (`check-ui-dependencies.js`) doesn't weaken the Test K gate, and ideally observe whether it actually reduces the "investigate a false alarm" busywork RESULTS.md documented in 5+/12 tests.
3. **Test L** — in a machine state that is *verifiably* clean this time. The V1.2.0 skilled run was contaminated by a stray `/tmp/opencode/qa-deps` cache (see RESULTS.md's Test L section) — only the baseline got a clean "no tooling" observation. This is the first opportunity to get a clean *skilled* Test L result.

Do these **one at a time**, not in parallel, and stop after each to decide whether the result changes anything before moving to the next. Do not attempt a full 12-test rerun — see RESULTS.md's own framing on not overstating an n-of-one/few comparison.

## Before touching anything

Read, in this order:
1. `CHANGELOG.md`'s V1.2.1 entry — what changed and the evidence citation for each change.
2. `evals/results/2026-08-24-opencode-claude-v1.2.0/RESULTS.md` — Test D, Test K, and Test L sections specifically (plus "High-Signal Tests" for D/K/L context), and "Recommended Skill Changes."
3. `evals/evaluation-suite.md`'s Test D, Test K, and Test L entries — Test L's now has an explicit environment-hygiene "Setup" checklist added in V1.2.1; follow it literally.
4. `evals/README.md` — scoring rubric and how to run an evaluation, plus its own Test L cross-reference.
5. This file, in full, before dispatching anything.

## Shared infrastructure already on disk

These seed repos exist locally from the V1.2.0 run and can be reused — do **not** create new ones unless a clean seed is genuinely unavailable:

- `/home/james/Downloads/Projects/ui-design-engineer-eval-seeds` — branch `seed-mantine` @ `f5679be` (Meridian, Mantine app — Test K's seed).
- `/home/james/Downloads/Projects/ui-design-engineer-eval-greenfield` — branch `test-d` @ `e4f0a0f` and branch `test-l` @ `e4f0a0f` (empty-commit greenfield seeds for D and L respectively).

Branches prefixed `eval-test-*` in both repos (e.g. `eval-test-d-claude`, `eval-test-k-baseline-claude`) are **already-used worktrees from the V1.2.0 run** — dirty, not clean starting points. For this retest, branch a **new** worktree/branch off the clean seed commits above (e.g. `eval-test-d-v121-claude`) so the V1.2.0 artifacts aren't disturbed and stay available for comparison.

The `ui-design-engineer` skill repo itself (this repo) is on `main`, and V1.2.1 should be committed and pushed before dispatching any worker against it — a worker needs to pick up the skill via its normal install/plugin path, which reads from `main`.

## Test-by-test plan

### 1. Test D retest (multi-state visual QA)

**Goal:** does a live worker, with the skill available, use `--route`/`--scenario` (or equivalent interactive QA) to catch a defect on a non-default tab/route, the way SKILL.md's Phase 10 now tells it to?

- Seed: fresh worktree/branch off `ui-design-engineer-eval-greenfield` branch `test-d` @ `e4f0a0f`.
- Prompt: same as `evaluation-suite.md`'s Test D ("Build a multi-tab application settings workspace covering Account Profile, API Key Management, Billing Plan, and Team Permissions.").
- Dispatch a fresh Claude Code worker (matching the V1.2.0 run's worker identity for a clean same-worker comparison — see RESULTS.md's own worker-identity caveats on Tests F and G for why this matters) with the skill available, full tool access (browser/Chrome MCP if available, or rely on `visual-qa.js` alone to specifically test the new flags).
- **What to look for**, beyond the normal scoring rubric: did the worker's own `visual-qa.js` invocation(s) use `--route` or `--scenario` at all? If it used interactive browser QA instead (a Chrome MCP session) to cover all four tabs, that's also a legitimate way to satisfy the new Phase 10 sentence — note which path it took. If it used neither and only rendered the default tab, that's a regression relative to the intent of this patch and worth flagging loudly, even if the worker happened to get lucky and the tab it skipped had no defect this time.
- Record under `evals/results/<new-date>-v1.2.1-retest/test-d/skilled/` following the existing directory convention (see the V1.2.0 results' `Artifact Index` section for the pattern: `worker-report.md`, screenshots/report.json, `DESIGN.md`, `git-diff.patch`).
- Compare against `evals/results/2026-08-24-opencode-claude-v1.2.0/test-d/skilled/` (the V1.2.0 skilled run, which caught the tab-overflow bug only via manual interactive QA, not an automated pass — that gap is exactly what this patch targets).

### 2. Test K retest (dependency ecosystem normalization)

**Goal:** confirm the false-positive fix doesn't weaken the critical non-drift gate, and see whether a live worker spends less time on "is this actually a conflict" investigation.

- Seed: fresh worktree/branch off `ui-design-engineer-eval-seeds` branch `seed-mantine` @ `f5679be`.
- Prompt: same as `evaluation-suite.md`'s Test K ("Add a major feature page to our application.").
- Dispatch with the skill available, same tool access as the V1.2.0 skilled Test K run (Chrome MCP available — see that run's own account for exact tool posture).
- **What to look for**: if the worker's feature reaches for a Mantine sibling package (e.g. `@mantine/dates`, matching the V1.2.0 run's own choice), does `check-ui-dependencies.js` correctly report it as the SAME ecosystem (no false CONFLICT), and does the worker's report show it spent less/no time investigating a non-issue compared to the V1.2.0 transcript? Separately and more importantly: if shadcn/Tailwind/Radix gets introduced (it shouldn't), confirm the CONFLICT still fires — this is the critical regression check, not just a nice-to-have.
- Record under `evals/results/<new-date>-v1.2.1-retest/test-k/skilled/`.
- Compare against `evals/results/2026-08-24-opencode-claude-v1.2.0/test-k/skilled/`.

### 3. Test L retest (genuinely clean environment)

**Goal:** get the first-ever clean *skilled* Test L observation (V1.2.0's skilled run was contaminated; only its baseline was clean).

- Seed: fresh worktree/branch off `ui-design-engineer-eval-greenfield` branch `test-l` @ `e4f0a0f`.
- **Before dispatching, follow `evaluation-suite.md`'s Test L "Setup" checklist literally** (added in V1.2.1) — this is the whole point of this retest:
  1. From the target project root, confirm both fail: `node -e "require('playwright')"` and `node -e "require('axe-core')"`.
  2. Search for and clear any shared/global cache that could make either resolvable outside the project's own `node_modules`. Check `/tmp/opencode/qa-deps` specifically (the known instance from the V1.2.0 run) — `rm -rf /tmp/opencode/qa-deps` if present — and also check for any other `/tmp/*/qa-deps`-shaped leftovers or a global npm cache/link that could leak in, given whatever dispatch tool is used this time.
  3. Confirm no MCP server (browser-rendering, component-discovery, or accessibility-audit) is configured for the worker before dispatch.
  4. Record the verified state (what was checked, what was found/cleared) in the run's own notes *before* dispatching — this record is what makes the result trustworthy, not just the score.
- Prompt: same as `evaluation-suite.md`'s Test L ("Design and implement a user interface for [any Test A-style request]" — the V1.2.0 run used a dashboard-shaped prompt; reuse that for comparability).
- Dispatch with the skill available and genuinely zero browser/MCP tooling per the checklist above.
- **What to look for**: does the worker correctly detect `visual-qa.js`'s missing-dependency failure (exit 3, the documented message) and degrade honestly through the fallback chain (the skill's `skills/ui-design-engineer/checklists/visual-qa-critique.md` and `skills/ui-design-engineer/checklists/accessibility-audit.md`) without ever fabricating or implying a screenshot/axe scan happened? This is the same bar the V1.2.0 baseline (uncontaminated) already cleared unassisted — the interesting question this retest answers is whether the *skilled* arm, with a genuinely clean environment this time, shows the skill adding value on top of that baseline honesty (token architecture, archetype-informed IA — see RESULTS.md's Test L section for what the baseline still lacked).
- Record under `evals/results/<new-date>-v1.2.1-retest/test-l/skilled/`, explicitly noting the environment-verification steps taken (per the checklist above) in the run's own metadata — this is the one test where the setup record matters as much as the score.
- Compare against **both** `evals/results/2026-08-24-opencode-claude-v1.2.0/test-l/skilled/` (contaminated — for reference only, not a fair comparison) and `evals/results/2026-08-24-opencode-claude-v1.2.0/test-l/baseline/` (genuinely clean, no skill — this is the real comparison point).

## After all three

- Update `evals/results/2026-08-24-opencode-claude-v1.2.0/RESULTS.md` or create a new dated results file (`evals/results/<new-date>-v1.2.1-retest/RESULTS.md`, following the existing convention) summarizing the three retest outcomes and whether they confirm the patch worked as intended. Do not edit the V1.2.0 file's own historical scores/findings — append/cross-reference, don't rewrite history (same principle CHANGELOG.md follows for past versions).
- Update this handoff file's "Status" line at the top, or delete it if all three are done and folded into a results file — don't leave a stale "NOT STARTED" sitting in the repo once it's wrong.
- Decide whether any further skill change is warranted based on what the retest actually shows — don't assume the V1.2.1 fixes worked just because the deterministic tests pass; deterministic tests prove the mechanism works, not that a live worker reaches for it correctly or that it changes real outcomes.
