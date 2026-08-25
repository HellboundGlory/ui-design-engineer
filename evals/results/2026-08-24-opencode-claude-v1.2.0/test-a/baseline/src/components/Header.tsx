import { TIME_RANGES, type TimeRangeKey } from "../lib/simulator";

interface HeaderProps {
  range: TimeRangeKey;
  onRangeChange: (r: TimeRangeKey) => void;
  paused: boolean;
  onTogglePaused: () => void;
  lastUpdated: number;
}

export function Header({ range, onRangeChange, paused, onTogglePaused, lastUpdated }: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-4 border-b border-slate-800 pb-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
          API Traffic
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 tracking-wide">
            v2 gateway
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Real-time request volume, error budget &amp; latency</p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span
            className={`h-2 w-2 rounded-full ${paused ? "bg-slate-600" : "bg-emerald-400 animate-pulse"}`}
            aria-hidden="true"
          />
          {paused ? "Paused" : "Live"}
          <span className="text-slate-600">
            · updated {new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>

        <button
          type="button"
          onClick={onTogglePaused}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          {paused ? "Resume" : "Pause"}
        </button>

        <div role="group" aria-label="Time range" className="flex rounded-lg border border-slate-700 bg-slate-900 p-0.5">
          {TIME_RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => onRangeChange(r.key)}
              aria-pressed={range === r.key}
              className={`rounded-md px-2.5 py-1 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-colors ${
                range === r.key ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
