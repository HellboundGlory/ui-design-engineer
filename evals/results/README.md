# Evaluation Results

This directory is where real A/B run results for `evals/evaluation-suite.md`'s Tests A–L get stored, once someone actually runs them. **It's empty by design** — no evaluation has been run and scored here yet, and nothing in this repository claims the skill has been proven better than baseline. Populate it only with genuine run output.

## Structure

```
evals/results/
  <model-or-agent>/         e.g. claude-sonnet-4.5, gpt-5-codex, cursor-composer
    test-a/
      baseline/              output produced WITHOUT the skill available
      skilled/                output produced WITH the skill available
      score.md                filled-in copy of score-template.md for this run
    test-h/
      baseline/
      skilled/
      score.md
    ...
```

One subdirectory per test (`test-a` through `test-l`), each containing a `baseline/` and `skilled/` output folder (screenshots, generated code, `report.json` from `visual-qa.js` if it ran, anything else produced) plus a `score.md` — a filled-in copy of `../score-template.md`.

## How to run one

1. Pick a test from `../evaluation-suite.md` and set up the described project state.
2. Run the prompt with the skill available; save everything it produced to `skilled/`.
3. Run the identical prompt without the skill available; save everything it produced to `baseline/`.
4. Copy `../score-template.md` to `score.md` in that test's directory and fill it in — rubric scores from `../README.md`, the specific failure conditions from the test's definition, and honest qualitative notes. An empty or "N/A" field is fine if something genuinely wasn't observed; don't force a number where judgment is needed.
5. Commit the result. Screenshots and generated code are useful evidence — include them, not just the score.

## What NOT to do here

- Don't write a `score.md` without actually running both variants — a score with no corresponding output isn't evidence of anything.
- Don't average results across a single run into a claimed "win rate" — one run per cell is an anecdote; several independent runs (ideally from different sessions/days) are what start to look like a trend, and even then, say how many runs the average covers.
- Don't delete a `baseline/` that scored poorly to make the comparison look better — a fair A/B keeps both sides regardless of outcome.
