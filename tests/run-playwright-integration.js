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
    const stdout = execFileSync("node", [path.join(ROOT, "scripts/visual-qa.js"), ...args], {
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
    assert("catches the planted undersized hit target", /undersized hit targets/.test(loadResult.stdout), loadResult.stdout);
    assert("catches the planted focus-obscured control", /focus-obscured controls/.test(loadResult.stdout), loadResult.stdout);

    const reportPath = path.join(OUT, "load", "report.json");
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    assert("report.json records axe version + tags + disclaimer", Boolean(report.axe && report.axe.version && report.axe.tags && report.axe.disclaimer), JSON.stringify(report.axe));
    assert("report.json records the readiness config used", report.readiness && report.readiness.waitUntil === "load" && report.readiness.waitForSelector === "#log-list", JSON.stringify(report.readiness));
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
