import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimePoint } from "../types";
import { ChartPanel } from "./ChartPanel";

const THRESHOLD = 5; // % — SLO error-budget line

export function ErrorRateChart({ data }: { data: TimePoint[] }) {
  const breached = data.length > 0 && data[data.length - 1].errorRatePct >= THRESHOLD;

  return (
    <ChartPanel
      title="Error rate"
      subtitle={`% of requests failing · SLO threshold ${THRESHOLD}%`}
      className={breached ? "ring-1 ring-red-500/40" : ""}
    >
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
            width={36}
            unit="%"
          />
          <Tooltip
            contentStyle={{
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#cbd5e1" }}
            formatter={(value) => [`${Number(value).toFixed(2)}%`, "Error rate"]}
          />
          <ReferenceLine
            y={THRESHOLD}
            stroke="#f87171"
            strokeDasharray="4 4"
            label={{ value: "SLO", position: "insideTopRight", fill: "#f87171", fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="errorRatePct"
            stroke="#fb7185"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
