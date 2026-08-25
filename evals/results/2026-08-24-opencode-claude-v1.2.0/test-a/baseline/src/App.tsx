import { useMemo, useState } from "react";
import { EndpointTable } from "./components/EndpointTable";
import { ErrorRateChart } from "./components/ErrorRateChart";
import { Header } from "./components/Header";
import { LatencyChart } from "./components/LatencyChart";
import { StatTile } from "./components/StatTile";
import { ThroughputChart } from "./components/ThroughputChart";
import { useTrafficSimulator } from "./hooks/useTrafficSimulator";
import { TIME_RANGES, type TimeRangeKey } from "./lib/simulator";

function App() {
  const [range, setRange] = useState<TimeRangeKey>("15m");
  const [paused, setPaused] = useState(false);

  const spacingSec = useMemo(
    () => TIME_RANGES.find((r) => r.key === range)?.spacingSec ?? 15,
    [range],
  );

  const { series, endpoints, lastUpdated, latest, previous } = useTrafficSimulator(range, spacingSec, paused);

  const totalRequests = useMemo(() => series.reduce((s, p) => s + p.throughput * spacingSec, 0), [series, spacingSec]);

  const errorDelta =
    latest && previous && previous.errorRatePct > 0
      ? ((latest.errorRatePct - previous.errorRatePct) / previous.errorRatePct) * 100
      : null;
  const throughputDelta =
    latest && previous && previous.throughput > 0
      ? ((latest.throughput - previous.throughput) / previous.throughput) * 100
      : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-6">
        <Header
          range={range}
          onRangeChange={setRange}
          paused={paused}
          onTogglePaused={() => setPaused((p) => !p)}
          lastUpdated={lastUpdated}
        />

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Summary metrics">
          <StatTile
            label="Total requests"
            value={totalRequests >= 1000 ? `${(totalRequests / 1000).toFixed(1)}k` : totalRequests.toFixed(0)}
            unit={`in window`}
          />
          <StatTile
            label="Throughput"
            value={latest ? latest.throughput.toFixed(0) : "—"}
            unit="req/s"
            delta={throughputDelta}
            deltaGoodDirection="up"
          />
          <StatTile
            label="Error rate"
            value={latest ? latest.errorRatePct.toFixed(2) : "—"}
            unit="%"
            delta={errorDelta}
            deltaGoodDirection="down"
            accent={latest && latest.errorRatePct >= 5 ? "danger" : "default"}
          />
          <StatTile
            label="p99 latency"
            value={latest ? Math.round(latest.p99).toString() : "—"}
            unit="ms"
          />
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3" aria-label="Traffic charts">
          <div className="xl:col-span-2">
            <ThroughputChart data={series} />
          </div>
          <ErrorRateChart data={series} />
        </section>

        <section aria-label="Latency chart">
          <LatencyChart data={series} />
        </section>

        <section aria-label="Endpoint table">
          <EndpointTable endpoints={endpoints} />
        </section>

        <footer className="pb-6 pt-2 text-center text-xs text-slate-600">
          Data is simulated client-side for demonstration — not connected to a live backend.
        </footer>
      </div>
    </div>
  );
}

export default App;
