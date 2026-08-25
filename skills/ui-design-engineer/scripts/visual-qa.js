#!/usr/bin/env node
/**
 * visual-qa.js
 *
 * Local fallback for the "Browser Rendering & Capture" and "Accessibility Audit"
 * capabilities (Tier 2 in SKILL.md's capability table — use this when a Playwright
 * MCP / axe-core MCP isn't available in the current environment).
 *
 * For each viewport, it:
 *   - navigates to the given URL and waits for a configurable readiness signal
 *   - captures a full-page PNG screenshot
 *   - runs a set of cheap, deterministic structural checks: overflow, broken images,
 *     missing alt text, zero-size interactive elements, and focus-obscured controls are
 *     HARD findings; undersized (<24px) hit targets are a REVIEW/advisory finding, since
 *     WCAG 2.2's target-size criterion has exceptions a DOM-size heuristic can't fully
 *     evaluate. If the structural-check step itself throws, that's reported as an
 *     INCOMPLETE pass (never as "no defects found")
 *   - surfaces uncaught page runtime errors as a hard finding (console errors, which are
 *     often noisy third-party noise, stay a softer non-failing category)
 *   - runs an axe-core automated accessibility scan against the rendered DOM
 * and writes a JSON report plus the screenshots to --out.
 *
 * MULTI-ROUTE / MULTI-STATE (V1.2.1): a single-render pass structurally cannot see a
 * client-rendered SPA's second tab, second route, or any state reached by clicking
 * something — a defect on that state is invisible to a clean single-render report (this
 * is exactly the gap that let a real table-overflow bug ship undetected on a settings
 * page's non-default tab). Two additive, backwards-compatible mechanisms close this:
 *   --route <path>       (repeatable) — resolved against --url, navigated independently
 *   --scenario <file>    a small JSON file describing named interaction states (click /
 *                        waitFor / fill / press / select — deliberately not a general
 *                        browser-automation DSL) to reach on top of --url or each --route
 * Neither flag is required. With neither, behavior and report.json shape are UNCHANGED
 * from single-page usage — see the "default" vs "multi-state" report shapes below.
 *
 * REQUIRES `playwright` and `axe-core` to be present in the project (or reachable
 * via `npx`). This script checks for them and fails loudly and specifically —
 * naming exactly what's missing and how to install it — rather than silently
 * skipping steps or fabricating a result. Never report this script as having run
 * successfully if it exited with an error; report the fallback checklist instead
 * (checklists/visual-qa-critique.md, checklists/accessibility-audit.md).
 *
 * IMPORTANT — what this script does NOT do: the structural checks below catch
 * things a script CAN reliably decide (an element with zero visible size, a broken
 * image, an interactive control another element covers at its own focus point).
 * They do not, and cannot, judge whether a design is good — hierarchy, spacing
 * taste, color appropriateness, and archetype fit require the multimodal critique
 * in checklists/visual-qa-critique.md. Keep those two responsibilities separate:
 * this script finds defects, the agent (or a human) judges design quality.
 *
 * IMPORTANT — about the axe-core scan: it is an automated scan of a documented
 * subset of WCAG success criteria, not a WCAG 2.2 AA conformance test. axe-core's
 * own documentation estimates automated tools catch roughly 30-40% of real
 * accessibility issues. Zero violations here means "zero *automated* violations",
 * and report.json says so explicitly — see checklists/accessibility-audit.md for
 * the manual checks that are still required.
 *
 * Usage:
 *   node scripts/visual-qa.js --url http://localhost:3000 [--out ./visual-qa-report]
 *     [--viewports 375x812,768x1024,1440x900,1920x1080]
 *     [--wait-until load|domcontentloaded|networkidle] [--settle-ms 300]
 *     [--wait-for <css-selector>]
 *     [--route <path>]...
 *     [--scenario <path-to-scenario.json>]
 */

const fs = require("fs");
const path = require("path");
const { printHelp, wantsHelp } = require("./lib/cli-help");

const args = process.argv.slice(2);

