// Client-side traffic simulator.
//
// There is no real backend in this project, so the "real-time" feed is
// synthesized in-browser: each endpoint has a baseline (throughput, error
// rate, latency) and every tick nudges those baselines with bounded random
// walk noise, occasionally injecting a transient incident (error spike or
// latency spike) on one endpoint. This keeps the charts and table moving in
// a way that looks like a plausible traffic pattern rather than pure static
// noise, without pretending to be a production data source.

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type EndpointStatus = 'healthy' | 'degraded' | 'critical'

export interface EndpointState {
  id: string
  method: HttpMethod
  path: string
  /** requests per second, smoothed */
  rps: number
  /** error rate as a percentage (0-100) */
  errorRatePct: number
  p50: number
  p95: number
  p99: number
  status: EndpointStatus
  /** internal incident countdown, not rendered */
  incidentTicksRemaining: number
}

export interface TrafficSample {
  t: number
  throughputRps: number
  errorRatePct: number
  p50: number
  p95: number
  p99: number
}

interface EndpointBaseline {
  method: HttpMethod
  path: string
  baseRps: number
  baseErrorPct: number
  baseP50: number
  baseP95: number
  baseP99: number
}

const ENDPOINT_BASELINES: EndpointBaseline[] = [
  { method: 'GET', path: '/api/users', baseRps: 42, baseErrorPct: 0.4, baseP50: 38, baseP95: 95, baseP99: 160 },
  { method: 'GET', path: '/api/users/:id', baseRps: 65, baseErrorPct: 0.3, baseP50: 22, baseP95: 60, baseP99: 110 },
  { method: 'POST', path: '/api/orders', baseRps: 18, baseErrorPct: 1.2, baseP50: 85, baseP95: 220, baseP99: 410 },
  { method: 'GET', path: '/api/orders/:id', baseRps: 30, baseErrorPct: 0.5, baseP50: 30, baseP95: 80, baseP99: 150 },
  { method: 'PUT', path: '/api/orders/:id', baseRps: 9, baseErrorPct: 1.8, baseP50: 70, baseP95: 190, baseP99: 340 },
  { method: 'DELETE', path: '/api/orders/:id', baseRps: 3, baseErrorPct: 0.9, baseP50: 40, baseP95: 100, baseP99: 180 },
  { method: 'GET', path: '/api/products', baseRps: 88, baseErrorPct: 0.2, baseP50: 20, baseP95: 55, baseP99: 95 },
  { method: 'POST', path: '/api/auth/login', baseRps: 12, baseErrorPct: 2.5, baseP50: 60, baseP95: 150, baseP99: 260 },
  { method: 'GET', path: '/api/search', baseRps: 24, baseErrorPct: 0.6, baseP50: 110, baseP95: 280, baseP99: 520 },
  { method: 'POST', path: '/api/webhooks/stripe', baseRps: 6, baseErrorPct: 0.7, baseP50: 45, baseP95: 120, baseP99: 210 },
]

const HISTORY_WINDOW = 60 // number of ticks retained for charts

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** Bounded random walk step: nudges `value` toward a new value near itself. */
function drift(value: number, spread: number, min: number, max: number): number {
  const delta = (Math.random() - 0.5) * spread
  return clamp(value + delta, min, max)
}

function statusFor(errorRatePct: number, p99: number, baselineP99: number): EndpointStatus {
  if (errorRatePct >= 5 || p99 >= baselineP99 * 2.5) return 'critical'
  if (errorRatePct >= 1.5 || p99 >= baselineP99 * 1.5) return 'degraded'
  return 'healthy'
}

export function createInitialEndpoints(): EndpointState[] {
  return ENDPOINT_BASELINES.map((b, i) => {
    const rps = b.baseRps
    const errorRatePct = b.baseErrorPct
    const p50 = b.baseP50
    const p95 = b.baseP95
    const p99 = b.baseP99
    return {
      id: `${b.method}-${b.path}-${i}`,
      method: b.method,
      path: b.path,
      rps,
      errorRatePct,
      p50,
      p95,
      p99,
      status: statusFor(errorRatePct, p99, b.baseP99),
      incidentTicksRemaining: 0,
    }
  })
}

/** Advance every endpoint by one tick, returning a new array (no mutation). */
export function stepEndpoints(prev: EndpointState[]): EndpointState[] {
  return prev.map((state, i) => {
    const baseline = ENDPOINT_BASELINES[i]

    // Small chance to start a transient incident (error or latency spike).
    let incidentTicksRemaining = state.incidentTicksRemaining
    let incidentBoost = 1
    let incidentErrorBoost = 0
    if (incidentTicksRemaining > 0) {
      incidentTicksRemaining -= 1
      incidentBoost = 3.2
      incidentErrorBoost = 6
    } else if (Math.random() < 0.015) {
      incidentTicksRemaining = 3 + Math.floor(Math.random() * 4)
      incidentBoost = 3.2
      incidentErrorBoost = 6
    }

    const rps = drift(state.rps, baseline.baseRps * 0.18, baseline.baseRps * 0.25, baseline.baseRps * 1.8)
    const errorRatePct = clamp(
      drift(state.errorRatePct, baseline.baseErrorPct * 0.6 + 0.15, 0, 100) + incidentErrorBoost * Math.random(),
      0,
      100,
    )
    const p50 = drift(state.p50, baseline.baseP50 * 0.15, baseline.baseP50 * 0.6, baseline.baseP50 * incidentBoost)
    const p95 = drift(state.p95, baseline.baseP95 * 0.18, baseline.baseP95 * 0.6, baseline.baseP95 * incidentBoost)
    const p99 = drift(state.p99, baseline.baseP99 * 0.2, baseline.baseP99 * 0.6, baseline.baseP99 * incidentBoost)

    return {
      ...state,
      rps: Math.round(rps * 10) / 10,
      errorRatePct: Math.round(errorRatePct * 100) / 100,
      p50: Math.round(p50),
      p95: Math.round(p95),
      p99: Math.round(p99),
      status: statusFor(errorRatePct, p99, baseline.baseP99),
      incidentTicksRemaining,
    }
  })
}

/** Aggregate the endpoint fleet into a single point-in-time traffic sample. */
export function aggregateSample(endpoints: EndpointState[], t: number): TrafficSample {
  const totalRps = endpoints.reduce((sum, e) => sum + e.rps, 0)
  const weightedErrors = endpoints.reduce((sum, e) => sum + (e.errorRatePct / 100) * e.rps, 0)
  const errorRatePct = totalRps > 0 ? (weightedErrors / totalRps) * 100 : 0

  // Weight latency percentiles by request volume so a single low-traffic
  // endpoint spiking doesn't dominate the fleet-wide number.
  const weightedP50 = endpoints.reduce((sum, e) => sum + e.p50 * e.rps, 0)
  const weightedP95 = endpoints.reduce((sum, e) => sum + e.p95 * e.rps, 0)
  const weightedP99 = endpoints.reduce((sum, e) => sum + e.p99 * e.rps, 0)

  return {
    t,
    throughputRps: Math.round(totalRps * 10) / 10,
    errorRatePct: Math.round(errorRatePct * 100) / 100,
    p50: totalRps > 0 ? Math.round(weightedP50 / totalRps) : 0,
    p95: totalRps > 0 ? Math.round(weightedP95 / totalRps) : 0,
    p99: totalRps > 0 ? Math.round(weightedP99 / totalRps) : 0,
  }
}

export const TRAFFIC_HISTORY_WINDOW = HISTORY_WINDOW
