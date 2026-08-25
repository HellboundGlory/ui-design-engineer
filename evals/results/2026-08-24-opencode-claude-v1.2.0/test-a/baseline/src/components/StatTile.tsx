interface StatTileProps {
  label: string;
  value: string;
  unit?: string;
  delta?: number | null;
  deltaGoodDirection?: "up" | "down";
  accent?: "default" | "danger";
}

export function StatTile({ label, value, unit, delta, deltaGoodDirection = "up", accent = "default" }: StatTileProps) {
  const hasDelta = delta !== undefined && delta !== null && Number.isFinite(delta);
  const isGood = hasDelta ? (deltaGoodDirection === "up" ? delta! >= 0 : delta! <= 0) : true;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span
          className={`text-2xl font-semibold tabular-nums ${accent === "danger" ? "text-red-400" : "text-slate-50"}`}
        >
          {value}
        </span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
      {hasDelta && (
        <span
          className={`inline-flex w-fit items-center gap-1 text-xs font-medium tabular-nums ${
            isGood ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {delta! >= 0 ? "▲" : "▼"} {Math.abs(delta!).toFixed(1)}% vs prior
        </span>
      )}
    </div>
  );
}
