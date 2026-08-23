#!/usr/bin/env node
/**
 * check-ui-dependencies.js
 *
 * Scans package.json for signs of dependency drift:
 *   - multiple UI primitive engines or component systems installed at once
 *     (Radix + MUI + Chakra, etc.) — the pattern that produces "component library soup"
 *   - multiple libraries in the same lower-stakes category (date, animation, icons,
 *     charting, forms) where a project usually wants one winner
 *   - individually heavy UI-adjacent dependencies, flagged as a review trigger against
 *     the ~15KB gzipped single-component budget guardrail (heuristic, not a hard fail —
 *     see references/component-selection.md)
 *
 * A detected component-system/primitive-engine conflict is a strong signal something's
 * worth reviewing, but it is NOT automatically a broken project: legitimate migrations
 * between UI systems, isolated legacy modules, and deliberately-scoped specialist
 * functionality all produce the same dependency shape. So by default this script
 * reports conflicts loudly (CONFLICT) without failing the run — use --strict for a CI
 * gate that treats an unresolved conflict as a hard failure, and --allow / a project
 * config file to mark a specific conflict as a reviewed, intentional exception.
 *
 * This also checks CROSS-system pairings, not just duplicates within one category —
 * e.g. an existing MUI project that has also picked up shadcn (components.json) and/or
 * Radix packages. MUI/Mantine/Chakra/Fluent/Primer/Ant Design each ship their own
 * primitive/interaction layer, so pairing one of them with shadcn or with a headless
 * primitive engine (Radix, Base UI, React Aria, Headless UI) is very likely an
 * unintended second design system, even though each side only has ONE package and so
 * would never trip the same-category ">1 package" check on its own. shadcn itself is
 * built ON TOP of Radix or Base UI, so that specific pairing is expected and not flagged.
 *
 * This does NOT install packages or inspect node_modules for actual bundle size; it
 * works off known-heavy package names as a heuristic. For real bundle numbers, use the
 * project's own bundler analyzer.
 *
 * Usage: node scripts/check-ui-dependencies.js [--dir <path>] [--strict] [--allow <name>]...
 * No dependencies beyond Node's built-in fs/path.
 */

const fs = require("fs");
const path = require("path");
const { printHelp, wantsHelp } = require("./lib/cli-help");

const args = process.argv.slice(2);

