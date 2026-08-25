import { useEffect, useMemo, useRef, useState } from "react";
import {
  createIncidentState,
  ENDPOINTS,
  POINTS,
  TICK_MS,
  tickEndpoint,
  type IncidentState,
  type TimeRangeKey,
} from "../lib/simulator";
import type { EndpointSnapshot, EndpointTickStat, TimePoint } from "../types";

interface EndpointBuffer {
  ticks: EndpointTickStat[];
  incident: IncidentState;
}

function formatLabel(t: number, spacingSec: number): string {
  const d = new Date(t);
  if (spacingSec >= 60) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleTimeString([], { minute: "2-digit", second: "2-digit" });
}

function buildGlobalPoint(
  t: number,
  spacingSec: number,
  ticks: Record<string, EndpointTickStat>,
): TimePoint {
  let totalReq = 0;
  let totalErr = 0;
  let w50 = 0;
  let w95 = 0;
  let w99 = 0;
  let status2xx = 0;
  let status4xx = 0;
  let status5xx = 0;

  for (const stat of Object.values(ticks)) {
    totalReq += stat.requests;
    totalErr += stat.errors;
    w50 += stat.p50 * stat.requests;
    w95 += stat.p95 * stat.requests;
    w99 += stat.p99 * stat.requests;
    const ok = stat.requests - stat.errors;
    status2xx += ok;
    // split errors heuristically: most are 5xx server errors, a minority 4xx client errors
    const serverErrors = Math.round(stat.errors * 0.7);
    status5xx += serverErrors;
    status4xx += stat.errors - serverErrors;
  }

  return {
    t,
    label: formatLabel(t, spacingSec),
    throughput: totalReq / spacingSec,
    errorRatePct: totalReq > 0 ? (totalErr / totalReq) * 100 : 0,
    p50: totalReq > 0 ? w50 / totalReq : 0,
    p95: totalReq > 0 ? w95 / totalReq : 0,
    p99: totalReq > 0 ? w99 / totalReq : 0,
    status2xx,
    status4xx,
    status5xx,
  };
}

function classify(errorRatePct: number): EndpointSnapshot["status"] {
  if (errorRatePct >= 5) return "critical";
  if (errorRatePct >= 1) return "warning";
  return "healthy";
}

function buildEndpointSnapshots(
  buffers: Record<string, EndpointBuffer>,
  spacingSec: number,
): EndpointSnapshot[] {
  return ENDPOINTS.map((def) => {
    const buf = buffers[def.id];
    const ticks = buf.ticks;
    const last = ticks[ticks.length - 1];
    const totalReq = ticks.reduce((s, t) => s + t.requests, 0);
    const totalErr = ticks.reduce((s, t) => s + t.errors, 0);
    const errorRatePct = totalReq > 0 ? (totalErr / totalReq) * 100 : 0;
    return {
      id: def.id,
      method: def.method,
      path: def.path,
      service: def.service,
      rps: last ? last.requests / spacingSec : 0,
      requests: totalReq,
      errors: totalErr,
      errorRatePct,
      p50: last?.p50 ?? 0,
      p95: last?.p95 ?? 0,
      p99: last?.p99 ?? 0,
      status: classify(errorRatePct),
      incident: buf.incident.active,
      sparkline: ticks.slice(-20).map((t) => t.requests),
    };
  });
}

export function useTrafficSimulator(range: TimeRangeKey, spacingSec: number, paused: boolean) {
  const [series, setSeries] = useState<TimePoint[]>([]);
  const [endpoints, setEndpoints] = useState<EndpointSnapshot[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number>(() => Date.now());

  const buffersRef = useRef<Record<string, EndpointBuffer>>({});
  const simClockRef = useRef<number>(0);
  simClockRef.current ||= Date.now();

  // (Re)seed history whenever the range changes so charts are immediately
  // populated instead of starting empty and filling up over minutes.
  useEffect(() => {
    const buffers: Record<string, EndpointBuffer> = {};
    for (const def of ENDPOINTS) {
      buffers[def.id] = { ticks: [], incident: createIncidentState() };
    }

    const now = Date.now();
    let simTime = now - POINTS * spacingSec * 1000;
    const backfillSeries: TimePoint[] = [];

    for (let i = 0; i < POINTS; i++) {
      simTime += spacingSec * 1000;
      const tickMap: Record<string, EndpointTickStat> = {};
      for (const def of ENDPOINTS) {
        const buf = buffers[def.id];
        const stat = tickEndpoint(def, simTime, spacingSec, buf.incident);
        buf.ticks.push(stat);
        tickMap[def.id] = stat;
      }
      backfillSeries.push(buildGlobalPoint(simTime, spacingSec, tickMap));
    }

    buffersRef.current = buffers;
    simClockRef.current = simTime;
    setSeries(backfillSeries);
    setEndpoints(buildEndpointSnapshots(buffers, spacingSec));
    setLastUpdated(now);
  }, [range, spacingSec]);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      simClockRef.current += spacingSec * 1000;
      const simTime = simClockRef.current;
      const buffers = buffersRef.current;
      const tickMap: Record<string, EndpointTickStat> = {};

      for (const def of ENDPOINTS) {
        const buf = buffers[def.id];
        const stat = tickEndpoint(def, simTime, spacingSec, buf.incident);
        buf.ticks.push(stat);
        if (buf.ticks.length > POINTS) buf.ticks.shift();
        tickMap[def.id] = stat;
      }

      const point = buildGlobalPoint(simTime, spacingSec, tickMap);
      setSeries((prev) => {
        const next = [...prev, point];
        if (next.length > POINTS) next.shift();
        return next;
      });
      setEndpoints(buildEndpointSnapshots(buffers, spacingSec));
      setLastUpdated(Date.now());
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [spacingSec, paused]);

  const latest = useMemo(() => series[series.length - 1], [series]);
  const previous = useMemo(() => series[series.length - 2], [series]);

  return { series, endpoints, lastUpdated, latest, previous };
}
