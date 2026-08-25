import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TrafficSample } from '../data/traffic'
import { formatTimeFull, formatTimeTick } from '../lib/format'
import { ChartCard } from './ChartCard'

interface LatencyChartProps {
  data: TrafficSample[]
}

const SERIES: { key: 'p50' | 'p95' | 'p99'; label: string; color: string }[] = [
  { key: 'p50', label: 'p50', color: 'var(--series-p50)' },
  { key: 'p95', label: 'p95', color: 'var(--series-p95)' },
  { key: 'p99', label: 'p99', color: 'var(--series-p99)' },
]

export function LatencyChart({ data }: LatencyChartProps) {
  const latest = data[data.length - 1]
  const srSummary = latest
    ? `Latency percentiles chart. Current latency: p50 ${latest.p50} milliseconds, p95 ${latest.p95} milliseconds, p99 ${latest.p99} milliseconds.`
    : 'Latency percentiles chart. No data yet.'

  const legend = (
    <ul className="chart-legend">
      {SERIES.map((s) => (
        <li key={s.key} className="chart-legend__item">
          <span className="chart-legend__swatch" style={{ background: s.color }} aria-hidden="true" />
          {s.label}
        </li>
      ))}
    </ul>
  )

  return (
    <ChartCard
      title="Latency Percentiles"
      description="Response time distribution, fleet-wide (p50 / p95 / p99)"
      srSummary={srSummary}
      legend={legend}
    >
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
            width={48}
            unit="ms"
          />
          <Tooltip
            contentStyle={{
              background: 'var(--tooltip-bg)',
              border: '1px solid var(--tooltip-border)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(t) => formatTimeFull(Number(t))}
            formatter={(value: number, name: string) => [`${value} ms`, name]}
          />
          {SERIES.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