if (wantsHelp(args)) {
  printHelp({
    name: "check-ui-dependencies.js",
    summary:
      "Scans package.json for duplicate UI primitive/component engines (including CROSS-system pairings —\n" +
      "e.g. an existing MUI project that also picked up shadcn/Radix), category overlap (date, icons,\n" +
      "animation, charts, forms), and known-heavy UI-adjacent packages. A component-system or primitive-\n" +
      "engine conflict is reported as CONFLICT but does NOT fail the run by default — legitimate migrations\n" +
      "and isolated legacy modules produce the same shape. Use --strict for a CI gate, and --allow (or a\n" +
      "config file) to mark a specific conflict as a reviewed, intentional exception.",
    usage: "node scripts/check-ui-dependencies.js [--dir <path>] [--strict] [--allow <package-or-engine>]...",
    options: [
      { flag: "--dir <path>", desc: "Project root (default: current directory)" },
      { flag: "--strict", desc: "Exit non-zero on any unresolved CONFLICT (component-system/primitive-engine overlap)" },
      { flag: "--allow <name>", desc: "Mark a package or engine name as an intentional exception (repeatable)" },
      { flag: "--allow-file <path>", desc: "JSON file of exceptions (default: ui-design-engineer.config.json if present)" },
      { flag: "--help, -h", desc: "Show this help" },
    ],
    exitCodes: [
      { code: "0", meaning: "No CONFLICT, or --strict was not passed (CONFLICT reported but non-blocking)" },
      { code: "1", meaning: "--strict was passed and an unresolved CONFLICT remains after applying exceptions" },
      { code: "2", meaning: "Setup error — no package.json found" },
    ],
    examples: [
      "node scripts/check-ui-dependencies.js",
      "node scripts/check-ui-dependencies.js --strict",
      "node scripts/check-ui-dependencies.js --strict --allow @mui/material",
    ],
    notes: [
      "Findings are labeled OK / REVIEW / CONFLICT / ALLOWED EXCEPTION. REVIEW (category overlap, heavy",
      "deps) is always non-blocking. CONFLICT (primitive-engine, component-system, or cross-system overlap)",
      "is the category --strict can fail on. For a cross-system finding, --allow accepts either the package",
      'name (e.g. "@mui/material") or the short system id (e.g. "mui", "shadcn", "radix") — either resolves',
      "the pairing. Config file shape:",
      '  { "allowUiDependencies": [{ "name": "mui", "reason": "migrating off MUI, TICKET-123" }] }',
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
const strict = args.includes("--strict");

const pkgPath = path.join(ROOT, "package.json");
if (!fs.existsSync(pkgPath)) {
  console.error(`No package.json found at ${pkgPath}`);
  process.exit(2);
}
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const depNames = Object.keys(deps);

// --- Exceptions: CLI --allow flags + optional config file ---
const allowSet = new Set(flagValues("--allow"));
const allowReasons = {};
allowSet.forEach((name) => (allowReasons[name] = "allowed via --allow flag"));

const allowFilePath = path.resolve(ROOT, flagValue("--allow-file") || "ui-design-engineer.config.json");
if (fs.existsSync(allowFilePath)) {
  try {
    const config = JSON.parse(fs.readFileSync(allowFilePath, "utf8"));
    for (const entry of config.allowUiDependencies || []) {
      if (entry && entry.name) {
        allowSet.add(entry.name);
        allowReasons[entry.name] = entry.reason || `documented exception in ${path.relative(ROOT, allowFilePath)}`;
      }
    }
  } catch (err) {
    console.error(`Warning: could not parse ${path.relative(ROOT, allowFilePath)} — ${err.message}`);
  }
}

// --- Category detection: exact package names AND namespace prefixes ---
// Radix (and similar scoped ecosystems) ship as many separate packages under one
// namespace (@radix-ui/react-dialog, @radix-ui/react-popover, ...). Matching only one
// "representative" package name misses every project that happened to install a
// different subset — detect the whole namespace instead.
const CATEGORIES = {
  "component-system": {
    packages: ["@mantine/core", "@chakra-ui/react", "@mui/material", "@fluentui/react-components", "@primer/react", "antd"],
    prefixes: [],
  },
  "primitive-engine": {
    packages: ["@base-ui-components/react", "react-aria-components", "@headlessui/react"],
    prefixes: ["@radix-ui/"],
  },
  "date-library": { packages: ["date-fns", "dayjs", "luxon", "moment"], prefixes: [] },
  "animation-library": { packages: ["motion", "framer-motion", "gsap", "@react-spring/web"], prefixes: [] },
  "icon-set": { packages: ["lucide-react", "@heroicons/react", "phosphor-react", "@phosphor-icons/react", "react-icons"], prefixes: [] },
  "charting-library": {
    packages: ["recharts", "@observablehq/plot", "echarts", "echarts-for-react", "chart.js", "@tremor/react"],
    prefixes: ["@visx/"],
  },
  "form-library": { packages: ["react-hook-form", "formik", "@tanstack/react-form"], prefixes: [] },
};

function presentInCategory(category) {
  const fromPackages = category.packages.filter((p) => depNames.includes(p));
  const fromPrefixes = depNames.filter((d) => category.prefixes.some((p) => d.startsWith(p)));
  return [...new Set([...fromPackages, ...fromPrefixes])];
}

const HARD_CONFLICT_CATEGORIES = new Set(["component-system", "primitive-engine"]);

// --- Cross-system compatibility model ---
// Short, explicit id per detected package, matching inspect-project.js's system ids —
// used both for readable output and so --allow/config-file exceptions can name a
// system ("mui", "shadcn", "radix") rather than requiring an exact package string.
const MONOLITHIC_SYSTEM_ID = {
  "@mantine/core": "mantine",
  "@chakra-ui/react": "chakra",
  "@mui/material": "mui",
  "@fluentui/react-components": "fluent",
  "@primer/react": "primer",
  antd: "antd",
};
function primitiveSystemId(pkg) {
  if (pkg.startsWith("@radix-ui/")) return "radix";
  if (pkg === "@base-ui-components/react") return "base-ui";
  if (pkg === "react-aria-components") return "react-aria";
  if (pkg === "@headlessui/react") return "headlessui";
  return pkg;
}

// Known heavy UI-adjacent single-purpose packages worth flagging as a bundle-budget
// review trigger. This is a heuristic allowlist, not exhaustive.
const HEAVY_PACKAGES = new Set([
  "moment", "lodash", "three", "@react-three/fiber", "@react-three/drei",
  "echarts", "chart.js", "monaco-editor", "@monaco-editor/react", "pdfjs-dist", "xlsx",
]);

console.log("ui-design-engineer :: UI dependency check" + (strict ? " (strict)" : ""));
console.log("");

let unresolvedConflict = false;
let anyFinding = false;

for (const [category, def] of Object.entries(CATEGORIES)) {
  const present = presentInCategory(def);
  if (present.length <= 1) continue;
  anyFinding = true;

  const isHard = HARD_CONFLICT_CATEGORIES.has(category);
  const allowed = present.filter((p) => allowSet.has(p));
  const notAllowed = present.filter((p) => !allowSet.has(p));

  if (!isHard) {
    console.log(`REVIEW: multiple "${category}" packages installed: ${present.join(", ")}`);
    console.log(`  Consider standardizing on one ${category.replace(/-/g, " ")} rather than maintaining both.`);
    console.log("");
    continue;
  }

  // Hard-conflict category (component-system / primitive-engine).
  if (allowed.length > 0) {
    console.log(`ALLOWED EXCEPTION: "${category}" overlap includes package(s) marked as reviewed: ${allowed.join(", ")}`);
    allowed.forEach((p) => console.log(`  - ${p}: ${allowReasons[p]}`));
  }
  if (notAllowed.length > 1) {
    // More than one non-allowed package in this category is still a live conflict.
    unresolvedConflict = true;
    console.log(`CONFLICT: multiple "${category}" packages installed without a documented exception: ${notAllowed.join(", ")}`);
    console.log("  Per references/component-selection.md, prefer a single primitive/component engine per project.");
    console.log("  Legitimate reasons this can happen: an in-progress migration, an isolated legacy module, or");
    console.log("  scoped specialist functionality. If intentional, mark it reviewed:");
    console.log(`    node scripts/check-ui-dependencies.js --allow <package-name>`);
    console.log(`  ...or add it to ${path.basename(allowFilePath)} with a reason, and record it in DESIGN.md §19.`);
  } else if (notAllowed.length === 1 && allowed.length > 0) {
    // Everything except one package was allowed — still worth a note, not a hard conflict on its own,
    // but surfaced so it isn't silently invisible.
    console.log(`REVIEW: "${category}" also includes a non-exempted package: ${notAllowed[0]}`);
  }
  console.log("");
}

// --- Cross-system conflict detection ---
// The loop above only catches DUPLICATES within one category (two component systems,
// or two primitive engines). It can't see a project with exactly one component system
// AND exactly one primitive engine, because each category individually has only one
// package present. That's precisely the shape of "existing MUI app that also picked up
// shadcn + Radix" — check it explicitly here instead.
{
  const shadcnPresent = fs.existsSync(path.join(ROOT, "components.json"));
  const monolithicSystems = presentInCategory(CATEGORIES["component-system"]).map((pkg) => ({
    id: MONOLITHIC_SYSTEM_ID[pkg],
    pkg,
  }));
  const primitiveSystemsPresentMap = new Map();
  for (const pkg of presentInCategory(CATEGORIES["primitive-engine"])) {
    const id = primitiveSystemId(pkg);
    if (!primitiveSystemsPresentMap.has(id)) primitiveSystemsPresentMap.set(id, pkg);
  }
  const primitiveSystemsPresent = [...primitiveSystemsPresentMap.entries()].map(([id, pkg]) => ({ id, pkg }));

  function identifiersFor(node) {
    return node.pkg ? [node.id, node.pkg] : [node.id];
  }
  function allowedNode(node) {
    return identifiersFor(node).find((id) => allowSet.has(id)) || null;
  }

  const crossPairs = [];
  // Rule A: shadcn (a component system in its own right) alongside another full
  // component system — two competing design systems.
  if (shadcnPresent) {
    for (const m of monolithicSystems) {
      crossPairs.push({
        a: { id: "shadcn", pkg: null, label: "shadcn (components.json)" },
        b: { ...m, label: `${m.id} (${m.pkg})` },
        reason: "shadcn is itself a component system — pairing it with another full component system is very likely two competing design systems, not one.",
      });
    }
  }
  // Rule B: a monolithic component system (which ships its own primitives/interaction
  // layer) alongside a headless primitive engine (Radix, Base UI, React Aria, Headless
  // UI) that has no reason to be there unless shadcn (or an equivalent bespoke layer)
  // is the thing actually using it.
  for (const m of monolithicSystems) {
    for (const p of primitiveSystemsPresent) {
      crossPairs.push({
        a: { ...m, label: `${m.id} (${m.pkg})` },
        b: { ...p, label: `${p.id} (${p.pkg})` },
        reason: `${m.id} ships its own primitives/interaction layer — a headless engine like ${p.id} alongside it is very likely an unintended second system (unless something else, like shadcn, is deliberately using it).`,
      });
    }
  }
  // shadcn + Radix / shadcn + Base UI is the EXPECTED pairing (shadcn is built on top
  // of one of them) — deliberately never generated as a finding above.

  for (const pair of crossPairs) {
    anyFinding = true;
    const allowedVia = allowedNode(pair.a) || allowedNode(pair.b);
    if (allowedVia) {
      console.log(`ALLOWED EXCEPTION: cross-system pairing "${pair.a.label}" + "${pair.b.label}" is marked as reviewed.`);
      console.log(`  - ${allowedVia}: ${allowReasons[allowedVia]}`);
    } else {
      unresolvedConflict = true;
      console.log(`CONFLICT: cross-system pairing "${pair.a.label}" + "${pair.b.label}" — no documented exception.`);
      console.log(`  ${pair.reason}`);
      console.log("  Per references/component-selection.md, prefer a single primitive/component engine per project.");
      console.log("  Legitimate reasons this can happen: an in-progress migration, an isolated legacy module, or");
      console.log("  scoped specialist functionality. If intentional, mark it reviewed:");
      console.log(`    node scripts/check-ui-dependencies.js --allow ${pair.a.id}`);
      console.log(`  ...or add it to ${path.basename(allowFilePath)} with a reason, and record it in DESIGN.md §19.`);
    }
    console.log("");
  }
}

const heavyFound = depNames.filter((d) => HEAVY_PACKAGES.has(d));
if (heavyFound.length > 0) {
  anyFinding = true;
  console.log(`REVIEW: heavy UI-adjacent dependencies present (bundle-budget review trigger, not a ban): ${heavyFound.join(", ")}`);
  console.log("  Confirm these are isolated behind dynamic/lazy imports where feasible, and are genuinely justified");
  console.log("  for this feature rather than pulled in for a single trivial use. See references/component-selection.md.");
  console.log("");
}

if (!anyFinding) {
  console.log("OK — no duplicate primitive engines, category overlaps, or known-heavy dependencies detected.");
}

if (unresolvedConflict && !strict) {
  console.log("Unresolved CONFLICT(s) above did not fail this run (default mode is review-only). Re-run with --strict to gate on them.");
}

process.exit(strict && unresolvedConflict ? 1 : 0);
