#!/usr/bin/env node
/**
 * run-playwright-integration.js
 *
 * The one test in this suite that needs a real browser — kept separate from
 * tests/run-fixtures.js (which runs with zero installs) so that CI can run the fast
 * job on every push and reserve this slower one for whenever Playwright/Chromium are
 * actually available. See .github/workflows/ci.yml.
 *
 * Starts tests/fixtures/streaming-app/server.js (a tiny app that polls continuously —
 * i.e. never goes network-idle — and has a handful of deliberately planted structural/
 * accessibility defects), then runs scripts/visual-qa.js against it twice:
 *
 *   1. --wait-until networkidle          -> expected to fail/time out (the problem
 *                                            this skill's V1.1 pass exists to fix)
 *   2. --wait-until load --wait-for ...   -> expected to succeed AND catch the
 *                                            planted defects (broken image, missing
 *                                            alt, zero-size control, undersized
 *                                            target, focus-obscured control)
 *
 * Requires `playwright` (with the Chromium browser installed) and `axe-core` in this
 * repo's own devDependencies — see the "playwright-integration" CI job.
 *
 * Usage: node tests/run-playwright-integration.js
 * Exit 0 if both scenarios behave as expected, 1 otherwise.
 */

const path = require("path");
const os = require("os");
const fs = require("fs");
const http = require("http");
const { execFileSync, spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const SKILL_ROOT = path.join(ROOT, "skills/ui-design-engineer");
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), "ui-design-engineer-pw-"));
const PORT = 4173;

// The fixture server MUST run as a separate OS process, not required in-process here.
// This script uses execFileSync (a BLOCKING call) to run visual-qa.js as a child — if
// the fixture server shared this process's event loop, that block would prevent the
// server from ever responding to the browser's requests, and every scenario below
// would time out for the wrong reason (the harness deadlocking itself) rather than
// for the reason each scenario is actually testing.
function startFixtureServer() {
  const child = spawn(process.execPath, [path.join(ROOT, "tests/fixtures/streaming-app/server.js")], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: "ignore",
  });
  return child;
}

function waitForServer(url, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    function attempt() {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() > deadline) reject(new Error(`Fixture server did not become ready within ${timeoutMs}ms`));
        else setTimeout(attempt, 100);
      });
    }
    attempt();
  });
}

let failures = 0;
function assert(label, condition, detail) {
  if (condition) {
    console.log(`PASS  ${label}`);
  } else {
    failures++;
    console.log(`FAIL  ${label}`);
    if (detail) console.log(`      ${detail}`);
  }
}

function run(args) {
  try {
    const stdout = execFileSync("node", [path.join(SKILL_ROOT, "scripts/visual-qa.js"), ...args], {
      encoding: "utf8",
      stdio: "pipe",
      timeout: 45000,
    });
    return { code: 0, stdout };
  } catch (err) {
    return { code: err.status ?? 1, stdout: (err.stdout || "") + (err.stderr || "") };
  }
}

