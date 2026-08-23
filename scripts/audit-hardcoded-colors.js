#!/usr/bin/env node
/**
 * audit-hardcoded-colors.js
 *
 * Scans source files for likely design-token bypasses:
 *   - raw hex colors (#1e293b, #fff) in component source
 *   - arbitrary Tailwind color utilities (bg-blue-600, text-red-500, border-[#123456])
 *   - raw rgb()/hsl() color functions outside of token/theme definition files
 *
 * Deliberately conservative to avoid drowning the agent in false positives:
 *   - skips node_modules, build output, and the project's own token-definition files
 *     (globals.css, tailwind.config.*, theme files) where raw values are expected
 *   - skips comments is NOT attempted (no real CSS/JS parser) — this is a fast
 *     regex-based scan meant to flag likely violations for human/agent review,
 *     not a guaranteed-precise AST audit
 *
 * Usage: node scripts/audit-hardcoded-colors.js [--dir <path>] [--ext .tsx,.ts,.jsx,.js]
 * Exits non-zero if any likely violation is found.
 * No dependencies beyond Node's built-in fs/path.
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
function flagValue(flag, fallback) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : fallback;
}

const ROOT = flagValue("--dir") ? path.resolve(flagValue("--dir")) : process.cwd();
const extensions = flagValue("--ext", ".tsx,.ts,.jsx,.js,.vue,.svelte").split(",");

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", "out", ".turbo", ".svelte-kit", "coverage"]);
// Files where raw color values are the expected place they live — never flag these.
const SKIP_FILE_PATTERNS = [
  /globals?\.css$/i,
  /tailwind\.config\.(js|ts|mjs|cjs)$/i,
  /theme\.(js|ts|css)$/i,
  /tokens?\.(js|ts|json|css)$/i,
  /design-tokens/i,
];

function shouldSkipFile(relPath) {
  return SKIP_FILE_PATTERNS.some((re) => re.test(relPath));
}

function collectFiles(dir) {
  const out = [];
  let entries;
  try {
    entries = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      out.push(...collectFiles(path.join(dir, entry.name)));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      const rel = path.join(dir, entry.name);
      if (!shouldSkipFile(rel)) out.push(rel);
    }
  }
  return out;
}

// Tailwind arbitrary/palette color utility classes: bg-blue-600, text-red-500/50,
// border-emerald-400, ring-rose-300, from-purple-600, to-blue-500, via-indigo-500.
// Deliberately excludes semantic-sounding names (bg-primary, text-foreground, etc.)
// by requiring a Tailwind default palette color name + numeric shade.
const TAILWIND_PALETTE_COLORS = [
  "slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber", "yellow",
  "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet",
  "purple", "fuchsia", "pink", "rose",
];
const tailwindUtilityRe = new RegExp(
  `\\b(?:bg|text|border|ring|from|via|to|fill|stroke|outline|divide|decoration|shadow|accent|caret)-(?:${TAILWIND_PALETTE_COLORS.join("|")})-\\d{2,3}\\b`,
  "g"
);

const hexColorRe = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const rgbHslRe = /\b(?:rgb|rgba|hsl|hsla)\(\s*\d/g;

// Arbitrary hex inside a Tailwind bracket utility, e.g. bg-[#1e293b], text-[#fff]
const tailwindArbitraryHexRe = /\b[a-z-]+-\[#[0-9a-fA-F]{3,8}\]/g;

const files = collectFiles(".");
const findings = [];

for (const relPath of files) {
  let text;
  try {
    text = fs.readFileSync(path.join(ROOT, relPath), "utf8");
  } catch {
    continue;
  }
  const lines = text.split("\n");
  lines.forEach((line, idx) => {
    const lineNo = idx + 1;
    const matches = new Set([
      ...(line.match(tailwindUtilityRe) || []),
      ...(line.match(tailwindArbitraryHexRe) || []),
      ...(line.match(hexColorRe) || []),
      ...(line.match(rgbHslRe) || []),
    ]);
    if (matches.size > 0) {
      findings.push({ file: relPath, line: lineNo, matches: [...matches], text: line.trim().slice(0, 120) });
    }
  });
}

console.log("ui-design-engineer :: hardcoded color audit");
console.log(`Scanned ${files.length} files under ${ROOT} (extensions: ${extensions.join(", ")})`);
console.log("");

if (findings.length === 0) {
  console.log("OK — no likely hardcoded colors or arbitrary Tailwind palette utilities found.");
  process.exit(0);
}

console.log(`${findings.length} likely token bypass${findings.length === 1 ? "" : "es"} found:`);
console.log("");
for (const f of findings) {
  console.log(`${f.file}:${f.line}  [${f.matches.join(", ")}]`);
  console.log(`  ${f.text}`);
}
console.log("");
console.log(
  "Review each: replace with the project's semantic tokens (bg-primary, text-foreground, border-border, etc.)"
);
console.log("per references/design-system-tokens.md. Some matches may be legitimate (e.g. a one-off brand");
console.log("illustration color, or a value inside a file this scanner doesn't know to skip) — use judgment,");
console.log("but treat each as a real finding to justify, not to dismiss by default.");
process.exit(1);
