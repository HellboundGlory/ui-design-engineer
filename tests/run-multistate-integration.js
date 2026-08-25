#!/usr/bin/env node
/**
 * run-multistate-integration.js
 *
 * Regression coverage for visual-qa.js's V1.2.1 multi-route/multi-state support (see
 * CHANGELOG.md's V1.2.1 entry and evals/results/2026-08-24-opencode-claude-v1.2.0/
 * RESULTS.md's Test D section and P1 recommendation). Test D's evaluation found a real,
 * shipped table-overflow bug that existed only on a settings page's non-default tab —
 * invisible to a single-render QA pass. This file proves that failure class is now
 * mechanically detectable, using tests/fixtures/tabbed-app/ (a default "Account" tab
 * that's clean, and a "Billing" tab, reached only via a scenario click, that overflows
 * horizontally) and its companion tests/fixtures/tabbed-app/scenarios.json.
 *
 * Kept separate from tests/run-playwright-integration.js (which is the streaming-app /
 * core structural-check suite) so each fixture app's concern stays legible on its own.
 *
 * Requires `playwright` (with Chromium installed) and `axe-core` — same requirement as
 * run-playwright-integration.js. See the "playwright-integration" CI job.
 *
 * Usage: node tests/run-multistate-integration.js
 * Exit 0 if every assertion passes, 1 otherwise.
 */

const path = require("path");
const os = require("os");
const fs = require("fs");
const http = require("http");
const { execFileSync, spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const SKILL_ROOT = path.join(ROOT, "skills/ui-design-engineer");
const FIXTURE = path.join(ROOT, "tests/fixtures/tabbed-app");
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), "ui-design-engineer-multistate-"));
const PORT = 4174;

