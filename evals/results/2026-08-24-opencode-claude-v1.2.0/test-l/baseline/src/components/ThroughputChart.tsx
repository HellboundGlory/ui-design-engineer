import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TrafficSample } from '../data/traffic'
import { formatTimeFull, formatTimeTick } from '../lib/format'
import { ChartCard } from './ChartCard'

interface ThroughputChartProps {
  data: TrafficSample[]
}

export function ThroughputChart({ data }: ThroughputChartProps) {
  const latest = data[data.length - 1]
  const avg = data.length > 0 ? data.reduce((s, d) => s + d.throughputRps, 0) / data.length : 0

  const srSummary = latest
    ? `Throughput chart. Current throughput is ${latest.throughputRps.toFixed(1)} requests per second, averaging ${avg.toFixed(1)} over the visible window.`
    : 'Throughput chart. No data yet.'

  return (
    <ChartCard title="Throughput" description="Requests per second across all endpoints" srSummary={srSummary}>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="throughputFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-accent)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--chart-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--grid-line)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="t"
            tickFormatter={formatTimeTick}
            stroke="var(--axis-text)"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--grid-line)' }}
            minTickGap={32}
          />
          <YAxis
            stroke="var(--axis-text)"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={40}
            unit=" rps"
          />
          <Tooltip
            contentStyle={{
              background: 'var(--tooltip-bg)',
              border: '1px solid var(--tooltip-border)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(t) => formatTimeFull(Number(t))}
            formatter={(value: number) => [`${value.toFixed(1)} req/s`, 'Throughput']}
          />
          <Area
            type="monotone"
            dataKey="throughputRps"
            stroke="var(--chart-accent)"
            strokeWidth={2}
            fill="url(#throughputFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
