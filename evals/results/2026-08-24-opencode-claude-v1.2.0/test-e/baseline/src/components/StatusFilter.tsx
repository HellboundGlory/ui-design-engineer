import { useEffect, useRef, useState } from 'react'
import type { CustomerStatus } from '../types'
import { StatusBadge } from './StatusBadge'

const ALL_STATUSES: CustomerStatus[] = ['active', 'trial', 'past_due', 'suspended', 'churned']

interface StatusFilterProps {
  selected: Set<CustomerStatus>
  onChange: (next: Set<CustomerStatus>) => void
}

export function StatusFilter({ selected, onChange }: StatusFilterProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggle(status: CustomerStatus) {
    const next = new Set(selected)
    if (next.has(status)) next.delete(status)
    else next.add(status)
    onChange(next)
  }

  const label =
    selected.size === 0 || selected.size === ALL_STATUSES.length
      ? 'All statuses'
      : `${selected.size} status${selected.size > 1 ? 'es' : ''}`

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        {label}
        <svg viewBox="0 0 12 12" className="h-3 w-3 text-slate-400" aria-hidden="true">
          <path d="M3 4.5 6 8l3-3.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-20 mt-1 w-44 rounded-md border border-slate-200 bg-white py-1 shadow-lg"
        >
          {ALL_STATUSES.map((status) => (
            <label
              key={status}
              className="flex cursor-pointer items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={selected.size === 0 || selected.has(status)}
                onChange={() => toggle(status)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-slate-800 focus:ring-slate-400"
              />
              <StatusBadge status={status} />
            </label>
          ))}
          {selected.size > 0 && (
            <button
              type="button"
              onClick={() => onChange(new Set())}
              className="mt-1 block w-full border-t border-slate-100 px-2.5 py-1.5 text-left text-xs text-slate-500 hover:bg-slate-50"
            >
              Clear filter
            </button>
          )}
        </div>
      )}
    </div>
  )
}