async function main() {
  const server = startFixtureServer();
  await waitForServer(`http://localhost:${PORT}/`);
  console.log(`Fixture streaming app listening on http://localhost:${PORT} (pid ${server.pid})`);

  try {
    console.log("");
    console.log("=== Scenario 1: --wait-until networkidle on a continuously-polling app (expected to fail) ===");
    const networkidleResult = run([
      "--url",
      `http://localhost:${PORT}/`,
      "--wait-until",
      "networkidle",
      "--viewports",
      "375x812",
      "--out",
      path.join(OUT, "networkidle"),
    ]);
    assert(
      "networkidle mode fails/times out on the streaming fixture (demonstrates the problem this release fixes)",
      networkidleResult.code === 1 && /NAVIGATION FAILED/.test(networkidleResult.stdout),
      networkidleResult.stdout
    );

    console.log("");
    console.log("=== Scenario 2: --wait-until load --wait-for --settle-ms (expected to succeed and catch planted defects) ===");
    const loadResult = run([
      "--url",
      `http://localhost:${PORT}/`,
      "--wait-until",
      "load",
      "--wait-for",
      "#log-list",
      "--settle-ms",
      "300",
      "--viewports",
      "375x812",
      "--out",
      path.join(OUT, "load"),
    ]);
    assert("load+wait-for+settle-ms navigates successfully", !/NAVIGATION FAILED/.test(loadResult.stdout), loadResult.stdout);
    assert("catches the planted broken image", /broken images: 1/.test(loadResult.stdout), loadResult.stdout);
    assert("catches the planted missing-alt image", /images missing alt: \d/.test(loadResult.stdout), loadResult.stdout);
    assert("catches the planted zero-size interactive element", /zero-size visible interactive elements: 1/.test(loadResult.stdout), loadResult.stdout);
    assert("catches the planted undersized hit target (as an advisory REVIEW, not a hard finding)", /REVIEW: potentially undersized/.test(loadResult.stdout), loadResult.stdout);
    assert("catches the planted focus-obscured control", /focus-obscured controls/.test(loadResult.stdout), loadResult.stdout);

    const reportPath = path.join(OUT, "load", "report.json");
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    assert("report.json records axe version + tags + disclaimer", Boolean(report.axe && report.axe.version && report.axe.tags && report.axe.disclaimer), JSON.stringify(report.axe));
    assert("report.json records the readiness config used", report.readiness && report.readiness.waitUntil === "load" && report.readiness.waitForSelector === "#log-list", JSON.stringify(report.readiness));

    console.log("");
    console.log("=== Scenario 3: /small-target-only — an undersized target ALONE must not cause a hard failure ===");
    const smallTargetResult = run([
      "--url",
      `http://localhost:${PORT}/small-target-only`,
      "--viewports",
      "375x812",
      "--out",
      path.join(OUT, "small-target"),
    ]);
    assert("small-target-only reports the undersized target as REVIEW", /REVIEW: potentially undersized/.test(smallTargetResult.stdout), smallTargetResult.stdout);
    assert(
      "small-target-only page (no other defects) exits 0 — advisory finding alone is non-blocking",
      smallTargetResult.code === 0,
      smallTargetResult.stdout
    );
    assert("small-target-only reports no hard structural findings", !/structural findings \(hard\)/.test(smallTargetResult.stdout), smallTargetResult.stdout);

    console.log("");
    console.log("=== Scenario 4: /page-error — an uncaught runtime exception must be surfaced and fail QA ===");
    const pageErrorResult = run([
      "--url",
      `http://localhost:${PORT}/page-error`,
      "--viewports",
      "375x812",
      "--out",
      path.join(OUT, "page-error"),
    ]);
    assert("page-error is surfaced in the CLI summary", /page runtime errors \(uncaught exceptions\)/.test(pageErrorResult.stdout), pageErrorResult.stdout);
    assert("page-error causes a non-zero exit", pageErrorResult.code === 1, pageErrorResult.stdout);

    console.log("");
    console.log("=== Scenario 5: /broken-structural-checks — a failed structural-check run must be INCOMPLETE, never OK ===");
    const brokenChecksResult = run([
      "--url",
      `http://localhost:${PORT}/broken-structural-checks`,
      "--viewports",
      "375x812",
      "--out",
      path.join(OUT, "broken-checks"),
    ]);
    assert("broken-structural-checks reports the failure explicitly", /STRUCTURAL CHECKS FAILED TO RUN/.test(brokenChecksResult.stdout), brokenChecksResult.stdout);
    assert("broken-structural-checks causes a non-zero exit (incomplete, not OK)", brokenChecksResult.code === 1, brokenChecksResult.stdout);
    assert(
      "broken-structural-checks never prints the clean-pass success message",
      !/no horizontal overflow, structural defects/.test(brokenChecksResult.stdout),
      brokenChecksResult.stdout
    );

    const brokenChecksReport = JSON.parse(fs.readFileSync(path.join(OUT, "broken-checks", "report.json"), "utf8"));
    assert(
      "report.json records structural.status = \"failed\" with an error message",
      brokenChecksReport.viewports[0].structural &&
        brokenChecksReport.viewports[0].structural.status === "failed" &&
        typeof brokenChecksReport.viewports[0].structural.error === "string",
      JSON.stringify(brokenChecksReport.viewports[0].structural)
    );
  } finally {
    server.kill();
    fs.rmSync(OUT, { recursive: true, force: true });
  }

  console.log("");
  if (failures > 0) {
    console.log(`${failures} assertion(s) failed.`);
    process.exit(1);
  } else {
    console.log("All Playwright integration assertions passed.");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("run-playwright-integration.js crashed:", err);
  process.exit(1);
});
