#!/usr/bin/env node
/**
 * check-ui-dependencies.js
 *
 * Scans package.json for signs of dependency drift:
 *   - multiple UI primitive engines installed at once (Radix + MUI + Chakra, etc.)
 *   - multiple libraries in the same category that should generally have one
 *     winner per project (date libraries, animation libraries, form libraries,
 *     icon sets, charting engines)
 *   - individually large UI-adjacent dependencies, flagged as a review trigger
 *     against the ~15KB gzipped single-component budget guardrail (heuristic,
 *     not a hard fail — see references/component-selection.md)
 *
 * This does NOT install packages or inspect node_modules for actual bundle size;
 * it works off known-heavy package names as a heuristic. For real bundle numbers,
 * use the project's own bundler analyzer (e.g. `next build`, `vite-bundle-visualizer`).
 *
 * Usage: node scripts/check-ui-dependencies.js [--dir <path>]
 * Exits non-zero only when a genuine duplicate-engine conflict is found;
 * heavy-dependency and category-duplication findings are warnings (exit 0).
 * No dependencies beyond Node's built-in fs/path.
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const dirFlagIndex = args.indexOf("--dir");
const ROOT = dirFlagIndex !== -1 ? path.resolve(args[dirFlagIndex + 1]) : process.cwd();

const pkgPath = path.join(ROOT, "package.json");
if (!fs.existsSync(pkgPath)) {
  console.error(`No package.json found at ${pkgPath}`);
  process.exit(2);
}
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const depNames = Object.keys(deps);

const CATEGORIES = {
  "component-system": ["@mantine/core", "@chakra-ui/react", "@mui/material", "@fluentui/react-components", "@primer/react", "antd"],
  "primitive-engine": ["@radix-ui/react-dialog", "@base-ui-components/react", "react-aria-components", "@headlessui/react"],
  "date-library": ["date-fns", "dayjs", "luxon", "moment"],
  "animation-library": ["motion", "framer-motion", "gsap", "@react-spring/web"],
  "icon-set": ["lucide-react", "@heroicons/react", "phosphor-react", "@phosphor-icons/react", "react-icons"],
  "charting-library": ["recharts", "@visx/visx", "@observablehq/plot", "echarts", "echarts-for-react", "chart.js", "@tremor/react"],
  "form-library": ["react-hook-form", "formik", "@tanstack/react-form"],
};

// Known heavy UI-adjacent single-purpose packages worth flagging as a bundle-budget
// review trigger. This is a heuristic allowlist, not exhaustive.
const HEAVY_PACKAGES = new Set([
  "moment", // large + legacy, mutable API; prefer date-fns/dayjs on a project not already committed to it
  "lodash", // prefer lodash-es or targeted imports (lodash/debounce) over the full package
  "three",
  "@react-three/fiber",
  "@react-three/drei",
  "echarts",
  "chart.js",
  "monaco-editor",
  "@monaco-editor/react",
  "pdfjs-dist",
  "xlsx",
]);

console.log("ui-design-engineer :: UI dependency check");
console.log("");

let hasHardConflict = false;
let hasWarnings = false;

for (const [category, packages] of Object.entries(CATEGORIES)) {
  const present = packages.filter((p) => depNames.includes(p));
  if (present.length > 1) {
    hasWarnings = true;
    const severity = category === "component-system" || category === "primitive-engine" ? "CONFLICT" : "REVIEW";
    if (severity === "CONFLICT") hasHardConflict = true;
    console.log(`${severity}: multiple "${category}" packages installed: ${present.join(", ")}`);
    if (category === "component-system" || category === "primitive-engine") {
      console.log(
        "  Per references/component-selection.md, prefer a single primitive/component engine per project."
      );
      console.log("  If this is intentional (e.g., a migration in progress), document why in DESIGN.md §19 Exceptions.");
    } else {
      console.log(`  Consider standardizing on one ${category.replace("-", " ")} rather than maintaining both.`);
    }
    console.log("");
  }
}

const heavyFound = depNames.filter((d) => HEAVY_PACKAGES.has(d));
if (heavyFound.length > 0) {
  hasWarnings = true;
  console.log(`REVIEW: heavy UI-adjacent dependencies present (bundle-budget review trigger, not a ban): ${heavyFound.join(", ")}`);
  console.log("  Confirm these are isolated behind dynamic/lazy imports where feasible, and are genuinely justified");
  console.log("  for this feature rather than pulled in for a single trivial use. See references/component-selection.md.");
  console.log("");
}

if (!hasWarnings) {
  console.log("OK — no duplicate primitive engines, category overlaps, or known-heavy dependencies detected.");
}

process.exit(hasHardConflict ? 1 : 0);
