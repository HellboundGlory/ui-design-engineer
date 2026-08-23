#!/usr/bin/env node
/**
 * inspect-project.js
 *
 * Scans the current project (or a --dir path) for framework, styling architecture,
 * component/primitive systems, and existing design memory, and prints a JSON summary.
 *
 * This is Phase 2 ("Existing-System Inspection") of the ui-design-engineer workflow —
 * run this BEFORE proposing any visual direction or component choice. It exists so the
 * agent reasons from what's actually in the repo instead of assuming every project is
 * a greenfield React/Tailwind/shadcn app.
 *
 * Usage: node scripts/inspect-project.js [--dir <path>] [--json]
 * No dependencies beyond Node's built-in fs/path — runs anywhere Node runs.
 */

const fs = require("fs");
const path = require("path");
const { printHelp, wantsHelp } = require("./lib/cli-help");

const args = process.argv.slice(2);

if (wantsHelp(args)) {
  printHelp({
    name: "inspect-project.js",
    summary:
      "Scans a project for framework, styling architecture, component/primitive systems, and existing\n" +
      "design memory (DESIGN.md). Run this before proposing any visual direction or component choice —\n" +
      "it's Phase 2 (Existing-System Inspection) of the ui-design-engineer workflow.",
    usage: "node scripts/inspect-project.js [--dir <path>] [--json]",
    options: [
      { flag: "--dir <path>", desc: "Project root to inspect (default: current directory)" },
      { flag: "--json", desc: "Print only the JSON summary, no human-readable notes" },
      { flag: "--help, -h", desc: "Show this help" },
    ],
    exitCodes: [{ code: "0", meaning: "Always — this is a read-only report, not a pass/fail gate" }],
    examples: [
      "node scripts/inspect-project.js",
      "node scripts/inspect-project.js --dir ./apps/web --json",
    ],
    notes: [
      "No dependencies beyond Node's built-in fs/path — runs anywhere Node runs.",
      "Output is safe to pipe: `node scripts/inspect-project.js --json | jq .componentSystem`",
    ],
  });
  process.exit(0);
}

const dirFlagIndex = args.indexOf("--dir");
const ROOT = dirFlagIndex !== -1 ? path.resolve(args[dirFlagIndex + 1]) : process.cwd();
const jsonOnly = args.includes("--json");

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function readJsonSafe(relPath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf8"));
  } catch {
    return null;
  }
}

function findFilesShallow(relDir, matcher, maxDepth = 4) {
  const found = [];
  function walk(dir, depth) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name.startsWith(".git")) continue;
      const rel = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(rel, depth + 1);
      } else if (matcher(entry.name)) {
        found.push(rel);
      }
    }
  }
  walk(relDir, 0);
  return found;
}

const pkg = readJsonSafe("package.json");
const deps = pkg ? { ...pkg.dependencies, ...pkg.devDependencies } : {};
const hasDep = (name) => Boolean(deps && deps[name]);

// --- Framework detection ---
let framework = "unknown";
if (hasDep("next")) framework = "next";
else if (hasDep("nuxt") || hasDep("nuxt3")) framework = "nuxt";
else if (hasDep("@sveltejs/kit")) framework = "sveltekit";
else if (hasDep("svelte")) framework = "svelte";
else if (hasDep("vue")) framework = "vue";
else if (hasDep("react") && hasDep("vite")) framework = "react-vite";
else if (hasDep("react")) framework = "react";
else if (pkg) framework = "node (framework not detected)";
else framework = "no package.json found";

const packageManager = exists("pnpm-lock.yaml")
  ? "pnpm"
  : exists("yarn.lock")
  ? "yarn"
  : exists("bun.lockb")
  ? "bun"
  : exists("package-lock.json")
  ? "npm"
  : "unknown";

const typescript = hasDep("typescript") || exists("tsconfig.json");

// --- Styling architecture ---
let styling = "unknown";
let tailwindVersion = null;
if (hasDep("tailwindcss")) {
  tailwindVersion = deps.tailwindcss;
  styling = tailwindVersion && tailwindVersion.replace(/[\^~]/, "").startsWith("4") ? "tailwind-v4" : "tailwind-v3-or-earlier";
} else if (hasDep("styled-components")) {
  styling = "styled-components";
} else if (hasDep("@emotion/react") || hasDep("@emotion/styled")) {
  styling = "emotion";
} else if (hasDep("@vanilla-extract/css")) {
  styling = "vanilla-extract";
} else if (findFilesShallow(".", (n) => n.endsWith(".module.css")).length > 0) {
  styling = "css-modules";
} else {
  styling = "plain-css-or-undetected";
}

