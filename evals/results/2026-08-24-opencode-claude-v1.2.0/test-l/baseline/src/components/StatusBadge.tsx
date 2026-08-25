import type { EndpointStatus } from '../data/traffic'

const LABELS: Record<EndpointStatus, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  critical: 'Critical',
}

export function StatusBadge({ status }: { status: EndpointStatus }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      <span className="status-badge__dot" aria-hidden="true" />
      {LABELS[status]}
    </span>
  )
}
