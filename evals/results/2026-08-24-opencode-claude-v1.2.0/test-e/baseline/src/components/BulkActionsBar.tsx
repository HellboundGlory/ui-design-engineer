import { useEffect, useRef, useState } from 'react'
import type { CustomerStatus } from '../types'

interface BulkActionsBarProps {
  selectedCount: number
  onClearSelection: () => void
  onSetStatus: (status: CustomerStatus) => void
  onExport: () => void
  onDelete: () => void
}

const STATUS_ACTIONS: { status: CustomerStatus; label: string }[] = [
  { status: 'active', label: 'Mark active' },
  { status: 'suspended', label: 'Suspend' },
  { status: 'churned', label: 'Mark churned' },
]

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onSetStatus,
  onExport,
  onDelete,
}: BulkActionsBarProps) {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setStatusMenuOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setStatusMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  if (selectedCount === 0) return null

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className="flex items-center gap-3 border-b border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-100"
    >
      <span className="font-medium tabular-nums">
        {selectedCount.toLocaleString()} selected
      </span>
      <div className="h-4 w-px bg-slate-700" />

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setStatusMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={statusMenuOpen}
          className="flex items-center gap-1 rounded px-2 py-1 font-medium hover:bg-slate-800"
        >
          Set status
          <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
            <path d="M3 4.5 6 8l3-3.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {statusMenuOpen && (
          <div
            role="menu"
            className="absolute left-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-md border border-slate-700 bg-slate-900 py-1 shadow-lg"
          >
            {STATUS_ACTIONS.map((action) => (
              <button
                key={action.status}
                type="button"
                role="menuitem"
                onClick={() => {
                  onSetStatus(action.status)
                  setStatusMenuOpen(false)
                }}
                className="block w-full px-3 py-1.5 text-left text-xs text-slate-100 hover:bg-slate-800"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onExport}
        className="rounded px-2 py-1 font-medium hover:bg-slate-800"
      >
        Export CSV
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="rounded px-2 py-1 font-medium text-rose-300 hover:bg-slate-800"
      >
        Delete
      </button>

      <div className="ml-auto">
        <button
          type="button"
          onClick={onClearSelection}
          className="rounded px-2 py-1 font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          Clear selection
        </button>
      </div>
    </div>
  )
}
