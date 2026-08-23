#!/usr/bin/env node
/**
 * validate-repo.js
 *
 * Fast, browser-free structural checks over the skill repository itself:
 *   A. skills/ui-design-engineer/SKILL.md frontmatter parses and has non-empty
 *      name/description.
 *   B. Every references/templates/scripts/checklists/evals path mentioned in any
 *      markdown file in the repo resolves to a real file (no broken internal links).
 *      Each mention is resolved relative to the FILE that mentions it, not always the
 *      repo root — this correctly handles both files inside skills/ui-design-engineer/
 *      (whose bare `references/...` mentions are relative to the skill's own directory)
 *      and root-level docs like README.md (whose mentions are written with the full
 *      `skills/ui-design-engineer/...` prefix, since that's the actual repo-root-
 *      relative path once the skill's content lives in its own subdirectory).
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
const SKILL_ROOT = path.join(ROOT, "skills/ui-design-engineer");
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
check("skills/ui-design-engineer/SKILL.md frontmatter parses with non-empty name/description", () => {
  const text = fs.readFileSync(path.join(SKILL_ROOT, "SKILL.md"), "utf8");
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
  // Optionally prefixed with skills/<name>/ so root-level docs (README, evals) can
  // point at the skill's own content with a real, resolvable repo-root-relative path.
  const pathPattern = /(?:skills\/[a-zA-Z0-9_-]+\/)?(references|templates|scripts|checklists|evals)\/[a-zA-Z0-9_./-]+\.(md|js|css|json)/g;
  // CHANGELOG.md is excluded: it's a historical record whose entries correctly
  // described paths as they were AT THE TIME they were written (e.g. root-level
  // scripts/ before the skills/ui-design-engineer/ move) — rewriting it to match the
  // current layout would misrepresent what actually happened at each past release.
  //
  // evals/evaluation-suite.md is excluded: its "scripts/foo.js" mentions describe what
  // the AGENT does when running its own bundled skill (agent-perspective narrative,
  // same convention as SKILL.md's own bare paths), not a pointer for a human browsing
  // this repository — they're correct as bare paths and aren't meant to resolve
  // relative to the repo root.
  const EXCLUDED = new Set(["CHANGELOG.md", path.join("evals", "evaluation-suite.md")]);
  const mdFiles = collectFiles(ROOT, (rel) => rel.endsWith(".md") && !rel.startsWith("node_modules") && !EXCLUDED.has(rel));
  const broken = [];
  for (const rel of mdFiles) {
    // Two possible bases, not "relative to the file's own directory": references/,
    // templates/, scripts/, and checklists/ are SIBLINGS under skills/ui-design-engineer/
    // and cross-reference each other relative to that shared skill root (a file in
    // checklists/ mentioning "scripts/foo.js" means the skill's sibling scripts/ dir,
    // not a scripts/ nested inside checklists/). Files outside skills/ui-design-engineer/
    // (README, CHANGELOG, evals/**) resolve their mentions relative to the repo root.
    const absPath = path.join(ROOT, rel);
    const base = absPath.startsWith(SKILL_ROOT + path.sep) ? SKILL_ROOT : ROOT;
    const text = fs.readFileSync(absPath, "utf8");
    const seen = new Set();
    for (const match of text.matchAll(pathPattern)) {
      const m = match[0];
      const isPrefixed = m.startsWith("skills/");
      // A bare (non-prefixed) mention immediately preceded by "node " outside
      // skills/ui-design-engineer/ is a literal command example (e.g. `node
      // scripts/visual-qa.js --url ...`) meant to be run from within the skill's own
      // installed directory — it's intentionally skill-relative, not repo-root-
      // relative, so it isn't checked against ROOT. Bare mentions elsewhere in a
      // root-level doc are real repo-navigation pointers and DO need the prefix.
      const precedingText = text.slice(Math.max(0, match.index - 5), match.index);
      const isCommandExample = base === ROOT && !isPrefixed && /node\s+$/.test(precedingText);
      const dedupeKey = `${m}|${isCommandExample}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      if (isCommandExample) continue;
      if (!fs.existsSync(path.join(base, m))) broken.push(`${rel}: ${m}`);
    }
  }
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
        path.join(SKILL_ROOT, "scripts/validate-design-tokens.js"),
        "--design-md",
        path.join(SKILL_ROOT, "templates/DESIGN.md"),
        "--css",
        path.join(SKILL_ROOT, "templates/adapters/react-tailwind/globals.css"),
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