if (wantsHelp(args)) {
  printHelp({
    name: "visual-qa.js",
    summary:
      "Renders a running app at multiple viewports (Playwright), captures screenshots, runs deterministic\n" +
      "structural checks (hard: overflow, broken images, missing alt, zero-size/focus-obscured controls,\n" +
      "page runtime errors; advisory REVIEW: undersized <24px hit targets), and runs an axe-core automated\n" +
      "accessibility scan. Requires the target app's dev server to already be running.\n" +
      "\n" +
      "With no --route/--scenario, this renders exactly one state (--url as given) — unchanged single-page\n" +
      "behavior and report.json shape. Pass one or more --route and/or a --scenario file to cover a\n" +
      "multi-tab/multi-route/stateful interface — a clean single-state report does NOT prove a second tab\n" +
      "or route is defect-free; see the P1 fix this addresses in CHANGELOG.md's V1.2.1 entry.",
    usage: "node scripts/visual-qa.js --url <http://localhost:PORT/route> [options]",
    options: [
      { flag: "--url <url>", desc: "Base URL to visit (required). Also the exact URL used when no --route is given." },
      { flag: "--out <dir>", desc: "Output directory for screenshots/report.json (default: ./visual-qa-report)" },
      { flag: "--viewports <list>", desc: "Comma-separated WIDTHxHEIGHT list (default: 375x812,768x1024,1440x900,1920x1080)" },
      { flag: "--wait-until <mode>", desc: "Page lifecycle readiness signal: load | domcontentloaded | networkidle (default: load)" },
      { flag: "--wait-for <selector>", desc: "CSS selector to wait for before capturing (optional)" },
      { flag: "--settle-ms <ms>", desc: "Extra fixed wait AFTER readiness signals, for animations/paint to settle (default: 300)" },
      { flag: "--route <path>", desc: "Repeatable. A path resolved against --url, navigated and captured as its own state (e.g. --route / --route /settings)." },
      { flag: "--scenario <path>", desc: "JSON file of named interaction states to reach via click/waitFor/fill/press/select actions — see notes." },
      { flag: "--help, -h", desc: "Show this help" },
    ],
    exitCodes: [
      { code: "0", meaning: "Single-state mode: no hard structural defects, page errors, or axe violations. Multi-state mode: every requested route/state was reached and none has a hard failure (advisory REVIEW findings don't affect this)." },
      { code: "1", meaning: "Overflow, a hard structural defect, an uncaught page error, a failed structural-check run, or an axe violation was found — OR, in multi-state mode, a requested route/state could not be reached at all (incomplete QA is never reported as a clean pass)." },
      { code: "2", meaning: "Invalid arguments (missing --url, bad --wait-until value, malformed --scenario JSON, etc.)" },
      { code: "3", meaning: "playwright and/or axe-core are not installed — see the printed fallback instructions" },
      { code: "4", meaning: "Unexpected crash" },
    ],
    examples: [
      "node scripts/visual-qa.js --url http://localhost:3000",
      "node scripts/visual-qa.js --url http://localhost:3000/logs --wait-for '[data-testid=log-list]' --settle-ms 500",
      "node scripts/visual-qa.js --url http://localhost:3000 --wait-until domcontentloaded --viewports 375x812,1440x900",
      "node scripts/visual-qa.js --url http://localhost:3000 --route / --route /settings --route /settings/billing",
      "node scripts/visual-qa.js --url http://localhost:3000/settings --scenario visual-qa.scenarios.json",
    ],
    notes: [
      "Readiness for STREAMING apps (WebSockets, SSE, live logs, streaming LLM responses, polling",
      "dashboards): avoid --wait-until networkidle — those apps may never go network-idle, so networkidle",
      "will time out or wait far longer than useful. The default (\"load\") plus --wait-for a selector that",
      "marks real content as present, plus a short --settle-ms, is the recommended combination for those",
      "apps. networkidle remains appropriate for simpler, mostly-static pages.",
      "",
      "The axe-core scan covers a documented subset of WCAG rules (see report.json's `axe` block for exactly",
      "which tags/version ran) — 0 violations is NOT proof of full WCAG 2.2 AA conformance. Always follow up",
      "with checklists/accessibility-audit.md.",
      "",
      "Undersized (<24px) hit targets are reported as REVIEW, not a hard failure — they alone never cause a",
      "non-zero exit. A structural-check run that itself throws is reported as an INCOMPLETE pass (exit 1),",
      "never silently treated as \"no defects found\". Uncaught page runtime errors (report.json's",
      "`pageErrors`) are a hard failure; console errors stay a softer, non-failing category.",
      "",
      "--scenario file shape (deliberately small — click/waitFor/fill/press/select only, no arbitrary JS):",
      '  { "states": [',
      '    { "name": "account", "actions": [] },',
      '    { "name": "api-keys", "actions": [',
      '        { "click": "[data-tab=\'api-keys\']" },',
      '        { "waitFor": "[data-panel=\'api-keys\']" }',
      "    ] }",
      "  ] }",
      '  Supported action keys: {"click": selector}, {"waitFor": selector}, {"fill": selector, "value": v},',
      '  {"press": key} or {"press": key, "selector": selector}, {"select": selector, "value": v}.',
      "",
      "Combining --route with --scenario runs every scenario state against every route (each route is",
      "navigated first, then that route's own copy of every scenario state is reached and captured).",
      "Screenshots for multi-state runs are written to <out>/<state-name>/<viewport>.png — one state's",
      "output is never overwritten by another's. report.json groups findings under `states[]` instead of",
      "the single-state `viewports[]` array; see report.json's own `mode` field (\"single\" | \"multi-state\").",
      "A route/state that could not be reached (navigation failure or a scenario action that timed out) is",
      "recorded with status \"incomplete\" and no screenshot — this always causes a non-zero exit; QA that",
      "never reached a requested state is not a clean pass.",
    ],
  });
  process.exit(0);
}

