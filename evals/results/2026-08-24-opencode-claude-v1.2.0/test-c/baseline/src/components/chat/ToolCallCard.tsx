"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  FileEdit,
  FileText,
  Globe,
  Loader2,
  Search,
  TerminalSquare,
  Wrench,
} from "lucide-react";
import type { ToolCall } from "@/lib/types";
import { TOOL_STATUS_META } from "@/lib/status-meta";
import { formatDuration } from "@/lib/format";

const TOOL_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  search_codebase: Search,
  web_search: Globe,
  run_tests: TerminalSquare,
  apply_patch: FileEdit,
  read_attachment: FileText,
};

function useElapsed(active: boolean, startedAt?: number): number {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!active || !startedAt) return;
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 250);
    return () => clearInterval(id);
  }, [active, startedAt]);
  return elapsed;
}

export function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
  const [expanded, setExpanded] = useState(true);
  const [trackedStatus, setTrackedStatus] = useState(toolCall.status);
  const userToggled = useRef(false);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const meta = TOOL_STATUS_META[toolCall.status];
  const Icon = TOOL_ICONS[toolCall.name] ?? Wrench;
  const isRunning = toolCall.status === "running";
  const elapsed = useElapsed(isRunning, toolCall.startedAt);

  // Force the card back open when a tool call transitions into an error
  // state, even if it had previously auto-collapsed. Adjusting state during
  // render (rather than in an effect) avoids an extra render pass.
  if (toolCall.status !== trackedStatus) {
    setTrackedStatus(toolCall.status);
    if (toolCall.status === "error") {
      setExpanded(true);
    }
  }

  useEffect(() => {
    if (toolCall.status === "complete" && !userToggled.current) {
      collapseTimer.current = setTimeout(() => setExpanded(false), 1100);
    }
    return () => {
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
    };
  }, [toolCall.status]);

  const toggle = () => {
    userToggled.current = true;
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
    setExpanded((v) => !v);
  };

  const duration =
    toolCall.completedAt && toolCall.startedAt
      ? toolCall.completedAt - toolCall.startedAt
      : isRunning
        ? elapsed
        : null;

  return (
    <div
      className="enter-block overflow-hidden rounded-lg border bg-surface transition-colors"
      style={{
        borderColor:
          toolCall.status === "error"
            ? "color-mix(in srgb, var(--color-status-error) 45%, var(--color-border))"
            : "var(--color-border)",
      }}
      role="group"
      aria-label={`Tool call: ${toolCall.label}, status ${meta.label}`}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-surface-raised"
      >
        <StatusIcon status={toolCall.status} />
        <Icon size={14} className="shrink-0 text-text-faint" />
        <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-text">
          {toolCall.label}
        </span>
        {duration !== null && (
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-text-faint">
            {formatDuration(duration)}
          </span>
        )}
        <span
          className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase"
          style={{
            color: meta.colorVar,
            backgroundColor: `color-mix(in srgb, ${meta.colorVar} 14%, transparent)`,
          }}
        >
          {meta.label}
        </span>
        <ChevronRight
          size={14}
          className={`shrink-0 text-text-faint transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      <div className={`collapse-grid ${expanded ? "is-open" : ""}`}>
        <div>
          <div className="space-y-2.5 border-t px-3 py-2.5">
            {Object.keys(toolCall.input).length > 0 && (
              <div>
                <div className="mb-1 text-[10px] font-medium tracking-wide text-text-faint uppercase">
                  Input
                </div>
                <pre className="scroll-thin overflow-x-auto rounded-md bg-surface-raised px-2.5 py-2 font-mono text-[12px] leading-relaxed text-text-muted">
{JSON.stringify(toolCall.input, null, 2)}
                </pre>
              </div>
            )}
            {toolCall.status === "running" && (
              <div className="h-1 w-full overflow-hidden rounded-full bg-surface-raised">
                <div
                  className="progress-indeterminate h-full w-1/3 rounded-full"
                  style={{ background: "var(--color-status-running)" }}
                />
              </div>
            )}
            {toolCall.output && (
              <div>
                <div className="mb-1 text-[10px] font-medium tracking-wide text-text-faint uppercase">
                  Output
                </div>
                <pre className="scroll-thin overflow-x-auto rounded-md bg-surface-raised px-2.5 py-2 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-text-muted">
{toolCall.output}
                </pre>
              </div>
            )}
            {toolCall.error && (
              <div>
                <div
                  className="mb-1 flex items-center gap-1 text-[10px] font-medium tracking-wide uppercase"
                  style={{ color: "var(--color-status-error)" }}
                >
                  <AlertTriangle size={11} /> Error
                </div>
                <pre
                  className="scroll-thin overflow-x-auto rounded-md px-2.5 py-2 font-mono text-[12px] leading-relaxed whitespace-pre-wrap"
                  style={{
                    background: "color-mix(in srgb, var(--color-status-error) 10%, var(--color-surface-raised))",
                    color: "var(--color-status-error)",
                  }}
                >
{toolCall.error}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: ToolCall["status"] }) {
  const color = TOOL_STATUS_META[status].colorVar;
  if (status === "running") {
    return <Loader2 size={14} className="spin shrink-0" style={{ color }} />;
  }
  if (status === "complete") {
    return (
      <span
        className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)` }}
      >
        <Check size={9} strokeWidth={3} style={{ color }} />
      </span>
    );
  }
  if (status === "error") {
    return (
      <span
        className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)` }}
      >
        <AlertTriangle size={9} strokeWidth={3} style={{ color }} />
      </span>
    );
  }
  return (
    <span
      className="status-dot-running block h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: color, animationPlayState: "paused", opacity: 0.5 }}
    />
  );
}
