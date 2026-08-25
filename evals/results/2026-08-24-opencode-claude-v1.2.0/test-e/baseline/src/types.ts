export type CustomerStatus =
  | 'active'
  | 'trial'
  | 'past_due'
  | 'suspended'
  | 'churned'

export type PlanTier = 'starter' | 'growth' | 'enterprise' | 'enterprise_plus'

export type Region = 'na' | 'emea' | 'apac' | 'latam'

export interface Customer {
  id: string
  company: string
  contactName: string
  contactEmail: string
  status: CustomerStatus
  plan: PlanTier
  mrr: number
  seats: number
  seatsUsed: number
  region: Region
  owner: string
  healthScore: number
  createdAt: string // ISO date
  lastActivityAt: string // ISO date
}

export type SortDirection = 'asc' | 'desc'

export interface SortRule {
  key: SortableKey
  direction: SortDirection
}

export type SortableKey =
  | 'company'
  | 'status'
  | 'plan'
  | 'mrr'
  | 'seats'
  | 'region'
  | 'owner'
  | 'healthScore'
  | 'createdAt'
  | 'lastActivityAt'
