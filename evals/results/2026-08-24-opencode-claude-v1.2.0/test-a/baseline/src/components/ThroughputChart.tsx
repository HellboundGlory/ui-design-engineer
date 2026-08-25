import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimePoint } from "../types";
import { ChartPanel } from "./ChartPanel";

const COLORS = {
  ok: "#22d3ee",
  client: "#fbbf24",
  server: "#fb7185",
};

export function ThroughputChart({ data }: { data: TimePoint[] }) {
  return (
    <ChartPanel title="Throughput" subtitle="Requests per interval, by response class">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="fillOk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.ok} stopOpacity={0.5} />
              <stop offset="100%" stopColor={COLORS.ok} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fillClient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.client} stopOpacity={0.5} />
              <stop offset="100%" stopColor={COLORS.client} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fillServer" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.server} stopOpacity={0.6} />
              <stop offset="100%" stopColor={COLORS.server} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "#1e293b" }}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            contentStyle={{
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#cbd5e1" }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#94a3b8" }}
            formatter={(value) => <span className="text-slate-400">{value}</span>}
          />
          <Area
            type="monotone"
            dataKey="status2xx"
            stackId="1"
            name="2xx"
            stroke={COLORS.ok}
            fill="url(#fillOk)"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="status4xx"
            stackId="1"
            name="4xx"
            stroke={COLORS.client}
            fill="url(#fillClient)"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="status5xx"
            stackId="1"
            name="5xx"
            stroke={COLORS.server}
            fill="url(#fillServer)"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