function flagValue(flag, fallback) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : fallback;
}
function flagValues(flag) {
  const out = [];
  args.forEach((a, i) => {
    if (a === flag) out.push(args[i + 1]);
  });
  return out;
}

const url = flagValue("--url", null);
const outDir = path.resolve(flagValue("--out", "./visual-qa-report"));
const viewportSpecs = flagValue("--viewports", "375x812,768x1024,1440x900,1920x1080")
  .split(",")
  .map((v) => {
    const [width, height] = v.split("x").map(Number);
    return { width, height, label: v };
  });

const VALID_WAIT_UNTIL = ["load", "domcontentloaded", "networkidle"];
const waitUntil = flagValue("--wait-until", "load");
const waitForSelector = flagValue("--wait-for", null);
const settleMsRaw = flagValue("--settle-ms", "300");
const settleMs = Number(settleMsRaw);
const routeArgs = flagValues("--route");
const scenarioPath = flagValue("--scenario", null);
const ACTION_TIMEOUT_MS = 10000;

if (!url) {
  console.error("Missing required --url. Run with --help for usage.");
  process.exit(2);
}
if (viewportSpecs.some((v) => !Number.isFinite(v.width) || !Number.isFinite(v.height))) {
  console.error(`Invalid --viewports value. Expected WIDTHxHEIGHT pairs like "375x812,1440x900". Run with --help for usage.`);
  process.exit(2);
}
if (!VALID_WAIT_UNTIL.includes(waitUntil)) {
  console.error(`Invalid --wait-until "${waitUntil}". Must be one of: ${VALID_WAIT_UNTIL.join(", ")}. Run with --help for usage.`);
  process.exit(2);
}
if (!Number.isFinite(settleMs) || settleMs < 0) {
  console.error(`Invalid --settle-ms "${settleMsRaw}". Must be a non-negative number. Run with --help for usage.`);
  process.exit(2);
}
if (settleMs > 10000) {
  console.error(`--settle-ms ${settleMs} is unusually large (>10s). --settle-ms is meant as a short settle period`);
  console.error("after a real readiness signal (--wait-until / --wait-for), not the primary wait mechanism.");
  console.error("If the app genuinely needs this long, prefer --wait-for a selector that marks real readiness.");
  process.exit(2);
}

// --- Parse --scenario, if given, before touching Playwright/axe-core so a malformed
// file fails fast with a setup-error exit code rather than after launching a browser. ---
let scenarioStates = null; // null = no --scenario given
if (scenarioPath) {
  let raw;
  try {
    raw = fs.readFileSync(path.resolve(scenarioPath), "utf8");
  } catch (err) {
    console.error(`Could not read --scenario file "${scenarioPath}": ${err.message}`);
    process.exit(2);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(`--scenario file "${scenarioPath}" is not valid JSON: ${err.message}`);
    process.exit(2);
  }
  if (!parsed || !Array.isArray(parsed.states) || parsed.states.length === 0) {
    console.error(`--scenario file "${scenarioPath}" must have a non-empty top-level "states" array. Run with --help for the expected shape.`);
    process.exit(2);
  }
  const ALLOWED_ACTION_KEYS = ["click", "waitFor", "fill", "press", "select"];
  for (const [i, s] of parsed.states.entries()) {
    if (!s || typeof s.name !== "string" || !s.name.trim()) {
      console.error(`--scenario states[${i}] is missing a non-empty "name" string.`);
      process.exit(2);
    }
    for (const [j, a] of (s.actions || []).entries()) {
      const key = ALLOWED_ACTION_KEYS.find((k) => a && Object.prototype.hasOwnProperty.call(a, k));
      if (!key) {
        console.error(
          `--scenario states[${i}].actions[${j}] must have exactly one of: ${ALLOWED_ACTION_KEYS.join(", ")}. Got: ${JSON.stringify(a)}`
        );
        process.exit(2);
      }
    }
  }
  scenarioStates = parsed.states;
}