function startFixtureServer() {
  const child = spawn(process.execPath, [path.join(FIXTURE, "server.js")], {
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

function run(args, timeout = 45000) {
  try {
    const stdout = execFileSync("node", [path.join(SKILL_ROOT, "scripts/visual-qa.js"), ...args], {
      encoding: "utf8",
      stdio: "pipe",
      timeout,
    });
    return { code: 0, stdout };
  } catch (err) {
    return { code: err.status ?? 1, stdout: (err.stdout || "") + (err.stderr || "") };
  }
}

async function main() {
  const server = startFixtureServer();
  await waitForServer(`http://localhost:${PORT}/`);
  console.log(`Fixture tabbed app listening on http://localhost:${PORT} (pid ${server.pid})`);

  try {
    console.log("");
    console.log("=== Scenario 1: legacy single-page usage (no --route/--scenario) is unchanged ===");
    const legacyOut = path.join(OUT, "legacy");
    const legacy = run(["--url", `http://localhost:${PORT}/`, "--viewports", "375x812", "--out", legacyOut]);
    assert("legacy single-page usage on the clean default (Account) tab exits 0", legacy.code === 0, legacy.stdout);
    assert("legacy single-page usage does NOT print the multi-state banner", !/visual-qa report \(multi-state\)/.test(legacy.stdout), legacy.stdout);
    const legacyReport = JSON.parse(fs.readFileSync(path.join(legacyOut, "report.json"), "utf8"));
    assert("legacy report.json has mode: \"single\" and a top-level viewports[] array (unchanged shape)", legacyReport.mode === "single" && Array.isArray(legacyReport.viewports), JSON.stringify(legacyReport.mode));
    assert(
      "legacy single-page report never sees the Billing tab's overflow (it's hidden by default — this is the exact blind spot the multi-state mode fixes)",
      legacyReport.viewports[0].overflow && legacyReport.viewports[0].overflow.hasHorizontalOverflow === false,
      JSON.stringify(legacyReport.viewports[0].overflow)
    );

    console.log("");
    console.log("=== Scenario 2: --scenario reaches the Billing tab and CATCHES the overflow the default tab hides ===");
    const scenarioOut = path.join(OUT, "scenario");
    const scenarioResult = run([
      "--url",
      `http://localhost:${PORT}/`,
      "--scenario",
      path.join(FIXTURE, "scenarios.json"),
      "--viewports",
      "375x812",
      "--out",
      scenarioOut,
    ], 60000);
    assert("scenario run prints the multi-state banner", /visual-qa report \(multi-state\)/.test(scenarioResult.stdout), scenarioResult.stdout);
    assert("scenario run exits non-zero (the Billing tab has a real hard defect + the unreachable-tab state is incomplete)", scenarioResult.code === 1, scenarioResult.stdout);
    assert("scenario run reports the unreachable state as INCOMPLETE QA, not silently passing", /INCOMPLETE QA/.test(scenarioResult.stdout), scenarioResult.stdout);

    const scenarioReport = JSON.parse(fs.readFileSync(path.join(scenarioOut, "report.json"), "utf8"));
    assert("scenario report.json has mode: \"multi-state\"", scenarioReport.mode === "multi-state", JSON.stringify(scenarioReport.mode));
    assert("scenario report.json visited all 3 requested states", scenarioReport.states.length === 3, JSON.stringify(scenarioReport.states.map((s) => s.name)));

    const account = scenarioReport.states.find((s) => s.name === "account");
    const billing = scenarioReport.states.find((s) => s.name === "billing");
    const unreachable = scenarioReport.states.find((s) => s.name === "unreachable-tab");
    assert("the \"account\" state (default tab) is clean — status ok/review, no overflow", account && account.status !== "hard-failure" && account.status !== "incomplete", JSON.stringify(account && account.status));
    assert(
      "the \"billing\" state (reached via scenario click) is caught as a hard failure (horizontal overflow)",
      billing && billing.status === "hard-failure" && billing.viewports[0].overflow && billing.viewports[0].overflow.hasHorizontalOverflow === true,
      JSON.stringify(billing)
    );
    assert("the \"unreachable-tab\" state is marked incomplete with a recorded reachError, and has NO screenshot", unreachable && unreachable.status === "incomplete" && typeof unreachable.reachError === "string" && unreachable.viewports[0].screenshot === null, JSON.stringify(unreachable));

    assert(
      "each state's screenshot is written under its own state directory (no cross-state overwrite)",
      fs.existsSync(path.join(scenarioOut, "account", "375x812.png")) && fs.existsSync(path.join(scenarioOut, "billing", "375x812.png")),
      fs.readdirSync(scenarioOut).join(", ")
    );

    console.log("");
    console.log("=== Scenario 3: --route captures multiple independent routes without overwriting each other ===");
    const routeOut = path.join(OUT, "routes");
    const routeResult = run([
      "--url",
      `http://localhost:${PORT}`,
      "--route",
      "/",
      "--route",
      "/settings",
      "--viewports",
      "375x812",
      "--out",
      routeOut,
    ]);
    assert("multi-route run prints the multi-state banner", /visual-qa report \(multi-state\)/.test(routeResult.stdout), routeResult.stdout);
    const routeReport = JSON.parse(fs.readFileSync(path.join(routeOut, "report.json"), "utf8"));
    assert("multi-route run visited both requested routes, each reached (both serve the same clean default tab)", routeReport.states.length === 2 && routeReport.states.every((s) => s.status !== "incomplete"), JSON.stringify(routeReport.states.map((s) => ({ name: s.name, status: s.status }))));
    assert(
      "multi-route run wrote two separate, non-overwritten screenshot files",
      fs.existsSync(path.join(routeOut, "root", "375x812.png")) && fs.existsSync(path.join(routeOut, "settings", "375x812.png")),
      fs.readdirSync(routeOut).join(", ")
    );

    console.log("");
    console.log("=== Scenario 4: a malformed --scenario file fails fast with exit 2, not a crash ===");
    const badScenarioPath = path.join(OUT, "bad-scenario.json");
    fs.writeFileSync(badScenarioPath, "{ not valid json");
    const badScenario = run(["--url", `http://localhost:${PORT}/`, "--scenario", badScenarioPath]);
    assert("malformed --scenario JSON exits 2 (setup error, not a crash)", badScenario.code === 2, badScenario.stdout);
  } finally {
    server.kill();
    fs.rmSync(OUT, { recursive: true, force: true });
  }

  console.log("");
  if (failures > 0) {
    console.log(`${failures} assertion(s) failed.`);
    process.exit(1);
  } else {
    console.log("All multi-state integration assertions passed.");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("run-multistate-integration.js crashed:", err);
  process.exit(1);
});
