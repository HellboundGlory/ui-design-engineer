#!/usr/bin/env node
/**
 * visual-qa.js
 *
 * Local fallback for the "Browser Rendering & Capture" and "Accessibility Audit"
 * capabilities (Tier 2 in SKILL.md's capability table — use this when a Playwright
 * MCP / axe-core MCP isn't available in the current environment).
 *
 * For each viewport, it:
 *   - navigates to the given URL
 *   - captures a full-page PNG screenshot
 *   - checks for horizontal overflow (documentElement.scrollWidth > clientWidth)
 *   - runs an axe-core accessibility scan against the rendered DOM
 * and writes a JSON report plus the screenshots to --out.
 *
 * REQUIRES `playwright` and `axe-core` to be present in the project (or reachable
 * via `npx`). This script checks for them and fails loudly and specifically —
 * naming exactly what's missing and how to install it — rather than silently
 * skipping steps or fabricating a result. Never report this script as having run
 * successfully if it exited with an error; report the fallback checklist instead
 * (checklists/visual-qa-critique.md, checklists/accessibility-audit.md).
 *
 * Usage:
 *   node scripts/visual-qa.js --url http://localhost:3000 [--out ./visual-qa-report]
 *     [--viewports 375x812,768x1024,1440x900,1920x1080]
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
function flagValue(flag, fallback) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : fallback;
}

const url = flagValue("--url", null);
const outDir = path.resolve(flagValue("--out", "./visual-qa-report"));
const viewportSpecs = flagValue("--viewports", "375x812,768x1024,1440x900,1920x1080")
  .split(",")
  .map((v) => {
    const [width, height] = v.split("x").map(Number);
    return { width, height, label: v };
  });

if (!url) {
  console.error("Usage: node scripts/visual-qa.js --url <http://localhost:PORT/route> [--out <dir>] [--viewports 375x812,...]");
  console.error("");
  console.error("This script visits a URL that must already be running (start your dev server first).");
  process.exit(2);
}

function tryRequire(name) {
  try {
    return require(name);
  } catch {
    return null;
  }
}

const playwright = tryRequire("playwright");
const axeSource = (() => {
  try {
    const axeCorePath = require.resolve("axe-core/axe.min.js");
    return fs.readFileSync(axeCorePath, "utf8");
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

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await playwright.chromium.launch();
  const report = { url, generatedAt: new Date().toISOString(), viewports: [] };

  try {
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
        await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      } catch (err) {
        navigationError = String(err);
      }

      const screenshotPath = path.join(outDir, `${vp.label}.png`);
      let overflow = null;
      let axeResults = null;

      if (!navigationError) {
        await page.screenshot({ path: screenshotPath, fullPage: true });

        overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        }));

        await page.evaluate(axeSource);
        axeResults = await page.evaluate(async () => {
          // eslint-disable-next-line no-undef
          const results = await axe.run(document, {
            resultTypes: ["violations"],
          });
          return results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            helpUrl: v.helpUrl,
            nodeCount: v.nodes.length,
            targets: v.nodes.slice(0, 5).map((n) => n.target),
          }));
        });
      }

      report.viewports.push({
        viewport: vp.label,
        navigationError,
        screenshot: navigationError ? null : path.relative(process.cwd(), screenshotPath),
        overflow,
        axeViolations: axeResults,
        consoleErrors,
        pageErrors,
      });

      await context.close();
    }
  } finally {
    await browser.close();
  }

  const reportPath = path.join(outDir, "report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log("ui-design-engineer :: visual-qa report");
  console.log(`URL: ${url}`);
  console.log(`Report: ${path.relative(process.cwd(), reportPath)}`);
  console.log("");

  let anyFailure = false;
  for (const vp of report.viewports) {
    if (vp.navigationError) {
      anyFailure = true;
      console.log(`[${vp.viewport}] NAVIGATION FAILED: ${vp.navigationError}`);
      continue;
    }
    const overflowFlag = vp.overflow?.hasHorizontalOverflow ? "OVERFLOW" : "ok";
    const violationCount = vp.axeViolations?.length ?? 0;
    console.log(
      `[${vp.viewport}] screenshot: ${vp.screenshot} | horizontal overflow: ${overflowFlag} | axe violations: ${violationCount}`
    );
    if (vp.overflow?.hasHorizontalOverflow) anyFailure = true;
    if (violationCount > 0) {
      anyFailure = true;
      vp.axeViolations.forEach((v) => console.log(`    - [${v.impact}] ${v.id}: ${v.help} (${v.nodeCount} node(s))`));
    }
    if (vp.consoleErrors.length > 0) {
      console.log(`    console errors: ${vp.consoleErrors.length}`);
    }
  }

  console.log("");
  if (anyFailure) {
    console.log("Issues found — see report.json for full detail. Fix and re-run before considering the visual QA pass complete.");
    process.exit(1);
  } else {
    console.log("OK — no horizontal overflow or axe-core violations detected at any viewport.");
    console.log("Automated scanning catches ~30-40% of real accessibility issues — still complete the manual");
    console.log("checks in checklists/accessibility-audit.md before considering accessibility QA done.");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("visual-qa.js crashed:", err);
  process.exit(4);
});
