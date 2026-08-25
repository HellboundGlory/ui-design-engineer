import type { PlanTier, Region } from '../types'

export const PLAN_LABELS: Record<PlanTier, string> = {
  starter: 'Starter',
  growth: 'Growth',
  enterprise: 'Enterprise',
  enterprise_plus: 'Enterprise+',
}

export const REGION_LABELS: Record<Region, string> = {
  na: 'NA',
  emea: 'EMEA',
  apac: 'APAC',
  latam: 'LATAM',
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`))
}

export function formatRelativeDays(iso: string, referenceIso = '2026-08-25'): string {
  const ms = new Date(`${referenceIso}T00:00:00Z`).getTime() - new Date(`${iso}T00:00:00Z`).getTime()
  const days = Math.round(ms / 86_400_000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.round(days / 30)}mo ago`
  return `${Math.round(days / 365)}y ago`
}
