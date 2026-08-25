export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type EndpointStatus = "healthy" | "warning" | "critical";

export interface EndpointDef {
  id: string;
  method: HttpMethod;
  path: string;
  service: string;
  /** requests/sec under normal (non-incident) load at the diurnal peak */
  baseRps: number;
  /** typical (p50) latency in ms under normal load */
  baseLatencyMs: number;
  /** baseline error rate, 0..1 */
  baseErrorRate: number;
}

export interface EndpointTickStat {
  t: number;
  requests: number;
  errors: number;
  p50: number;
  p95: number;
  p99: number;
}

export interface TimePoint {
  t: number;
  label: string;
  throughput: number; // req/s
  errorRatePct: number;
  p50: number;
  p95: number;
  p99: number;
  status2xx: number;
  status4xx: number;
  status5xx: number;
}

export interface EndpointSnapshot {
  id: string;
  method: HttpMethod;
  path: string;
  service: string;
  rps: number;
  requests: number;
  errors: number;
  errorRatePct: number;
  p50: number;
  p95: number;
  p99: number;
  status: EndpointStatus;
  incident: boolean;
  sparkline: number[];
}
