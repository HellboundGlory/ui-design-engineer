import type { Customer, SortRule, SortableKey } from '../types'
import { formatCurrency, formatDate, formatRelativeDays, PLAN_LABELS, REGION_LABELS } from '../lib/format'
import { StatusBadge } from './StatusBadge'
import { SortHeaderCell } from './SortHeaderCell'

interface CustomerTableProps {
  rows: Customer[]
  sortRules: SortRule[]
  onSort: (key: SortableKey, additive: boolean) => void
  selectedIds: Set<string>
  onToggleRow: (id: string) => void
  onToggleAllOnPage: () => void
}

function healthTone(score: number): string {
  if (score >= 70) return 'text-emerald-700'
  if (score >= 40) return 'text-amber-700'
  return 'text-rose-700'
}

export function CustomerTable({
  rows,
  sortRules,
  onSort,
  selectedIds,
  onToggleRow,
  onToggleAllOnPage,
}: CustomerTableProps) {
  const allOnPageSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id))
  const someOnPageSelected = rows.some((r) => selectedIds.has(r.id)) && !allOnPageSelected

  return (
    <div className="min-w-full overflow-x-auto">
      <table className="w-full min-w-[1180px] border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-slate-50 shadow-[inset_0_-1px_0_theme(colors.slate.200)]">
          <tr>
            <th scope="col" className="w-9 px-3 py-2">
              <input
                type="checkbox"
                aria-label="Select all rows on this page"
                checked={allOnPageSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someOnPageSelected
                }}
                onChange={onToggleAllOnPage}
                className="h-3.5 w-3.5 rounded border-slate-300 text-slate-800 focus:ring-slate-400"
              />
            </th>
            <th scope="col" className="w-24 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              ID
            </th>
            <SortHeaderCell label="Company" sortKey="company" rules={sortRules} onSort={onSort} className="min-w-[10rem] text-left" />
            <th scope="col" className="min-w-[11rem] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Contact
            </th>
            <SortHeaderCell label="Status" sortKey="status" rules={sortRules} onSort={onSort} className="min-w-[6.5rem] text-left" />
            <SortHeaderCell label="Plan" sortKey="plan" rules={sortRules} onSort={onSort} className="min-w-[7rem] text-left" />
            <SortHeaderCell label="MRR" sortKey="mrr" rules={sortRules} onSort={onSort} align="right" className="min-w-[6rem] text-right" />
            <SortHeaderCell label="Seats" sortKey="seats" rules={sortRules} onSort={onSort} align="right" className="min-w-[6rem] text-right" />
            <SortHeaderCell label="Region" sortKey="region" rules={sortRules} onSort={onSort} className="min-w-[5rem] text-left" />
            <SortHeaderCell label="Owner" sortKey="owner" rules={sortRules} onSort={onSort} className="min-w-[7rem] text-left" />
            <SortHeaderCell label="Health" sortKey="healthScore" rules={sortRules} onSort={onSort} align="right" className="min-w-[5rem] text-right" />
            <SortHeaderCell label="Created" sortKey="createdAt" rules={sortRules} onSort={onSort} className="min-w-[6.5rem] text-left" />
            <SortHeaderCell label="Last activity" sortKey="lastActivityAt" rules={sortRules} onSort={onSort} className="min-w-[7rem] text-left" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((customer) => {
            const selected = selectedIds.has(customer.id)
            return (
              <tr
                key={customer.id}
                aria-selected={selected}
                className={`h-9 ${selected ? 'bg-slate-100' : 'odd:bg-white even:bg-slate-50/40 hover:bg-slate-100/70'}`}
              >
                <td className="px-3 py-1.5">
                  <input
                    type="checkbox"
                    aria-label={`Select ${customer.company}`}
                    checked={selected}
                    onChange={() => onToggleRow(customer.id)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-slate-800 focus:ring-slate-400"
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-1.5 font-mono text-[11px] text-slate-400">{customer.id}</td>
                <td className="whitespace-nowrap px-3 py-1.5 font-medium text-slate-800">{customer.company}</td>
                <td className="px-3 py-1.5">
                  <div className="flex flex-col leading-tight">
                    <span className="whitespace-nowrap text-slate-700">{customer.contactName}</span>
                    <span className="truncate text-[11px] text-slate-400">{customer.contactEmail}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-1.5">
                  <StatusBadge status={customer.status} />
                </td>
                <td className="whitespace-nowrap px-3 py-1.5 text-slate-600">{PLAN_LABELS[customer.plan]}</td>
                <td className="whitespace-nowrap px-3 py-1.5 text-right tabular-nums text-slate-700">
                  {formatCurrency(customer.mrr)}
                </td>
                <td className="whitespace-nowrap px-3 py-1.5 text-right tabular-nums text-slate-600">
                  {customer.seatsUsed.toLocaleString()}/{customer.seats.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-3 py-1.5 text-slate-600">{REGION_LABELS[customer.region]}</td>
                <td className="whitespace-nowrap px-3 py-1.5 text-slate-600">{customer.owner}</td>
                <td className={`whitespace-nowrap px-3 py-1.5 text-right tabular-nums font-medium ${healthTone(customer.healthScore)}`}>
                  {customer.healthScore}
                </td>
                <td className="whitespace-nowrap px-3 py-1.5 text-slate-500">{formatDate(customer.createdAt)}</td>
                <td className="whitespace-nowrap px-3 py-1.5 text-slate-500" title={formatDate(customer.lastActivityAt)}>
                  {formatRelativeDays(customer.lastActivityAt)}
                </td>
              </tr>
            )
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={12} className="px-3 py-10 text-center text-sm text-slate-400">
                No customers match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
