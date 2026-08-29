# V1.2.1 retest — results

Retest of the three items `evals/HANDOFF-V1.2.1-RETEST.md` called for after the
V1.2.1 "evidence-driven QA/tooling patch" (see `CHANGELOG.md`). Dispatched one
test at a time per that handoff's instruction, each as a real Claude Code
worker in its own Orca worktree, skill available, no baseline re-run (compared
against the existing V1.2.0 skilled/baseline artifacts instead). Seed note:
the original `seed-mantine`/`test-d`/`test-l` seeds referenced by the handoff
were deleted in an unrelated cleanup on 2026-08-26 and rebuilt fresh before
this retest — see `ui-design-engineer-eval-greenfield`'s and
`ui-design-engineer-eval-seeds`' READMEs.

## Test D retest (multi-state visual QA)

**Worktree:** `ui-design-engineer-eval-greenfield` branch `eval-test-d-v121-claude`, off seed branch `test-d` @ `6c02977`.
**Prompt:** identical to `evaluation-suite.md`'s Test D, no mention of QA methodology (so as not to bias the thing being tested).
**Runtime:** ~30 min, self-terminated cleanly (no safety-cap truncation).

**Result: PASS — clear improvement over V1.2.0.** The worker invoked
`scripts/visual-qa.js` with all four routes at once
(`report.json`'s `requested.routes: ["/account","/api-keys","/billing","/team"]`,
confirmed directly from the tool's own output, not just claimed in its
report) across all 4 viewports, twice (before/after fixes) — see
`test-d/skilled/visual-qa-before-fixes/` and `visual-qa-final/`. This is
exactly the gap V1.2.1's SKILL.md Phase 10 sentence targeted: the V1.2.0
skilled run's own report states `visual-qa.js` "only renders one route" /
"only loads the default route of a client-side SPA," and its one real
cross-tab bug (a table-overflow clip on the API Keys/Team/Billing tabs) was
only caught by manual interactive browser MCP QA, not the automated tool
(`evals/results/2026-08-24-opencode-claude-v1.2.0/test-d/skilled/worker-report.md`
lines 46, 68, 75).

This run's automated multi-route pass caught two real, route-specific defects
unprompted:
1. The Team Permissions role `<Select>` leaked its two-line dropdown content
   into the closed trigger, overlapping neighboring table rows — only
   reachable by rendering `/team` specifically.
2. A Chromium horizontal-overflow quirk that only manifested at 375px on
   certain routes.

Both were fixed and re-verified in the same session (see `DESIGN.md` §21 in
the results dir). The worker also independently caught and fixed its own use
of Inter — named in the skill's own anti-pattern catalog — swapping to Karla
with reasoning logged in `DESIGN.md` §6, unprompted by this retest.

Architectural note: this run's app uses real routed pages (`/account`,
`/api-keys`, etc.) rather than V1.2.0's client-side tab-switching SPA — the
worker's own design choice, not something the retest specified. That
happens to make `--route` more directly applicable than it would be for a
single-route tab-switcher, so this is a strong but not fully
apples-to-apples comparison; a client-side-tabs implementation would be a
better test of whether `--scenario` (rather than `--route`) gets reached for
in that shape. Worth another data point if a future run produces a
tab-switching SPA again.

**Artifacts:** `test-d/skilled/worker-report.md`, `DESIGN.md`,
`git-diff.patch`, `git-status.txt`, `git-diff-stat.txt`,
`visual-qa-before-fixes/` (4 routes × 4 viewports), `visual-qa-final/` (same).

---

## Test K retest (existing non-shadcn design system)

**Worktree:** `ui-design-engineer-eval-seeds` branch `eval-test-k-v121-claude`, off seed branch `seed-mantine` @ `bbd2252` (the rebuilt "Meridian" app — see seed note above; this seed does not have `playwright`/`axe-core` installed, unlike the original V1.2.0 `seed-mantine`, which is a real environment difference from the original run, not a retest variable).
**Prompt:** "Add a major feature page to our application," plus generic explore-first/write-a-worker-report framing — no mention of the design-system or dependency-drift check being the thing under test.
**Runtime:** ~3 min.