const multiStateMode = routeArgs.length > 0 || scenarioStates !== null;

function tryRequire(name) {
  try {
    return require(name);
  } catch {
    return null;
  }
}

const playwright = tryRequire("playwright");
let axeVersion = null;
const axeSource = (() => {
  try {
    const axeCorePath = require.resolve("axe-core/axe.min.js");
    const source = fs.readFileSync(axeCorePath, "utf8");
    try {
      axeVersion = require("axe-core/package.json").version;
    } catch {
      axeVersion = "unknown";
    }
    return source;
  } catch {
    return null;
  }
})();

const missing = [];
if (!playwright) missing.push("playwright");
if (!axeSource) missing.push("axe-core");

if (missing.length > 0) {
  console.error("ui-design-engineer :: visual-qa — required tooling not available in this environment.");
  console.error("");
  console.error(`Missing package(s): ${missing.join(", ")}`);
  console.error("");
  console.error("Install locally to enable automated rendering + accessibility QA:");
  console.error(`  npm install --save-dev ${missing.join(" ")}`);
  if (missing.includes("playwright")) {
    console.error("  npx playwright install chromium   # downloads the browser binary");
  }
  console.error("");
  console.error("FALLBACK: do not claim a screenshot or axe scan ran. Instead:");
  console.error("  1. Use a browser automation MCP if one is available in this environment.");
  console.error("  2. If neither is available, work through checklists/visual-qa-critique.md and");
  console.error("     checklists/accessibility-audit.md manually against the rendered code, and say");
  console.error("     explicitly in your report that this was a manual/static review, not an automated one.");
  process.exit(3);
}

// axe-core tags covering WCAG 2.0/2.1/2.2 A+AA success criteria that axe-core implements
// rules for. This is a best-effort automated subset, not the full standard — axe-core
// itself documents that automated tooling cannot test everything WCAG requires (e.g.
// meaningful reading order, whether alt text is actually *accurate*, focus order making
// sense). Unrecognized tags are simply no-ops for older axe-core versions, so this is
// safe to pass even if the installed version predates wcag22aa rule coverage.
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const AXE_DISCLAIMER =
  "Automated axe-core scan covering a documented subset of WCAG 2.x A/AA rules (see `tags`). " +
  "This is NOT a full WCAG 2.2 AA conformance test — axe-core's own documentation estimates automated " +
  "tools catch roughly 30-40% of real accessibility issues. Zero violations means zero AUTOMATED " +
  "violations found, not full conformance. Complete checklists/accessibility-audit.md for keyboard, " +
  "focus order, and manual structural review.";

