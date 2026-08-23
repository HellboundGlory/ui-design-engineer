#!/usr/bin/env node
/**
 * validate-design-tokens.js
 *
 * Cross-checks the CSS custom properties declared in a project's DESIGN.md
 * (section 5, ":root { ... }" and ".dark { ... }" code blocks) against the
 * tokens actually defined in the project's stylesheets. Flags:
 *   - tokens documented in DESIGN.md but missing from the stylesheet (drift risk:
 *     the contract says one thing, the CSS says another)
 *   - tokens present in the stylesheet but undocumented in DESIGN.md (drift risk:
 *     a token nobody wrote down, likely to be reinvented or misused later)
 *
 * Usage: node scripts/validate-design-tokens.js [--design-md <path>] [--css <path>...] [--dir <path>]
 * Exits non-zero if any mismatch is found, so it can gate a workflow step.
 * No dependencies beyond Node's built-in fs/path.
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
function flagValue(flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
}
function flagValues(flag) {
  const out = [];
  args.forEach((a, i) => {
    if (a === flag) out.push(args[i + 1]);
  });
  return out;
}

const ROOT = flagValue("--dir") ? path.resolve(flagValue("--dir")) : process.cwd();
const designMdPath = path.resolve(ROOT, flagValue("--design-md") || "DESIGN.md");

function extractTokenNames(cssText) {
  const names = new Set();
  const re = /--([a-zA-Z0-9-]+)\s*:/g;
  let m;
  while ((m = re.exec(cssText))) {
    names.add(m[1]);
  }
  return names;
}

if (!fs.existsSync(designMdPath)) {
  console.error(`No DESIGN.md found at ${designMdPath}.`);
  console.error("Instantiate templates/DESIGN.md at the project root before running this validation.");
  process.exit(2);
}

const designMdText = fs.readFileSync(designMdPath, "utf8");
const codeBlocks = designMdText.match(/```css([\s\S]*?)```/g) || [];
const designMdTokens = new Set();
for (const block of codeBlocks) {
  for (const name of extractTokenNames(block)) designMdTokens.add(name);
}

if (designMdTokens.size === 0) {
  console.error("No CSS custom properties found in DESIGN.md's ```css code blocks.");
  console.error("Section 5 (Color & Semantic Tokens) should contain :root { --token: ...; } and .dark { ... } blocks.");
  process.exit(2);
}

let cssPaths = flagValues("--css");
if (cssPaths.length === 0) {
  // Default search: common locations for a global stylesheet.
  const candidates = [
    "app/globals.css",
    "src/app/globals.css",
    "src/globals.css",
    "src/styles/globals.css",
    "styles/globals.css",
    "src/index.css",
    "src/main.css",
  ];
  cssPaths = candidates.filter((c) => fs.existsSync(path.join(ROOT, c)));
}

if (cssPaths.length === 0) {
  console.error("No stylesheet found to validate against. Pass one or more --css <path> flags.");
  console.error("(Searched common locations: app/globals.css, src/styles/globals.css, src/index.css, ...)");
  process.exit(2);
}

const stylesheetTokens = new Set();
const readCssFiles = [];
for (const rel of cssPaths) {
  const full = path.resolve(ROOT, rel);
  if (!fs.existsSync(full)) {
    console.error(`Warning: --css path not found, skipping: ${rel}`);
    continue;
  }
  readCssFiles.push(rel);
  const text = fs.readFileSync(full, "utf8");
  for (const name of extractTokenNames(text)) stylesheetTokens.add(name);
}

const missingFromStylesheet = [...designMdTokens].filter((t) => !stylesheetTokens.has(t)).sort();
const undocumentedInDesignMd = [...stylesheetTokens].filter((t) => !designMdTokens.has(t)).sort();

console.log("ui-design-engineer :: token validation");
console.log(`DESIGN.md: ${path.relative(ROOT, designMdPath)} (${designMdTokens.size} tokens documented)`);
console.log(`Stylesheets checked: ${readCssFiles.join(", ") || "(none readable)"} (${stylesheetTokens.size} tokens found)`);
console.log("");

let hasProblems = false;

if (missingFromStylesheet.length > 0) {
  hasProblems = true;
  console.log(`MISSING from stylesheet (documented in DESIGN.md, not implemented) — ${missingFromStylesheet.length}:`);
  missingFromStylesheet.forEach((t) => console.log(`  --${t}`));
  console.log("");
}

if (undocumentedInDesignMd.length > 0) {
  hasProblems = true;
  console.log(`UNDOCUMENTED in DESIGN.md (implemented in CSS, not recorded in the contract) — ${undocumentedInDesignMd.length}:`);
  undocumentedInDesignMd.forEach((t) => console.log(`  --${t}`));
  console.log("");
}

if (!hasProblems) {
  console.log("OK — DESIGN.md token contract and stylesheet tokens are in sync.");
  process.exit(0);
} else {
  console.log("Reconcile the lists above: either update DESIGN.md §5 to match the stylesheet, or update the stylesheet to match the documented contract.");
  process.exit(1);
}
