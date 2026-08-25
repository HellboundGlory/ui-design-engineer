import type { ReactNode } from "react";

type Tone = "neutral" | "accent" | "danger" | "warn" | "success";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-canvas text-ink-500 ring-1 ring-inset ring-border-strong",
  accent: "bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-400/30",
  danger: "bg-danger-50 text-danger-600 ring-1 ring-inset ring-danger-500/20",
  warn: "bg-warn-50 text-warn-500 ring-1 ring-inset ring-warn-500/25",
  success: "bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-400/30",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