// --- Structural check source, injected into the page and evaluated there. ---
// Deliberately narrow and deterministic: no aesthetic judgment, just measurable facts
// about the rendered DOM (sizes, positions, attributes). See file header for why this
// boundary matters.
const STRUCTURAL_CHECKS_SRC = `
(function () {
  // WCAG 2.2 2.5.8's 24px floor (44px is the "preferred" mobile threshold, not the floor)
  // — but the full criterion has exceptions (inline targets, equivalent target nearby,
  // essential/legally-required sizing, user-agent-controlled controls) that a DOM-size
  // heuristic can't reliably evaluate. Findings from this check are reported as
  // advisory (REVIEW), not a guaranteed violation — see the Node-side reporting below.
  const MIN_TARGET_PX = 24;
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;

  function isVisible(el) {
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  // Broken / missing-alt images.
  const images = Array.from(document.querySelectorAll("img"));
  const brokenImages = images
    .filter((img) => img.complete && img.naturalWidth === 0 && img.naturalHeight === 0 && img.src)
    .map((img) => ({ src: img.currentSrc || img.src, selector: describe(img) }));
  const missingAlt = images
    .filter((img) => !img.hasAttribute("alt"))
    .map((img) => ({ src: img.currentSrc || img.src, selector: describe(img) }));

  // Interactive elements: buttons, links with href, form controls, explicit roles/tabindex.
  const interactiveSelector =
    'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])';
  const interactive = Array.from(document.querySelectorAll(interactiveSelector));

  const zeroSizeVisible = [];
  const undersizedTargets = [];
  for (const el of interactive) {
    const style = getComputedStyle(el);
    const hidden = style.display === "none" || style.visibility === "hidden" || el.hasAttribute("disabled");
    if (hidden) continue;
    const rect = el.getBoundingClientRect();
    const rendered = Number(style.opacity) !== 0;
    if (rendered && rect.width === 0 && rect.height === 0) {
      zeroSizeVisible.push({ selector: describe(el), text: (el.textContent || "").trim().slice(0, 60) });
      continue;
    }
    // WCAG 2.2's target-size criterion (2.5.8) has a documented exception for a target
    // that's inline within a sentence/block of text (e.g. a plain link inside a
    // paragraph) — its size is governed by the surrounding text, not a fixed minimum.
    // Cheaply exclude the common case (an <a> still at its default inline display,
    // i.e. not styled to look like a button) rather than trying to fully implement the
    // spec's exception logic here.
    const isInlineProseLink = el.tagName === "A" && style.display === "inline";
    if (rendered && !isInlineProseLink && rect.width > 0 && rect.height > 0 && (rect.width < MIN_TARGET_PX || rect.height < MIN_TARGET_PX)) {
      undersizedTargets.push({
        selector: describe(el),
        text: (el.textContent || "").trim().slice(0, 60),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    }
  }

  // Focus-obscured check (WCAG 2.2 2.4.11): for a bounded sample of focusable elements,
  // focus it, then ask the browser what element is actually painted at its center point.
  // If that's not the focused element (or an ancestor/descendant of it), something else
  // is covering it — e.g. a sticky header or floating panel.
  const SAMPLE_CAP = 40;
  const focusable = interactive.filter(isVisible).slice(0, SAMPLE_CAP);
  const obscured = [];
  const previouslyFocused = document.activeElement;
  for (const el of focusable) {
    try {
      el.focus({ preventScroll: false });
      if (document.activeElement !== el) continue; // not actually focusable (e.g. disabled)
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      if (cx < 0 || cy < 0 || cx > vw || cy > vh) continue; // scrolled out of view, not obscured
      const atPoint = document.elementFromPoint(cx, cy);
      if (atPoint && atPoint !== el && !el.contains(atPoint) && !atPoint.contains(el)) {
        obscured.push({ selector: describe(el), coveredBy: describe(atPoint) });
      }
    } catch {
      // Some elements throw on focus (e.g. mid-transition); skip rather than fail the whole check.
    }
  }
  try {
    if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    else document.activeElement && document.activeElement.blur && document.activeElement.blur();
  } catch {}

  function describe(el) {
    if (!el || el === document.body) return "body";
    const id = el.id ? "#" + el.id : "";
    const cls = el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\\s+/).slice(0, 2).join(".") : "";
    return el.tagName.toLowerCase() + id + cls;
  }

  return {
    brokenImages,
    missingAlt,
    zeroSizeVisibleInteractive: zeroSizeVisible,
    undersizedInteractiveTargets: undersizedTargets,
    focusObscured: obscured,
    focusableSampleSize: focusable.length,
    focusableTotalCount: interactive.length,
  };
})()
`;

// Filesystem-safe, deterministic slug for a route path or scenario state name.
function slugify(s) {
  const cleaned = String(s)
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .replace(/\//g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "root";
}

// Resolve a --route path against the base --url. A leading "/" means "path on the
// same origin as --url"; anything new.URL can resolve against --url is accepted.
function resolveRoute(baseUrl, route) {
  return new URL(route, baseUrl).toString();
}

async function runScenarioAction(page, action) {
  if ("click" in action) {
    await page.click(action.click, { timeout: ACTION_TIMEOUT_MS });
  } else if ("waitFor" in action) {
    await page.waitForSelector(action.waitFor, { timeout: ACTION_TIMEOUT_MS });
  } else if ("fill" in action) {
    await page.fill(action.fill, action.value ?? "", { timeout: ACTION_TIMEOUT_MS });
  } else if ("press" in action) {
    if (action.selector) {
      await page.press(action.selector, action.press, { timeout: ACTION_TIMEOUT_MS });
    } else {
      await page.keyboard.press(action.press);
    }
  } else if ("select" in action) {
    await page.selectOption(action.select, action.value, { timeout: ACTION_TIMEOUT_MS });
  }
}

// Renders ONE (targetUrl, viewport) combination against an already-navigated page and
// returns the same per-viewport result shape used by both single-state and multi-state
// report modes. `page` must already be at the desired state (navigation + any scenario
// actions already applied by the caller) when this is called.
async function captureViewportResult(page, vp, screenshotPath) {
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));

  let structural;
  try {
    const result = await page.evaluate(STRUCTURAL_CHECKS_SRC);
    structural = { status: "ok", ...result };
  } catch (err) {
    // The detector itself failed to run — this is NOT "no defects found". Whatever
    // structural issues might be on this page are simply unknown. Never let this
    // collapse into a clean/passing report; see the reporting logic below.
    structural = { status: "failed", error: String(err) };
  }

  await page.evaluate(axeSource);
  const axeResults = await page.evaluate(
    async (tags) => {
      // eslint-disable-next-line no-undef
      const results = await axe.run(document, { resultTypes: ["violations"], runOnly: { type: "tag", values: tags } });
      return results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        helpUrl: v.helpUrl,
        nodeCount: v.nodes.length,
        targets: v.nodes.slice(0, 5).map((n) => n.target),
      }));
    },
    AXE_TAGS
  );

  return { overflow, structural, axeResults };
}

