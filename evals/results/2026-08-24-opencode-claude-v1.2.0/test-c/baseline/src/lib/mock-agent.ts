import { createId } from "./format";
import type { AgentStreamEvent, Attachment, ToolCall } from "./types";

type EmitFn = (event: AgentStreamEvent) => void;

interface TextStep {
  kind: "text";
  text: string;
}

interface ToolStep {
  kind: "tool";
  name: string;
  label: string;
  input: Record<string, unknown>;
  durationMs: number;
  result: { ok: true; output: string } | { ok: false; error: string };
}

type Step = TextStep | ToolStep;

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

async function streamText(
  blockId: string,
  text: string,
  emit: EmitFn,
  signal: AbortSignal,
): Promise<void> {
  const tokens = text.match(/\S+\s*|\s+/g) ?? [text];
  let i = 0;
  while (i < tokens.length) {
    if (signal.aborted) return;
    const chunkSize = 1 + Math.floor(Math.random() * 2);
    const chunk = tokens.slice(i, i + chunkSize).join("");
    emit({ type: "text-delta", blockId, delta: chunk });
    i += chunkSize;
    await sleep(16 + Math.random() * 26, signal);
  }
}

let rotation = 0;

const CODE_SNIPPET = `\`\`\`diff
export function PriceBadge({ cents }: { cents: number }) {
  const value = (cents / 100).toFixed(2);
- return <span className="badge">{value}</span>;
+ return <span className="badge" aria-label={\`$\${value}\`}>
+   \${value}
+ </span>;
}
\`\`\``;

const TABLE_SNIPPET = `| Metric | Before | After |
| --- | ---: | ---: |
| LCP | 2.9s | 1.6s |
| Bundle size | 412 KB | 298 KB |
| Test coverage | 71% | 84% |`;

