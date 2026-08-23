#!/usr/bin/env node
/**
 * validate-repo.js
 *
 * Fast, browser-free structural checks over the skill repository itself:
 *   A. SKILL.md frontmatter parses and has non-empty name/description.
 *   B. Every references/templates/scripts/checklists/evals path mentioned in any
 *      markdown file in the repo resolves to a real file (no broken internal links).
 *   D. templates/DESIGN.md and templates/adapters/react-tailwind/globals.css are
 *      internally consistent (every token DESIGN.md documents exists in the adapter),
 *      verified by actually running scripts/validate-design-tokens.js rather than
 *      re-implementing the check here.
 *
 * This is the "does the skill's own documentation and cross-references hold together"
 * layer — separate from tests/run-fixtures.js, which exercises the deterministic
 * scripts' actual logic against synthetic project fixtures, and separate from
 * evals/evaluation-suite.md, which is a design-quality benchmark for agent behavior,
 * not something a script can grade.
 *
 * Usage: node tests/validate-repo.js
 * Exit 0 if every check passes, 1 if any fails.
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
let failures = 0;

function check(label, fn) {
  try {
    fn();
    console.log(`PASS  ${label}`);
  } catch (err) {
    failures++;
    console.log(`FAIL  ${label}`);
    console.log(`      ${err.message}`);
  }
}

// --- A: SKILL.md frontmatter ---
check("SKILL.md frontmatter parses with non-empty name/description", () => {
  const text = fs.readFileSync(path.join(ROOT, "SKILL.md"), "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error("No --- frontmatter block found at the top of SKILL.md");
  const frontmatter = match[1];

  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const descMatch = frontmatter.match(/^description:\s*([\s\S]+?)(?:\n[a-zA-Z_-]+:|$)/m);

  if (!nameMatch || !nameMatch[1].trim()) throw new Error("frontmatter missing a non-empty `name` field");
  if (!descMatch || !descMatch[1].trim()) throw new Error("frontmatter missing a non-empty `description` field");
  if (nameMatch[1].trim() !== "ui-design-engineer") {
    throw new Error(`frontmatter name is "${nameMatch[1].trim()}", expected "ui-design-engineer"`);
  }
});

// --- B: internal path references resolve ---
check("all references/templates/scripts/checklists/evals paths mentioned in markdown resolve", () => {
  const pathPattern = /(references|templates|scripts|checklists|evals)\/[a-zA-Z0-9_./-]+\.(md|js|css|json)/g;
  const mdFiles = collectFiles(ROOT, (rel) => rel.endsWith(".md") && !rel.startsWith("node_modules"));
  const mentioned = new Set();
  for (const rel of mdFiles) {
    const text = fs.readFileSync(path.join(ROOT, rel), "utf8");
    const matches = text.match(pathPattern) || [];
    matches.forEach((m) => mentioned.add(m));
  }
  const broken = [...mentioned].filter((p) => !fs.existsSync(path.join(ROOT, p)));
  if (broken.length > 0) {
    throw new Error(`${broken.length} broken path reference(s):\n        ` + broken.join("\n        "));
  }
});

// --- D: DESIGN.md template / adapter consistency ---
check("templates/DESIGN.md tokens are all implemented in templates/adapters/react-tailwind/globals.css", () => {
  try {
    execFileSync(
      "node",
      [
        path.join(ROOT, "scripts/validate-design-tokens.js"),
        "--design-md",
        path.join(ROOT, "templates/DESIGN.md"),
        "--css",
        path.join(ROOT, "templates/adapters/react-tailwind/globals.css"),
      ],
      { encoding: "utf8", stdio: "pipe" }
    );
  } catch (err) {
    throw new Error("validate-design-tokens.js (default mode) failed against the reference template/adapter pair:\n" + err.stdout);
  }
});

function collectFiles(dir, matcher, relDir = "") {
  const out = [];
  const SKIP = new Set(["node_modules", ".git", "dist", "build", ".next"]);
  let entries;
  try {
    entries = fs.readdirSync(path.join(dir, relDir), { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (SKIP.has(entry.name)) continue;
    const rel = path.join(relDir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectFiles(dir, matcher, rel));
    } else if (matcher(rel)) {
      out.push(rel);
    }
  }
  return out;
}

console.log("");
if (failures > 0) {
  console.log(`${failures} check(s) failed.`);
  process.exit(1);
} else {
  console.log("All repository validation checks passed.");
  process.exit(0);
}
