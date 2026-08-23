#!/usr/bin/env node
/**
 * run-fixtures.js
 *
 * Exercises the deterministic scripts (inspect-project.js, check-ui-dependencies.js,
 * audit-hardcoded-colors.js, validate-design-tokens.js) against small synthetic
 * fixtures under tests/fixtures/, and visual-qa.js's argument-validation / missing-
 * dependency behavior (no browser required — see tests/run-playwright-integration.js
 * for the browser-dependent job).
 *
 * This answers "does the deterministic machinery actually work" — a different
 * question from evals/evaluation-suite.md's Tests A-L, which ask "does the skill
 * make an agent design better." Both matter; this file only covers the former.
 *
 * Usage: node tests/run-fixtures.js
 * Exit 0 if every assertion passes, 1 if any fails.
 */

const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const FIXTURES = path.join(__dirname, "fixtures");
const SCRIPTS = path.join(ROOT, "scripts");

let failures = 0;
let total = 0;

function run(scriptName, scriptArgs) {
  try {
    const stdout = execFileSync("node", [path.join(SCRIPTS, scriptName), ...scriptArgs], {
      encoding: "utf8",
      stdio: "pipe",
    });
    return { code: 0, stdout };
  } catch (err) {
    return { code: err.status ?? 1, stdout: (err.stdout || "") + (err.stderr || "") };
  }
}

function assert(label, condition, detail) {
  total++;
  if (condition) {
    console.log(`PASS  ${label}`);
  } else {
    failures++;
    console.log(`FAIL  ${label}`);
    if (detail) console.log(`      ${detail}`);
  }
}

// --- inspect-project.js fixture ---
{
  const { code, stdout } = run("inspect-project.js", ["--dir", path.join(FIXTURES, "inspect-clean-react"), "--json"]);
  let summary = null;
  try {
    summary = JSON.parse(stdout);
  } catch {
    /* leave null, assertions below will fail with a useful message */
  }
  assert("inspect-project.js exits 0 on a valid fixture", code === 0, `exit code ${code}`);
  assert("inspect-project.js detects framework=next", summary && summary.framework === "next", JSON.stringify(summary));
  assert("inspect-project.js detects styling=tailwind-v4", summary && summary.styling === "tailwind-v4", JSON.stringify(summary));
  assert("inspect-project.js detects componentSystem=shadcn", summary && summary.componentSystem === "shadcn", JSON.stringify(summary));
  assert("inspect-project.js detects primitiveSystem=radix", summary && summary.primitiveSystem === "radix", JSON.stringify(summary));
  assert("inspect-project.js detects icons=lucide", summary && summary.icons === "lucide", JSON.stringify(summary));
  assert("inspect-project.js detects charts=recharts", summary && summary.charts === "recharts", JSON.stringify(summary));
}

// --- inspect-project.js: multi-system detection (cross-system fixture) ---
{
  const { code, stdout } = run("inspect-project.js", ["--dir", path.join(FIXTURES, "existing-mui-with-shadcn"), "--json"]);
  let summary = null;
  try {
    summary = JSON.parse(stdout);
  } catch {
    /* leave null */
  }
  assert("inspect-project.js exits 0 on the mui+shadcn+radix fixture", code === 0, `exit code ${code}`);
  assert(
    "inspect-project.js detects BOTH mui and shadcn in componentSystems",
    summary && Array.isArray(summary.componentSystems) && summary.componentSystems.includes("mui") && summary.componentSystems.includes("shadcn"),
    JSON.stringify(summary)
  );
  assert(
    "inspect-project.js detects radix in primitiveSystems",
    summary && Array.isArray(summary.primitiveSystems) && summary.primitiveSystems.includes("radix"),
    JSON.stringify(summary)
  );
  assert(
    "inspect-project.js's backwards-compatible singular componentSystem is one of the detected systems",
    summary && summary.componentSystems.includes(summary.componentSystem),
    JSON.stringify(summary)
  );
}

