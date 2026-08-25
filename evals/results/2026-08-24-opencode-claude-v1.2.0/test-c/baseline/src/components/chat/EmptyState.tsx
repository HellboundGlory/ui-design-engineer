import { Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Fix the rounding bug in the checkout price display",
  "Summarize recent performance improvements to the app",
  "Add an accessible label to the price badge component",
];

export function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15">
        <Sparkles size={20} style={{ color: "var(--color-accent)" }} />
      </div>
      <h1 className="mt-4 text-[17px] font-medium text-text">What are we working on?</h1>
      <p className="mt-1.5 max-w-sm text-center text-[13px] text-text-muted">
        Ask the agent to research, edit code, or run tools. Attach files for extra context.
      </p>
      <div className="mt-5 flex w-full max-w-md flex-col gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-xl border bg-surface px-3.5 py-2.5 text-left text-[13px] text-text-muted transition-colors hover:border-border-strong hover:text-text"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