function buildScript(userText: string, attachments: Attachment[]): Step[] {
  const trimmed = userText.trim();
  const summary = trimmed.length > 64 ? `${trimmed.slice(0, 61)}...` : trimmed || "your request";
  const wantsError = /\b(error|fail|failing|broken|bug|crash)\b/i.test(userText);
  const readyAttachments = attachments.filter((a) => a.status === "ready");

  const steps: Step[] = [];

  steps.push({
    kind: "text",
    text: `Let me look into "${summary}".\n\n`,
  });

  if (readyAttachments.length > 0) {
    const names = readyAttachments.map((a) => a.name).join(", ");
    steps.push({
      kind: "tool",
      name: "read_attachment",
      label: `Reading ${readyAttachments.length} attachment${readyAttachments.length > 1 ? "s" : ""}`,
      input: { files: readyAttachments.map((a) => a.name) },
      durationMs: 500 + Math.random() * 300,
      result: {
        ok: true,
        output: `Parsed ${names}\n${readyAttachments
          .map((a) => `  - ${a.name} (${a.mimeType || "unknown"}, ${a.size} bytes)`)
          .join("\n")}`,
      },
    });
  }

  if (wantsError) {
    steps.push({
      kind: "text",
      text: "I'll start by searching the codebase, then reproduce the failure.\n\n",
    });
    steps.push({
      kind: "tool",
      name: "search_codebase",
      label: "Searching codebase",
      input: { query: trimmed || "recent changes", scope: "src/**/*.{ts,tsx}" },
      durationMs: 700 + Math.random() * 400,
      result: {
        ok: true,
        output:
          "src/lib/payments.ts:42\nsrc/lib/payments.test.ts:18\nsrc/components/Checkout.tsx:107\n\n3 matches in 3 files",
      },
    });
    steps.push({
      kind: "tool",
      name: "run_tests",
      label: "Running test suite",
      input: { command: "npm test -- payments" },
      durationMs: 1100 + Math.random() * 400,
      result: {
        ok: false,
        error:
          "FAIL src/lib/payments.test.ts\n  ● rounds cents to nearest currency unit\n\n  expect(received).toBe(expected)\n  Expected: 19.99\n  Received: 19.98999999999999\n\n  1 failed, 11 passed, 12 total",
      },
    });
    steps.push({
      kind: "text",
      text:
        "That confirms it — `payments.ts` is doing raw floating point division, which drifts on some inputs. I'll switch the rounding to fixed-point cents arithmetic and re-run the suite.\n\n" +
        CODE_SNIPPET +
        "\n\n",
    });
    steps.push({
      kind: "tool",
      name: "apply_patch",
      label: "Applying patch",
      input: { file: "src/lib/payments.ts" },
      durationMs: 500 + Math.random() * 250,
      result: { ok: true, output: "1 file changed, 4 insertions(+), 2 deletions(-)" },
    });
    steps.push({
      kind: "tool",
      name: "run_tests",
      label: "Re-running test suite",
      input: { command: "npm test -- payments" },
      durationMs: 900 + Math.random() * 300,
      result: { ok: true, output: "PASS src/lib/payments.test.ts\n\n12 passed, 12 total" },
    });
    steps.push({
      kind: "text",
      text:
        "Fixed. The rounding bug is gone and the full suite is green again.\n\n" +
        "**What changed**\n\n" +
        "1. Replaced float division with integer cents math in `payments.ts`.\n" +
        "2. Added an explicit `aria-label` so the formatted price is announced correctly.\n" +
        "3. Re-ran the targeted test file to confirm the fix.\n\n" +
        "Let me know if you'd like me to widen the fix to the other currency helpers.",
    });
    return steps;
  }

  if (rotation % 2 === 0) {
    steps.push({
      kind: "text",
      text: "I'll search for the relevant files first, then propose a change.\n\n",
    });
    steps.push({
      kind: "tool",
      name: "search_codebase",
      label: "Searching codebase",
      input: { query: trimmed || "component", scope: "src/**" },
      durationMs: 650 + Math.random() * 350,
      result: {
        ok: true,
        output: "src/components/Button.tsx:1\nsrc/components/Button.module.css:1\n\n2 matches in 2 files",
      },
    });
    steps.push({
      kind: "text",
      text:
        "Found it. Here's a focused change with an accessible label added alongside the visual price:\n\n" +
        CODE_SNIPPET +
        "\n\nThis keeps the visual output identical while giving screen readers a proper currency announcement.\n\n",
    });
    steps.push({
      kind: "tool",
      name: "apply_patch",
      label: "Applying patch",
      input: { file: "src/components/Button.tsx" },
      durationMs: 500 + Math.random() * 300,
      result: { ok: true, output: "1 file changed, 6 insertions(+), 2 deletions(-)" },
    });
    steps.push({
      kind: "tool",
      name: "run_tests",
      label: "Running test suite",
      input: { command: "npm test" },
      durationMs: 1000 + Math.random() * 500,
      result: { ok: true, output: "PASS src/components/Button.test.tsx\n\n14 passed, 14 total" },
    });
    steps.push({
      kind: "text",
      text:
        "Done — patch applied and the suite passes.\n\n" +
        "- Added `aria-label` to the price badge\n" +
        "- No visual regressions, verified against the existing test file\n" +
        "- Suite: 14 passed, 14 total\n\n" +
        "Anything else you'd like adjusted?",
    });
  } else {
    steps.push({
      kind: "text",
      text: "Let me pull together some background before answering.\n\n",
    });
    steps.push({
      kind: "tool",
      name: "web_search",
      label: "Searching the web",
      input: { query: trimmed || "topic" },
      durationMs: 800 + Math.random() * 400,
      result: {
        ok: true,
        output: "5 results retrieved — top sources: web.dev, MDN, developer blogs",
      },
    });
    steps.push({
      kind: "text",
      text:
        "Here's a summary, plus the numbers that motivated the change:\n\n" +
        "## Summary\n\n" +
        "Deferring non-critical JS and trimming the bundle had the biggest impact on load performance.\n\n" +
        TABLE_SNIPPET +
        "\n\n" +
        "Key takeaways:\n\n" +
        "- Code-splitting the editor route cut the initial bundle by **28%**\n" +
        "- Swapping the date library removed a 40 KB dependency\n" +
        "- Image `loading=\"lazy\"` plus explicit dimensions fixed layout shift\n\n" +
        "Want me to open a PR with these changes?",
    });
  }
  rotation += 1;
  return steps;
}

export type AgentTurnResult = "done" | "stopped";

export async function runAgentTurn(
  userText: string,
  attachments: Attachment[],
  emit: EmitFn,
  signal: AbortSignal,
): Promise<AgentTurnResult> {
  const steps = buildScript(userText, attachments);

  for (const step of steps) {
    if (signal.aborted) return "stopped";

    if (step.kind === "text") {
      const blockId = createId("blk");
      emit({ type: "text-block-start", blockId });
      await streamText(blockId, step.text, emit, signal);
      if (signal.aborted) return "stopped";
    } else {
      const id = createId("tool");
      const toolCall: ToolCall = {
        id,
        name: step.name,
        label: step.label,
        input: step.input,
        status: "pending",
      };
      emit({ type: "tool-call-start", toolCall });
      await sleep(200 + Math.random() * 200, signal);
      if (signal.aborted) return "stopped";

      emit({ type: "tool-call-running", id });
      await sleep(step.durationMs, signal);
      if (signal.aborted) return "stopped";

      if (step.result.ok) {
        emit({ type: "tool-call-complete", id, output: step.result.output });
      } else {
        emit({ type: "tool-call-error", id, error: step.result.error });
      }
    }
  }

  emit({ type: "message-done" });
  return "done";
}
