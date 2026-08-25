import type { SortDirection, SortRule, SortableKey } from '../types'

interface SortHeaderCellProps {
  label: string
  sortKey: SortableKey
  rules: SortRule[]
  onSort: (key: SortableKey, additive: boolean) => void
  align?: 'left' | 'right'
  className?: string
}

function ariaSortFor(direction: SortDirection | undefined): 'ascending' | 'descending' | 'none' {
  if (direction === 'asc') return 'ascending'
  if (direction === 'desc') return 'descending'
  return 'none'
}

export function SortHeaderCell({
  label,
  sortKey,
  rules,
  onSort,
  align = 'left',
  className = '',
}: SortHeaderCellProps) {
  const ruleIndex = rules.findIndex((r) => r.key === sortKey)
  const rule = ruleIndex >= 0 ? rules[ruleIndex] : undefined
  const priority = ruleIndex >= 0 && rules.length > 1 ? ruleIndex + 1 : null

  return (
    <th
      scope="col"
      aria-sort={ariaSortFor(rule?.direction)}
      className={`select-none px-3 py-2 text-xs font-semibold text-slate-500 ${className}`}
    >
      <button
        type="button"
        onClick={(e) => onSort(sortKey, e.shiftKey)}
        title="Click to sort. Shift+click to add as a secondary sort column."
        className={`group flex w-full items-center gap-1 uppercase tracking-wide hover:text-slate-800 ${
          align === 'right' ? 'flex-row-reverse justify-start' : ''
        }`}
      >
        <span>{label}</span>
        <span className="flex items-center gap-0.5">
          <svg
            viewBox="0 0 12 12"
            className={`h-3 w-3 shrink-0 transition-opacity ${
              rule ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
            }`}
            aria-hidden="true"
          >
            {rule?.direction === 'desc' ? (
              <path d="M3 4.5 6 8l3-3.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M3 7.5 6 4l3 3.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
          {priority !== null && (
            <span className="rounded-full bg-slate-200 px-1 text-[9px] font-bold leading-3.5 text-slate-600">
              {priority}
            </span>
          )}
        </span>
      </button>
    </th>
  )
}
