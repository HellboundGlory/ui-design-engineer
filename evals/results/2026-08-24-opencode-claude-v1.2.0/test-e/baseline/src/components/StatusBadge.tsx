import type { CustomerStatus } from '../types'

const STATUS_CONFIG: Record<
  CustomerStatus,
  { label: string; dot: string; text: string; bg: string; ring: string }
> = {
  active: {
    label: 'Active',
    dot: 'bg-emerald-500',
    text: 'text-emerald-800',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-600/20',
  },
  trial: {
    label: 'Trial',
    dot: 'bg-sky-500',
    text: 'text-sky-800',
    bg: 'bg-sky-50',
    ring: 'ring-sky-600/20',
  },
  past_due: {
    label: 'Past due',
    dot: 'bg-amber-500',
    text: 'text-amber-800',
    bg: 'bg-amber-50',
    ring: 'ring-amber-600/20',
  },
  suspended: {
    label: 'Suspended',
    dot: 'bg-orange-500',
    text: 'text-orange-800',
    bg: 'bg-orange-50',
    ring: 'ring-orange-600/20',
  },
  churned: {
    label: 'Churned',
    dot: 'bg-slate-400',
    text: 'text-slate-600',
    bg: 'bg-slate-100',
    ring: 'ring-slate-500/15',
  },
}

export function StatusBadge({ status }: { status: CustomerStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px] font-medium leading-4 ring-1 ring-inset ${cfg.bg} ${cfg.text} ${cfg.ring}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} aria-hidden="true" />
      {cfg.label}
    </span>
  )
}