function viewportHasHardFailure(vpResult) {
  if (vpResult.navigationError) return true;
  if (vpResult.overflow?.hasHorizontalOverflow) return true;
  if ((vpResult.axeViolations?.length ?? 0) > 0) return true;
  const s = vpResult.structural;
  if (s && s.status === "failed") return true;
  if (s && s.status === "ok") {
    if (s.brokenImages.length + s.missingAlt.length + s.zeroSizeVisibleInteractive.length + s.focusObscured.length > 0) return true;
  }
  if (vpResult.pageErrors && vpResult.pageErrors.length > 0) return true;
  return false;
}

function logViewportFindings(vp, prefix = "") {
  if (vp.navigationError) {
    console.log(`${prefix}[${vp.viewport}] NAVIGATION FAILED: ${vp.navigationError}`);
    return;
  }
  const overflowFlag = vp.overflow?.hasHorizontalOverflow ? "OVERFLOW" : "ok";
  const violationCount = vp.axeViolations?.length ?? 0;
  console.log(
    `${prefix}[${vp.viewport}] screenshot: ${vp.screenshot} | horizontal overflow: ${overflowFlag} | axe (automated) violations: ${violationCount}`
  );
  if (violationCount > 0) {
    vp.axeViolations.forEach((v) => console.log(`${prefix}    - [${v.impact}] ${v.id}: ${v.help} (${v.nodeCount} node(s))`));
  }

  const s = vp.structural;
  if (s && s.status === "ok") {
    const hardIssueCount = s.brokenImages.length + s.missingAlt.length + s.zeroSizeVisibleInteractive.length + s.focusObscured.length;
    if (hardIssueCount > 0) {
      console.log(`${prefix}    structural findings (hard): ${hardIssueCount}`);
      if (s.brokenImages.length) console.log(`${prefix}      broken images: ${s.brokenImages.length}`);
      if (s.missingAlt.length) console.log(`${prefix}      images missing alt: ${s.missingAlt.length}`);
      if (s.zeroSizeVisibleInteractive.length) console.log(`${prefix}      zero-size visible interactive elements: ${s.zeroSizeVisibleInteractive.length}`);
      if (s.focusObscured.length) console.log(`${prefix}      focus-obscured controls (WCAG 2.4.11): ${s.focusObscured.length}`);
    }
    if (s.undersizedInteractiveTargets.length > 0) {
      console.log(`${prefix}    REVIEW: potentially undersized interactive target(s) (<24px, advisory — see checklists/accessibility-audit.md): ${s.undersizedInteractiveTargets.length}`);
    }
  } else if (s && s.status === "failed") {
    console.log(`${prefix}    STRUCTURAL CHECKS FAILED TO RUN (QA incomplete for this viewport): ${s.error}`);
  }

  if (vp.pageErrors && vp.pageErrors.length > 0) {
    console.log(`${prefix}    page runtime errors (uncaught exceptions): ${vp.pageErrors.length}`);
    vp.pageErrors.slice(0, 3).forEach((e) => console.log(`${prefix}      - ${String(e).slice(0, 200)}`));
    if (vp.pageErrors.length > 3) console.log(`${prefix}      ... and ${vp.pageErrors.length - 3} more (see report.json)`);
  }

  if (vp.consoleErrors && vp.consoleErrors.length > 0) {
    console.log(`${prefix}    console errors: ${vp.consoleErrors.length}`);
  }
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await playwright.chromium.launch();

  let exitCode;
  try {
    exitCode = multiStateMode ? await runMultiStateMode(browser) : await runSingleStateMode(browser);
  } finally {
    // Always close the browser before exiting — a process.exit() before this point
    // (e.g. inside the mode functions) would leak a detached Chromium subprocess.
    await browser.close();
  }
  process.exit(exitCode);
}