// --- CSS custom properties / design tokens ---
const cssFiles = findFilesShallow(".", (n) => n.endsWith(".css"));
let cssCustomPropertyCount = 0;
let sampleTokenFile = null;
for (const file of cssFiles) {
  try {
    const content = fs.readFileSync(path.join(ROOT, file), "utf8");
    const matches = content.match(/--[a-zA-Z0-9-]+\s*:/g);
    if (matches && matches.length > 0) {
      cssCustomPropertyCount += matches.length;
      if (!sampleTokenFile) sampleTokenFile = file;
    }
  } catch {
    /* unreadable file, skip */
  }
}

// --- Component / primitive / registry detection ---
const primitiveSystem = hasDep("@radix-ui/react-dialog") || Object.keys(deps).some((d) => d.startsWith("@radix-ui/"))
  ? "radix"
  : hasDep("@base-ui-components/react")
  ? "base-ui"
  : hasDep("react-aria") || hasDep("react-aria-components")
  ? "react-aria"
  : hasDep("@headlessui/react")
  ? "headlessui"
  : null;

const componentSystem = exists("components.json")
  ? "shadcn"
  : hasDep("@mantine/core")
  ? "mantine"
  : hasDep("@chakra-ui/react")
  ? "chakra"
  : hasDep("@mui/material")
  ? "mui"
  : hasDep("@fluentui/react-components")
  ? "fluent"
  : hasDep("@primer/react")
  ? "primer"
  : hasDep("antd")
  ? "antd"
  : null;

const icons = hasDep("lucide-react")
  ? "lucide"
  : hasDep("@heroicons/react")
  ? "heroicons"
  : hasDep("phosphor-react") || hasDep("@phosphor-icons/react")
  ? "phosphor"
  : hasDep("react-icons")
  ? "react-icons"
  : null;

const animation = hasDep("motion")
  ? "motion"
  : hasDep("framer-motion")
  ? "framer-motion"
  : hasDep("gsap")
  ? "gsap"
  : hasDep("@react-spring/web")
  ? "react-spring"
  : null;

const charts = hasDep("recharts")
  ? "recharts"
  : hasDep("@visx/visx") || Object.keys(deps).some((d) => d.startsWith("@visx/"))
  ? "visx"
  : hasDep("@observablehq/plot")
  ? "observable-plot"
  : hasDep("echarts") || hasDep("echarts-for-react")
  ? "echarts"
  : hasDep("chart.js")
  ? "chart.js"
  : hasDep("@tremor/react")
  ? "tremor"
  : null;

const forms = hasDep("react-hook-form")
  ? "react-hook-form"
  : hasDep("formik")
  ? "formik"
  : hasDep("@tanstack/react-form")
  ? "tanstack-form"
  : null;

const dateLibrary = hasDep("date-fns")
  ? "date-fns"
  : hasDep("dayjs")
  ? "dayjs"
  : hasDep("luxon")
  ? "luxon"
  : hasDep("moment")
  ? "moment (legacy — do not add to a project that doesn't already use it)"
  : null;

const dataTable = hasDep("@tanstack/react-table")
  ? "tanstack-table"
  : hasDep("ag-grid-react")
  ? "ag-grid"
  : null;

// --- Design memory ---
const designMemory = exists("DESIGN.md") || exists("docs/DESIGN.md");
const designMemoryPath = exists("DESIGN.md") ? "DESIGN.md" : exists("docs/DESIGN.md") ? "docs/DESIGN.md" : null;

const otherDesignDocs = findFilesShallow(".", (n) =>
  /^(design-system|STYLEGUIDE|styleguide|tokens)\.(md|json)$/i.test(n)
);

const summary = {
  root: ROOT,
  framework,
  packageManager,
  typescript,
  styling,
  tailwindVersion,
  cssCustomPropertyCount,
  sampleTokenFile,
  primitiveSystem,
  componentSystem,
  icons,
  animation,
  charts,
  forms,
  dateLibrary,
  dataTable,
  designMemory,
  designMemoryPath,
  otherDesignDocs,
};

if (jsonOnly) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log("ui-design-engineer :: project inspection");
  console.log(JSON.stringify(summary, null, 2));
  console.log("");
  if (!designMemory) {
    console.log(
      "No DESIGN.md found. Consider instantiating templates/DESIGN.md, populated with values from a chosen archetype, before establishing new visual direction."
    );
  }
  if (componentSystem && componentSystem !== "shadcn") {
    console.log(
      `Detected an existing component system ("${componentSystem}"). Per references/component-selection.md, prefer this system over introducing shadcn/Tailwind-first primitives.`
    );
  }
  if (!pkg) {
    console.log("No package.json found at this root — this may not be a JS/TS frontend project, or --dir points at the wrong path.");
  }
}
