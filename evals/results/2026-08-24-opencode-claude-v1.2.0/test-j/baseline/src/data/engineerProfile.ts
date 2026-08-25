// Domain: "Orbit" — an internal infrastructure/on-call directory.
// The profile card here is a lookup artifact: an incident commander scanning
// the on-call roster needs ownership, load, and reliability numbers at a
// glance, not a personality. Every field earns its place by answering a
// question someone asks during an incident.

export type ServiceStatus = 'operational' | 'degraded' | 'offline'

export interface EngineerProfile {
  name: string
  handle: string
  role: string
  team: string
  location: string
  timezone: string
  status: ServiceStatus
  avatarInitials: string
  stats: {
    uptimeSlaPct: number
    p50ResponseMs: number
    p99ResponseMs: number
    incidentsResolved90d: number
    servicesOwned: number
    onCallHoursThisMonth: number
  }
  ownedServices: string[]
  lastDeploy: {
    service: string
    result: 'success' | 'failed'
    relativeTime: string
  }
  contact: {
    slack: string
    email: string
    github: string
  }
}

export const engineerProfile: EngineerProfile = {
  name: 'Priya Natarajan',
  handle: 'pnatarajan',
  role: 'Staff Engineer, Reliability',
  team: 'Platform / Core Infra',
  location: 'Toronto, CA',
  timezone: 'UTC-4',
  status: 'operational',
  avatarInitials: 'PN',
  stats: {
    uptimeSlaPct: 99.982,
    p50ResponseMs: 118,
    p99ResponseMs: 842,
    incidentsResolved90d: 14,
    servicesOwned: 6,
    onCallHoursThisMonth: 36,
  },
  ownedServices: ['auth-gateway', 'billing-worker', 'edge-cache', 'rate-limiter', 'webhook-relay', 'ledger-sync'],
  lastDeploy: {
    service: 'auth-gateway',
    result: 'success',
    relativeTime: '2h 14m ago',
  },
  contact: {
    slack: '@priya.n',
    email: 'p.natarajan@orbit.dev',
    github: 'pnatarajan',
  },
}
