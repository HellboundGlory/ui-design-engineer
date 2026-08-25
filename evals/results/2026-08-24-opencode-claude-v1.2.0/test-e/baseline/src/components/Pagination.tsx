const PAGE_SIZE_OPTIONS = [25, 50, 100]

interface PaginationProps {
  page: number
  pageCount: number
  pageSize: number
  totalRows: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

function getPageList(page: number, pageCount: number): (number | 'ellipsis')[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }
  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b)
  const result: (number | 'ellipsis')[] = []
  let prev = 0
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push('ellipsis')
    result.push(p)
    prev = p
  }
  return result
}

export function Pagination({
  page,
  pageCount,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const startRow = totalRows === 0 ? 0 : (page - 1) * pageSize + 1
  const endRow = Math.min(page * pageSize, totalRows)
  const pageList = getPageList(page, pageCount)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
      <div className="flex items-center gap-3">
        <span className="tabular-nums">
          {totalRows === 0
            ? 'No rows'
            : `Showing ${startRow.toLocaleString()}–${endRow.toLocaleString()} of ${totalRows.toLocaleString()}`}
        </span>
        <label className="flex items-center gap-1.5">
          <span className="text-slate-500">Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded border border-slate-300 px-2 py-1 font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:bg-slate-100"
        >
          Prev
        </button>
        {pageList.map((p, idx) =>
          p === 'ellipsis' ? (
            <span key={`e-${idx}`} className="px-1.5 text-slate-400">
              &hellip;
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`min-w-[1.75rem] rounded px-1.5 py-1 tabular-nums font-medium ${
                p === page
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          className="rounded border border-slate-300 px-2 py-1 font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:bg-slate-100"
        >
          Next
        </button>
      </nav>
    </div>
  )
}
