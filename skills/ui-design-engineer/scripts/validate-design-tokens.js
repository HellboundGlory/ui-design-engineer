#!/usr/bin/env node
/**
 * validate-design-tokens.js
 *
 * Checks that the semantic tokens a project's DESIGN.md claims to own (section 5's
 * ":root { ... }" / ".dark { ... }" ```css blocks) actually exist in the project's
 * stylesheet. This is the direction that matters by default: DESIGN.md is a contract,
 * and an agent editing the stylesheet shouldn't silently drop a token the contract
 * documents.
 *
 * The REVERSE direction — flagging every CSS custom property in the stylesheet that
 * DESIGN.md doesn't mention — is opt-in via --strict. A mature app's stylesheet will
 * legitimately contain plenty of custom properties DESIGN.md was never meant to own
 * (--sidebar-width, --toast-z-index, --editor-line-height, --header-height, one-off
 * component-scoped variables...). Treating every one of those as "drift" by default
 * produced noisy false positives on real projects, so default mode only validates
 * what DESIGN.md actually claims — the "managed" token set — and --strict is there
 * for a project that genuinely wants the exhaustive two-way comparison (e.g. a CI
 * gate on a small, deliberately fully-tokenized design system).
 *
 * Usage: node scripts/validate-design-tokens.js [--design-md <path>] [--css <path>...]
 *          [--dir <path>] [--strict] [--category <name>[,<name>...]]
 * No dependencies beyond Node's built-in fs/path.
 */

const fs = require("fs");
const path = require("path");
const { printHelp, wantsHelp } = require("./lib/cli-help");

const args = process.argv.slice(2);

if (wantsHelp(args)) {
  printHelp({
    name: "validate-design-tokens.js",
    summary:
      "Validates that the CSS custom properties DESIGN.md documents in its Color & Semantic Tokens\n" +
      "section actually exist in the project's stylesheet. Default mode checks only that direction\n" +
      "(DESIGN.md's contract must be honored) — it does NOT require every CSS variable in the app to\n" +
      "be documented in DESIGN.md, since real projects have plenty of legitimately unmanaged tokens\n" +
      "(--sidebar-width, --toast-z-index, etc). Use --strict for the exhaustive two-way comparison.",
    usage: "node scripts/validate-design-tokens.js [--design-md <path>] [--css <path> ...] [--dir <path>] [--strict] [--category <name,...>]",
    options: [
      { flag: "--design-md <path>", desc: "Path to DESIGN.md (default: <dir>/DESIGN.md)" },
      { flag: "--css <path>", desc: "Stylesheet to check (repeatable). Default: common global CSS locations" },
      { flag: "--dir <path>", desc: "Project root (default: current directory)" },
      { flag: "--strict", desc: "Also flag stylesheet tokens undocumented in DESIGN.md (exhaustive two-way check)" },
      { flag: "--category <list>", desc: "Restrict validation to these token categories (comma-separated)" },
      { flag: "--help, -h", desc: "Show this help" },
    ],
    exitCodes: [
      { code: "0", meaning: "OK — no managed tokens missing (and, in --strict, none undocumented)" },
      { code: "1", meaning: "One or more managed tokens documented in DESIGN.md are missing from the stylesheet" +
          " (or, in --strict, undocumented stylesheet tokens found)" },
      { code: "2", meaning: "Setup error — DESIGN.md or a stylesheet could not be found/parsed" },
    ],
    examples: [
      "node scripts/validate-design-tokens.js",
      "node scripts/validate-design-tokens.js --css app/globals.css --strict",
      "node scripts/validate-design-tokens.js --category color,status",
    ],
    notes: [
      "Categories recognized: color, status, chart, typography, spacing, radius, surface, motion, other.",
      "Categories group output for readability and let --category scope a run to e.g. just \"color, status\" —",
      "they don't change whether a token counts as managed. --strict is exhaustive across all categories,",
      "including \"other\"; expect real projects to need --category or a documented exception there.",
    ],
  });
  process.exit(0);
}

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
const strict = args.includes("--strict");

const VALID_CATEGORIES = ["color", "status", "chart", "typography", "spacing", "radius", "surface", "motion", "other"];
const categoryFilterRaw = flagValue("--category");
let categoryFilter = null;
if (categoryFilterRaw) {
  categoryFilter = categoryFilterRaw.split(",").map((c) => c.trim().toLowerCase());
  const invalid = categoryFilter.filter((c) => !VALID_CATEGORIES.includes(c));
  if (invalid.length > 0) {
    console.error(`Invalid --category value(s): ${invalid.join(", ")}`);
    console.error(`Valid categories: ${VALID_CATEGORIES.join(", ")}`);
    process.exit(2);
  }
}