// --- check-ui-dependencies.js fixtures ---
{
  const clean = run("check-ui-dependencies.js", ["--dir", path.join(FIXTURES, "dependency-clean")]);
  assert("check-ui-dependencies.js: clean project exits 0", clean.code === 0, clean.stdout);

  const mixedDefault = run("check-ui-dependencies.js", ["--dir", path.join(FIXTURES, "dependency-mixed-primitives")]);
  assert(
    "check-ui-dependencies.js: mixed primitives (Radix + Headless UI) reports CONFLICT but exits 0 without --strict",
    mixedDefault.code === 0 && /CONFLICT/.test(mixedDefault.stdout) && /@radix-ui\/react-popover/.test(mixedDefault.stdout),
    mixedDefault.stdout
  );

  const mixedStrict = run("check-ui-dependencies.js", ["--dir", path.join(FIXTURES, "dependency-mixed-primitives"), "--strict"]);
  assert("check-ui-dependencies.js: mixed primitives with --strict exits 1", mixedStrict.code === 1, mixedStrict.stdout);

  const allowedStrict = run("check-ui-dependencies.js", ["--dir", path.join(FIXTURES, "dependency-allowed-exception"), "--strict"]);
  assert(
    "check-ui-dependencies.js: fully-allowed exception (config file) exits 0 even with --strict",
    allowedStrict.code === 0 && /ALLOWED EXCEPTION/.test(allowedStrict.stdout),
    allowedStrict.stdout
  );

  // --- Cross-system conflict: existing MUI project that also picked up shadcn + Radix ---
  // (each side has only ONE package, so this would be invisible to the same-category
  // ">1 package" checks above — it's the specific gap V1.1.1 closes. See Test K.)
  const crossDefault = run("check-ui-dependencies.js", ["--dir", path.join(FIXTURES, "existing-mui-with-shadcn")]);
  assert(
    "check-ui-dependencies.js: mui+shadcn+radix reports BOTH cross-system conflicts, non-blocking without --strict",
    crossDefault.code === 0 &&
      /CONFLICT: cross-system pairing "shadcn .* \+ "mui/.test(crossDefault.stdout) &&
      /CONFLICT: cross-system pairing "mui .* \+ "radix/.test(crossDefault.stdout),
    crossDefault.stdout
  );
  assert(
    "check-ui-dependencies.js: shadcn+radix alone (the expected shadcn pairing) never appears as a conflict",
    !/pairing "shadcn[^"]*" \+ "radix/.test(crossDefault.stdout) && !/pairing "radix[^"]*" \+ "shadcn/.test(crossDefault.stdout),
    crossDefault.stdout
  );

  const crossStrict = run("check-ui-dependencies.js", ["--dir", path.join(FIXTURES, "existing-mui-with-shadcn"), "--strict"]);
  assert("check-ui-dependencies.js: mui+shadcn+radix with --strict exits 1 (unresolved cross-system conflict)", crossStrict.code === 1, crossStrict.stdout);

  const crossAllowed = run("check-ui-dependencies.js", [
    "--dir",
    path.join(FIXTURES, "existing-mui-with-shadcn"),
    "--strict",
    "--allow",
    "mui",
  ]);
  assert(
    "check-ui-dependencies.js: --allow mui resolves both cross-system findings, exits 0 even with --strict",
    crossAllowed.code === 0 && /ALLOWED EXCEPTION/.test(crossAllowed.stdout) && !/\bCONFLICT:/.test(crossAllowed.stdout),
    crossAllowed.stdout
  );

  // shadcn+radix alone (no monolithic system) must never be flagged — this is the
  // expected, compatible pairing shadcn is built on.
  const shadcnRadixOnly = run("check-ui-dependencies.js", ["--dir", path.join(FIXTURES, "inspect-clean-react"), "--strict"]);
  assert(
    "check-ui-dependencies.js: shadcn+radix alone (greenfield fixture) exits 0 even with --strict — no false conflict",
    shadcnRadixOnly.code === 0 && !/CONFLICT/.test(shadcnRadixOnly.stdout),
    shadcnRadixOnly.stdout
  );
}