// --- Single-state mode: byte-for-byte the original (pre-V1.2.1) behavior. Kept as its
// own function, unchanged in substance, so existing report.json consumers and CLI-output
// scrapers never see a shape change unless they opt into --route/--scenario. ---
async function runSingleStateMode(browser) {
  const report = {
    mode: "single",
    url,
    generatedAt: new Date().toISOString(),
    readiness: { waitUntil, waitForSelector, settleMs },
    axe: { version: axeVersion, tags: AXE_TAGS, disclaimer: AXE_DISCLAIMER },
    viewports: [],
  };

  for (const vp of viewportSpecs) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    const pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));

    let navigationError = null;
    try {
      await page.goto(url, { waitUntil, timeout: 30000 });
      if (waitForSelector) {
        await page.waitForSelector(waitForSelector, { timeout: 15000 });
      }
      try {
        await page.evaluate(() => (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()));
      } catch {
        // Font loading API unsupported/blocked — not fatal, continue.
      }
      if (settleMs > 0) {
        await page.waitForTimeout(settleMs);
      }
    } catch (err) {
      navigationError = String(err);
    }

    const screenshotPath = path.join(outDir, `${vp.label}.png`);
    let overflow = null;
    let structural = null;
    let axeResults = null;

    if (!navigationError) {
      const result = await captureViewportResult(page, vp, screenshotPath);
      overflow = result.overflow;
      structural = result.structural;
      axeResults = result.axeResults;
    }

    report.viewports.push({
      viewport: vp.label,
      navigationError,
      screenshot: navigationError ? null : path.relative(process.cwd(), screenshotPath),
      overflow,
      structural,
      axeViolations: axeResults,
      consoleErrors,
      pageErrors,
    });

    await context.close();
  }

  const reportPath = path.join(outDir, "report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log("ui-design-engineer :: visual-qa report");
  console.log(`URL: ${url}`);
  console.log(`Readiness: --wait-until ${waitUntil}${waitForSelector ? `, --wait-for "${waitForSelector}"` : ""}, --settle-ms ${settleMs}`);
  console.log(`Report: ${path.relative(process.cwd(), reportPath)}`);
  console.log("");

  let anyFailure = false;
  for (const vp of report.viewports) {
    if (viewportHasHardFailure(vp)) anyFailure = true;
    logViewportFindings(vp);
  }

  console.log("");
  console.log(AXE_DISCLAIMER);
  console.log("");
  if (anyFailure) {
    console.log("Issues found — see report.json for full detail. Fix and re-run before considering the visual QA pass complete.");
    return 1;
  } else {
    console.log("OK — no horizontal overflow, structural defects, or automated axe violations detected at any viewport.");
    console.log("Still complete the manual checks in checklists/accessibility-audit.md and the design critique in");
    console.log("checklists/visual-qa-critique.md — this script finds defects, it doesn't judge design quality.");
    return 0;
  }
}

