import { useMemo, useState } from 'react'
import type { EndpointState } from '../data/traffic'
import { MethodBadge } from './MethodBadge'
import { StatusBadge } from './StatusBadge'

interface EndpointTableProps {
  endpoints: EndpointState[]
}

type SortKey = 'path' | 'status' | 'rps' | 'errorRatePct' | 'p50' | 'p95' | 'p99'
type SortDirection = 'asc' | 'desc'

const STATUS_RANK: Record<EndpointState['status'], number> = { critical: 0, degraded: 1, healthy: 2 }

const COLUMNS: { key: SortKey; label: string; align?: 'right' }[] = [
  { key: 'path', label: 'Endpoint' },
  { key: 'status', label: 'Status' },
  { key: 'rps', label: 'Req/s', align: 'right' },
  { key: 'errorRatePct', label: 'Error %', align: 'right' },
  { key: 'p50', label: 'p50 (ms)', align: 'right' },
  { key: 'p95', label: 'p95 (ms)', align: 'right' },
  { key: 'p99', label: 'p99 (ms)', align: 'right' },
]

export function EndpointTable({ endpoints }: EndpointTableProps) {
  // Default sort is alphabetical by path rather than by a live-changing
  // metric like req/s: sorting by a value that drifts every tick would
  // make rows continuously reorder/jump, which is hard to track visually
  // and worse for keyboard/screen-reader users following row position.
  // Users can still opt into sorting by any live metric via the headers.
  const [sortKey, setSortKey] = useState<SortKey>('path')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const sorted = useMemo(() => {
    const copy = [...endpoints]
    copy.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'path') cmp = a.path.localeCompare(b.path)
      else if (sortKey === 'status') cmp = STATUS_RANK[a.status] - STATUS_RANK[b.status]
      else cmp = a[sortKey] - b[sortKey]
      return sortDirection === 'asc' ? cmp : -cmp
    })
    return copy
  }, [endpoints, sortKey, sortDirection])

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  const criticalCount = endpoints.filter((e) => e.status === 'critical').length
  const degradedCount = endpoints.filter((e) => e.status === 'degraded').length

  return (
    <section className="endpoint-table-card" aria-label="Active endpoints">
      <header className="chart-card__header">
        <div>
          <h2 className="chart-card__title">Active Endpoints</h2>
          <p className="chart-card__description">
            {endpoints.length} endpoints
            {criticalCount > 0 && <span className="endpoint-table-card__flag endpoint-table-card__flag--critical"> · {criticalCount} critical</span>}
            {degradedCount > 0 && <span className="endpoint-table-card__flag endpoint-table-card__flag--degraded"> · {degradedCount} degraded</span>}
          </p>
        </div>
      </header>
      <div className="endpoint-table-scroll">
        <table className="endpoint-table">
          <caption className="sr-only">
            Live traffic per API endpoint, sorted by {COLUMNS.find((c) => c.key === sortKey)?.label}, {sortDirection === 'asc' ? 'ascending' : 'descending'}.
            Click a column header to change sort order.
          </caption>
          <thead>
            <tr>
              {COLUMNS.map((col) => {
                const isSorted = sortKey === col.key
                const ariaSort = isSorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'
                return (
                  <th key={col.key} scope="col" aria-sort={ariaSort} className={col.align === 'right' ? 'is-numeric' : undefined}>
                    <button type="button" className="endpoint-table__sort-btn" onClick={() => handleSort(col.key)}>
                      {col.label}
                      <span className="endpoint-table__sort-icon" aria-hidden="true">
                        {isSorted ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                      </span>
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((endpoint) => (
              <tr key={endpoint.id}>
                <th scope="row" className="endpoint-table__endpoint-cell">
                  <MethodBadge method={endpoint.method} />
                  <code>{endpoint.path}</code>
                </th>
                <td>
                  <StatusBadge status={endpoint.status} />
                </td>
                <td className="is-numeric">{endpoint.rps.toFixed(1)}</td>
                <td className={`is-numeric ${endpoint.errorRatePct >= 5 ? 'is-critical-text' : endpoint.errorRatePct >= 1.5 ? 'is-warn-text' : ''}`}>
                  {endpoint.errorRatePct.toFixed(2)}%
                </td>
                <td className="is-numeric">{endpoint.p50}</td>
                <td className="is-numeric">{endpoint.p95}</td>
                <td className="is-numeric">{endpoint.p99}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
