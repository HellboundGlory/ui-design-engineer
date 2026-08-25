import { useMemo, useState } from "react";
import type { EndpointSnapshot, EndpointStatus, HttpMethod } from "../types";
import { Sparkline } from "./Sparkline";

type SortKey = "path" | "rps" | "requests" | "errorRatePct" | "p50" | "p95" | "p99";
type SortDir = "asc" | "desc";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const STATUSES: { key: EndpointStatus | "all"; label: string }[] = [
  { key: "all", label: "All statuses" },
  { key: "healthy", label: "Healthy" },
  { key: "warning", label: "Warning" },
  { key: "critical", label: "Critical" },
];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  POST: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  PUT: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  PATCH: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  DELETE: "bg-red-500/15 text-red-300 border-red-500/30",
};

const STATUS_STYLES: Record<EndpointStatus, string> = {
  healthy: "bg-emerald-500/15 text-emerald-300",
  warning: "bg-amber-500/15 text-amber-300",
  critical: "bg-red-500/15 text-red-300",
};

const STATUS_DOT: Record<EndpointStatus, string> = {
  healthy: "bg-emerald-400",
  warning: "bg-amber-400",
  critical: "bg-red-400",
};

interface Column {
  key: SortKey;
  label: string;
  align?: "right";
}

const COLUMNS: Column[] = [
  { key: "path", label: "Endpoint" },
  { key: "rps", label: "RPS", align: "right" },
  { key: "requests", label: "Requests", align: "right" },
  { key: "errorRatePct", label: "Error rate", align: "right" },
  { key: "p50", label: "p50", align: "right" },
  { key: "p95", label: "p95", align: "right" },
  { key: "p99", label: "p99", align: "right" },
];

export function EndpointTable({ endpoints }: { endpoints: EndpointSnapshot[] }) {
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState<HttpMethod | "all">("all");
  const [status, setStatus] = useState<EndpointStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("requests");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return endpoints
      .filter((e) => (method === "all" ? true : e.method === method))
      .filter((e) => (status === "all" ? true : e.status === status))
      .filter((e) => (q ? e.path.toLowerCase().includes(q) || e.service.toLowerCase().includes(q) : true))
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortKey === "path") return a.path.localeCompare(b.path) * dir;
        return (a[sortKey] - b[sortKey]) * dir;
      });
  }, [endpoints, query, method, status, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 p-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Active endpoints</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {filtered.length} of {endpoints.length} shown
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="endpoint-search">
            Search endpoints
          </label>
          <input
            id="endpoint-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search path or service…"
            className="w-52 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:border-cyan-400"
          />

          <label className="sr-only" htmlFor="method-filter">
            Filter by method
          </label>
          <select
            id="method-filter"
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod | "all")}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:border-cyan-400"
          >
            <option value="all">All methods</option>
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="status-filter">
            Filter by status
          </label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => setStatus(e.target.value as EndpointStatus | "all")}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:border-cyan-400"
          >
            {STATUSES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left">
              <th className="px-4 py-2 text-xs font-medium text-slate-500">Status</th>
              {COLUMNS.map((col) => (
                <th key={col.key} className={`px-4 py-2 ${col.align === "right" ? "text-right" : "text-left"}`}>
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    className={`inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500 hover:text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded ${
                      col.align === "right" ? "flex-row-reverse" : ""
                    }`}
                    aria-sort={sortKey === col.key ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  >
                    {col.label}
                    {sortKey === col.key && <span aria-hidden="true">{sortDir === "asc" ? "↑" : "↓"}</span>}
                  </button>
                </th>
              ))}
              <th className="px-4 py-2 text-xs font-medium text-slate-500">Trend</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr
                key={e.id}
                className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[e.status]}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[e.status]} ${e.incident ? "animate-pulse" : ""}`} />
                    {e.status}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${METHOD_COLORS[e.method]}`}
                    >
                      {e.method}
                    </span>
                    <span className="font-mono text-xs text-slate-200">{e.path}</span>
                  </div>
                  <span className="ml-[2px] text-[11px] text-slate-500">{e.service}</span>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-300">{e.rps.toFixed(1)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-300">
                  {e.requests.toLocaleString()}
                </td>
                <td
                  className={`px-4 py-2.5 text-right tabular-nums font-medium ${
                    e.status === "critical"
                      ? "text-red-400"
                      : e.status === "warning"
                        ? "text-amber-400"
                        : "text-slate-300"
                  }`}
                >
                  {e.errorRatePct.toFixed(2)}%
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-300">{e.p50}ms</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-300">{e.p95}ms</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-300">{e.p99}ms</td>
                <td className="px-4 py-2.5">
                  <Sparkline values={e.sparkline} color={e.status === "critical" ? "#fb7185" : "#38bdf8"} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 2} className="px-4 py-10 text-center text-sm text-slate-500">
                  No endpoints match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
