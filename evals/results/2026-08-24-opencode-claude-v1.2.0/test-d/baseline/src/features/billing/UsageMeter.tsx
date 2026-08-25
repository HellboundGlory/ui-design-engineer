interface UsageMeterProps {
  label: string;
  used: number;
  limit: number;
}

export function UsageMeter({ label, used, limit }: UsageMeterProps) {
  const isUnlimited = !Number.isFinite(limit);
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const tone = pct >= 90 ? "bg-danger-500" : pct >= 70 ? "bg-warn-500" : "bg-accent-500";

  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-ink-700">{label}</span>
        <span className="text-ink-400">
          {used.toLocaleString()} / {isUnlimited ? "Unlimited" : limit.toLocaleString()}
        </span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-canvas"
        role="progressbar"
        aria-label={label}
        aria-valuenow={isUnlimited ? undefined : used}
        aria-valuemin={0}
        aria-valuemax={isUnlimited ? undefined : limit}
      >
        {!isUnlimited && <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />}
      </div>
    </div>
  );
}