// --- audit-hardcoded-colors.js fixtures ---
{
  const result = run("audit-hardcoded-colors.js", ["--dir", path.join(FIXTURES, "hardcoded-colors")]);
  assert("audit-hardcoded-colors.js: exits 1 when violations exist", result.code === 1, result.stdout);
  assert("audit-hardcoded-colors.js: flags hardcoded hex in .tsx", /Bad\.tsx/.test(result.stdout), result.stdout);
  assert("audit-hardcoded-colors.js: flags Tailwind palette utility (bg-blue-600)", /bg-blue-600/.test(result.stdout), result.stdout);
  assert("audit-hardcoded-colors.js: flags hardcoded hex/rgba in .module.scss", /Card\.module\.scss/.test(result.stdout), result.stdout);
  assert("audit-hardcoded-colors.js: does NOT flag Good.tsx (semantic tokens only)", !/Good\.tsx/.test(result.stdout), result.stdout);
  assert("audit-hardcoded-colors.js: does NOT flag globals.css (token-definition file)", !/[^.]globals\.css/.test(result.stdout), result.stdout);
}

// --- validate-design-tokens.js managed-token behavior ---
{
  const lenient = run("validate-design-tokens.js", [
    "--design-md",
    path.join(ROOT, "templates/DESIGN.md"),
    "--css",
    path.join(ROOT, "templates/adapters/react-tailwind/globals.css"),
  ]);
  assert("validate-design-tokens.js: default (lenient) mode passes on the reference template/adapter pair", lenient.code === 0, lenient.stdout);

  const strict = run("validate-design-tokens.js", [
    "--design-md",
    path.join(ROOT, "templates/DESIGN.md"),
    "--css",
    path.join(ROOT, "templates/adapters/react-tailwind/globals.css"),
    "--strict",
  ]);
  assert(
    "validate-design-tokens.js: --strict on the same pair reports undocumented adapter-mapping tokens (exit 1)",
    strict.code === 1 && /UNDOCUMENTED/.test(strict.stdout),
    strict.stdout
  );
}

// --- visual-qa.js: argument validation + graceful missing-dependency behavior (no browser needed) ---
{
  const help = run("visual-qa.js", ["--help"]);
  assert("visual-qa.js --help exits 0 and mentions --wait-until", help.code === 0 && /--wait-until/.test(help.stdout), help.stdout);

  const missingUrl = run("visual-qa.js", []);
  assert("visual-qa.js with no --url exits 2", missingUrl.code === 2, missingUrl.stdout);

  const badWaitUntil = run("visual-qa.js", ["--url", "http://localhost:1", "--wait-until", "bogus"]);
  assert("visual-qa.js with invalid --wait-until exits 2", badWaitUntil.code === 2, badWaitUntil.stdout);

  const badSettle = run("visual-qa.js", ["--url", "http://localhost:1", "--settle-ms", "-1"]);
  assert("visual-qa.js with negative --settle-ms exits 2", badSettle.code === 2, badSettle.stdout);

  // Whether this exits 3 (playwright/axe-core genuinely absent) or proceeds to a
  // navigation attempt depends on what's installed in the environment running this
  // test — both are acceptable here since this suite doesn't install Playwright.
  // What matters is it never crashes (exit 4) or silently reports success on bad input.
  const missingDeps = run("visual-qa.js", ["--url", "http://localhost:1"]);
  assert("visual-qa.js with valid args never crashes unexpectedly (exit 4)", missingDeps.code !== 4, missingDeps.stdout);
}

console.log("");
console.log(`${total - failures}/${total} assertions passed.`);
if (failures > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
