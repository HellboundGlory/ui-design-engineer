import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  description?: string
  /** Plain-text summary of the current data, read by screen readers since the
   * chart itself is an SVG that assistive tech cannot meaningfully traverse. */
  srSummary: string
  legend?: ReactNode
  children: ReactNode
  className?: string
}

export function ChartCard({ title, description, srSummary, legend, children, className }: ChartCardProps) {
  return (
    <section className={`chart-card ${className ?? ''}`} aria-label={title}>
      <header className="chart-card__header">
        <div>
          <h2 className="chart-card__title">{title}</h2>
          {description && <p className="chart-card__description">{description}</p>}
        </div>
        {legend && <div className="chart-card__legend">{legend}</div>}
      </header>
      {/*
        Deliberately NOT a live region (no role="status"/aria-live) even
        though this data updates every tick: the feed ticks every 1-5s, and
        a live region would force screen readers to re-announce the summary
        on every tick, which would be disruptive rather than helpful. This
        text is still reachable by a screen reader user navigating into the
        card; it just isn't pushed at them automatically.
      */}
      <p className="sr-only">{srSummary}</p>
      <div className="chart-card__body" aria-hidden="true">
        {children}
      </div>
    </section>
  )
}
