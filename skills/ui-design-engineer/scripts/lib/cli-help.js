/**
 * Shared --help formatter for scripts/*.js.
 *
 * Every script in this skill is meant to be callable as a black box — an agent
 * should be able to run `node scripts/<name>.js --help` and know exactly what it
 * does, what it needs, and what its exit codes mean, without reading the script's
 * source. This keeps that contract consistent across all five scripts instead of
 * five slightly different ad hoc usage strings.
 */

function printHelp({ name, summary, usage, options = [], exitCodes = [], examples = [], notes = [] }) {
  const lines = [];
  lines.push(`ui-design-engineer :: ${name}`);
  lines.push("");
  lines.push(summary);
  lines.push("");
  lines.push("Usage:");
  (Array.isArray(usage) ? usage : [usage]).forEach((u) => lines.push(`  ${u}`));

  if (options.length > 0) {
    lines.push("");
    lines.push("Options:");
    const width = Math.max(...options.map((o) => o.flag.length));
    for (const o of options) {
      lines.push(`  ${o.flag.padEnd(width)}  ${o.desc}`);
    }
  }

  if (exitCodes.length > 0) {
    lines.push("");
    lines.push("Exit codes:");
    for (const e of exitCodes) {
      lines.push(`  ${e.code}  ${e.meaning}`);
    }
  }

  if (examples.length > 0) {
    lines.push("");
    lines.push("Examples:");
    examples.forEach((e) => lines.push(`  ${e}`));
  }

  if (notes.length > 0) {
    lines.push("");
    notes.forEach((n) => lines.push(n));
  }

  console.log(lines.join("\n"));
}

function wantsHelp(args) {
  return args.includes("--help") || args.includes("-h");
}

module.exports = { printHelp, wantsHelp };
