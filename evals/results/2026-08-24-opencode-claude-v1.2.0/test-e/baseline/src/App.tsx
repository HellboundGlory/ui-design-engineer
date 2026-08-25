import { useMemo, useState } from 'react'
import { generateCustomers } from './data/generateCustomers'
import type { Customer, CustomerStatus, PlanTier, Region, SortRule, SortableKey } from './types'
import { sortCustomers, applySortClick } from './lib/sort'
import { PLAN_LABELS, REGION_LABELS } from './lib/format'
import { CustomerTable } from './components/CustomerTable'
import { Pagination } from './components/Pagination'
import { BulkActionsBar } from './components/BulkActionsBar'
import { StatusFilter } from './components/StatusFilter'

const INITIAL_ROW_COUNT = 220

function toCsv(rows: Customer[]): string {
  const header = ['ID', 'Company', 'Contact', 'Email', 'Status', 'Plan', 'MRR', 'Seats Used', 'Seats', 'Region', 'Owner', 'Health', 'Created', 'Last Activity']
  const lines = rows.map((r) =>
    [r.id, r.company, r.contactName, r.contactEmail, r.status, r.plan, r.mrr, r.seatsUsed, r.seats, r.region, r.owner, r.healthScore, r.createdAt, r.lastActivityAt]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  )
  return [header.join(','), ...lines].join('\n')
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function App() {
  const [customers, setCustomers] = useState<Customer[]>(() => generateCustomers(INITIAL_ROW_COUNT))
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Set<CustomerStatus>>(new Set())
  const [planFilter, setPlanFilter] = useState<PlanTier | 'all'>('all')
  const [regionFilter, setRegionFilter] = useState<Region | 'all'>('all')
  const [sortRules, setSortRules] = useState<SortRule[]>([{ key: 'mrr', direction: 'desc' }])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return customers.filter((c) => {
      if (statusFilter.size > 0 && !statusFilter.has(c.status)) return false
      if (planFilter !== 'all' && c.plan !== planFilter) return false
      if (regionFilter !== 'all' && c.region !== regionFilter) return false
      if (!q) return true
      return (
        c.company.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q) ||
        c.contactEmail.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      )
    })
  }, [customers, search, statusFilter, planFilter, regionFilter])

  const sorted = useMemo(() => sortCustomers(filtered, sortRules), [filtered, sortRules])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const clampedPage = Math.min(page, pageCount)
  const pageRows = useMemo(() => {
    const start = (clampedPage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, clampedPage, pageSize])

  function resetToFirstPage() {
    setPage(1)
  }

  function handleSort(key: SortableKey, additive: boolean) {
    setSortRules((prev) => applySortClick(prev, key, additive))
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllOnPage() {
    setSelectedIds((prev) => {
      const allSelected = pageRows.every((r) => prev.has(r.id))
      const next = new Set(prev)
      if (allSelected) {
        for (const r of pageRows) next.delete(r.id)
      } else {
        for (const r of pageRows) next.add(r.id)
      }
      return next
    })
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  function handleBulkSetStatus(status: CustomerStatus) {
    setCustomers((prev) =>
      prev.map((c) => (selectedIds.has(c.id) ? { ...c, status } : c)),
    )
    clearSelection()
  }

  function handleBulkExport() {
    const selectedRows = customers.filter((c) => selectedIds.has(c.id))
    downloadCsv(toCsv(selectedRows), `customers-export-${selectedRows.length}.csv`)
  }

  function handleBulkDelete() {
    const count = selectedIds.size
    const ok = window.confirm(
      `Delete ${count} customer${count > 1 ? 's' : ''}? This cannot be undone.`,
    )
    if (!ok) return
    setCustomers((prev) => prev.filter((c) => !selectedIds.has(c.id)))
    clearSelection()
  }

  const activeFilterCount =
    (statusFilter.size > 0 ? 1 : 0) + (planFilter !== 'all' ? 1 : 0) + (regionFilter !== 'all' ? 1 : 0) + (search.trim() ? 1 : 0)

  return (
    <div className="flex h-screen flex-col bg-slate-100 text-slate-900">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-[11px] font-bold text-white">
            OP
          </div>
          <span className="text-sm font-semibold text-slate-800">Orbit Ops Console</span>
          <span className="text-slate-300">/</span>
          <span className="text-sm text-slate-500">Customers</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="tabular-nums">{customers.length.toLocaleString()} accounts</span>
          <div className="h-6 w-6 rounded-full bg-slate-200" aria-hidden="true" />
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden px-4 py-3">
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2">
            <div className="relative">
              <svg
                viewBox="0 0 16 16"
                className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              >
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
                <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  resetToFirstPage()
                }}
                placeholder="Search company, contact, email, or ID"
                className="w-72 rounded border border-slate-300 py-1 pl-7 pr-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <StatusFilter
              selected={statusFilter}
              onChange={(next) => {
                setStatusFilter(next)
                resetToFirstPage()
              }}
            />

            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value as PlanTier | 'all')
                resetToFirstPage()
              }}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="all">All plans</option>
              {(Object.keys(PLAN_LABELS) as PlanTier[]).map((p) => (
                <option key={p} value={p}>
                  {PLAN_LABELS[p]}
                </option>
              ))}
            </select>

            <select
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value as Region | 'all')
                resetToFirstPage()
              }}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="all">All regions</option>
              {(Object.keys(REGION_LABELS) as Region[]).map((r) => (
                <option key={r} value={r}>
                  {REGION_LABELS[r]}
                </option>
              ))}
            </select>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setStatusFilter(new Set())
                  setPlanFilter('all')
                  setRegionFilter('all')
                  resetToFirstPage()
                }}
                className="text-xs font-medium text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-slate-700"
              >
                Reset filters
              </button>
            )}

            <span className="ml-auto text-xs text-slate-400 tabular-nums">
              {sorted.length.toLocaleString()} match{sorted.length === 1 ? '' : 'es'}
            </span>
          </div>

          <BulkActionsBar
            selectedCount={selectedIds.size}
            onClearSelection={clearSelection}
            onSetStatus={handleBulkSetStatus}
            onExport={handleBulkExport}
            onDelete={handleBulkDelete}
          />

          <div className="flex-1 overflow-auto">
            <CustomerTable
              rows={pageRows}
              sortRules={sortRules}
              onSort={handleSort}
              selectedIds={selectedIds}
              onToggleRow={toggleRow}
              onToggleAllOnPage={toggleAllOnPage}
            />
          </div>

          <Pagination
            page={clampedPage}
            pageCount={pageCount}
            pageSize={pageSize}
            totalRows={sorted.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              resetToFirstPage()
            }}
          />
        </div>
      </div>
    </div>
  )
}