// Classifies a token name into a namespace for grouped reporting. This is a naming-
// pattern heuristic, not a schema — it exists to make --strict output scannable and
// to let --category scope a run, not to gate whether a token counts as "managed"
// (that's governed by DESIGN.md actually documenting it, not by name shape).
function classify(name) {
  if (/^status-/.test(name)) return "status";
  if (/^chart-/.test(name)) return "chart";
  if (/radius/i.test(name)) return "radius";
  if (/^(spacing|space|gap)(-|$)/i.test(name)) return "spacing";
  if (/(font|leading|tracking|line-height|letter-spacing)/i.test(name)) return "typography";
  if (/(shadow|elevation|surface|blur|backdrop)/i.test(name)) return "surface";
  if (/(duration|ease|transition|spring|delay)/i.test(name)) return "motion";
  if (/^(background|foreground|primary|secondary|accent|muted|border|ring|card|destructive|input|popover)(-.*)?$/i.test(name))
    return "color";
  return "other";
}

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
let designMdTokens = new Set();
for (const block of codeBlocks) {
  for (const name of extractTokenNames(block)) designMdTokens.add(name);
}

if (designMdTokens.size === 0) {
  console.error("No CSS custom properties found in DESIGN.md's ```css code blocks.");
  console.error("Section 5 (Color & Semantic Tokens) should contain :root { --token: ...; } and .dark { ... } blocks.");
  process.exit(2);
}

if (categoryFilter) {
  designMdTokens = new Set([...designMdTokens].filter((t) => categoryFilter.includes(classify(t))));
  if (designMdTokens.size === 0) {
    console.error(`No DESIGN.md tokens matched category filter: ${categoryFilter.join(", ")}`);
    process.exit(2);
  }
}

let cssPaths = flagValues("--css");
if (cssPaths.length === 0) {
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

let stylesheetTokens = new Set();
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

if (categoryFilter) {
  stylesheetTokens = new Set([...stylesheetTokens].filter((t) => categoryFilter.includes(classify(t))));
}

const missingFromStylesheet = [...designMdTokens].filter((t) => !stylesheetTokens.has(t)).sort();
const undocumentedInDesignMd = [...stylesheetTokens].filter((t) => !designMdTokens.has(t)).sort();

function groupByCategory(tokens) {
  const grouped = {};
  for (const t of tokens) {
    const c = classify(t);
    (grouped[c] = grouped[c] || []).push(t);
  }
  return grouped;
}

console.log("ui-design-engineer :: token validation" + (strict ? " (strict mode)" : ""));
console.log(`DESIGN.md: ${path.relative(ROOT, designMdPath)} (${designMdTokens.size} managed token(s))`);
console.log(`Stylesheets checked: ${readCssFiles.join(", ") || "(none readable)"} (${stylesheetTokens.size} token(s) found)`);
console.log("");

let hasErrors = false;

if (missingFromStylesheet.length > 0) {
  hasErrors = true;
  console.log(`MISSING from stylesheet (DESIGN.md documents these, the stylesheet doesn't implement them) — ${missingFromStylesheet.length}:`);
  const grouped = groupByCategory(missingFromStylesheet);
  for (const [cat, tokens] of Object.entries(grouped)) {
    console.log(`  [${cat}]`);
    tokens.forEach((t) => console.log(`    --${t}`));
  }
  console.log("");
}

if (strict) {
  if (undocumentedInDesignMd.length > 0) {
    hasErrors = true;
    console.log(`UNDOCUMENTED in DESIGN.md (--strict: stylesheet has these, DESIGN.md doesn't mention them) — ${undocumentedInDesignMd.length}:`);
    const grouped = groupByCategory(undocumentedInDesignMd);
    for (const [cat, tokens] of Object.entries(grouped)) {
      console.log(`  [${cat}]`);
      tokens.forEach((t) => console.log(`    --${t}`));
    }
    console.log("");
  }
} else if (undocumentedInDesignMd.length > 0) {
  const grouped = groupByCategory(undocumentedInDesignMd);
  const otherCount = (grouped.other || []).length;
  console.log(
    `INFO: ${undocumentedInDesignMd.length} stylesheet token(s) aren't documented in DESIGN.md (${otherCount} in "other" — ` +
      `likely unmanaged, e.g. layout/z-index/component-local variables). Not treated as an error by default.`
  );
  console.log("Run with --strict to review the full list and decide whether any belong in DESIGN.md.");
  console.log("");
}

if (!hasErrors) {
  console.log("OK — every token DESIGN.md documents is implemented in the stylesheet.");
  process.exit(0);
} else {
  console.log("Reconcile the lists above: either update DESIGN.md §5 to match the stylesheet, or update the stylesheet to match the documented contract.");
  process.exit(1);
}
