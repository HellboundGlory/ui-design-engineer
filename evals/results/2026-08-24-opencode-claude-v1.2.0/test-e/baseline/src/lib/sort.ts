import type { Customer, SortDirection, SortRule, SortableKey } from '../types'

const STATUS_ORDER = { active: 0, trial: 1, past_due: 2, suspended: 3, churned: 4 }
const PLAN_ORDER = { starter: 0, growth: 1, enterprise: 2, enterprise_plus: 3 }

function compareValues(a: Customer, b: Customer, key: SortableKey): number {
  switch (key) {
    case 'company':
      return a.company.localeCompare(b.company)
    case 'status':
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    case 'plan':
      return PLAN_ORDER[a.plan] - PLAN_ORDER[b.plan]
    case 'mrr':
      return a.mrr - b.mrr
    case 'seats':
      return a.seats - b.seats
    case 'region':
      return a.region.localeCompare(b.region)
    case 'owner':
      return a.owner.localeCompare(b.owner)
    case 'healthScore':
      return a.healthScore - b.healthScore
    case 'createdAt':
      return a.createdAt.localeCompare(b.createdAt)
    case 'lastActivityAt':
      return a.lastActivityAt.localeCompare(b.lastActivityAt)
    default:
      return 0
  }
}

export function sortCustomers(rows: Customer[], rules: SortRule[]): Customer[] {
  if (rules.length === 0) return rows
  return [...rows].sort((a, b) => {
    for (const rule of rules) {
      const cmp = compareValues(a, b, rule.key)
      if (cmp !== 0) return rule.direction === 'asc' ? cmp : -cmp
    }
    // Stable tiebreaker so equal sort keys don't jitter between renders.
    return a.id.localeCompare(b.id)
  })
}

/**
 * Click cycles a column through asc -> desc -> off.
 * Plain click replaces the sort with just this column.
 * Shift+click adds/updates this column as an additional sort key,
 * preserving existing rules (multi-column sort).
 */
export function applySortClick(
  rules: SortRule[],
  key: SortableKey,
  additive: boolean,
): SortRule[] {
  const existing = rules.find((r) => r.key === key)
  const nextDirection: SortDirection | null = !existing
    ? 'asc'
    : existing.direction === 'asc'
      ? 'desc'
      : null

  if (!additive) {
    return nextDirection ? [{ key, direction: nextDirection }] : []
  }

  const withoutKey = rules.filter((r) => r.key !== key)
  return nextDirection ? [...withoutKey, { key, direction: nextDirection }] : withoutKey
}
