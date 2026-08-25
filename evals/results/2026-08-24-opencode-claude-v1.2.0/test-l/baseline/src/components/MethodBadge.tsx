import type { HttpMethod } from '../data/traffic'

export function MethodBadge({ method }: { method: HttpMethod }) {
  return <span className={`method-badge method-badge--${method.toLowerCase()}`}>{method}</span>
}
