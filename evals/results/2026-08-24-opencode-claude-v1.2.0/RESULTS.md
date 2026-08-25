# ui-design-engineer Evaluation Results

## Run Metadata

- **Skill version:** 1.2.0 (`ui-design-engineer-marketplace`, matches `CHANGELOG.md`'s V1.2 entry)
- **Repository commit:** `0f7bb7a` on `main` (`ui-design-engineer`), clean at run start
- **Date:** 2026-08-24
- **ADE:** Orca (orchestration via `orca orchestration` CLI, `orca-ide` binary)
- **Worker:** Mixed — **not the single-worker run the mission specified.** Tests J and G ran on **opencode** (v1.18.21, via an OpenRouter model identifying as `stealth/ox-alpha`). Tests A, B, C, D, E, F, H, I, K, L (10/12) ran on **Claude Code** (Sonnet 5). See "Deviations from the planned protocol" below for why.
- **Number of tests:** 12 (A–L, all of `evals/evaluation-suite.md`)
- **Baseline coverage:** **1/12 (Test H only)**, added 2026-08-24 in a follow-up session, same seed commit (`main` @ `35d0a7e` in `ui-design-engineer-eval-seeds`) and same Claude Code worker as the skilled H run, dispatched directly (not through Orca) with explicit instructions not to invoke `/ui-design-engineer` or read anything in the skill's own repo. The other 11 tests remain skilled-only. Treat the Test H baseline as one anecdotal data point, not a trend — see `evals/results/README.md` on not averaging a single run into a claimed win rate.
- **Skilled coverage:** 12/12 — every test has a completed `worker-report.md`, evidence, and a self-scored rubric.
- **Tools/MCP environment:** No MCP servers were configured for any worker at any point (`opencode mcp list` confirmed empty; Claude Code workers had `claude-in-chrome` available but not a dedicated axe/shadcn/Figma MCP). All capability came from the skill's own bundled scripts (`inspect-project.js`, `visual-qa.js`, `check-ui-dependencies.js`, `audit-hardcoded-colors.js`, `validate-design-tokens.js`) plus, where a worker judged it genuinely required, a locally-installed Playwright/axe-core pair.

## Deviations from the planned protocol — read this before the scores

This run does **not** match the original orchestration brief in three material ways. Each is disclosed here rather than smoothed over in the per-test sections below.

1. **Worker was not uniformly opencode.** The original instruction required every SKILLED worker to be opencode. J and G were dispatched to opencode first and completed there (96/100 and 92/100 respectively — both strong runs; opencode's own output quality was never the problem). Every remaining opencode dispatch (H, K, L, A, B, C, D, E, F, I — 10 tests) hit a hard, repeated `agent_prompt_stalled` failure in Orca's dispatch-input stage, compounded by severe upstream rate-limiting on the shared `stealth/ox-alpha` OpenRouter model once multiple workers ran concurrently. At the user's explicit direction, all 10 unfinished opencode dispatches were scrapped and re-run on Claude Code instead. **This means 10 of 12 "skilled" results reflect Claude Code's use of the skill, not opencode's**, and this run cannot support any claim about opencode-specific skill behavior beyond J and G.
2. **The `/ui-design-engineer` invocation mechanism differs between the two workers, and this matters for one specific finding.** opencode has no native concept of a Claude Code plugin skill, so a bridge was built: a `.opencode/command/ui-design-engineer.md` file whose content is the real `SKILL.md` plus explicit path-resolution instructions, triggered by sending `/ui-design-engineer <task>` as the *literal first message* to a freshly-created, un-injected terminal (Orca's normal `worker-start`/`dispatch --inject` path wraps the task in its own coordinator preamble, which defeats the slash-command match — this was caught and fixed during the run; see the pilot-run correction below). Claude Code needed no bridge: the skill is a real, already-enabled Claude Code plugin, and every Claude worker's transcript shows a genuine `Skill(ui-design-engineer:ui-design-engineer)` tool call. Both mechanisms produced verifiable, real invocations (confirmed by reading each worker's own transcript, not merely trusting the self-report), but they are not the same mechanism, which is a second reason not to treat opencode and Claude results as interchangeable in this run.
3. **A pilot-run correction happened mid-flight and is worth recording.** The first two dispatch attempts (both opencode, both later discarded) used Orca's standard `worker-start`/`dispatch --inject` composition, which prepends its own lifecycle preamble before the task spec. Because of this, the literal string `/ui-design-engineer` was never the first thing the agent received — it was buried mid-message — so the agent read `SKILL.md` manually via a file `Read` instead of triggering an actual slash command. This is exactly the shortcut the mission explicitly forbids ("Do NOT merely read SKILL.md manually as a substitute for invoking the skill"). It was caught before scaling to all 12 tests, and the dispatch method was corrected (bypass `--inject`; deliver the task as a file plus a short, clean, single-line command send) for every result that counts in this document.

None of the above changes the substance of what was measured once a worker was actually running — every worker still had to invoke the real skill, inspect the real project, and produce real evidence. But the *worker identity* claim in this run's metadata is honest only as: **2 opencode results (J, G), 10 Claude Code results (everything else).**

## Executive Summary

- **Did the skill improve UI/product-design behavior?** Still largely unanswered with paired evidence — 11 of 12 tests remain baseline-free. One baseline now exists (Test H, added 2026-08-24): a strong unskilled agent reached comparable *visual* non-drift (83/100 vs. skilled's 94/100), with the 11-point gap concentrated in the skill's durable artifacts (a validated DESIGN.md, an automated axe pass) rather than the rendered output — see Baseline vs Skilled Findings. That is one test, not a trend. What the full run *can* say regardless: given the skill, both workers (opencode and Claude Code) consistently produced non-generic, archetype-committed, token-disciplined output with real (not simulated) visual/accessibility QA loops, across all 12 tests, with no critical failures on the two tests explicitly designed to gate on one (H's non-drift, K's non-shadcn-introduction).
- **Where was it strongest?** The three highest-priority tests (H, K, L) plus the divergence test (J) all landed as clean passes with no critical-failure-condition triggers, and — more importantly than the numeric scores — each surfaced genuine, evidenced *process* discipline: H reproduced a flagged bug against the unmodified original file before attributing it to new work; K wrote a custom Playwright contrast script to catch color pairs axe hadn't yet rendered; E and G separately used `checkVisibility()`/DOM-inspection scripts to distinguish real defects from checker false positives rather than either blindly "fixing" or dismissing findings; F distinguished a real scroll-reveal bug from a lazy-load screenshot artifact by three independent lines of evidence. This is the behavior this skill exists to produce, and it showed up unprompted and repeatedly, not just on the tests that name it.
- **Where was it weakest?** Two structural gaps recurred across otherwise-strong runs: (a) shared, persistent-across-projects layout chrome (sidebar nav) not adapting at mobile widths was flagged as a real, live defect in three separate tests (B, H, I) — always correctly identified as *pre-existing and out of this task's scope*, never silently fixed or silently ignored, but it's the same gap recurring rather than three different gaps, which suggests either the seed app's own debt or a blind spot in how "add one page" tasks reason about shared shell responsiveness. (b) `visual-qa.js`'s single-render-per-invocation model structurally cannot see defects on a second tab/route of a client-rendered SPA — Test D's real table-overflow bug was only caught because the worker separately ran interactive browser QA; a worker that trusted the automated pass alone would have shipped it undetected.
- **Did it reduce generic AI UI?** Yes, consistently, and this is the best-supported claim in the whole run. Every test's own "Generic / AI-slop tendencies observed" section reports zero-to-minimal findings, and this was independently spot-checked (not just taken on the workers' word) — Test K's board and Test F's editorial hero were both visually inspected directly and neither reads as templated AI output.
- **Did it preserve existing design systems?** Yes, on every test where one existed to preserve (B, G, H, I: orbitctl's bespoke Tailwind system; K: Mantine). K in particular — the test explicitly designed to catch a shadcn/Tailwind/Radix intrusion into a non-Tailwind app — triggered no such intrusion, verified three independent ways (dependency checker, hardcoded-color audit, and a direct manual `package.json` diff review).
- **Did it help with visual QA?** Yes, substantively — every test ran real multi-viewport Playwright+axe passes (not fallback narratives), most iterated 2–4 times with genuine before/after fixes, and Test L's report is a model of the honesty this dimension is built to reward: the tool was unexpectedly, genuinely available (see High-Signal Tests below) and the worker reported that surprise transparently instead of fabricating the expected unavailable-then-fallback narrative.
- **Did it introduce any new recurring house style?** A soft one, worth naming: dark-mode-first, border-not-shadow surfaces, restrained single-accent color, and tabular-nums-everywhere showed up across A, B, E, H, I, K's shared-system pages. This is largely explained by three of those tests (B, H, I) sharing one seed app and by Precision Technical / Dense Enterprise being the objectively correct archetype fit for the tasks given (ops dashboards, admin grids) — but F (Editorial Premium, full-bleed photography, warm ink/paper palette, 0-radius) and J's "Tend" direction (warm, rounded, spring motion) are genuine, full counter-examples in the same run, so this reads as "correct archetype convergence for similar briefs" rather than "the skill only knows one look."

## Overall Results Table

| Test | Title | Baseline | Skilled | Delta | Verdict | Confidence | Primary Finding |
|---|---|---|---|---|---|---|---|
| A | High-Throughput Analytics Dashboard | N/A | 95/100 | N/A | PASS | HIGH | Real archetype reasoning; 6 genuine defects found+fixed across 4 QA iterations, incl. a keyboard-focus regression axe never flagged |
| B | Developer Observability & Log Viewer | N/A | 90/100 | N/A | PASS | HIGH | Zero drift on existing system; real functional bug (Escape/Close) caught by a from-scratch Playwright test, not just visual QA |
| C | Conversational AI Workspace | N/A | 95/100 | N/A | PASS | HIGH | Reasoned, written rejection of `assistant-ui`; caught a real `[object Object]` code-render bug only visible in an actual screenshot |
| D | Application Settings Workspace | N/A | 97/100 | N/A | PASS | HIGH | Genuinely distinct 4-tab IA; real table-overflow bug found only via interactive browser QA — `visual-qa.js`'s single-route limit is a real tooling gap |
| E | Enterprise Data Administration Grid | N/A | 96/100 | N/A | PASS | HIGH | Rigorous false-positive investigation (`checkVisibility()` scripts) distinguishing real defects from checker artifacts |
| F | Editorial Creative Landing Page | N/A | 97/100 | N/A | PASS | HIGH | Independently visually confirmed: real photography, asymmetric composition, genuine serif display type, zero gradient/purple |
| G | Refactoring Legacy Interface (opencode) | N/A | 92/100 | N/A | PASS | HIGH | Zero drift; diagnosed and correctly dismissed a focus-ring-transition false alarm rather than "fixing" a non-bug |
| H | Non-Drifting Feature Addition ⭐ | 83/100 | 94/100 | +11 | PASS (both) | HIGH | Baseline independently avoided visible drift and fixed the same shared Modal focus-trap bug; the skill's edge was concentrated in durable design-memory artifacts (DESIGN.md + token validation) and automated axe coverage, not one-shot visual fidelity — see Test H section below |
| I | Multimodal Vision-to-Code Recreation | N/A | 90/100 | N/A | PASS | HIGH | Zero screenshot-palette leakage (0 hex hits); domain-appropriate content rename ("Incident Queue," not "Support Queue") |
| J | Archetype Divergence Benchmark (opencode) | N/A | 96/100 | N/A | PASS | HIGH | Two structurally, not cosmetically, divergent directions sharing one token vocabulary; both pass their own a11y baseline |
| K | Existing Non-shadcn Design System ⭐ | N/A | 98/100 | N/A | PASS | HIGH | Critical failure mode (shadcn/Tailwind/Radix intrusion) verified NOT triggered 3 independent ways; highest score in the suite |
| L | Limited Tool Environment ⭐ | N/A | 93/100 | N/A | PASS | HIGH (MEDIUM on the specific graceful-failure criterion) | A shared cache (`/tmp/opencode/qa-deps`) left by a prior process silently defeated the test's "no tooling" premise — disclosed honestly rather than faked |

Every remaining "N/A" is deliberate, not a missing-data placeholder — only Test H has a real baseline run as of this update.

## Test A — High-Throughput Analytics Dashboard

**95/100, PASS.** Chose Precision Technical deliberately (read the archetype file, considered and rejected two others). Built a grouped Traffic/Errors/Latency metric strip instead of a KPI-card row, three task-derived Recharts charts wired to a live-ticking mock stream, and a sortable/filterable 18-row endpoint table with a genuine mobile workflow change (table → stacked cards, not squeezed columns). Ran `visual-qa.js` four times across the session; found and fixed six real defects, the most notable being a keyboard-focus-ring regression (`focus-visible:outline-none` on two controls) that no automated axe rule catches — found only by a manual Tab-through. DESIGN.md fully instantiated with a documented OKLCH contrast-tuning history. No failure conditions triggered. Weakest point: an un-code-split 586KB bundle, disclosed rather than hidden.

## Test B — Developer Observability & Log Viewer

**90/100, PASS.** Existing orbitctl dark-mode system preserved throughout — reused existing `Card`/`Badge`/`Button`/`Input`, extended (didn't reinvent) the existing warning/danger tokens for severity. The JSON inspector and 8 keyboard shortcuts are genuinely wired and functionally verified (a from-scratch Playwright script with 10 explicit assertions caught and the worker fixed a real Escape/Close bug before shipping) — directly answering the test's named failure mode ("shortcuts mentioned but not wired"). One real latent Badge-contrast issue was found, correctly left unfixed as out-of-scope shared-component work, and logged rather than silently dropped. Docked responsiveness points for the pre-existing, non-collapsing sidebar (see Cross-Test Analysis — this recurs).

## Test C — Conversational AI Workspace

**95/100, PASS.** The test's specific ask — reason about `assistant-ui` vs. bespoke — got a real, written answer (DESIGN.md §13: opinionated runtime for a backend this project doesn't have; full control over tool-card state was worth keeping) rather than a rubric-shaped checkbox. Tool-call cards encode state redundantly (color + icon + text + live timer), never color-only. Four real `visual-qa.js` iterations caught a genuine SSR hydration mismatch, an unlabeled file input, an unfocusable scrollable region, a contrast failure, and — critically — a functional bug (`[object Object]` literal text where syntax-highlighted code should render) that was only visible by actually looking at a rendered screenshot, not by any automated check. Two honest gaps remain: an incomplete mobile-drawer focus trap, and light mode not independently axe-scanned (only spot-checked).

## Test D — Application Settings Workspace

**97/100, PASS — joint-second-highest score.** The four tabs are genuinely different structures (a form; a keyed table with per-row secret-reveal handling; a summary+comparison-grid+invoice-table composite; a member table plus a completely separate role×capability matrix), not four re-skinned forms. Every destructive action (revoke key, regenerate key, remove member, cancel plan, delete account) routes through a shared confirmation dialog, with the two highest-stakes actions additionally gated on typing an exact phrase. API keys are masked by default with a real, industry-standard one-time-reveal-at-creation pattern. **The single most operationally important finding in this run**: `visual-qa.js` only renders a client-rendered SPA's default route, so its automated pass cannot see the other three tabs at all. A real table-overflow bug (wide monospace secret column pushing later columns off-screen, silently clipped) existed on the API Keys/Team/Billing tabs and was only caught because the worker separately drove a live Chrome MCP session through every tab. This is a genuine tooling gap, not a worker shortcoming — see Recommended Skill Changes.

## Test E — Enterprise Data Administration Grid

**96/100, PASS.** A real dense `<table>` (36px rows, tabular numerals, thin-border/low-fill status chips), not a card-grid reinterpretation — the test's named failure mode is cleanly avoided. Bulk-action bar appears contextually in the filter bar's exact slot the instant a row is selected. Mobile is a genuine workflow change (table → stacked record list; sidebar → icon rail → focus-trapped drawer), decided in DESIGN.md *before* implementation. The standout behavior here is investigative rigor: rather than accepting or blindly patching two `visual-qa.js` structural findings ("56–74 zero-size interactive elements," "3 focus-obscured controls"), the worker wrote ad hoc Playwright scripts using `checkVisibility()` and `elementsFromPoint()` to trace both to specific, defensible, non-bug root causes (responsively-hidden ancestors; a benign last-row scroll-clipping artifact that keyboard focus already resolves correctly) before deciding not to change the code. Manual checklist work caught two real gaps axe never flagged: missing `aria-modal` on two Radix dialogs, and no real `<h1>` on the page.

## Test F — Editorial Creative Landing Page

**97/100, PASS — joint-second-highest score, independently visually verified.** Committed fully to Editorial Premium: full-bleed real photography (9 curated Unsplash images, explicitly rejecting weaker generic stock in the process), asymmetric layout throughout (bottom-left hero text over a pixel-tuned scrim, an offset 5/12–6/12 lede, alternating image/text feature rows, an irregular gallery grid, a full-bleed inverted newsletter section), a real loaded display serif (Fraunces) paired with Work Sans, and zero purple/blue gradient anywhere in the codebase (grepped, not assumed). Direct visual inspection of the rendered hero (see the artifact index) confirms this independently of the self-report — it reads as a genuine editorial page, not a templated marketing site. The most interesting engineering behavior in this run: the worker found two distinct "missing content in a screenshot" symptoms during QA and diagnosed each to a different, correct root cause rather than assuming both were the same bug — one was real (a scroll-reveal hook never firing during a non-scrolling full-page capture, fixed with a timed fallback) and one was a verified false positive (native `img loading="lazy"` correctly not fetching off-screen images in a capture context that never scrolls, proven three independent ways, and deliberately *not* "fixed" by removing lazy-loading, since that would trade real performance for a screenshot tool's blind spot).

## Test G — Refactoring Legacy Interface (opencode)

**92/100, PASS.** Refactored the bare `legacy/report.html` (unlabeled inputs, `td` header cells, `bgcolor` attributes) into a token-pure, semantically improved `/servers` page — real `<table>` with `<th scope="col">`, every form control properly labeled, `aria-invalid`/`aria-describedby` validation wiring, a `role="status"` success announcement. All 19 `audit-hardcoded-colors.js` hits are token *definitions*, zero are bypasses. The design-system-memory gate held cleanly. Worth naming specifically: the worker investigated an apparent focus-ring-color anomaly and correctly determined it was a Tailwind v4 `transition-colors` animation settling to the right color over ~100ms, not a real defect — the same "verify before assuming a finding is real" discipline seen independently in E, F, and H. This is opencode's second (and last) completed result in this run; both of opencode's completions (J, G) scored solidly, which matters for correctly attributing this run's earlier infrastructure problems to the dispatch/rate-limit layer rather than to opencode's own competence with the skill.

## Test H — Non-Drifting Feature Addition ⭐

**94/100, PASS.** Ran `inspect-project.js` first, read every existing component (`Billing.tsx`, `Modal.tsx`, `Button.tsx`, `Input.tsx`, `Card.tsx`, `Badge.tsx`) before writing anything, and built the new Webhook Configuration modal entirely from those existing primitives — same radius, spacing, button variants, and monospace-secret convention as the neighboring Plan/Payment/Invoices cards, verified via direct screenshot comparison. **This is the standout methodology of the entire run**: when `visual-qa.js` flagged a focus-obscured control at 375px, the worker did not assume the new work caused it — it swapped the unmodified original `Billing.tsx` back in via `git show HEAD:...`, reproduced the identical finding against code that predates this session, and only then concluded it was pre-existing debt, not a regression, and documented it as out-of-scope follow-up rather than either fixing an unrelated area or silently absorbing a false self-blame. Along the way, a genuine, previously-unnoticed accessibility gap in the *shared* `Modal` component (no focus trap, no initial/restore focus) was found via manual keyboard QA and fixed as legitimate shared-infrastructure work. `DESIGN.md` was instantiated from real inspection and passed `validate-design-tokens.js --strict` (25/25 tokens, 0 gaps). No shadcn/registry component was introduced — nothing to normalize, verified.

**Baseline (83/100, PASS, evaluator-scored — added 2026-08-24):** A fresh Claude Code agent, given the identical task and setup but explicitly barred from invoking `/ui-design-engineer` or reading anything in the skill's repo, was dispatched against the same seed commit. It read the same existing files unprompted, built a comparably scoped modal (endpoint URL, event checklist, active toggle, signing secret with reveal/copy) from the same existing primitives, and — independently, with no skill guidance — found and fixed the exact same pre-existing bug in the shared `Modal.tsx` (no focus trap, no initial/restore focus), plus added a real `p-4` overlay gutter fix and clean localStorage persistence (a completeness edge the skilled run's report doesn't claim). Direct screenshot comparison (`baseline/screenshots/desktop-1440-edit-modal.jpg` vs. `skilled/screenshots/05-webhook-configured-desktop.jpg`) shows near-indistinguishable visual fidelity to the existing design language — **the named failure condition for this test (visibly different radius/shadow/component quality) was not triggered by either arm.** The 11-point gap is concentrated almost entirely in what the skill is structurally built to add rather than in the one-shot visual output: baseline produced no DESIGN.md and no automated token-validation evidence (Design System Memory & Non-Drift: 8/15 vs. 15/15 — the single largest per-dimension delta), and ran no automated axe-core scan, relying on a manual/JS-assisted keyboard pass only (Accessibility: 12/15 vs. 14/15). Engineering Quality and the QA loop itself scored close (19/20 vs. 19/20, 9/10 vs. 10/10) — baseline's manual verification process, including an honest, explicitly-flagged workaround for a window-manager resize limitation (an iframe-in-a-static-page substitute for true 390px device emulation), was itself methodical and transparent, just not backed by the skill's scripted evidence trail. **Read this as one anecdotal run, not a trend** (n=1); the clearest interpretation is that a strong baseline agent can independently reach non-drift on a single well-scoped task, but the skill's durable value — a persistent, validated design-memory artifact plus automated multi-viewport accessibility coverage — doesn't have a baseline substitute by construction. Full evidence: `test-h/baseline/`.

## Test I — Multimodal Vision-to-Code Recreation

**90/100, PASS.** Recreated the reference screenshot's 2-column composition (list panel + two sidebar stat cards) using orbitctl's own dark tokens — `audit-hardcoded-colors.js` confirms the new file contributes **zero** hardcoded-color hits, meaning no hex value from the screenshot's warm/cream palette leaked into the code. The content was also correctly re-domained ("Incident Queue," an on-call-engineer framing) rather than literally porting "Support Queue" — a real signal that user/task reasoning happened before the visual port, not just a palette swap. One real contrast defect (a token misused for body text that had previously only been used for placeholders) and one keyboard-scroll defect were found and fixed via a genuine before/after `visual-qa.js` pass. The same shared-sidebar mobile-collapse gap seen in B and H recurs here, again correctly identified as pre-existing and out of this task's scope rather than silently fixed or silently ignored.

## Test J — Archetype Divergence Benchmark (opencode)

**96/100, PASS.** See High-Signal Tests below for the full analysis — this is one of the four tests that most directly measures what this skill is for.

## Test K — Existing Non-shadcn Design System ⭐

**98/100, PASS — highest score in the suite.** See High-Signal Tests below.

## Test L — Limited Tool Environment ⭐

**93/100, PASS, with one important caveat on how to read the score.** See High-Signal Tests below.

---

## High-Signal Tests

### Test H — Non-Drift

Full account above. The specific behavior worth emphasizing here, because it's the exact failure mode this test (and this skill) exists to prevent: **a beautiful-looking result is not evidence of non-drift; only checking against the pre-existing, unmodified code is.** The worker's `git show HEAD:...` reproduction technique is a concrete, reusable pattern — it turns "I don't think this is my bug" from an assertion into a verified fact. No critical failure condition (visibly different radius/shadow/font-weight, an un-normalized registry component) was triggered, and the report's evidence trail (direct screenshot comparison, `check-ui-dependencies.js`, `audit-hardcoded-colors.js`) supports that conclusion independently of the self-score.

**With the baseline now run (83/100 vs. 94/100, see the Test H section above):** the named failure condition — visible drift — was not triggered by the unskilled arm either, which is an important, non-obvious result in its own right: a single capable agent, unguided, can reach non-drift on one well-scoped task without this skill. What the baseline could not reach was the skill's *durable, checkable* evidence for that claim — a DESIGN.md validated against the stylesheet, and an automated axe pass — versus a self-report that, however careful, has no artifact a future session or reviewer could re-verify against. That distinction, not raw visual quality, is where this test's real delta showed up.

### Test J — Design Divergence

Both "Relay" (dark, mono-numeral, 2–4px radius, border-surfaces, 100ms linear motion, ops-console register) and "Tend" (warm cream, Baloo 2/Nunito, 24px/pill radii, soft shadow, 180–220ms spring motion, community-app register) are structurally different — different type systems, different geometry systems, different density models, different motion languages, different information architectures (a compliance-strip + scope-list vs. a portrait-hero + interest-chips + stat-strip) — while both consume the *same semantic token names* with different values, which is exactly "divergence by design, not drift" rather than a reskinned single component. Both pass their own accessibility baseline independently (0 axe violations across 12 render combinations — 3 routes × 4 viewports). The worker's own honest caveat is the right level of scrutiny: Tend's butter-arch-over-circular-portrait hero gesture is named as the closest approach to a generic "friendly consumer app" cliché in either direction, and the report explains specifically why it still reads as a considered choice (the palette, type pairing, and portrait carry its identity, not the layout gesture alone) rather than asserting a 15/15 by default.

### Test K — Existing Design System

Full account above. This is the test explicitly designed to gate hard on one failure mode, and that failure mode simply did not occur — verified three separate ways (the dependency checker, the hardcoded-color audit, and a direct human `git diff --stat` review of `package.json`, which is the one check a determined worker could have skipped and still passed the automated gates). The new Task Board feature reaches for `@mantine/dates` specifically *because* it's the same system's official sibling package — a level-2 "extend the existing system" decision, not a level-6 "reach for a specialized registry" decision — which is the kind of judgment call this test is built to reward beyond the binary pass/fail. The worker also wrote a custom Playwright script to compute real WCAG contrast math directly from rendered `getComputedStyle` values, catching two color pairs axe hadn't yet rendered in its specific automated pass. Nothing about this result should be read as "the bar was low" — a substantial kanban feature with a real modal, filters, and menu-driven status changes was built, entirely inside Mantine's own idiom.

### Test L — Limited Tooling

This is the most operationally important single finding in the entire run, and it is about the **test environment**, not the skill's design quality. The task's premise — no MCP, no `playwright`/`axe-core` as project dependencies — was supposed to force the graceful-degradation path (`visual-qa.js` fails explicitly, the worker falls through to static/manual review). Instead, `playwright` and `axe-core` were genuinely available via a pre-existing shared cache at `/tmp/opencode/qa-deps`, left behind by an earlier (abandoned, pre-switch) opencode dispatch on this same machine. This was **not** installed by the Test L worker, is **not** a project dependency of the greenfield repo it was building in, and **no** MCP server was configured — the worker verified all three of those things explicitly before concluding the tool was real, then used it for real rather than fabricating the expected "unavailable" narrative to match the test's shape. This is precisely the honesty this dimension is designed to reward, and the worker's own scoring reflects the right epistemic humility: it marked the specific "detect failure, use the fallback chain" success criterion as **NOT OBSERVABLE AS SPECIFIED** rather than claiming a pass it couldn't support, and flagged MEDIUM (not HIGH) confidence on that one scoring dimension specifically. **The actionable takeaway is that Test L cannot be trusted on a machine with any prior skill usage** — a shared, cross-project cache defeats its premise silently unless that cache is explicitly cleared (or the test's setup instructions are updated to check for and clear it) before each run. See Recommended Skill Changes.

---

## Cross-Test Analysis

### Product / UX Reasoning

Every test's DESIGN.md §1–3 (product intent, users/tasks, cost-of-mistake) was filled with real, task-specific reasoning before any visual decision, across both workers. This was independently checkable, not just self-reported: I's content rename ("Incident Queue" vs. the reference screenshot's literal "Support Queue") and J's two fully-imagined product framings (an access-control console vs. a plant-swap community app) are concrete artifacts of that reasoning actually happening, not boilerplate.

### Information Architecture

D's four structurally distinct tabs and E's genuinely different mobile workflow (not just breakpoints) are the clearest evidence that IA was decided before component selection, per the skill's own stated phase ordering. No test in this run defaulted to "the same block, four times."

### Visual Hierarchy

Consistently strong (14–15/15 self-scores across the board, and the two independently-viewed screenshots — K's board, F's hero — both show a clear, unambiguous focal point). The one recurring minor deduction across multiple tests (A, G) is under-using very wide (1920px) viewports rather than any real hierarchy failure.

### Distinctiveness / Anti-Slop

Zero purple/blue gradients across all 12 tests (checked, not merely claimed, on F via a direct grep). Zero card-grid reinterpretations of tabular data on the two tests that name this failure mode (E, K). Zero generic 3-KPI-card rows on the two dashboard-shaped tests (A, L). This is the most consistent finding in the run.

### Design Diversity

Genuinely present, not just claimed: F's editorial/photography-led register and J's "Tend" direction sit at the opposite end of the visual spectrum from A/E/H/I's dark, mono-numeral, Precision-Technical register — and that contrast is a *feature* of this run, not noise, since three of those Precision-Technical results (B, H, I) share one seed app and one task family (ops/infra tooling), where that convergence is the objectively correct call, not a limitation of the skill's range.

### Component Selection

C's written rejection of `assistant-ui`, D's written choice of Radix-direct over the shadcn CLI, A's written rejection of shadcn for a bespoke interactive-primitive set, K's choice of `@mantine/dates` specifically because it's the same system's sibling package, and G/H's refusal to introduce any second system into an existing bespoke one are all real, reasoned applications of the 7-level selection hierarchy — not a rubric checkbox. No test in this run introduced an unneeded duplicate primitive engine (`check-ui-dependencies.js` clean or cleanly-exceptioned everywhere).

### Existing-System Preservation

Clean across every applicable test (B, G, H, I, K) — this is the run's strongest, most load-bearing result, since it's exactly what K and H are built to gate on and neither triggered its named critical failure.

### DESIGN.md / Persistent Memory

Universal. Every test instantiated the template fully (no leftover bracket placeholders — checked, not assumed, since several reports explicitly call out having verified this) and appended real decision-log entries, including the two most methodologically interesting entries in the run: F's screenshot-artifact investigation and H's non-drift verification technique, both logged for a future session to build on rather than only living in this report.

### Responsive UX

Mostly strong (genuine workflow changes — table→stacked-list, sidebar→drawer — appear in D, E, K, not just reflow), with one real recurring gap: B, H, and I all independently found and correctly flagged (not fixed, not ignored) the same shared orbitctl sidebar's lack of mobile collapse. See Repeated Failure Patterns.

### Accessibility

Consistently the strongest evidence trail in the run — every test ran a real axe-core scan (not a manual-equivalent stand-in) and most supplemented it with genuine manual keyboard/focus work that caught things axe structurally cannot (D's `aria-modal` gaps, E's missing `<h1>`, A's suppressed focus ring, F's photographic-background contrast via direct pixel sampling). No test conflated "0 axe violations" with "WCAG 2.2 AA conformance" — every report explicitly names axe's coverage as a subset.

### Visual QA / Refinement

Universally real: every test ran actual Playwright renders (via MCP, via the skill's own `visual-qa.js`, or via a locally-installed pair), iterated 2–4 times with genuine before/after evidence, and stayed at or under the skill's own ~3-iteration guidance. L's report is the clearest example of the honesty this dimension is meant to reward under a surprising environment condition.

### Engineering Quality

Clean builds/typechecks/lints across all 12 tests, with real (not rubber-stamped) dependency-conflict investigation everywhere `check-ui-dependencies.js` flagged something (every "CONFLICT" in this run turned out to be one engine split across multiple scoped packages, correctly documented as a reviewed exception rather than either ignored or worked around by removing legitimate packages).

---

## Repeated Failure Patterns

Ranked by how many independent tests it appeared in, evidence-supported only:

1. **Shared, non-collapsing sidebar nav at mobile widths** (B, H, I — all three sharing the orbitctl seed app). Every occurrence was correctly diagnosed as pre-existing and out of scope, never silently fixed or silently ignored — so this is not a case of the skill missing a defect, but the same underlying seed-app debt surfacing three times because three different tests happened to touch the same shared shell. Worth fixing in the seed for future runs of this suite, not necessarily a finding about the skill.
2. **`visual-qa.js` only renders one route of a client-rendered SPA** (D, directly; a structural limitation that would recur on any multi-tab/multi-route greenfield test). This is a real tooling gap, not a worker shortcoming — D's worker caught the resulting bug only because it separately ran interactive browser QA. A worker that trusted the automated pass alone, on a test without a browser MCP available, would plausibly ship an undetected defect on a non-default route.
3. **`check-ui-dependencies.js` flags legitimate split-package installs of one engine as a "CONFLICT"** (seen in A/E/D's Radix packages, K's `@mantine/dates`, C's Radix set). Every occurrence was correctly investigated and documented as a reviewed exception, so this cost no test any points — but it happened often enough (5+ of 12 tests) that it's generating avoidable "investigate a false alarm" work on nearly every run that uses more than one scoped package from the same family.

No other pattern in this run met the bar of appearing in independent, unprompted findings across multiple tests rather than being test-specific.

---

## Skill Instructions That Appear Effective

- **"Run `inspect-project.js` before assuming anything" (Phase 2).** Every single test ran this first and cited its actual JSON output as the basis for a real decision (component-system detection in B/G/H/I/K; confirmed-greenfield in A/C/D/E/F/J/L) — this is not boilerplate; multiple reports quote the specific detected fields that changed their approach.
- **The four-tier rule-authority framing (Invariants/Defaults/Heuristics/Project Decisions).** Visible in how confidently workers deviated from Defaults with written reasoning (Radix-over-shadcn in D, bespoke-over-assistant-ui in C) versus how uniformly they treated accessibility as non-negotiable (0 tests treated a11y as optional or skippable).
- **The capability fallback chain (MCP → local script → static/manual).** L's honest divergence report is only possible *because* the skill explicitly told the worker what "unavailable" should look like and what to do about it — that's what let the worker recognize its actual situation didn't match the expected shape, rather than just running whatever was available without comment.
- **"Never claim a tool ran if it didn't."** Zero fabricated tool-run claims detected across 12 reports and one direct spot-check of screenshots — every report's "Automated Checks" section reads as a real transcript of commands run, not a description of what should have happened.

## Skill Instructions That Appear Ignored or Weak

- **Nothing in the skill's own text was found to be actively ignored.** The closest candidate is that `check-ui-dependencies.js`'s split-package false-positive rate (see Repeated Failure Patterns #3) means workers spend real time on an investigation the skill's own guidance ("legitimate migrations and legacy modules look the same as accidental drift from the outside... use `--allow` or a config file") anticipates but doesn't fully prevent — this is a tooling refinement opportunity, not evidence the instruction was ignored.

## Baseline vs Skilled Findings

**1/12 baseline runs exist (Test H, added 2026-08-24).** Full account in the Test H section above and in `test-h/baseline/`; do not generalize a single-test result into a suite-wide claim. In summary: baseline (83/100) and skilled (94/100) produced near-indistinguishable *visual* output on Test H, and both independently avoided the test's named failure condition (visible drift) and found the same real shared-component accessibility bug — so this one data point does **not** support "the skill is required to avoid drift on a well-scoped task." The 11-point gap was concentrated in artifacts specific to the skill's process rather than the rendered result: a validated `DESIGN.md` (worth 7 of the 11 points on its own, via the Design System Memory dimension) and an automated axe-core pass (part of the 2-point Accessibility gap) — both things a baseline run has no mechanism to produce, by construction, not because the baseline agent reasoned worse. The remaining 10 tests, including K (non-shadcn), are still skilled-only; K in particular is the other test where a naive baseline seems least likely to reproduce the skill's verification techniques (dependency/token/color audits), and remains the highest-priority test to run next.

## Generic-UI / House-Style Audit

**Did `ui-design-engineer` remove generic AI slop while accidentally introducing a new repeatable "ui-design-engineer look"?** Only a soft, explainable one. Dark-first, border-not-shadow, single-restrained-accent, tabular-nums treatments recur across A/B/E/H/I/K — but three of those (B, H, I) share one seed app by construction (this run's own design, not the skill's), and the other two (A, E) are Precision Technical / Dense Enterprise archetypes correctly matched to ops-dashboard and admin-grid briefs, where that register is the objectively right call, not a default. F (full-bleed photography, warm ink/paper palette, 0-radius, real display serif) and J's "Tend" (warm cream, pill radii, spring motion) are genuine counter-examples produced in the *same run*, which is the strongest evidence available here that the convergence is archetype-appropriateness, not a hidden preset. No recurring chart style, card treatment, or navigation pattern appeared across unrelated archetypes in this run.

## Recommended Skill Changes

**P1 — repeated, high-impact:**
- **`visual-qa.js`: add (or document) a multi-route/multi-tab capture mode.** Evidence: Test D's real, shipped table-overflow bug existed only on non-default tabs and was invisible to the tool's single-render pass; this is a structural blind spot for any client-rendered SPA with tab/route-based navigation, which several of this suite's own tests (C, D) are. Suggested change: accept a list of routes/hash-fragments/interaction steps to visit before capturing, or at minimum document explicitly in SKILL.md that a worker building a multi-route SPA must supplement `visual-qa.js` with interactive QA rather than treating a clean single-route report as sufficient. Risk of overfitting: low — this is a capability gap, not a subjective preference, and the fix generalizes beyond this suite.
- **`check-ui-dependencies.js`: reduce the false-positive rate on legitimately-scoped multi-package engines.** Evidence: 5+ of 12 tests spent real investigation time confirming that multiple `@radix-ui/*` or a Mantine-family package wasn't actually a second engine. Suggested change: ship a small default allowlist of known scoped-package families (Radix's `@radix-ui/react-*`, Mantine's `@mantine/*`) so the common case doesn't need a per-project config exception. Risk of overfitting: low-moderate — a hardcoded allowlist needs maintenance as new systems emerge, but the current cost (near-universal false positive) is worse than that maintenance burden.

**P2 — useful refinement:**
- **Document the shared-cache interaction for Test L specifically (or any repeated-run environment).** Evidence: `/tmp/opencode/qa-deps` silently defeated Test L's premise on a machine with prior skill usage. This isn't a skill-code change, but the evaluation suite itself (`evals/README.md` or Test L's own definition in `evaluation-suite.md`) should note that a genuinely clean run requires clearing any shared Playwright/axe cache first, not just removing project-level `devDependencies`. Risk of overfitting: none — this is a testing-hygiene note, not a behavior change.

**P3 — optional experiment:**
- **Consider whether the skill should proactively suggest fixing a discovered shared-layout responsive gap** (the sidebar-collapse pattern that recurred in B/H/I) rather than only logging it as out-of-scope follow-up work every time it's encountered. This is explicitly optional — the current "log it, don't silently fix unrelated areas" behavior is correct and matches the mission's own guidance against scope creep; a P3 experiment would be a lightweight nudge (e.g., a DESIGN.md §20 item that accumulates a repeat-count) rather than a change to the non-drift Invariant itself.

## Things NOT To Change

- **The `git show HEAD:...` non-drift verification pattern that emerged organically in Test H should not be formalized into a rigid script or checklist item.** It worked precisely because the worker reasoned its way to it as the right tool for a specific doubt, not because a checklist told it to run a specific command. Turning it into a mandatory step risks producing rote, unreasoned invocations on tests where it isn't the right check.
- **The capability fallback chain and its honesty requirement should not be loosened, even though Test L's "expected" observation (graceful failure) didn't occur.** The test still did its job — it revealed a real environmental confound and rewarded honest reporting of it. Weakening the "never fabricate a QA result" invariant to make L's exact expected shape more likely to occur would trade a genuine strength for a cleaner-looking single test result.
- **The component-selection hierarchy's bias toward "check existing/local first" should not be second-guessed based on this run.** Every test that had an existing system to check (B, G, H, I, K) preserved it cleanly, and every greenfield test that walked the hierarchy anyway (A, C, D, F) produced a reasoned, non-default choice rather than a reflexive one. This is working exactly as intended.

## Final Verdict

**EFFECTIVE**, with the explicit caveat that this verdict rests almost entirely on skilled-only evidence (1/12 baselines) and a worker mix (2 opencode, 10 Claude Code) that deviated from the planned protocol for reasons outside the skill's own control. Within those bounds: 12/12 tests passed, including both critical-failure-gated tests (H, K) with their named failure conditions verifiably not triggered, and the divergence test (J) producing genuine range rather than a palette-swapped single design. The behavior this skill exists to produce — inspect before implementing, reason about archetype rather than defaulting to it, verify non-drift rather than assume it, run real (not fabricated) visual/accessibility QA, and disclose gaps honestly rather than paper over them — showed up unprompted, repeatedly, and was independently checkable in this run's evidence trail, not just self-reported. **STRONGLY EFFECTIVE** is withheld specifically because the one baseline that does exist (Test H) shows a capable unskilled agent can independently reach comparable visual non-drift, with the skill's clearest measured advantage being durable, checkable artifacts (DESIGN.md, automated axe coverage) rather than one-shot output quality — and 11 of 12 tests still have no baseline at all to check that pattern against. That remains the single biggest gap between what this run shows and what the original mission asked for.

## Next Evaluation Recommendation

1. **Run the paired baseline this protocol was designed to produce** for the remaining high-signal tests (J, K, L — H is now done, see above), using the same Claude Code worker and the same seed apps already built for this run (`ui-design-engineer-eval-seeds`, `ui-design-engineer-eval-greenfield`) — the infrastructure now exists and doesn't need rebuilding.
2. **Re-run Test L with the shared cache explicitly cleared first** (`rm -rf /tmp/opencode/qa-deps` or equivalent on whatever machine runs it next), to get the graceful-degradation observation this run's Test L could not produce.
3. **If opencode is wanted as a worker again, resolve the dispatch-injection issue at the Orca level first** (or budget for the manual bypass this run had to invent) rather than relying on `worker-start`'s default composition, which reliably produced `agent_prompt_stalled` failures for opencode specifically in this environment.
4. **Consider a dedicated multi-route visual-qa follow-up test** targeting the exact gap Test D surfaced (a tab/route the default capture never sees), since this run only found it opportunistically rather than by design.

---

## Artifact Index

All paths below are relative to `evals/results/2026-08-24-opencode-claude-v1.2.0/`.

- `test-a/skilled/worker-report.md`, `.eval` screenshots + `report.json`, `DESIGN.md`, `git-diff.patch`
- `test-b/skilled/worker-report.md`, screenshots + `report.json`, `DESIGN.md`, `git-diff.patch`
- `test-c/skilled/worker-report.md`, `visual-qa-final/` + `visual-qa-before-final-fixes/` (both kept — shows iteration), `DESIGN.md`, `git-diff.patch`
- `test-d/skilled/worker-report.md`, `screenshots/`, `visual-qa-account/`, `DESIGN.md`, `git-diff.patch`
- `test-e/skilled/worker-report.md`, `screenshots/` (incl. 4 interaction-state captures), `report.json`, `DESIGN.md`, `git-diff.patch`
- `test-f/skilled/worker-report.md`, `screenshots/` (incl. `hero-updated.png`, independently reviewed above), `visual-qa-final/`, `DESIGN.md`, `git-diff.patch` — largest evidence set (21MB, legitimate real photography-heavy renders, not build bloat)
- `test-g/skilled/worker-report.md` (opencode), `.eval` screenshots incl. `other-routes/` regression renders, `report.json`, `DESIGN.md`, `git-diff.patch`
- `test-h/skilled/worker-report.md`, `screenshots/` (6, incl. mobile + validation states), `visual-qa-final/`, `DESIGN.md`, `git-diff.patch`
- `test-h/baseline/worker-report.md`, `screenshots/desktop-1440-edit-modal.jpg`, `git-diff.patch`, `git-status.txt`, `git-diff-stat.txt` (added 2026-08-24; no DESIGN.md, no visual-qa-final — by construction, baseline had neither the skill's template nor its scripts)
- `test-i/skilled/worker-report.md`, `screenshots/`, `visual-qa-report/`, `DESIGN.md`, `git-diff.patch`
- `test-j/skilled/worker-report.md` (opencode), `screenshots/`, multiple `vqa-*` report directories (round-by-round evidence), `DESIGN.md`, `git-diff.patch`
- `test-k/skilled/worker-report.md`, `visual-qa-board/`, `visual-qa-overview/`, `visual-qa-projects/` (regression checks on pre-existing pages), `git-diff.patch`
- `test-l/skilled/worker-report.md`, `visual-qa-report/`, `screenshots/` (incl. `chart-keyboard-navigation.png`), `DESIGN.md`, `git-diff.patch`

Seed/harness infrastructure built for this run (not part of the skill's own repo, kept for reproducibility):
- `/home/james/Downloads/Projects/ui-design-engineer-eval-seeds` — `main` (orbitctl, Tailwind, no DESIGN.md — used by B/H/I), `test-g-existing-design-system` (orbitctl + DESIGN.md + legacy fixture — used by G), `seed-mantine` (Meridian, Mantine, orphan branch — used by K)
- `/home/james/Downloads/Projects/ui-design-engineer-eval-greenfield` — one empty commit, branched per greenfield test (A/C/D/E/F/J/L)
- `/home/james/Downloads/Projects/ui-design-engineer-eval-seeds-assets/test-i-reference-screenshot.jpg` — the hand-built reference image for Test I
