# Evaluating `ui-design-engineer`

This directory holds a benchmark suite (`evaluation-suite.md`, Tests A–L) for testing whether the skill actually changes agent output for the better, and where it still has gaps. This is a design-quality evaluation, not a unit-test suite — read the note on scoring below before treating any number here as ground truth.

## How to run an evaluation

1. Pick a test (or several) from `evaluation-suite.md`. Set up the described project state — greenfield or an existing codebase matching the test's setup, as specified.
2. Run the prompt against an agent **with** the skill available, and — for comparison — the same prompt against an agent **without** it. The delta between the two is usually more informative than either run in isolation.
3. Score both runs against the rubric below.
4. Read the failure conditions listed for that test explicitly — a run can score reasonably on the rubric while still tripping a named failure condition (especially on Tests H, K, and L), and a tripped failure condition should weigh heavily regardless of the numeric score.

**Test L specifically requires a verified-clean environment before dispatch, not just a project-level dependency removal** — see its own "Setup" entry in `evaluation-suite.md` for the checklist. The first full paired run of this suite (2026-08-24/25) found that a stray shared cache on the eval machine silently defeated the skilled run's "no tooling" premise without anyone noticing until the (separately, correctly clean) baseline run was compared against it — a Test L result recorded without confirming and clearing shared caches first should be treated as unverified.

## Scoring rubric (100 points)

Adapted from the source research's evaluation criteria. Score each dimension independently, then read the qualitative notes — **a single composite number should never stand alone for subjective design work.** Two runs with the same total score can differ enormously in what they got right and wrong; write a sentence per dimension explaining the score, not just the number.

1. **Hierarchy & Layout (15 pts)** — Visual focal point clarity (5), spatial grid alignment (5), grid balance & containment (5).
2. **Visual Identity & Non-Slop (15 pts)** — Archetype commitment / point of view (5), elimination of AI-slop clichés from `anti-patterns-catalog.md` (5), typography pairing quality (5).
3. **Engineering Quality (20 pts)** — Clean compilation with no type errors (5), zero unneeded duplicate UI packages (5), component modularity & clean code (10).
4. **Design System Memory & Non-Drift (15 pts)** — DESIGN.md token compliance (10), component normalization & existing-system preservation (5). **This dimension should gate the overall score on Tests H and K specifically** — a visually excellent result that fails non-drift or introduces a second component system on those tests is a failed run, not a run that lost a few points.
5. **Accessibility & WCAG 2.2 (15 pts)** — 0 axe-core AA violations, or a clearly reported manual equivalent (10); keyboard focus visibility & target sizes verified (5).
6. **Visual QA Loop Execution (10 pts)** — Multi-viewport rendering pass actually performed or explicitly and honestly reported as unavailable (5); iterative self-correction or a clear, honest report of what remains unresolved at the safety cap (5).
7. **Responsiveness (10 pts)** — Fluid layout adaptation across reference viewports (5), appropriate navigation/workflow adaptation at mobile — not just reflow (5).

## What this rubric can't capture

Subjective design quality resists full quantification. Two designs can score identically on this rubric while one is genuinely better because of a hundred small judgment calls the rubric doesn't itemize — a spacing decision that "just feels right," a color choice that fits the brand's actual personality, restraint exercised at exactly the right moment. Use the score to catch objective regressions and gross failures (drift, broken accessibility, slop clichés); use human judgment and the qualitative critique for everything else. If a low-scoring run is nonetheless the better design, trust that judgment over the rubric.

## Interpreting results across the suite

- **Tests A, E, F, J** are mainly testing range and appropriateness — can the skill produce genuinely different, fitting output for genuinely different contexts, or does everything converge on one look?
- **Tests B, D, G** are testing engineering completeness alongside design — real states, real validation, real accessibility, not just a pretty static render.
- **Tests H, K, L** are the highest-priority signal for whether this skill is safe to use on real, existing production codebases rather than only greenfield demos. Weight failures here more heavily than a marginal rubric-point difference anywhere else — a skill that produces beautiful greenfield work but drifts on Test H or introduces shadcn on Test K is not ready, regardless of its average score.
- **Test I** stresses whether the agent defers to project tokens over literal pixel-matching when the two conflict — this is a frequent real-world request ("make it look like this screenshot but fit our app") and worth checking specifically.

## Extending the suite

These 12 tests are a starting benchmark, not exhaustive. When adding a new test, follow the existing format (Prompt / Setup / Success conditions / Failure conditions / Scoring areas) and be specific about the failure conditions — a vague "should look good" test doesn't discriminate between skill versions the way a concrete failure condition does.

## Storing real results

`results/` holds actual A/B run output once someone runs these tests for real — see `results/README.md` for the directory convention and `results/score-template.md` for the per-run scorecard (rubric scores, failure conditions triggered, qualitative critique, artifacts). It starts empty: no run has been scored here yet, and nothing elsewhere in this repository should be read as a claim that the skill has been proven better than baseline until real results are recorded there.

This suite and `tests/` (at the repo root) test different things: `tests/` asks "does the deterministic machinery (the scripts) work correctly" — that's a yes/no a script can verify, and it runs in CI. This suite asks "does having the skill available make an agent design better" — that's a judgment call that needs an actual run and a human or careful agent reading the output; no script can grade it for you.
