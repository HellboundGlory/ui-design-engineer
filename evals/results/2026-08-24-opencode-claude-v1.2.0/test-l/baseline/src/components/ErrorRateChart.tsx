import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TrafficSample } from '../data/traffic'
import { formatTimeFull, formatTimeTick } from '../lib/format'
import { ChartCard } from './ChartCard'

interface ErrorRateChartProps {
  data: TrafficSample[]
}

const WARN_THRESHOLD = 2
const CRIT_THRESHOLD = 5

export function ErrorRateChart({ data }: ErrorRateChartProps) {
  const latest = data[data.length - 1]
  const srSummary = latest
    ? `Error rate chart. Current error rate is ${latest.errorRatePct.toFixed(2)} percent. Warning threshold is ${WARN_THRESHOLD} percent, critical threshold is ${CRIT_THRESHOLD} percent.`
    : 'Error rate chart. No data yet.'

  return (
    <ChartCard
      title="Error Rate"
      description="Percent of requests returning 4xx/5xx, fleet-wide"
      srSummary={srSummary}
    >
      <ResponsiveContainer width="100%" height={220}>
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
            width={40}
            unit="%"
          />
          <Tooltip
            contentStyle={{
              background: 'var(--tooltip-bg)',
              border: '1px solid var(--tooltip-border)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(t) => formatTimeFull(Number(t))}
            formatter={(value: number) => [`${value.toFixed(2)}%`, 'Error rate']}
          />
          <ReferenceLine y={WARN_THRESHOLD} stroke="var(--warn)" strokeDasharray="4 4" strokeOpacity={0.7} />
          <ReferenceLine y={CRIT_THRESHOLD} stroke="var(--critical)" strokeDasharray="4 4" strokeOpacity={0.7} />
          <Line
            type="monotone"
            dataKey="errorRatePct"
            stroke="var(--critical)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
