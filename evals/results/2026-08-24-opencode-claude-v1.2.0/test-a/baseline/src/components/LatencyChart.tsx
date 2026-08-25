import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimePoint } from "../types";
import { ChartPanel } from "./ChartPanel";

export function LatencyChart({ data }: { data: TimePoint[] }) {
  return (
    <ChartPanel title="Latency percentiles" subtitle="p50 / p95 / p99 response time, milliseconds">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "#1e293b" }}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
            unit="ms"
          />
          <Tooltip
            contentStyle={{
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#cbd5e1" }}
            formatter={(value, name) => [`${Math.round(Number(value))} ms`, name]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => <span className="text-slate-400">{value}</span>}
          />
          <Line type="monotone" dataKey="p50" name="p50" stroke="#38bdf8" strokeWidth={1.75} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="p95" name="p95" stroke="#a78bfa" strokeWidth={1.75} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="p99" name="p99" stroke="#fb923c" strokeWidth={1.75} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