**Result: PASS on the primary gating condition, with one honest but incomplete QA gap.**

The worker built a **Team** page (`/team`, staffing/workload view) reusing
`StatCard`/`StatusBadge`/`Card`/`Avatar`/`Progress` and the existing
`meridian`/`slate` theme colors throughout — no new npm dependencies, zero
`package.json` changes (confirmed directly via `git diff --cached --stat`,
not just the worker's own claim). Independently re-ran the same two checks
the V1.2.0 evaluator used:

- `scripts/check-ui-dependencies.js` → `OK: "component-system" — detected
  ecosystem: mantine`, correctly treating `@mantine/dates` and
  `@mantine/notifications` (pre-existing, unused-by-this-feature sibling
  packages) as part of the same ecosystem rather than flagging a false
  conflict — this was an open question from the original handoff and is now
  answered: no false positive.
- `scripts/audit-hardcoded-colors.js` → clean on the new file.

The named critical failure condition (introducing shadcn/ui, Tailwind, or
Radix alongside Mantine) was **not triggered**. Code review of
`src/pages/Team.tsx` found no bugs (capacity is never 0 in the seed data, so
the utilization-bar division is safe; `slate` is a real theme color, not a
typo).

**The QA gap:** the worker reported it "couldn't take a live screenshot
because the Claude-in-Chrome browser extension wasn't connected in this
environment" and fell back to `tsc -b` + `oxlint` + a production build only —
it never attempted `scripts/visual-qa.js` itself, so it never saw that
script's own graceful-failure/fallback-chain message, and didn't
cite the static reference tables or `checklists/` the skill documents for
this situation. This is a materially different scenario from Test D: there,
automated multi-route visual QA ran and worked. Here it didn't run at all.
Two contributing factors, disentangled:
1. **Environment**: independently confirmed (`node -e "require.resolve('playwright')"` from this worktree, and my own session's Chrome MCP tool returning the same "extension not connected" state the worker saw) that this is a genuine tooling gap, not a fabrication — `playwright` is not installed in this rebuilt seed app, and the Chrome extension was in fact disconnected for me too when I tried to verify visually myself. The original V1.2.0 `seed-mantine` apparently *did* have `playwright`/`axe-core` available (its skilled run got a real 4-viewport axe+contrast scan) — my rebuilt seed does not include those dependencies, so this retest's environment is stricter than V1.2.0's was for Test K specifically, an artifact of the rebuild rather than of V1.2.1.
2. **Worker behavior**: given the gap was real, the worker's degradation was honest (no fabricated screenshot claim, explicit statement of what was and wasn't verified) but incomplete relative to what Test L's own success condition asks for in this exact situation — it didn't demonstrate hitting `visual-qa.js`'s documented graceful failure or consult the fallback chain, so this run doesn't cleanly demonstrate the fallback-chain behavior either way.

**Verdict:** Test K's own primary gate (design-system non-drift) is a clear
**PASS**, evaluator-verified three independent ways. The QA-degradation
behavior is a secondary, inconclusive data point caused by my seed rebuild
missing dependencies the original had — not a finding about the skill
itself. If this matters going forward, the fix is to add `playwright` +
`axe-core` as devDependencies to `seed-mantine` (restoring V1.2.0 parity) or
to explicitly treat this as a second, informal Test-L-shaped data point.

**Artifacts:** `test-k/skilled/worker-report.md`, `git-diff.patch`,
`git-diff-stat.txt`, `git-status.txt`.

## Test L retest (limited tool environment) — inconclusive, two structural misses

**Worktrees:** `ui-design-engineer-eval-greenfield`, branches `eval-test-l-v121-claude` (run 1) and `eval-test-l-v121-claude-run2` (run 2), both off seed branch `test-l` @ `b1cd1b1`.
**Prompt:** identical to Test A's ("Build a real-time API traffic analytics dashboard..."), per Test L's own setup instruction to reuse a Test A-style request.

**Neither run validly tested what Test L exists to test** — the agent's honest
degradation through the documented fallback chain when visual QA tooling is
genuinely unavailable. Two different structural reasons, found and fixed in
sequence, are recorded here because they're durable findings about this
dispatch environment, not one-off flukes:

### Run 1 — pre-dispatch hygiene check was insufficient

Before dispatching, I followed the handoff doc's checklist: confirmed
`playwright`/`axe-core` don't resolve from the target project
(`require.resolve` failed cleanly), searched `/tmp` and global npm locations
for a stray cache (none found — the specific `/tmp/opencode/qa-deps` culprit
from the V1.2.0 incident wasn't present), and confirmed no `.mcp.json` /
global `mcpServers` config. All clean. Dispatched anyway with a real gap: the
worker's `worker-report.md` claimed a full `visual-qa.js` run (Playwright +
axe-core at 4 viewports, 0 violations, plus a paused/incident scenario pass)
— genuinely true, not fabricated, with real screenshots and `report.json`
evidence in its scratchpad.

Root cause: the `ui-design-engineer` skill plugin itself declares
`playwright`/`axe-core` as `devDependencies` (for its own internal test
suite — `package.json` at both
`.../ui-design-engineer/1.2.0/` and `.../1.2.1/`), and `npm install` had
been run in that plugin cache directory at some prior point, populating its
own `node_modules`. Since `scripts/visual-qa.js` lives inside that same
directory tree, Node's `require()` resolution walks up from **the script's
own location**, not the target project or process cwd — so it finds those
packages regardless of what project it's pointed at. This is more
structural than the V1.2.0 `/tmp/opencode/qa-deps` incident: it isn't a
stray leftover from an unrelated dispatch, it's a natural side effect of
ever having run the skill's own test suite on a machine, and it will recur
on every future Test L attempt here until addressed. My own hygiene check
had a real gap too — I checked `skills/ui-design-engineer/node_modules`
(empty) but not the plugin root one level up
(`ui-design-engineer/1.2.1/node_modules`), where the actual `node_modules`
lives.

**Fix applied for run 2:** moved
`.../ui-design-engineer/1.2.1/node_modules` aside for the duration of the
run, re-verified `require.resolve('playwright')` and `('axe-core')` both
failed from the skill's own script directory, then restored it immediately
after the run completed.

### Run 2 — tooling was genuinely absent, but nothing blocked installing it

With the plugin's `node_modules` genuinely isolated, the worker correctly
detected the missing tooling — and then simply ran `npm install playwright
axe-core` itself (real install, real Chromium download, verified in
`package.json`/`package-lock.json`) and proceeded to run a full 4-viewport,
both-theme `visual-qa.js` pass anyway. This is not a failure condition as
literally written (no fabrication, no silent skip, task didn't stall — it
disclosed exactly what it did: *"installed Playwright + axe-core... to run
the skill's automated visual QA"*), and it found and fixed two real issues
(a light-mode contrast failure, undersized table sort-header hit targets)
plus a design-consistency bug tooling didn't catch. But it also didn't
exercise the fallback chain (local script attempts → static reference
tables → manual `checklists/`) Test L's success condition is actually
checking for, because nothing in the environment stopped it from just
closing the gap with a real install.

**This points at a gap in Test L's own setup instructions**, not just this
machine's state: "confirm `playwright`/`axe-core` aren't resolvable" isn't
sufficient to force graceful degradation if the dispatched worker retains
ordinary `npm install`/network access — a capable agent will often just fix
the gap rather than degrade. Forcing the intended behavior would need
network/install restrictions in addition to dependency-resolution
isolation, which is a meaningfully heavier sandbox than anything either
V1.2.0 or this retest has set up so far.

**Verdict:** Test L was not validly retested. Both runs are kept as
evidence of *why* — not scored as pass/fail against Test L's rubric. Worth
folding this finding into `evals/evaluation-suite.md`'s Test L setup section
and `HANDOFF-V1.2.1-RETEST.md` before anyone attempts this test again on
this or a similarly-configured machine.

**Artifacts:** `test-l/run1-contaminated/` and `test-l/run2-self-remediated/`
(`worker-report.md`, `DESIGN.md`, git diff/status/stat for each).
