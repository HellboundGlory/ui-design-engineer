<!--
  Copy this file to evals/results/<model-or-agent>/<test-id>/score.md and fill it in
  from a real run. See evals/results/README.md for the directory convention and
  evals/README.md for the 100-point rubric this references.
-->

# Score: [Test ID, e.g. Test H] — [model/agent name]

## Run metadata

- **Agent / tool**: [e.g. Claude Code, Cursor, OpenCode]
- **Model**: [e.g. claude-sonnet-4.5]
- **Model version / date observed**: [if known — models change over time]
- **Date of run**: [YYYY-MM-DD]
- **Skill enabled**: [Yes (skilled) / No (baseline)]
- **Skill version**: [e.g. V1.1 — match the CHANGELOG entry this was tested against]
- **Tools available**: [e.g. "Playwright MCP available", "no MCPs, local scripts only", "browser + axe-core MCP"]
- **Task prompt used**: [paste the exact prompt given, including any setup/context provided]

## Artifacts

- [ ] Screenshots saved to this directory (or `baseline/` / `skilled/` as applicable)
- [ ] Generated code saved
- [ ] `visual-qa.js` `report.json` saved, if it ran
- Links/paths: [ ]

## Rubric scores (see evals/README.md for point breakdown)

| Dimension | Points | Score | Notes |
|---|---|---|---|
| Hierarchy & Layout | 15 | | |
| Visual Identity & Non-Slop | 15 | | |
| Engineering Quality | 20 | | |
| Design System Memory & Non-Drift | 15 | | |
| Accessibility & WCAG 2.2 | 15 | | |
| Visual QA Loop Execution | 10 | | |
| Responsiveness | 10 | | |
| **Total** | **100** | | |

## Named failure conditions triggered (from this test's definition in evaluation-suite.md)

List each failure condition the test defines, and whether it was observed:

- [ ] [Failure condition 1] — [observed / not observed — evidence]
- [ ] [Failure condition 2] — [observed / not observed — evidence]

## Qualitative critique

[Free text: what specifically worked, what didn't, anything the rubric score doesn't capture. Be concrete — cite the specific screen/component/decision, not a general impression.]

## Unresolved defects

[Anything left broken/unaddressed at the end of the run, including anything the agent itself flagged as unresolved at a safety cap.]

## Baseline comparison notes (if applicable)

[What differed between the skilled and baseline run specifically — not just "skilled was better" but what decision or behavior actually changed.]