// --- Multi-state mode: one or more --route values and/or a --scenario file. Every
// combination of route x scenario-state is its own independently-navigated, independently-
// screenshotted, independently-reported state. A state that can't be reached (navigation
// failure or a scenario action timing out) is recorded as "incomplete" and never silently
// treated as passing — see file header. ---
async function runMultiStateMode(browser) {
  const routes = routeArgs.length > 0 ? routeArgs : [null]; // null = use --url as given
  const states = scenarioStates && scenarioStates.length > 0 ? scenarioStates : [{ name: "default", actions: [] }];
  const combineRoutesAndScenario = routeArgs.length > 0 && scenarioStates !== null;

  const plan = [];
  for (const route of routes) {
    for (const state of states) {
      const routeSlug = route !== null ? slugify(route) : null;
      const stateSlug = scenarioStates !== null ? slugify(state.name) : null;
      let name;
      if (routeSlug && stateSlug) name = `${routeSlug}/${stateSlug}`;
      else if (routeSlug) name = routeSlug;
      else name = stateSlug;
      plan.push({
        name,
        route,
        targetUrl: route !== null ? resolveRoute(url, route) : url,
        stateName: state.name,
        actions: state.actions || [],
      });
    }
  }

  const report = {
    mode: "multi-state",
    url,
    generatedAt: new Date().toISOString(),
    readiness: { waitUntil, waitForSelector, settleMs },
    axe: { version: axeVersion, tags: AXE_TAGS, disclaimer: AXE_DISCLAIMER },
    requested: {
      routes: routeArgs,
      scenario: scenarioPath,
      combineRoutesAndScenario,
    },
    states: [],
  };

  console.log("ui-design-engineer :: visual-qa report (multi-state)");
  console.log(`Base URL: ${url}`);
  if (routeArgs.length > 0) console.log(`Routes: ${routeArgs.join(", ")}`);
  if (scenarioPath) console.log(`Scenario: ${scenarioPath} (${states.length} state(s))`);
  console.log(`States planned: ${plan.length}`);
  console.log("");

  let anyHardFailure = false;
  let anyIncomplete = false;

  for (const item of plan) {
    const stateDir = path.join(outDir, ...item.name.split("/"));
    fs.mkdirSync(stateDir, { recursive: true });

    const stateResult = {
      name: item.name,
      route: item.route,
      scenarioState: scenarioStates !== null ? item.stateName : null,
      targetUrl: item.targetUrl,
      status: "ok", // "ok" | "review" | "hard-failure" | "incomplete"
      reachError: null,
      viewports: [],
    };

    console.log(`=== State: ${item.name} (${item.targetUrl}) ===`);

    for (const vp of viewportSpecs) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();
      const consoleErrors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      const pageErrors = [];
      page.on("pageerror", (err) => pageErrors.push(String(err)));

      let navigationError = null;
      try {
        await page.goto(item.targetUrl, { waitUntil, timeout: 30000 });
        if (waitForSelector) {
          await page.waitForSelector(waitForSelector, { timeout: 15000 });
        }
        for (const action of item.actions) {
          await runScenarioAction(page, action);
        }
        try {
          await page.evaluate(() => (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()));
        } catch {
          // Font loading API unsupported/blocked — not fatal, continue.
        }
        if (settleMs > 0) {
          await page.waitForTimeout(settleMs);
        }
      } catch (err) {
        navigationError = String(err);
      }

      let overflow = null;
      let structural = null;
      let axeResults = null;
      let screenshotRel = null;

      if (!navigationError) {
        const screenshotPath = path.join(stateDir, `${vp.label}.png`);
        const result = await captureViewportResult(page, vp, screenshotPath);
        overflow = result.overflow;
        structural = result.structural;
        axeResults = result.axeResults;
        screenshotRel = path.relative(process.cwd(), screenshotPath);
      }

      const vpResult = {
        viewport: vp.label,
        navigationError,
        screenshot: screenshotRel,
        overflow,
        structural,
        axeViolations: axeResults,
        consoleErrors,
        pageErrors,
      };
      stateResult.viewports.push(vpResult);

      if (navigationError) {
        stateResult.status = "incomplete";
        stateResult.reachError = stateResult.reachError || navigationError;
      } else if (viewportHasHardFailure(vpResult) && stateResult.status !== "incomplete") {
        stateResult.status = "hard-failure";
      } else if (
        structural &&
        structural.status === "ok" &&
        structural.undersizedInteractiveTargets.length > 0 &&
        stateResult.status === "ok"
      ) {
        stateResult.status = "review";
      }

      logViewportFindings(vpResult, "  ");
      await context.close();
    }

    if (stateResult.status === "incomplete") anyIncomplete = true;
    if (stateResult.status === "hard-failure") anyHardFailure = true;

    console.log(`  -> state status: ${stateResult.status.toUpperCase()}`);
    console.log("");
    report.states.push(stateResult);
  }

  report.summary = {
    statesRequested: plan.length,
    statesReached: report.states.filter((s) => s.status !== "incomplete").length,
    anyIncomplete,
    anyHardFailure,
  };

  const reportPath = path.join(outDir, "report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report: ${path.relative(process.cwd(), reportPath)}`);
  console.log("");
  console.log(AXE_DISCLAIMER);
  console.log("");

  if (anyIncomplete) {
    console.log(
      `INCOMPLETE QA: ${plan.length - report.summary.statesReached}/${plan.length} requested state(s) could not be reached — see report.json's "states[].reachError". This is never a clean pass.`
    );
    return 1;
  } else if (anyHardFailure) {
    console.log("Issues found in one or more states — see report.json for full detail. Fix and re-run before considering the visual QA pass complete.");
    return 1;
  } else {
    console.log(`OK — all ${plan.length} requested state(s) reached with no hard structural defects, page errors, or automated axe violations.`);
    console.log("Still complete the manual checks in checklists/accessibility-audit.md and the design critique in");
    console.log("checklists/visual-qa-critique.md — this script finds defects, it doesn't judge design quality.");
    return 0;
  }
}

main().catch((err) => {
  console.error("visual-qa.js crashed:", err);
  process.exit(4);
});
