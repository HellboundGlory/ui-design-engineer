interface KpiCardProps {
  label: string
  value: string
  unit?: string
  delta?: number | null
  /** When true, a positive delta is rendered as "bad" (red) rather than "good" (green). */
  increaseIsBad?: boolean
  hint?: string
}

export function KpiCard({ label, value, unit, delta, increaseIsBad = false, hint }: KpiCardProps) {
  const hasDelta = delta !== null && delta !== undefined && Number.isFinite(delta) && delta !== 0
  const isUp = hasDelta && delta! > 0
  const isGood = hasDelta ? (increaseIsBad ? !isUp : isUp) : null

  return (
    <div className="kpi-card">
      <p className="kpi-card__label">{label}</p>
      <div className="kpi-card__value-row">
        <span className="kpi-card__value">{value}</span>
        {unit && <span className="kpi-card__unit">{unit}</span>}
      </div>
      <div className="kpi-card__footer">
        {hasDelta ? (
          <span
            className={`kpi-card__delta kpi-card__delta--${isGood ? 'good' : 'bad'}`}
            aria-label={`${isUp ? 'increased' : 'decreased'} ${Math.abs(delta!).toFixed(1)}${unit ?? ''} since last update`}
          >
            <span aria-hidden="true">{isUp ? '↑' : '↓'}</span> {Math.abs(delta!).toFixed(1)}
            {unit}
          </span>
        ) : (
          <span className="kpi-card__delta kpi-card__delta--flat">steady</span>
        )}
        {hint && <span className="kpi-card__hint">{hint}</span>}
      </div>
    </div>
  )
}
