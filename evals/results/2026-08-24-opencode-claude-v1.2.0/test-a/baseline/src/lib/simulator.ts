import type { EndpointDef, EndpointTickStat } from "../types";

export const ENDPOINTS: EndpointDef[] = [
  { id: "auth-login", method: "POST", path: "/api/v1/auth/login", service: "auth", baseRps: 42, baseLatencyMs: 110, baseErrorRate: 0.008 },
  { id: "auth-refresh", method: "POST", path: "/api/v1/auth/refresh", service: "auth", baseRps: 65, baseLatencyMs: 60, baseErrorRate: 0.004 },
  { id: "users-list", method: "GET", path: "/api/v1/users", service: "users", baseRps: 88, baseLatencyMs: 75, baseErrorRate: 0.006 },
  { id: "users-get", method: "GET", path: "/api/v1/users/:id", service: "users", baseRps: 140, baseLatencyMs: 45, baseErrorRate: 0.003 },
  { id: "orders-list", method: "GET", path: "/api/v1/orders", service: "orders", baseRps: 96, baseLatencyMs: 130, baseErrorRate: 0.012 },
  { id: "orders-create", method: "POST", path: "/api/v1/orders", service: "orders", baseRps: 38, baseLatencyMs: 210, baseErrorRate: 0.02 },
  { id: "orders-get", method: "GET", path: "/api/v1/orders/:id", service: "orders", baseRps: 120, baseLatencyMs: 55, baseErrorRate: 0.005 },
  { id: "payments-charge", method: "POST", path: "/api/v1/payments/charge", service: "payments", baseRps: 24, baseLatencyMs: 340, baseErrorRate: 0.031 },
  { id: "payments-refund", method: "POST", path: "/api/v1/payments/refund", service: "payments", baseRps: 6, baseLatencyMs: 260, baseErrorRate: 0.018 },
  { id: "search", method: "GET", path: "/api/v1/search", service: "search", baseRps: 210, baseLatencyMs: 95, baseErrorRate: 0.009 },
  { id: "recommendations", method: "GET", path: "/api/v2/recommendations", service: "search", baseRps: 74, baseLatencyMs: 180, baseErrorRate: 0.014 },
  { id: "inventory-get", method: "GET", path: "/api/v1/inventory/:sku", service: "inventory", baseRps: 155, baseLatencyMs: 40, baseErrorRate: 0.004 },
  { id: "inventory-update", method: "PATCH", path: "/api/v1/inventory/:sku", service: "inventory", baseRps: 18, baseLatencyMs: 90, baseErrorRate: 0.01 },
  { id: "webhooks-stripe", method: "POST", path: "/api/v1/webhooks/stripe", service: "payments", baseRps: 9, baseLatencyMs: 150, baseErrorRate: 0.022 },
  { id: "reports-export", method: "GET", path: "/api/v1/reports/export", service: "reports", baseRps: 3, baseLatencyMs: 890, baseErrorRate: 0.04 },
  { id: "notifications", method: "POST", path: "/api/v1/notifications", service: "notifications", baseRps: 51, baseLatencyMs: 70, baseErrorRate: 0.007 },
  { id: "health", method: "GET", path: "/api/v1/health", service: "platform", baseRps: 30, baseLatencyMs: 8, baseErrorRate: 0.0005 },
];

export type TimeRangeKey = "5m" | "15m" | "1h" | "6h";

export const TIME_RANGES: { key: TimeRangeKey; label: string; spacingSec: number }[] = [
  { key: "5m", label: "5m", spacingSec: 5 },
  { key: "15m", label: "15m", spacingSec: 15 },
  { key: "1h", label: "1h", spacingSec: 60 },
  { key: "6h", label: "6h", spacingSec: 360 },
];

export const POINTS = 60;
export const TICK_MS = 2000;

// Box-Muller standard normal sample
function randn(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export interface IncidentState {
  active: boolean;
  ticksLeft: number;
  latencyMult: number;
  errorMult: number;
}

export function createIncidentState(): IncidentState {
  return { active: false, ticksLeft: 0, latencyMult: 1, errorMult: 1 };
}

/** Diurnal traffic multiplier based on simulated wall-clock hour, smooth 24h wave + weekday bump. */
function diurnalFactor(simTimeMs: number): number {
  const hour = new Date(simTimeMs).getUTCHours() + new Date(simTimeMs).getUTCMinutes() / 60;
  // peak around 15:00 UTC, trough around 03:00 UTC
  const wave = Math.sin(((hour - 9) / 24) * Math.PI * 2);
  return 0.55 + 0.45 * (wave * 0.5 + 0.5);
}

/**
 * Advance one endpoint by one tick. Mutates incident state in place and returns
 * the tick's stats. Percentiles are derived analytically from a log-normal
 * latency model (mean/std shift under incident) rather than sampled per
 * request, which keeps this cheap enough to run every 2s for ~20 endpoints
 * while still producing genuinely time-varying, endpoint-specific values.
 */
export function tickEndpoint(
  def: EndpointDef,
  simTimeMs: number,
  dtSec: number,
  incident: IncidentState,
): EndpointTickStat {
  // incident lifecycle
  if (incident.active) {
    incident.ticksLeft -= 1;
    if (incident.ticksLeft <= 0) {
      incident.active = false;
      incident.latencyMult = 1;
      incident.errorMult = 1;
    }
  } else if (Math.random() < 0.006) {
    incident.active = true;
    incident.ticksLeft = 6 + Math.floor(Math.random() * 12);
    incident.latencyMult = 1.8 + Math.random() * 3.5;
    incident.errorMult = 3 + Math.random() * 10;
  }

  const diurnal = diurnalFactor(simTimeMs);
  const noise = 1 + randn() * 0.08;
  const rps = Math.max(0, def.baseRps * diurnal * noise);
  const requests = Math.max(0, Math.round(rps * dtSec));

  const effectiveErrorRate = Math.min(
    0.85,
    def.baseErrorRate * incident.errorMult * (1 + Math.max(0, randn()) * 0.3),
  );
  const errorNoise = randn() * Math.sqrt(requests * effectiveErrorRate * (1 - effectiveErrorRate) + 0.01);
  const errors = Math.min(requests, Math.max(0, Math.round(requests * effectiveErrorRate + errorNoise)));

  const meanLatency = def.baseLatencyMs * incident.latencyMult * (1 + randn() * 0.05);
  const mu = Math.log(Math.max(1, meanLatency));
  const sigma = incident.active ? 0.55 : 0.35;

  const p50 = Math.exp(mu);
  const p95 = Math.exp(mu + 1.645 * sigma);
  const p99 = Math.exp(mu + 2.326 * sigma);

  return {
    t: simTimeMs,
    requests,
    errors,
    p50: Math.round(p50),
    p95: Math.round(p95),
    p99: Math.round(p99),
  };
}
